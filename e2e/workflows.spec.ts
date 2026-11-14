import { test, expect } from '@playwright/test';
import { backend, signIn } from './fixtures';
import path from 'node:path';
const previews = process.env['TF_PREVIEW_DIR'];
test('portada y móvil mantienen contenido visible sin desplazamiento horizontal', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Tu talento merece');
  if (previews)
    await page.screenshot({ path: path.join(previews, '01-portada-desktop.png'), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  if (previews)
    await page.screenshot({ path: path.join(previews, '02-portada-movil.png'), fullPage: true });
});
test('la ruta privada solicita autenticación', async ({ page }) => {
  await page.goto('/app/indicadores');
  await expect(page).toHaveURL(/ingresar/);
  await expect(page.getByLabel('Contraseña')).toBeVisible();
});
test('registro valida datos y permite crear cuenta', async ({ page }) => {
  await backend(page);
  await page.goto('/registro');
  await page.getByRole('button', { name: 'Crear cuenta', exact: true }).click();
  await expect(page.getByText('Este campo es obligatorio.').first()).toBeVisible();
  await page.getByLabel('Nombre', { exact: true }).fill('Lucía');
  await page.getByLabel('Apellido', { exact: true }).fill('Rivera');
  await page.getByLabel('Correo electrónico').fill('lucia@example.test');
  await page.getByLabel('Contraseña').fill('Pruebas360!');
  await page.getByRole('button', { name: 'Crear cuenta', exact: true }).click();
  await expect(page).toHaveURL(/ingresar/);
});
test('postulante explora, filtra y postula con matching y feedback visible', async ({ page }) => {
  await backend(page);
  await signIn(page);
  await page.getByRole('link', { name: 'Oportunidades', exact: true }).click();
  await expect(page.locator('.job-card')).toHaveCount(9);
  await page.getByLabel('Puesto, empresa o lugar').fill('Frontend');
  await expect(page.locator('.job-card')).toHaveCount(4);
  if (previews)
    await page.screenshot({ path: path.join(previews, '03-oportunidades.png'), fullPage: true });
  await page.locator('.job-card').first().click();
  await page.getByRole('button', { name: 'Quiero postular' }).click();
  await expect(page.getByRole('heading', { name: 'Por qué este matching' })).toBeVisible();
  await expect(
    page.getByText('Buen dominio de componentes. Reforzar consultas SQL.'),
  ).toBeVisible();
  if (previews)
    await page.screenshot({
      path: path.join(previews, '04-matching-y-seguimiento.png'),
      fullPage: true,
    });
});
test('un perfil inexistente se puede registrar y completar', async ({ page }) => {
  await backend(page, { profileMissing: true });
  await signIn(page);
  await page.getByRole('link', { name: 'Mi perfil', exact: true }).click();
  await page
    .getByLabel('Tu perfil profesional')
    .fill('Estudiante con proyectos en desarrollo web.');
  await page.getByLabel('Teléfono').fill('900000001');
  await page.getByLabel('Dirección').fill('Lima, Perú');
  await page.getByRole('button', { name: 'Guardar perfil' }).click();
  await expect(
    page.getByText('Perfil actualizado. Tu completitud fue recalculada por el servidor.'),
  ).toBeVisible();
  await page.getByRole('button', { name: 'educación', exact: true }).click();
  await expect(page.getByLabel('Institución')).toBeVisible();
});
test('el postulante no tiene acceso a usuarios aunque conozca la ruta', async ({ page }) => {
  await backend(page);
  await page.goto('/app/usuarios');
  await page.getByLabel('Correo electrónico').fill('lucia@example.test');
  await page.getByLabel('Contraseña').fill('Pruebas360!');
  await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click();
  await expect(page).toHaveURL(/sin-acceso/);
});
test('el dashboard identifica métricas pendientes y no atribuye al primer cambio el cálculo actual', async ({
  page,
}) => {
  await backend(page);
  await signIn(page, 'admin@example.test');
  await page.getByRole('link', { name: 'Indicadores', exact: true }).click();
  await expect(page.getByText('1,200', { exact: true })).toBeVisible();
  await expect(page.getByText('I2.1 exige el primer cambio.', { exact: false })).toBeVisible();
  await expect(page.getByText('Pendiente de implementar en backend')).toHaveCount(2);
  if (previews)
    await page.screenshot({ path: path.join(previews, '05-indicadores.png'), fullPage: true });
});
test('el agendamiento explica un conflicto HTTP 409', async ({ page }) => {
  await backend(page, { conflict: true });
  await signIn(page, 'admin@example.test');
  await page.getByRole('link', { name: 'Agenda de entrevistas' }).click();
  await page.getByLabel('ID de postulación', { exact: true }).fill('21');
  await page.getByLabel('ID del evaluador', { exact: true }).fill('2');
  await page.getByLabel('Inicio de entrevista').fill('2026-12-01T10:00');
  await page.getByLabel('Fin de entrevista').fill('2026-12-01T11:00');
  await page.getByLabel('Tipo', { exact: true }).selectOption('VIRTUAL');
  await page.getByLabel('Ubicación o enlace').fill('https://example.test/reunion');
  await page.getByRole('button', { name: 'Agendar entrevista' }).click();
  await expect(page.getByRole('alert')).toContainText('ya tiene una entrevista');
});
test('estado vacío y menú móvil son utilizables', async ({ page }) => {
  await backend(page, { emptyJobs: true });
  await signIn(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Abrir menú' }).click();
  await page.getByRole('link', { name: 'Oportunidades', exact: true }).click();
  await expect(page.getByText('No hay vacantes que coincidan.')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
test('crear vacante envía requisitos y método POST del contrato real', async ({ page }) => {
  await backend(page);
  await signIn(page, 'admin@example.test');
  await page.getByRole('link', { name: 'Oportunidades', exact: true }).click();
  await page.getByRole('link', { name: 'Crear vacante' }).click();
  await page.getByLabel('Requisito', { exact: true }).fill('Angular');
  await page.getByLabel('Tipo', { exact: true }).selectOption('HABILIDAD_TECNICA');
  await page.getByLabel('Valor esperado').fill('Angular');
  await page.getByRole('button', { name: 'Agregar a la lista' }).click();
  await page.getByLabel('Título del puesto').fill('Practicante de frontend');
  await page.getByLabel('Empresa', { exact: true }).fill('Andes Digital');
  await page
    .getByLabel('Descripción', { exact: true })
    .first()
    .fill('Desarrollo de interfaces accesibles');
  await page.getByLabel('Modalidad').selectOption('HIBRIDO');
  await page
    .getByLabel('Fecha de cierre')
    .fill(new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10));
  const req = page.waitForRequest(
    (r) => r.url().includes('/api/vacantes/reclutador/') && r.method() === 'POST',
  );
  await page.getByRole('button', { name: 'Crear borrador' }).click();
  expect((await req).postDataJSON().requisitos[0].nombre).toBe('Angular');
  await expect(page).toHaveURL(/vacantes\/11$/);
});

test('el evaluador registra criterios y envía la evaluación al contrato real', async ({ page }) => {
  await backend(page);
  await signIn(page, 'evaluador@example.test');
  await page.getByRole('link', { name: 'Evaluaciones', exact: true }).click();
  const form = page
    .locator('section.panel')
    .filter({ has: page.getByRole('heading', { name: 'Registrar evaluación', exact: true }) });
  await form.getByLabel('Criterio profesional').fill('Resolución técnica');
  await form.getByLabel('Puntaje obtenido').fill('85');
  await form
    .getByLabel('Justificación')
    .fill('Resuelve el ejercicio con componentes reutilizables.');
  await form.getByRole('button', { name: 'Agregar a la lista' }).click();
  await form.getByLabel('ID de postulación').fill('21');
  await form.getByLabel('Puntaje general (0 a 100)').fill('85');
  await form
    .getByLabel('Comentarios', { exact: true })
    .fill('Resultado favorable de la evaluación técnica.');
  const req = page.waitForRequest(
    (r) => r.url().endsWith('/api/evaluaciones/evaluador/1') && r.method() === 'POST',
  );
  await form.getByRole('button', { name: 'Guardar evaluación' }).click();
  expect((await req).postDataJSON().criterios[0].puntaje).toBe(85);
  await expect(page.getByText('Registro guardado correctamente.')).toBeVisible();
});
test('cerrar sesión vuelve al login y limpia el acceso privado', async ({ page }) => {
  await backend(page);
  await signIn(page);
  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  await expect(page).toHaveURL(/ingresar/);
  await page.goto('/app/inicio');
  await expect(page).toHaveURL(/ingresar/);
});
