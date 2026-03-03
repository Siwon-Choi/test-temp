# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```


## Solved.ac account setup

1. Copy `.env.example` to `.env`.
2. Set `VITE_SOLVEDAC_HANDLE` to your solved.ac/BOJ handle.

```bash
cp .env.example .env
# edit .env
```

Example:

```env
VITE_SOLVEDAC_HANDLE=dipokal
```


## solved.ac CORS note

The browser cannot call `https://solved.ac/api/v3/...` directly due to CORS.
This project uses Vite dev proxy (`/api/solvedac -> https://solved.ac/api/v3`) during local development.

For production deployment, keep the same path (`/api/solvedac/...`) and provide a server-side proxy/rewrites on your hosting platform.


## Vercel deployment (solved.ac proxy)

If you deploy to Vercel, this repo includes `vercel.json` rewrite:

- `/api/solvedac/*` -> `https://solved.ac/api/v3/*`

So you can keep frontend code as-is (`/api/solvedac/user/show?...`) in both local and production.

After connecting the repo to Vercel, set env vars in Vercel Project Settings:
- `VITE_SOLVEDAC_HANDLE`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
