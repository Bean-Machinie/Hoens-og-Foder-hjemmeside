# Høns og Foder – hjemmeside

Hjemmeside for hoensogfoder.dk.

## Teknologi

| Område        | Teknologi                          |
| ------------- | ---------------------------------- |
| Sprog         | TypeScript (.ts / .tsx)            |
| UI-framework  | React 18                           |
| Styling       | CSS Modules (scoped pr. komponent) |
| Build-værktøj | Vite                               |
| Routing       | React Router DOM                   |

## Kom i gang

```bash
npm install      # installer afhængigheder
npm run dev      # start udviklingsserver på http://localhost:5173
npm run build    # typecheck + produktionsbuild til /dist
npm run preview  # vis produktionsbuild lokalt
npm run typecheck
```

## Deploy

GitHub Pages deployer automatisk, når der pushes til `main`.

Første gang skal repository-indstillingen sættes til GitHub Actions:
`Settings` -> `Pages` -> `Build and deployment` -> `Source` -> `GitHub Actions`.

## Projektstruktur

```
src/
  main.tsx                 # entrypoint, monterer React + BrowserRouter
  App.tsx                  # rutetabel
  config/
    navigation.ts          # menupunkter (deles af topbar og router)
    site.ts                # firmanavn, kontaktinfo m.m.
  styles/
    variables.css          # design-tokens (farver, spacing, typografi)
    global.css             # globale styles + .container helper
  components/
    layout/                # TopPanel (topbar), Footer, Layout (app-shell)
    ui/                    # genbrugelige Button, PageHeader
  pages/
    home/                  # forsiden + dens sektioner
      sections/            # Hero, Catalogue, About, Info
    catalogue/             # /sortiment (pladsholder)
    about/                 # /om-os (pladsholder)
    contact/               # /kontakt (pladsholder)
    NotFoundPage.tsx       # 404
```

## Sådan udvider du

- **Ny side:** tilføj en route i `src/App.tsx` og et menupunkt i
  `src/config/navigation.ts`.
- **Skift udseende:** rediger design-tokens i `src/styles/variables.css`.
- **Ret kontaktinfo:** opdatér `src/config/site.ts`.
- Hver komponent har sin egen `.module.css` ved siden af `.tsx`-filen.
