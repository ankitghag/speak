# Speak learning app

A static HTML, CSS, and JavaScript reader for the English Communication Markdown lessons you provided. The original lesson files are the only lesson content in the app; their wording is unchanged. The design uses a deep aubergine sidebar, cream reading surface, and muted coral accents.

## Run / deploy

There is no Python, backend, database, package install, or build step. Publish the contents of this folder to a static host (such as GitHub Pages, Netlify, or Cloudflare Pages) and open its `index.html` URL.

For a local preview, use a static file preview extension such as **Live Server** in Visual Studio Code. The browser loads `courses.json`, course metadata, and lesson files with `fetch`; browsers block those requests when `index.html` is opened directly as a `file://` URL. A local preview extension serves the unchanged static files over HTTP; it does not add an application backend.

Lesson Markdown is rendered by the app's local JavaScript, so opening lesson content does not depend on a CDN or a Python runtime. Google Fonts are optional; system font fallbacks are included.

## Files

```text
index.html
styles.css
courses.json
courses/english-communication/course.json
courses/english-communication/lessons/   Your 47 original Markdown lessons
js/                                      Static browser application modules
```

The course configuration controls day grouping, lesson titles, order, and Markdown paths. Previous/next links and the lesson index use that same order. Reading progress is stored locally in the browser.

## Markdown rendering

The app renders headings, paragraphs, emphasis, lists, tables, blockquotes, inline and fenced code, links, and images. It renders the `\rightarrow` token in one lesson as an arrow. Raw HTML is displayed as text, unsafe URL schemes are removed, relative links and images resolve from each lesson file, and external links use `noopener noreferrer`.
