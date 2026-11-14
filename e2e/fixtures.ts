import { Page } from '@playwright/test';
export const sampleJob = {
  id: 11,
  titulo: 'Practicante de Desarrollo Frontend',
  empresa: 'Andes Digital',
  descripcion: 'Construye experiencias accesibles junto a un equipo que acompaña tu aprendizaje.',
  ubicacion: 'Lima, Perú',
  modalidad: 'HIBRIDO',
  estado: 'PUBLICADA',
  numVacantes: 2,
  fechaCierre: '2027-12-01',
  reclutadorId: 2,
  requisitos: [
    {
      id: 1,
      nombre: 'Angular',
      tipo: 'HABILIDAD_TECNICA',
      obligatorio: true,
      pesoMatching: 10,
      valorEsperado: 'Angular',
      descripcion: 'Componentes, formularios y consumo REST.',
    },
    {
      id: 2,
      nombre: 'SQL',
      tipo: 'HABILIDAD_TECNICA',
      obligatorio: false,
      pesoMatching: 5,
      valorEsperado: 'SQL',
    },
  ],
};
export const sampleApplication = {
  id: 21,
  postulanteId: 3,
  postulanteNombre: 'Lucía Rivera',
  vacanteId: 11,
  vacanteTitulo: sampleJob.titulo,
  estado: 'EN_REVISION',
  scoreCompatibilidad: 86.7,
  fechaPostulacion: '2026-11-01T10:00:00',
};
export async function backend(
  page: Page,
  options: {
    conflict?: boolean;
    profileMissing?: boolean;
    emptyJobs?: boolean;
    forbiddenDashboard?: boolean;
  } = {},
) {
  let role = 'POSTULANTE';
  let hasProfile = !options.profileMissing;
  let profile = {
    id: 3,
    usuarioId: 1,
    nombreCompleto: 'Lucía Rivera',
    email: 'lucia@example.test',
    resumenProfesional: 'Estudiante de Ingeniería de Sistemas',
    telefono: '900000001',
    direccion: 'Lima',
    porcentajeCompletitud: 83,
    perfilCompleto: false,
    educaciones: [
      {
        id: 1,
        titulo: 'Ingeniería de Sistemas',
        institucion: 'Universidad de ejemplo',
        nivelEducacion: 'UNIVERSITARIO_EN_CURSO',
      },
    ],
    experiencias: [],
    habilidades: [{ id: 1, nombre: 'Angular', nivelDominio: 'INTERMEDIO' }],
  };
  const jobs = Array.from({ length: 12 }, (_, i) => ({
    ...sampleJob,
    id: 11 + i,
    titulo: [
      'Practicante de Desarrollo Frontend',
      'Practicante de Análisis de Datos',
      'Practicante de UX / UI',
    ][i % 3],
    empresa: ['Andes Digital', 'Nexo Analytics', 'Estudio Horizonte'][i % 3],
    modalidad: ['HIBRIDO', 'REMOTO', 'PRESENCIAL'][i % 3],
  }));
  await page.route('**/api/**', async (route) => {
    const req = route.request(),
      path = new URL(req.url()).pathname,
      method = req.method();
    let data: unknown;
    let status = 200;
    let message = 'OK';
    if (path === '/api/auth/login') {
      role = req.postDataJSON().email.startsWith('admin')
        ? 'ADMINISTRADOR'
        : req.postDataJSON().email.startsWith('evaluador')
          ? 'EVALUADOR'
          : 'POSTULANTE';
      data = {
        token:
          'header.' +
          Buffer.from(JSON.stringify({ exp: Date.now() / 1000 + 3600 })).toString('base64url') +
          '.signature',
        usuarioId: 1,
        rol: role,
        nombreCompleto: role === 'POSTULANTE' ? 'Lucía Rivera' : 'Diego Mendoza',
        email: req.postDataJSON().email,
      };
    } else if (path === '/api/auth/registro') {
      data = { id: 100 };
      status = 201;
    } else if (!req.headers()['authorization']) {
      status = 401;
      message = 'Sesión requerida';
    } else if (path === '/api/vacantes') {
      data = options.emptyJobs ? [] : jobs;
    } else if (path === '/api/vacantes/11') {
      data = sampleJob;
    } else if (/^\/api\/vacantes\/reclutador\//.test(path) && method === 'POST') {
      data = { ...sampleJob, ...req.postDataJSON(), id: 11, estado: 'BORRADOR' };
      status = 201;
    } else if (path.startsWith('/api/postulantes/usuario/')) {
      if (method === 'POST') {
        hasProfile = true;
        profile = { ...profile, ...req.postDataJSON() };
      }
      if (!hasProfile) {
        status = 404;
        message = 'No existe un perfil. Completa tu perfil primero.';
      } else data = profile;
    } else if (path === '/api/postulantes/3' || path.startsWith('/api/postulantes/3/')) {
      profile = { ...profile, ...req.postDataJSON() };
      data = profile;
    } else if (path.includes('/postulaciones/postulante/') && path.includes('/vacante/')) {
      data = sampleApplication;
      status = 201;
    } else if (path === '/api/postulaciones/21') {
      data = sampleApplication;
    } else if (path === '/api/postulaciones/21/matching') {
      data = [
        {
          id: 1,
          requisitoNombre: 'Angular',
          puntajeObtenido: 100,
          puntajeMaximo: 100,
          justificacion: 'El perfil registra Angular como habilidad técnica.',
          criterioCumplido: true,
        },
        {
          id: 2,
          requisitoNombre: 'SQL',
          puntajeObtenido: 30,
          puntajeMaximo: 50,
          justificacion: 'Coincidencia parcial con el requisito profesional.',
          criterioCumplido: false,
        },
      ];
    } else if (path === '/api/postulaciones/21/historial') {
      data = [
        {
          id: 1,
          estadoNuevo: 'PENDIENTE_REVISION',
          motivo: 'Postulación creada',
          usuarioCambioNombre: 'Lucía Rivera',
          fechaCambio: '2026-11-01T10:00:00',
        },
        {
          id: 2,
          estadoNuevo: 'EN_REVISION',
          motivo: 'Revisión de competencias profesionales',
          usuarioCambioNombre: 'Diego Mendoza',
          fechaCambio: '2026-11-02T10:00:00',
        },
      ];
    } else if (path === '/api/postulaciones/21/estado') {
      data = { ...sampleApplication, estado: req.postDataJSON().nuevoEstado };
    } else if (/^\/api\/postulaciones\/(postulante|evaluador|vacante)\//.test(path)) {
      data = [sampleApplication];
    } else if (path.includes('/retroalimentacion/postulacion/')) {
      data = [
        {
          id: 1,
          evaluadorNombre: 'Diego Mendoza',
          contenido: 'Buen dominio de componentes. Reforzar consultas SQL.',
          visiblePostulante: true,
          fechaCreacion: '2026-11-03T10:00:00',
        },
      ];
    } else if (path === '/api/entrevistas' && method === 'POST') {
      if (options.conflict) {
        status = 409;
        message = 'El evaluador ya tiene una entrevista en ese horario';
      } else {
        data = { id: 40, ...req.postDataJSON() };
        status = 201;
      }
    } else if (path.startsWith('/api/entrevistas/')) {
      data = [];
    } else if (path.startsWith('/api/evaluaciones/') && method === 'GET') {
      data = [];
    } else if (path.startsWith('/api/evaluaciones/') && method === 'POST') {
      data = { id: 51, ...req.postDataJSON() };
      status = 201;
    } else if (path === '/api/dashboard') {
      if (options.forbiddenDashboard) {
        status = 403;
        message = 'Acceso denegado';
      } else
        data = {
          totalPostulantes: 1200,
          perfilesIncompletos: 180,
          porcentajePerfilesIncompletos: 15,
          promedioCompletitud: 84,
          totalVacantes: 900,
          vacantesPublicadas: 48,
          totalPostulaciones: 8400,
          postulacionesSinSeguimiento: 504,
          porcentajeSinSeguimiento: 6,
          tiempoPromedioRespuestaDias: 4.2,
          porcentajeSinRetroalimentacion: 8,
          distribucionEstadoPostulaciones: {
            PENDIENTE_REVISION: 504,
            EN_REVISION: 1020,
            PRESELECCIONADO: 800,
            ENTREVISTA_PROGRAMADA: 240,
            ENTREVISTA_REALIZADA: 260,
            EVALUADO: 220,
            ACEPTADO: 2150,
            RECHAZADO: 2800,
            CANCELADO: 406,
          },
          cargaPorEvaluador: { 7: 64, 8: 52, 9: 47 },
        };
    } else if (path === '/api/usuarios' && method === 'GET') {
      data = [
        {
          id: 1,
          nombre: 'Diego',
          apellido: 'Mendoza',
          email: 'admin@example.test',
          rol: 'ADMINISTRADOR',
          activo: true,
        },
        {
          id: 2,
          nombre: 'Andrea',
          apellido: 'Flores',
          email: 'andrea@example.test',
          rol: 'EVALUADOR',
          activo: true,
        },
      ];
    } else {
      status = 501;
      message = 'Contrato no implementado en el doble de prueba: ' + method + ' ' + path;
    }
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify({
        success: status < 400,
        message,
        data,
        timestamp: '2026-11-14T09:00:00',
      }),
    });
  });
}
export async function signIn(page: Page, email = 'lucia@example.test') {
  await page.goto('/ingresar');
  await page.getByLabel('Correo electrónico').fill(email);
  await page.getByLabel('Contraseña', { exact: true }).fill('Pruebas360!');
  await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click();
  await page.waitForURL('**/app/inicio');
}
