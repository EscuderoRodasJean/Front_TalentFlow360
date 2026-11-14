# Propuesta de datos históricos y logs

## Estado actual

El código versionado no incluye un seeder. La base desplegada **no ha sido inventariada** porque sus consultas exigen autenticación. Se adjunta `scripts/inventario-datos.sql`, de solo lectura, para que el responsable de BD obtenga conteos exactos y fechas extremas sin exportar datos personales. El dashboard por sí solo no cuenta todas las tablas.

## Población propuesta

Simular diez años, del 14/11/2016 al 14/11/2026, en una BD académica separada. Son datos sintéticos, no evidencia real de diez años de uso. Una misma persona no debe figurar como practicante permanente durante diez años: crear cohortes, cerrar procesos antiguos y concentrar los activos en los últimos meses.

| Tabla / recurso | Registros objetivo |
|---|---:|
| usuarios | 1,000 |
| postulantes | 900 |
| educacion_postulante | 1,100 |
| experiencia_postulante | 700 |
| habilidad_postulante | 2,700 |
| vacantes | 400 |
| requisito_vacante | 1,200 |
| postulaciones | 4,000 |
| detalle_matching | 12,000 |
| historial_estado_postulacion | 10,000 |
| entrevistas | 1,500 |
| evaluaciones | 1,200 |
| criterio_evaluacion | 3,600 |
| retroalimentaciones | 1,100 |
| eventos_auditoria (nuevo) | 3,000 |
| **Total** | **44,400** |


Los datos de negocio y el historial ya superan 20 mil sin depender de inflar los logs. Los 3 mil eventos nuevos necesitan una migración del backend; no existen actualmente como recurso de API.

## Cómo generarlos

1. Ejecutar primero el inventario sobre una copia o con una conexión de lectura. Comparar esquema y conteos; conservar datos anteriores, sin TRUNCATE ni reseteo de secuencias.
2. Implementar un perfil Spring `demo-seed` o un importador TypeScript offline que genere SQL transaccional para esa BD de demo. No usar scripts que llamen miles de veces a Render ni cambiar los `@CreationTimestamp` del servidor de producción.
3. Fijar semilla reproducible y un `seed_batch` de control para que el proceso pueda repetirse sin duplicados. Generar correos en `example.test`, empresas y nombres ficticios, hashes BCrypt para cuentas de demostración con contraseña configurada fuera de Git.
4. Insertar en orden de dependencia: usuarios, perfiles, formación/experiencia/habilidades, vacantes/requisitos, postulaciones, matching, historial, entrevistas, evaluaciones/criterios, feedback y eventos. No crear IDs de referencia inexistentes ni duplicar usuario/perfil o postulante/vacante.
5. Asignar 100 cuentas de equipo entre reclutadores, evaluadores, coordinadores y administradores. Asignar una vacante a su reclutador y una entrevista/evaluación a un evaluador real del conjunto sintético.
6. Distribuir fechas por cohortes y campañas: mayor actividad en marzo/abril y agosto/septiembre. Vacantes publicadas antes de postular, entrevistas posteriores a preselección, evaluaciones posteriores al encuentro y feedback después de evaluación. Los perfiles de personas no activas y los procesos antiguos se conservan.
7. Producir grupos variados de completitud, habilidades, resultados y tiempos. Las líneas base 34%, 12 días, 26% y 15% son datos del caso académico, no resultados que se deban forzar en cada cohorte para aparentar una mejora. Documentar escenarios antes/después como simulaciones, sin afirmar causalidad.
8. Ejecutar el mismo MatchingService sobre criterios profesionales y guardar sus detalles. La suma de puntos / suma de máximos por 100 debe reproducir el score. No usar edad, género, etnia, dirección, nombre o correo como criterio de matching.
9. Generar solo transiciones válidas y un evento de historial por cambio con actor, motivo y fecha. Los conflictos de prueba deben quedar como intentos rechazados, sin insertar entrevistas activas solapadas.
10. Validar el lote en transacción antes de aplicar: FKs, unicidad, rango de scores, cronología, visibilidad de feedback y cantidades. Crear índices y paginación en la API, medir con la población completa y conservar el informe de verificación.

No se ha generado ni cargado esta población todavía. Es la propuesta para la siguiente etapa, después de revisar el frontend y de corregir las dependencias del backend.

## Logs que sí aportan a la matriz

| Indicador | Datos durables | Cálculo |
|---|---|---|
| I1.1 / I1.2 | Apartados del perfil y completitud recalculada | Incompletos / perfiles; promedio de completitud |
| I2.1 | Creación de postulación y primer historial de cambio efectivo | Promedio de días entre creación y primer cambio, excluyendo el evento inicial |
| I2.2 | Estado actual e historial | Pendientes sin atención / postulaciones |
| I3.2 / I3.3 | Matching por requisito, máximos y justificación | Reproducibilidad del score y requisitos con explicación |
| I4.1 / I4.2 | Procesos finalizados y feedback con visibilidad | Finalizados sin feedback / finalizados; visibles / feedback |
| I5.1 | Intervalos de entrevistas activas y participantes | Entrevistas con solapamiento / entrevistas activas |
| I5.2 | Evento INTERVIEW_CONFLICT_REJECTED | Número de intentos bloqueados por periodo |
| I6.1 | Historial con actor, motivo, fecha y estado | Cambios con historial completo / cambios |
| I6.2 | Eventos STATE_CHANGE_REQUESTED y STATE_CHANGE_REJECTED | Transiciones inválidas rechazadas / intentos de transición inválida |

## Recurso nuevo de auditoría propuesto

Persistir en servidor: `id`, `occurred_at`, `actor_user_id`, `action`, `entity_type`, `entity_id`, `outcome`, `reason_code`, `correlation_id` y contexto mínimo no sensible. Agregar endpoint paginado de solo lectura para coordinador/admin con filtros por fechas, actor, acción y resultado. Evitar campos libres con credenciales, JWT o cuerpos completos de formularios.

Para que un rechazo no desaparezca por rollback de la operación fallida, registrar el evento en una transacción independiente bien delimitada o en infraestructura durable. Los cambios exitosos y su historial de negocio deben ser atómicos. Los logs de consola, `localStorage` y un contador Angular no sustituyen esa persistencia.

Un rechazo HTTP genérico no basta para contar conflictos: el evento debe distinguir conflicto de horario, duplicado, falta de permiso y error de infraestructura. `correlation_id` y claves de idempotencia evitan contar dos veces reenvíos de la misma operación. La identidad del actor se obtiene del JWT validado por Spring.

Con estos datos la última exposición puede mostrar indicadores y auditoría con SQL/JPQL y el dashboard Angular. No hace falta Python, ciencia de datos ni otro microservicio.
