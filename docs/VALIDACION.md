# Validación del frontend

Validación local del 14/11/2026. Node 24.19.0, Angular 22.2, Vitest 5.1 y Playwright 1.65 con Chromium. No se han usado credenciales de Render ni se han realizado escrituras en la instancia desplegada.

| Comprobación | Resultado |
|---|---|
| `npm run build` | Correcto. Bundle inicial 305,79 kB, transferencia estimada 84,51 kB, rutas diferidas |
| `npm run test:unit` | 36 pruebas correctas, 3 archivos, sin errores no controlados |
| `npm run test:e2e` | 16 recorridos correctos, 1 worker, 20 s aproximadamente |
| `npm run format:check` | Correcto |
| `git diff --check` | Sin errores de espacio en el contenido |
| Inspección visual | Portada de escritorio y móvil, oportunidades, matching y dashboard |
| Swagger desplegado | GET `/v3/api-docs` devuelve 200 |
| Datos sin autenticación | Vacantes publicadas y dashboard devuelven 403 |
| Prueba de extremo a extremo con Render autenticado | Pendiente de cuenta de prueba autorizada |
| Conteo de BD desplegada | Pendiente de ejecutar el inventario con acceso de lectura |
| Suite del backend Java | No ejecutada en esta revisión |
| Workflow de GitHub Actions | Configurado, aún no ejecutado en GitHub porque no se ha publicado la rama |

## Qué verifican las pruebas

- Expiración JWT, cierre de sesión, permisos, rechazo de tokens inválidos y retorno seguro a rutas internas.
- Token enviado únicamente al backend configurado y omitido en el login y en servicios externos.
- Contrato ApiResponse, método PATCH, parámetros, errores de negocio, 401, 403, 409 y errores de red.
- Ámbito de postulación antes de cargar el detalle para postulantes y evaluadores; comprobación del reclutador.
- Formularios obligatorios, formatos, espacios vacíos y orden de fechas.
- Registro, exploración y filtrado de vacantes, postulación, desglose matching, historial y feedback visible.
- Creación de perfil, bloqueo de ruta por rol, consulta de indicadores y tratamiento del cálculo temporal pendiente.
- Agendamiento con respuesta 409, menú móvil, ausencia de desborde horizontal, vacante con requisitos y evaluación con criterios numéricos.

Los recorridos de navegador sustituyen `/api/**` por contratos aislados. Demuestran el comportamiento Angular y la forma de sus peticiones; no certifican el cumplimiento de autorización, persistencia ni rendimiento del backend real. Los nombres y cifras de las capturas son sintéticos.

## Incidencias corregidas durante la verificación

- Se limitó el arte decorativo de la portada para evitar desborde en móvil.
- Se definieron nombres accesibles inequívocos en formularios y filtros de consulta.
- Se normalizan números de campos dinámicos antes de serializar el JSON.
- Se comprueba la expiración al navegar a rutas hijas y se vuelve al login.
- Se conserva el perfil actualizado al cambiar entre sus apartados.
- Los porcentajes sin observaciones se presentan con un guion en vez de afirmar que un cero cumple una meta.

Las pruebas se repitieron tras cada corrección relevante. El último build, las 36 pruebas unitarias y los 16 recorridos corresponden a la versión final de los archivos.

## Rediseño del portal

Se comprobaron el menú del avatar (cierre al pulsar Escape y restauración de foco), las pestañas de empresas/oportunidades, el selector de acceso, los botones sociales a color con aviso informativo, la visibilidad de contraseña y la conservación de filtros tras login. Se verificó ausencia de desplazamiento horizontal en portada y espacio personal a 390 px. Las capturas v2 muestran la aplicación en Chromium con datos de prueba aislados.

Las dos imágenes de producción ocupan aproximadamente 316 kB en total. Se generaron con la herramienta integrada ImageGen y se optimizaron en WebP; no se incluyen las versiones PNG originales en el bundle público.
