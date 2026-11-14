export type EstadoEntrevista =
  'PROGRAMADA' | 'CONFIRMADA' | 'EN_CURSO' | 'COMPLETADA' | 'CANCELADA' | 'NO_ASISTIO';
export type EstadoPostulacion =
  | 'PENDIENTE_REVISION'
  | 'EN_REVISION'
  | 'PRESELECCIONADO'
  | 'ENTREVISTA_PROGRAMADA'
  | 'ENTREVISTA_REALIZADA'
  | 'EVALUADO'
  | 'ACEPTADO'
  | 'RECHAZADO'
  | 'CANCELADO';
export type EstadoVacante = 'BORRADOR' | 'PUBLICADA' | 'EN_PROCESO' | 'CERRADA' | 'CANCELADA';
export type Modalidad = 'PRESENCIAL' | 'REMOTO' | 'HIBRIDO';
export type NivelEducacion =
  | 'SECUNDARIA'
  | 'TECNICO'
  | 'UNIVERSITARIO_EN_CURSO'
  | 'BACHILLER'
  | 'TITULADO'
  | 'MAESTRIA'
  | 'DOCTORADO';
export type Rol = 'POSTULANTE' | 'RECLUTADOR' | 'EVALUADOR' | 'COORDINADOR' | 'ADMINISTRADOR';
export type TipoRequisito =
  | 'EDUCACION'
  | 'EXPERIENCIA'
  | 'HABILIDAD_TECNICA'
  | 'HABILIDAD_BLANDA'
  | 'CERTIFICACION'
  | 'IDIOMA';
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}
export interface AuthResponseDTO {
  token?: string;
  email?: string;
  nombreCompleto?: string;
  usuarioId?: number;
  rol?: Rol;
  message?: string;
}
export interface CambioEstadoDTO {
  nuevoEstado?: EstadoPostulacion;
  motivo?: string;
}
export interface CriterioEvaluacionDTO {
  id?: number;
  nombre?: string;
  puntaje?: number;
  puntajeMaximo?: number;
  comentario?: string;
}
export interface DashboardDTO {
  totalPostulantes?: number;
  perfilesIncompletos?: number;
  porcentajePerfilesIncompletos?: number;
  promedioCompletitud?: number;
  totalVacantes?: number;
  vacantesPublicadas?: number;
  totalPostulaciones?: number;
  postulacionesSinSeguimiento?: number;
  porcentajeSinSeguimiento?: number;
  tiempoPromedioRespuestaDias?: number;
  postulacionesSinRetroalimentacion?: number;
  porcentajeSinRetroalimentacion?: number;
  distribucionEstadoPostulaciones?: Record<string, number>;
  cargaPorEvaluador?: Record<string, number>;
}
export interface DetalleMatchingDTO {
  id?: number;
  requisitoVacanteId?: number;
  requisitoNombre?: string;
  requisitoTipo?: string;
  puntajeObtenido?: number;
  puntajeMaximo?: number;
  justificacion?: string;
  criterioCumplido?: boolean;
}
export interface EducacionDTO {
  id?: number;
  institucion?: string;
  titulo?: string;
  campoEstudio?: string;
  nivelEducacion?: NivelEducacion;
  fechaInicio?: string;
  fechaFin?: string;
  enCurso?: boolean;
}
export interface EntrevistaCrearDTO {
  postulacionId?: number;
  evaluadorId?: number;
  fechaHoraInicio?: string;
  fechaHoraFin?: string;
  tipo?: string;
  ubicacionOEnlace?: string;
  notas?: string;
}
export interface EntrevistaDTO {
  id?: number;
  postulacionId?: number;
  postulanteNombre?: string;
  evaluadorId?: number;
  evaluadorNombre?: string;
  fechaHoraInicio?: string;
  fechaHoraFin?: string;
  tipo?: string;
  estado?: EstadoEntrevista;
  ubicacionOEnlace?: string;
  notas?: string;
}
export interface EvaluacionCrearDTO {
  postulacionId?: number;
  entrevistaId?: number;
  puntajeGeneral?: number;
  comentarios?: string;
  criterios?: CriterioEvaluacionDTO[];
}
export interface EvaluacionDTO {
  id?: number;
  postulacionId?: number;
  evaluadorId?: number;
  evaluadorNombre?: string;
  entrevistaId?: number;
  puntajeGeneral?: number;
  comentarios?: string;
  fechaEvaluacion?: string;
  criterios?: CriterioEvaluacionDTO[];
}
export interface ExperienciaDTO {
  id?: number;
  empresa?: string;
  cargo?: string;
  descripcion?: string;
  fechaInicio?: string;
  fechaFin?: string;
  actual?: boolean;
}
export interface HabilidadDTO {
  id?: number;
  nombre?: string;
  tipo?: TipoRequisito;
  nivelDominio?: string;
  aniosExperiencia?: number;
}
export interface HistorialEstadoDTO {
  id?: number;
  postulacionId?: number;
  estadoAnterior?: EstadoPostulacion;
  estadoNuevo?: EstadoPostulacion;
  motivo?: string;
  fechaCambio?: string;
  usuarioCambioId?: number;
  usuarioCambioNombre?: string;
}
export interface LoginDTO {
  email?: string;
  password?: string;
}
export interface PostulacionDTO {
  id?: number;
  postulanteId?: number;
  postulanteNombre?: string;
  vacanteId?: number;
  vacanteTitulo?: string;
  estado?: EstadoPostulacion;
  scoreCompatibilidad?: number;
  fechaPostulacion?: string;
  fechaUltimoCambioEstado?: string;
  detallesMatching?: DetalleMatchingDTO[];
}
export interface PostulanteCrearDTO {
  resumenProfesional?: string;
  telefono?: string;
  direccion?: string;
  linkedinUrl?: string;
}
export interface PostulanteDTO {
  id?: number;
  usuarioId?: number;
  nombreCompleto?: string;
  email?: string;
  resumenProfesional?: string;
  telefono?: string;
  direccion?: string;
  linkedinUrl?: string;
  perfilCompleto?: boolean;
  porcentajeCompletitud?: number;
  fechaActualizacion?: string;
  educaciones?: EducacionDTO[];
  experiencias?: ExperienciaDTO[];
  habilidades?: HabilidadDTO[];
}
export interface RequisitoVacanteDTO {
  id?: number;
  nombre?: string;
  descripcion?: string;
  tipo?: TipoRequisito;
  obligatorio?: boolean;
  pesoMatching?: number;
  valorEsperado?: string;
}
export interface RetroalimentacionDTO {
  id?: number;
  postulacionId?: number;
  evaluadorId?: number;
  evaluadorNombre?: string;
  contenido?: string;
  visiblePostulante?: boolean;
  fechaCreacion?: string;
}
export interface UsuarioDTO {
  id?: number;
  email?: string;
  nombre?: string;
  apellido?: string;
  rol?: Rol;
  activo?: boolean;
  fechaCreacion?: string;
}
export interface UsuarioRegistroDTO {
  email?: string;
  password?: string;
  nombre?: string;
  apellido?: string;
  rol?: Rol;
}
export interface VacanteCrearDTO {
  titulo?: string;
  descripcion?: string;
  empresa?: string;
  ubicacion?: string;
  modalidad?: Modalidad;
  numVacantes?: number;
  fechaCierre?: string;
  requisitos?: RequisitoVacanteDTO[];
}
export interface VacanteDTO {
  id?: number;
  titulo?: string;
  descripcion?: string;
  empresa?: string;
  ubicacion?: string;
  modalidad?: Modalidad;
  estado?: EstadoVacante;
  numVacantes?: number;
  fechaPublicacion?: string;
  fechaCierre?: string;
  fechaCreacion?: string;
  reclutadorId?: number;
  reclutadorNombre?: string;
  requisitos?: RequisitoVacanteDTO[];
}
