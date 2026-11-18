# Apurv Gupta: personal site

A static site for GitHub Pages. There is no framework, package install, or build step.

## Preview locally

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Publish to GitHub Pages

1. Create a public GitHub repository named `apurvg14.github.io`.
2. Initialize Git inside this folder only and push it to that repository.
3. In the repository's Settings, open Pages, choose "Deploy from a branch", then select `main` and `/ (root)`.
4. The site goes live at `https://apurvg14.github.io`.

## Files

- `index.html`: home page (introduction, selected work, experience, research, education, outside work, contact)
- `resume.html`: print-friendly résumé
- `llms.txt`: detailed profile written for AI assistants and recruiting agents
- `photography.html`, `photography.js`, `photography-provenance.json`: photography and the provenance record for each image
- `travel.html`, `travel.js`: interactive travel map
- `games.html`: games list
- `styles.css`: one stylesheet for every page
- `script.js`: shared behavior (light and dark theme, search on Ctrl K or /, copy email, mobile menu)
- `theme.js`: sets the theme before the page paints and refuses to render inside another site's frame
- `assets/fonts/`: self-hosted Geist and Geist Mono, under the SIL Open Font License

Every page carries a Content Security Policy that only allows scripts, styles, fonts, and images from this site.
- `assets/social-card.png`: link preview image

## Keeping it accurate

The site, `llms.txt`, and the LinkedIn profile should say the same things. Client names stay out of every file, and so do client dollar figures. When a role or number changes, update all three.
