# F1FEMVP
React / TypeScript / Vite photography spot MVP with Leaflet, Dexie and PWA support.

## GitHub Pages
1. Use this source in the `main` branch of your chosen repository.
2. Settings → Pages → Build and deployment → Source: GitHub Actions.
3. Settings → Secrets and variables → Actions: add repository secret `VITE_ORS_API_KEY` with your openrouteservice key.
4. Run the Deploy F1FEMVP to GitHub Pages workflow.

The workflow derives the URL base path automatically. The key is omitted from source control but is included in the compiled browser code, as required by the client-only design. No backend or cross-device sync is provided.

## Local development
`npm ci`, copy `.env.example` to `.env.local`, enter the key, then `npm run dev`.
`npm run build` builds the application.

Seed images contain attribution and source links. Images are resized and re-encoded from their credited originals; retain their original licenses when redistributing.

A changed domain uses separate browser storage: spots created on the former Sites domain do not automatically appear on GitHub Pages.
