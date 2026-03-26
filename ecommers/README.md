This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Arquitectura propuesta: Screaming Architecture

- **Enfoque:** Screaming Architecture — la estructura del repositorio debe "gritar" el dominio/producto.
- **Carpeta central de reutilizables:** `shared/` — aquí se definen los elementos reutilizables del proyecto (UI primitives, componentes con lógica, hooks, utilidades, estilos, etc.).

### Distinción clave: `ui` vs `components`

- **`shared/ui/` — Presentación (sin lógica):**
	- Contendrá componentes puramente visuales y declarativos, sin estado de negocio ni efectos. Ejemplos: botones estilizados, inputs presentacionales, layout primitives.
	- Deben ser atómicos, fácilmente testeables y sin dependencias a la capa de dominio.

- **`shared/components/` — Composición y lógica:**
	- Contendrá componentes que implementan lógica, orquestación, estado o interacción con servicios/hooks. Ejemplos: ProductList (usa hooks para fetch), CartWidget (maneja estado y side-effects).
	- Si un `ui` necesita lógica, se promueve a `components` o se compone desde `components`.

### Convenciones y buenas prácticas

- Nombres de carpetas en `kebab-case` y componentes en `kebab-case`.
- Preferir named exports; evitar `any` y definir tipos explícitos.
- Mantener `shared/ui` puro: nada de fetch, efectos o lógica de negocio.
- `shared/components` sí puede usar hooks, llamadas a servicios y contener handlers/eventos.
- Documentar cambios de estructura en el README y en la descripción del PR antes de modificar el árbol de carpetas.

### Estructura propuesta (src/)

```
src/
	app/                       # Rutas Next.js (App Router, RSC)
		(public)/                # Segmentos paralelos públicos (marketing, landing)
			page.tsx
		(app)/                   # App autenticada u operativa
			layout.tsx
			clasess/              # Página protegida de productos
				page.tsx
				api/                 # API Routes específicas del feature (opcional)
					route.ts

	features/                  # Slices que gritan dominio (modular por feature)
		nombre-del-modulo/
			ui/                    # Componentes de UI específicos del feature (pueden usar shadcn/ui)
				ProductCard.tsx
				ProductTable.tsx
			actions/               # Server Actions compatibles con RSC (Next.js)
				createProduct.ts
				listClases.ts
			services/              # Orquestación de lógica del dominio (validación, persistencia, etc.)
				clasesService.ts
			schemas/               # Esquemas de validación (Zod), DTOs
				product.ts
			model/                 # Tipos/entidades simples del dominio (TS types)
				Product.ts
        

	infrastructure/            # Integraciones externas
		supabase/                # Cliente Supabase y helpers relacionados
			client.ts
		http/                    # Helpers genéricos para fetch
			fetcher.ts

	shared/                    # Código reutilizable y transversal a features
		ui/                      # Componentes genéricos (shadcn/ui + wrappers propios)
			button.tsx
			input.tsx
			data-table/
				DataTable.tsx
		lib/                     # Utilidades compartidas (env, logging, auth, etc.)
			env.ts                 # Validador de variables de entorno (Zod)
			logger.ts              # Logger compartido (puede ser consola o externalizado)
			auth.ts                # Helpers de autenticación (NextAuth u otro)
		hooks/                   # Custom React hooks compartidos
			useDebounce.ts
		styles/                  # Estilos globales y tokens
			globals.css

	config/                    # Configuración del proyecto
		eslint/                  # Reglas ESLint personalizadas (si aplica)
		tsconfig/                # Configuración de TypeScript

public/                      # Archivos públicos (imágenes, fuentes, etc.)
```

> Nota: Esto es una especificación para el equipo. NO crear carpetas ni mover archivos automáticamente — la implementación y migración deben planearse y ejecutarse manualmente con consenso del equipo.
