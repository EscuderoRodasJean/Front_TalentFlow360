-- Inventario exacto. Solo lectura. PostgreSQL. Ejecutar con una cuenta autorizada.
BEGIN TRANSACTION READ ONLY;
WITH conteos AS (
SELECT 'usuarios' AS tabla, count(*) AS registros FROM usuarios
UNION ALL
SELECT 'postulantes' AS tabla, count(*) AS registros FROM postulantes
UNION ALL
SELECT 'educacion_postulante' AS tabla, count(*) AS registros FROM educacion_postulante
UNION ALL
SELECT 'experiencia_postulante' AS tabla, count(*) AS registros FROM experiencia_postulante
UNION ALL
SELECT 'habilidad_postulante' AS tabla, count(*) AS registros FROM habilidad_postulante
UNION ALL
SELECT 'vacantes' AS tabla, count(*) AS registros FROM vacantes
UNION ALL
SELECT 'requisito_vacante' AS tabla, count(*) AS registros FROM requisito_vacante
UNION ALL
SELECT 'postulaciones' AS tabla, count(*) AS registros FROM postulaciones
UNION ALL
SELECT 'detalle_matching' AS tabla, count(*) AS registros FROM detalle_matching
UNION ALL
SELECT 'historial_estado_postulacion' AS tabla, count(*) AS registros FROM historial_estado_postulacion
UNION ALL
SELECT 'entrevistas' AS tabla, count(*) AS registros FROM entrevistas
UNION ALL
SELECT 'evaluaciones' AS tabla, count(*) AS registros FROM evaluaciones
UNION ALL
SELECT 'criterio_evaluacion' AS tabla, count(*) AS registros FROM criterio_evaluacion
UNION ALL
SELECT 'retroalimentaciones' AS tabla, count(*) AS registros FROM retroalimentaciones
) SELECT tabla, registros FROM conteos UNION ALL SELECT 'TOTAL', sum(registros) FROM conteos;
SELECT min(fecha_postulacion) AS primera_postulacion, max(fecha_postulacion) AS ultima_postulacion FROM postulaciones;
SELECT min(fecha_cambio) AS primer_evento, max(fecha_cambio) AS ultimo_evento FROM historial_estado_postulacion;
SELECT rol,count(*) AS cuentas FROM usuarios GROUP BY rol ORDER BY rol;
COMMIT;
