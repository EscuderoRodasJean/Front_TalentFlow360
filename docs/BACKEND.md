# Revisión de integración del backend

Revisión estática del commit `b918f144ab16b6146174a25e0eb08ab7f0f498c6`, más consultas GET a Render el 14/11/2026. No se han modificado ni publicado cambios en el backend. No se ha vuelto a ejecutar su suite Java en este entorno; no confundir presencia de tests con resultados actuales de ejecución o cobertura.

| Tema del curso | Evidencia de código | Límite de lo comprobado |
|---|---|---|
| TDD en Spring | Tests de MatchingService, PostulacionService, EntrevistaService, PostulanteService, acceso y SecurityEndpoints | Hay pruebas automatizadas. El ciclo histórico RED/GREEN/REFACTOR no se demuestra solo con el código final |
| REST y métodos HTTP | Auth, Usuario, Postulante, Vacante, Postulacion, Entrevista, Evaluacion, Dashboard controllers | GET consulta; POST crea; PUT actualiza usuario/perfil; PATCH cambia estados. No hay DELETE; se conserva historial |
| Herramientas API | Swagger/OpenAPI expuesto en Render | `/v3/api-docs` devolvió 200; contrato descargado para revisión |
| JPA/Hibernate, CRUD | 14 entidades y repositorios Spring Data | No todos los recursos exponen edición o eliminación; no se debe afirmar CRUD completo para cada tabla |
| JPQL | Queries en repositorios de postulación, entrevistas, historial y evaluaciones | Revisado estáticamente |
| Transacciones | `@Transactional` en servicios y `readOnly=true` en consultas | No se ha simulado caída de BD en esta revisión |
| Seguridad/JWT | SecurityConfig, JwtTokenValidator, JwtUtils, BCrypt en UsuarioService | JWT y roles presentes, autorización por objeto incompleta |

## Incidencias prioritarias antes de una exposición integral

1. **Autorización por propietario/asignación.** Los servicios consultan IDs sin comprobar en todos los métodos al principal autenticado. Debe verificarse que el postulante sea propietario, que el evaluador tenga asignación y que el reclutador gestione sus vacantes. Ocultar un botón o usar guards de Angular no resuelve este riesgo.
2. **Matchers de POST incompletos.** SecurityConfig protege rutas exactas `/api/vacantes`, `/api/postulantes`, `/api/postulaciones` y `/api/evaluaciones`, pero los POST reales incluyen sufijos, por ejemplo `/api/vacantes/reclutador/{id}`. Esas rutas caen en `anyRequest().authenticated()`. Deben protegerse por ruta y método reales, además de validación en servicio.
3. **Feedback privado.** El postulante debe poder invocar exclusivamente el feedback visible de su propia postulación. El GET general de evaluaciones permite POSTULANTE y alcanza rutas de comentarios internos. Separar esas autorizaciones en Spring.
4. **Identidad en cambios.** `usuarioId` y `evaluadorId` recibidos en parámetros no deben decidir quién actúa. Derivar la identidad de `Authentication` y comprobar delegaciones explícitas.
5. **Edición de usuarios.** `PUT /api/usuarios/{id}` usa `@Valid UsuarioRegistroDTO`, que exige password/email. El servicio solo modifica nombre, apellido y rol, e ignora password/email. Crear `UsuarioActualizarDTO` con nombre, apellido y rol, o definir la edición de email y su validación de unicidad. La UI no simula una edición exitosa.
6. **RF-35.** No hay endpoint de asignación explícita de evaluadores a postulaciones. La consulta de asignaciones deriva de entrevistas existentes. Definir un recurso de asignación antes de poner un selector de asignación como si persistiera.
7. **RF-36 / I5.2 / I6.2.** Se rechazan conflictos y transiciones, pero no se persisten sus intentos. Añadir eventos de rechazo durables.
8. **I2.1.** DashboardService resta `fechaPostulacion` de `fechaUltimoCambioEstado`. La matriz pide el primer cambio. Usar el primer historial posterior al evento de creación. RF-37 exige además permanencia por etapa, que no está agregada en la API.
9. **Rendimiento y fechas.** Añadir paginación/filtros de servidor, índices y una zona horaria acordada (`America/Lima` para este caso). El backend actual usa LocalDateTime sin offset. El frontend envía el mismo contrato y no lo convierte silenciosamente a UTC.
10. **Despliegue.** Registrar el origen HTTPS del hosting Angular en CORS. Los orígenes locales actuales incluyen localhost:4200.

## Verificación de datos actuales

No se encontraron `data.sql`, scripts INSERT ni inicializadores de datos en `src`. Esto solo demuestra ausencia de carga versionada, no que Render esté vacío. Los GET `/api/vacantes/publicadas` y `/api/dashboard` devolvieron 403 sin sesión. Un ZIP del mismo código no permite ver las filas de PostgreSQL. Hace falta una cuenta de prueba o ejecutar el SQL de inventario con permisos de lectura.

## Prueba real pendiente

Con cuentas sintéticas de los cinco roles: registrar perfil, completar seis apartados, crear/publicar vacante con requisitos, postular, revisar desglose, agendar y provocar 409, evaluar, publicar feedback, cambiar estado y revisar historial. Para cada rol comprobar accesos propios y ajenos, HTTP 401 sin token, 403 por rol y expiración. Confirmar que ningún DTO devuelve password.

No usar una cuenta ajena ni introducir miles de datos en Render para hacer esta comprobación. Esta revisión no ha realizado escrituras en la instancia desplegada.
