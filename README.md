# Simple Code Editor

Inspired by the tutorial ["Build and Deploy a Cursor Clone"](https://www.youtube.com/watch?v=Xf9rHPNBMyQ), this project extracts and simplifies the frontend portion into a minimal POC demonstrating how to implement a browser-based code editor.

It is a lightweight, modern code editor built with Next.js and React, featuring a file explorer sidebar, a CodeMirror editor with syntax highlighting, a split-pane layout, and dark mode support. 

Note that it is frontend-only with no backend integration, which means all data is stored in browser memory and will be lost upon page refresh.

## Setup

```sh
npx create-next-app .
npx shadcn@latest init
npx shadcn@latest add --all

# use https://github.com/AntonioErdeljac/polaris-assets/blob/main/globals.css

# Add dark mode: https://ui.shadcn.com/docs/dark-mode/next
npm install next-themes

# Add split-pane https://www.npmjs.com/package/allotment
npm i allotment

# File & Folder Icons: https://www.npmjs.com/package/@react-symbols/icons
npm i @react-symbols/icons

# https://codemirror.net
npm i codemirror @codemirror/lang-javascript @codemirror/lang-html @codemirror/lang-css @codemirror/lang-json @codemirror/lang-markdown
npm i @codemirror/theme-one-dark
npm i @replit/codemirror-minimap @replit/codemirror-indentation-markers

# https://github.com/xtermjs/xterm.js
npm i @xterm/xterm @xterm/addon-fit

# https://github.com/sindresorhus/execa
npm i execa
```

## Deploy to Netlify

The `@netlify/plugin-nextjs` package is what makes App Router API routes (app/api/...) work correctly.

```sh
npm install -D @netlify/plugin-nextjs
```

```toml
[[plugins]]
package = "@netlify/plugin-nextjs"

[build]
  command = "next build"
  publish = ".next"
```

Push to GitHub, then on Netlify:
1. Click Add new site → Import an existing project
2. Connect GitHub → select your repo
3. Netlify auto-detects Next.js. Build settings should auto-fill.
4. Click Deploy
