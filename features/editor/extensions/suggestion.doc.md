## Understanding the CodeMirror Extension

CodeMirror 6 has a very different architecture from most editors you might have used. Before diving into the code, you need to understand one fundamental rule: **the editor state is immutable**. You never modify state directly. Instead, you describe *what changed*, and CodeMirror produces a new state object.

---

### How CodeMirror Handles State

When something happens in the editor — a keystroke, a paste, a cursor move — CodeMirror creates a **transaction**. A transaction describes the change and gets applied to produce a new immutable state. If you want to store your own data in the editor (like a suggestion string), you need to plug into this system rather than just keeping a variable somewhere.

That's what `StateField` and `StateEffect` are for.

A `StateField` is a named slot of custom data that lives inside the editor state. Because state is immutable, you don't set a field directly. Instead you define a reducer function that receives the current value and a transaction, and returns the next value. Every transaction runs through every field's reducer, whether it affects it or not.

A `StateEffect` is how you carry information *inside* a transaction. Think of it as a typed payload — you define a kind of effect, attach a value to it, include it in a dispatched transaction, and then your field's reducer can check for it. In this code:

```typescript
const setSuggestionEffect = StateEffect.define<string | null>();
```

This creates one kind of effect that carries a string or null. The field then watches for it:

```typescript
update(value, transaction) {
  for (const effect of transaction.effects) {
    if (effect.is(setSuggestionEffect)) {
      return effect.value;
    }
  }
  return value;
}
```

If the transaction contains this effect, the field updates. Otherwise it stays the same. This is exactly the Redux reducer pattern applied to editor state.

---

### Rendering Custom Content

CodeMirror renders text through a DOM it controls entirely. You can't just inject a `<span>` wherever you want — you have to go through **decorations**, which are instructions that tell CodeMirror how to alter the visual presentation of a range or position in the document.

One kind of decoration is a **widget**, which inserts a custom DOM element at a specific character position without affecting the document text. The `WidgetType` class defines what that element looks like:

```typescript
class SuggestionWidget extends WidgetType {
  toDOM() {
    const span = document.createElement("span");
    span.textContent = this.text;
    span.style.opacity = "0.4";
    span.style.pointerEvents = "none";
    return span;
  }
}
```

CodeMirror calls `toDOM()` when it needs to actually paint the widget. The `side: 1` option when creating the decoration tells CodeMirror to place it after the cursor position rather than before it.

---

### Keeping Decorations in Sync

Decorations aren't stored in the state — they live in a `ViewPlugin`, which is a class that runs alongside the editor view. A `ViewPlugin` has access to both the state and the DOM, making it the right place to manage anything visual.

The plugin holds a `DecorationSet` and rebuilds it whenever something relevant changes. The `update()` method receives a `ViewUpdate` object that tells you exactly what happened — whether the document changed, whether the selection moved, and what transactions just ran. The plugin checks all three:

```typescript
const shouldRebuild = update.docChanged || update.selectionSet || suggestionChanged;
```

The cursor position matters here because the widget decoration is pinned to wherever the cursor currently is. If the cursor moves, the old decoration is in the wrong place.

When rebuilding, the plugin reads the current suggestion out of the state field and the current cursor position, then constructs a fresh `DecorationSet` with the widget placed there. If there's no suggestion, it returns `Decoration.none`.

The second argument to `ViewPlugin.fromClass` — `{ decorations: (plugin) => plugin.decorations }` — is how you tell CodeMirror where to find the decorations on your plugin instance. Without this, they'd never be applied.

---

### Using the Extension

The export bundles the field and plugin together:

```typescript
export const suggestion = () => [suggestionState, renderPlugin];
```

You add this to your editor's extensions array. To show or hide a suggestion from your application code, you dispatch a transaction carrying the effect:

```typescript
view.dispatch({
  effects: setSuggestionEffect.of("suggested completion text")
});
```

That dispatch triggers `suggestionState`'s reducer, which updates the stored string, which causes the `ViewPlugin` to rebuild its decorations, which causes CodeMirror to re-render the widget after the cursor. The whole cycle is synchronous and driven by the transaction system rather than by manual DOM manipulation.

### Building Context for AI Suggestions

For an AI model to generate a useful inline suggestion, it needs more than just the character at the cursor. It needs to understand the surrounding code — what came before, what comes after, and where exactly the cursor sits within the current line. This function gathers all of that into a single payload object.

```ts
const generatePayload = (view: EditorView, fileName: string) => {
  const code = view.state.doc.toString();
  if (!code || code.trim().length === 0) return null;

  const cursorPosition = view.state.selection.main.head;
  const currentLine = view.state.doc.lineAt(cursorPosition);
  const cursorInLine = cursorPosition - currentLine.from;

  const previousLines: string[] = [];
  const previousLinesToFetch = Math.min(5, currentLine.number - 1);
  for (let i = previousLinesToFetch; i >= 1; i--) {
    previousLines.push(view.state.doc.line(currentLine.number - i).text);
  }

  const nextLines: string[] = [];
  const totalLines = view.state.doc.lines;
  const linesToFetch = Math.min(5, totalLines - currentLine.number);
  for (let i = 1; i <= linesToFetch; i++) {
    nextLines.push(view.state.doc.line(currentLine.number + i).text);
  }

  return {
    fileName,
    code,
    currentLine: currentLine.text,
    previousLines: previousLines.join("\n"),
    textBeforeCursor: currentLine.text.slice(0, cursorInLine),
    textAfterCursor: currentLine.text.slice(cursorInLine),
    nextLines: nextLines.join("\n"),
    lineNumber: currentLine.number,
  }
};
```