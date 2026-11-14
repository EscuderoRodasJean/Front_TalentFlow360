import { test, expect } from '@playwright/test';
import { backend, signIn } from './fixtures';
import path from 'node:path';
const previews = process.env['TF_PREVIEW_DIR'];
test('carrusel con logos oficiales, avance automático y pausa accesible', async ({ page }) => {
  await page.goto('/');
  const carousel = page.getByRole('region', {
    name: 'Conoce las empresas donde puede empezar tu futuro.',
  });
  await carousel.scrollIntoViewIfNeeded();
  await expect(carousel.locator('img')).toHaveCount(18);
  await expect
    .poll(() =>
      carousel
        .locator('img')
        .evaluateAll((images) =>
          images.every(
            (img) =>
              (img as HTMLImageElement).complete && (img as HTMLImageElement).naturalWidth > 0,
          ),
        ),
    )
    .toBe(true);
  await page.mouse.move(0, 0);
  const track = carousel.locator('.carousel-track');
  const initial = await track.getAttribute('style');
  await expect(track).not.toHaveAttribute('style', initial!, { timeout: 6000 });
  await carousel.getByRole('button', { name: 'Pausar carrusel automático' }).click();
  await expect(
    carousel.getByRole('button', { name: 'Reproducir carrusel automático' }),
  ).toBeVisible();
  if (previews)
    await carousel.screenshot({
      path: path.join(previews, '11-carrusel-empresas.png'),
      animations: 'disabled',
    });
  await carousel.getByRole('link', { name: 'Ver todas las empresas' }).click();
  await expect(page).toHaveURL(/\/empresas$/);
});
test('directorio público filtra empresas y abre su ficha oficial', async ({ page }) => {
  await page.goto('/empresas');
  await expect(page.locator('.company-result')).toHaveCount(6);
  if (previews)
    await page.screenshot({
      path: path.join(previews, '12-directorio-empresas.png'),
      fullPage: true,
    });
  if (previews) {
    await page.setViewportSize({ width: 1440, height: 960 });
    await page.screenshot({ path: path.join(previews, '15-directorio-vista.png') });
  }
  await page.getByLabel('Nombre o palabra clave de empresa').fill('Gloria');
  await expect(page.locator('.company-result')).toHaveCount(1);
  await page
    .locator('.company-result')
    .getByRole('link', { name: /Conocer empresa/ })
    .click();
  await expect(page.getByRole('heading', { name: 'Gloria', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Visitar sitio oficial' })).toHaveAttribute(
    'href',
    'https://www.gloria.com.pe/',
  );
  await expect(page.getByText('Ingresa para consultar las oportunidades.')).toBeVisible();
  if (previews)
    await page.screenshot({ path: path.join(previews, '13-ficha-empresa.png'), fullPage: true });
});
test('filtros, estado vacío y directorio móvil', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/empresas');
  await page.getByLabel('Sector de actividad').selectOption('Servicios financieros');
  await expect(page.locator('.company-result')).toHaveCount(1);
  await expect(page.locator('.company-result-main h2')).toHaveText('Compartamos Banco');
  await page.getByLabel('Nombre o palabra clave de empresa').fill('sin coincidencias');
  await expect(page.getByText('No encontramos empresas para esta consulta.')).toBeVisible();
  await page.getByRole('button', { name: 'Limpiar filtros', exact: true }).last().click();
  await expect(page.locator('.company-result')).toHaveCount(6);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  if (previews)
    await page.screenshot({ path: path.join(previews, '14-empresas-movil.png'), fullPage: true });
});
test('la preferencia de movimiento reducido detiene el carrusel inicial', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Reproducir carrusel automático' })).toBeVisible();
  await page.getByRole('button', { name: 'Empresas siguientes' }).click();
  await expect(page.locator('.carousel-track')).not.toHaveAttribute('style', /translateX\(-100%\)/);
});
test('una vacante publicada se atribuye por empresa y no por cifras inventadas', async ({
  page,
}) => {
  await backend(page);
  await signIn(page);
  await page.route('**/api/vacantes', (route) =>
    route.fulfill({
      json: {
        success: true,
        data: [
          {
            id: 11,
            titulo: 'Practicante de Sistemas',
            empresa: 'Alicorp S.A.A.',
            estado: 'PUBLICADA',
            modalidad: 'HIBRIDO',
            ubicacion: 'Lima',
          },
          { id: 12, titulo: 'Vacante en borrador', empresa: 'Alicorp', estado: 'BORRADOR' },
        ],
      },
    }),
  );
  await page.getByRole('link', { name: 'Conocer empresas', exact: true }).click();
  await page.getByRole('tab', { name: 'Con oportunidades', exact: true }).click();
  await expect(page.locator('.company-result')).toHaveCount(1);
  await expect(page.locator('.vacancy-count')).toHaveText('1 vacante registrada');
  await page.locator('.company-result').getByRole('link', { name: 'Conocer empresa' }).click();
  await expect(page.locator('.company-job-list>a')).toHaveCount(1);
  await expect(page.locator('.company-job-list h3')).toHaveText('Practicante de Sistemas');
});
