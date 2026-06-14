// ============================================================
//  types/index.ts — Tipos compartidos por toda la app.
// ============================================================

export interface DatosLote {
  cultivoId: string;
  superficieHa: number;
  rindeTHa: number;          // NUEVO: rinde del cultivo en toneladas/ha
  fertilizanteId: string;
  dosisFertilizanteKgHa: number;
  gasoilLHa: number;
  quemaRastrojos: boolean;
  siembraDirecta: boolean;
  cultivosCobertura: boolean;
}