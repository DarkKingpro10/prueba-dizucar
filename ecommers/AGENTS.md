<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Reglas para agentes y cambios en la arquitectura

- Los agentes deben respetar la **Screaming Architecture** definida en el README.
- La carpeta `shared/` es el lugar para elementos reutilizables. Dentro de `shared/` se hace la distinción entre `ui/` (presentación pura) y `components/` (composición y lógica).
- Antes de proponer o efectuar cambios estructurales (crear/mover carpetas o archivos), documentar la propuesta en un PR y obtener aprobación del equipo.
- Los agentes NO deben crear carpetas ni mover archivos automáticamente en el repositorio sin coordinación humana.

Mantener estas reglas garantiza consistencia y evita cambios estructurales inesperados por automatizaciones.
