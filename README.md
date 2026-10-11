# GarbaVibe

Free Navratri story, collage and greeting studio. Node.js + Express backend, vanilla HTML/CSS/JS frontend, Canvas PNG export.

## Pages
Home, Story Maker (editor + greeting generator + saved designs), Collage Maker (8 layouts), Greeting Library (search, favorites, nine forms of Durga), Daily Companion (checklist, notes, countdown).

## Run on Windows
Install Node.js LTS (nodejs.org), then in PowerShell:

    cd garbavibe
    npm install
    npm start

Open http://localhost:3000

Greetings are bundled in `frontend/js/greetings-data.js` (generated from `backend/storage/data/greetings.json`), so the greeting pages work even if the API is unreachable. Saving designs and the generator still need the Node server.

## Templates
Story Maker: 9 background templates (Jai Mata Di, Golden Arch, Garba Night, Lotus Ivory, Moonlit Temple, Dandiya Red, Floral Navratri, Lantern Purple, Emerald Arch), all drawn in code in `frontend/js/templates.js`.
Collage Maker: 12 templates (4, 5 and 6 photos) with circle, hexagon, arch and polaroid frames, in the same file. Nothing needs to be uploaded.
To use your own artwork instead, export backgrounds as 1080x1920 PNGs WITHOUT photos, put them in `frontend/assets/backgrounds/`, and ask for them to be wired in.

## Image templates (Classic and Gen Z)
120 ready-made 1080x1920 templates: 60 Classic and 60 Gen Z (36 collages with 4/5/6 photos and 24 stories each pack). Photo areas are cut out of the artwork so user photos appear in the exact frame shape.
Folder structure (already included):

    frontend/assets/templates/
      manifest.json        names, photo-area positions, text colours
      classic/collage/  classic/story/  genz/collage/  genz/story/   (.webp, with transparent photo areas)
      thumbs/              gallery previews (.jpg)

Use only artwork you have the right to use. To add more templates, add a .webp and an entry in manifest.json.

## Set up your support QR (before hosting!)
After a PNG download, a polite optional popup shows your QR.
1. Save your payment QR as `frontend/assets/my-qr.png`.
2. Edit `frontend/js/config.js` (UPI ID, name). `enabled: false` turns it off.

The popup only displays your QR. It does not process or verify payments.

## Host it (Render, easiest)
1. Push to GitHub (steps below).
2. On render.com: New > Web Service > connect the repo. It reads `render.yaml` (build `npm install`, start `npm start`).
3. Open the URL Render gives you. Railway also works (uses the Procfile).

Saved designs are stored in `backend/storage/data/designs.json`. On free hosts the disk is wiped on every redeploy or restart. To keep designs, attach a persistent disk and set env `DATA_DIR` to its mount path. Greetings, collages and PNG exports do not depend on this.

Privacy: there are no accounts. Each browser gets a random id, and designs are visible only to that browser id. This is not real security. Do not treat saved designs as private data.

## Environment variables
See `.env.example`: `PORT` (set automatically by hosts), `DATA_DIR` (optional storage folder).

## API
- GET /api/health, GET /api/templates
- GET /api/greetings?q=&category= ; POST /api/greetings/generate `{language: en|hi|hinglish, length: short|medium|long, signature?, count?}`
- GET/POST /api/designs, GET/PUT/DELETE /api/designs/:id (header `X-Client-Id: <uuid>`; body `{title, type: story|collage, data}`)

## Project layout
`server.js` entry. `backend/routes` handlers, `backend/services/greetingEngine.js` local phrase engine (not AI), `backend/storage/jsonStore.js` storage layer, `frontend/` pages and `js/`.

## Known limitations
Uploaded photos are not saved with designs (re-add after reopening). Collages cannot be saved yet, only exported. Greeting generator varies by language and length only. Sharing uses download plus the Web Share API for text; direct posting to Instagram/WhatsApp is not supported.

## Publish to GitHub
    git init
    git add .
    git commit -m "Initial commit"
    git branch -M main
    git remote add origin https://github.com/YOUR-USERNAME/garbavibe.git
    git push -u origin main
`.env` and generated design data are in `.gitignore`.
