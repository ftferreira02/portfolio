# Francisco Ferreira, portfolio

Personal portfolio site: a one-page home plus a page for each featured project.

Built with Next.js 16 (App Router, fully static), TypeScript, Tailwind CSS v4 and MDX. Diagrams are
hand-drawn SVG React components that follow the light/dark theme.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run lint
npm test           # Playwright smoke tests (first time: npx playwright install chromium)
```

## Where things live

| Path | What |
|---|---|
| `content/site.ts` | Name, headline, contact links, CV path |
| `content/projects.ts` | Project cards and page headers (numbers live here once) |
| `content/projects/*.mdx` | Long-form project pages |
| `content/experience.ts` | Jobs, education, "Also built" |
| `components/diagrams/` | SVG diagrams |
| `app/globals.css` | Colour tokens for light and dark mode |
| `public/cv.pdf` | The CV served at `/cv.pdf` |

## Deploy

Import the GitHub repository in Vercel (framework preset: Next.js, no settings to change). Optionally set
`NEXT_PUBLIC_SITE_URL` to the final URL so canonical links, the sitemap and social previews point to it.
