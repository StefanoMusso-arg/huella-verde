// ============================================================
//  types/index.ts — Tipos compartidos por toda la app.
// ============================================================

export interface DatosLote {
  cultivoId: string;
  superficieHa: number;
  rindeTHa: number;          // rinde del cultivo en toneladas/ha
  fertilizanteId: string;
  dosisFertilizanteKgHa: number;

  // --- GASOIL: desglose por labor (reemplaza al campo único) ---
  gasoilSiembraLHa: number;        // litros/ha en siembra + fertilización
  cantidadPulverizaciones: number; // cantidad de pasadas de pulverización
  gasoilPulverizacionLHa: number;  // litros/ha por CADA pasada de pulverización
  gasoilCosechaLHa: number;        // litros/ha en cosecha
  gasoilLabranzaLHa: number;       // litros/ha en labranza (solo si no hace siembra directa)

  // --- FLETE: transporte de la cosecha al destino ---
  distanciaFleteKm: number;        // km al acopio/destino (un tramo)

  quemaRastrojos: boolean;
  siembraDirecta: boolean;
  cultivosCobertura: boolean;
}