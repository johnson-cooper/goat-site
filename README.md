# Project Goat Static Website

A no-build, fully static showcase site for Project Goat.

## Editing the site

Most visible copy lives in Markdown files under `content/`:

- `hero.md` — title, intro, call-to-action buttons
- `about.md` — project overview
- `features.md` — feature cards
- `gameplay.md` — campaign/gameplay explanation
- `roadmap.md` — current direction
- `faq.md` — FAQ

Edit those files and upload/push the changed files. No build step is required.

## Local preview

Because browsers block `fetch()` from `file://`, do not double-click `index.html` directly. From this folder run:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Free hosting: GitHub Pages

1. Put this folder in a GitHub repository.
2. Open repository Settings → Pages.
3. Choose deployment from a branch.
4. Select the branch containing `index.html` and the root folder.
5. Save.

## Free hosting: Cloudflare Pages

1. Create a Pages project from the Git repository.
2. Framework preset: None.
3. Build command: leave blank.
4. Build output directory: `/` (repository root).
5. Deploy.

## Structure

```text
index.html
css/styles.css
js/app.js
content/*.md
assets/images/*
assets/video/project-goat-demo.mp4
```

## Markdown support

The included tiny parser supports headings, paragraphs, unordered lists, blockquotes, bold, italic, inline code, and links. `hero.md` also supports a custom line:

```text
BUTTONS: Label => #target | Another Label => https://example.com
```

This keeps the site dependency-free and portable.
