import { StateEffect, StateField } from "@codemirror/state";
import {
    Decoration,
    DecorationSet,
    EditorView,
    ViewPlugin,
    ViewUpdate,
    WidgetType
} from "@codemirror/view";

const setSuggestionEffect = StateEffect.define<string | null>();

const suggestionState = StateField.define<string | null>({
  create() {
    return '// Show some ghost text here';
  },
  update(value, transaction) {
    // Check each effect in this transaction
    // If we find our setSuggestionEffect, return its new value
    // Otherwise, keep the current value unchanged
    for (const effect of transaction.effects) {
      if (effect.is(setSuggestionEffect)) {
        return effect.value;
      }
    }
    return value;
  },
});

// WidgetType: Creates custom DOM elements to display in the editor.
// toDOM() is called by CodeMirror to create the actual HTML element.
class SuggestionWidget extends WidgetType {
  constructor(readonly text: string) {
    super();
  }
  toDOM() {
    const span = document.createElement("span");
    span.textContent = this.text;
    span.style.opacity = "0.4"; // Ghost text appearance
    span.style.pointerEvents = "none";
    return span;
  }
}

const renderPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = this.build(view);
    }

    update(update: ViewUpdate) {
      const suggestionChanged = update.transactions.some((transaction) => {
        return transaction.effects.some((effect) => {
          return effect.is(setSuggestionEffect);
        });
      });

      // Rebuild decorations if doc changed, cursor moved, or suggestion changed
      const shouldRebuild =
        update.docChanged || update.selectionSet || suggestionChanged;

      if (shouldRebuild) {
        this.decorations = this.build(update.view);
      }
    }

    build(view: EditorView) {
      const suggestion = view.state.field(suggestionState);
      if (!suggestion) {
        return Decoration.none;
      }

      const cursor = view.state.selection.main.head;
      return Decoration.set([
        Decoration.widget({
          widget: new SuggestionWidget(suggestion),
          side: 1, // Render after cursor (side: 1)
        }).range(cursor),
      ]);
    }
  },
  { decorations: (plugin) => plugin.decorations }
);

export const suggestion = () => [
  suggestionState,
  renderPlugin,
];
