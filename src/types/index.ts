// ============================================================
//  types/index.ts — Tipos compartidos por toda la app.
//  Acá vive la "forma" de los datos que usan varios archivos.
// ============================================================

// Lo que carga el productor en el formulario.
export interface DatosLote {
  cultivoId: string;
  superficieHa: number;
  fertilizanteId: string;
  dosisFertilizanteKgHa: number;
  gasoilLHa: number;
  quemaRastrojos: boolean;
  siembraDirecta: boolean;
  cultivosCobertura: boolean;
}