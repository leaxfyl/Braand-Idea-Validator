# Braand Idea Validator

Next.js App Router application for Braand School's AI-assisted business idea assessment.

## Local development

```bash
npm install
npm run dev
```

## Environment

Configure one AI provider in Vercel Project Settings or a local `.env.local` file:

- `OPENAI_API_KEY` (optional) and `OPENAI_MODEL` (defaults to `gpt-4o`), or
- `AI_GATEWAY_API_KEY` and optionally `AI_MODEL` (defaults to `anthropic/claude-sonnet-5.5`).

The API returns a configuration error if neither provider is available. Never commit API keys.

## Brand fonts

The CSS is configured for Basement Grotesque display headings and Coolvetica subheadings/body text. The source archive did not include the actual font assets. Add properly licensed webfont files at:

- `public/fonts/BasementGrotesque.woff2`
- `public/fonts/Coolvetica.woff2`

Until then, the stylesheet uses system fallbacks. The layout and spacing are prepared for the requested font pairing, but the exact typefaces will not render until the licensed files are supplied.

## Notes

- Reports are stored in the visitor's browser local storage; they are not synced across devices.
- Uploaded reference images are resized in the browser and sent to the analysis provider; the app does not persist them.
- The AI report is a preliminary assessment and not financial, legal, or investment advice.
