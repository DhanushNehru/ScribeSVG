# Contributing to ScribeSVG

Thanks for helping improve ScribeSVG. Keep changes focused on one issue or behavior, and follow the existing TypeScript and Next.js patterns in nearby files.

## Local setup

Use Node.js 20 or 22, the versions covered by CI. Install dependencies and start the development server:

```sh
npm install
npm run dev
```

Open <http://localhost:3000> to use the visual builder. The SVG endpoint is at <http://localhost:3000/api/render>; for example, try `/api/render?lines=Hello;World&layout=terminal`.

## Where changes belong

- [`src/app/page.tsx`](src/app/page.tsx) holds the visual builder, presets, and URL generation.
- [`src/app/api/render/route.ts`](src/app/api/render/route.ts) handles `/api/render` requests. [`parse-params.ts`](src/app/api/render/parse-params.ts) interprets query parameters.
- [`src/app/api/render/renderer.ts`](src/app/api/render/renderer.ts) defines render options, themes, and the generated SVG.

For a new theme, update `THEMES` in `renderer.ts` and `THEME_PRESETS` in `page.tsx`. For a new layout, update the layout types and rendering branches, the builder's layout control, and the accepted values in `parse-params.ts`. In both cases, keep the API table and examples in [`README.md`](README.md) current. Check both the builder preview and a direct `/api/render` URL.

## Before opening a pull request

Run the relevant tests and the same lint and build commands used by CI:

```sh
npm test
npm run lint
npm run build
```

Link the issue in the PR and explain the behavior change briefly. For visible changes, include rendered before/after screenshots of the builder or SVG output so reviewers can compare the result. Keep unrelated formatting and dependency changes out of the PR.
