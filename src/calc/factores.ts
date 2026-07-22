// ============================================================
//  factores.ts — Constantes y factores de cálculo de Huella Verde
//  Todos los números viven acá, con su fuente para defenderlos.
// ============================================================

// ---------- FACTORES DE EMISIÓN ----------
export const FRACCION_N_A_N2O = 0.01;          // IPCC Tier 1 (1% del N)
export const CONVERSION_N_A_N2O = 44 / 28;     // estequiometría
export const GWP_N2O = 298;                    // IPCC
export const CO2_POR_LITRO_GASOIL = 2.68;      // kg CO₂ / litro
export const CO2_POR_KG_UREA = 0.733;          // IPCC (0,20 kg C × 44/12)
export const CONVERSION_C_A_CO2 = 44 / 12;     // estequiometría

// ---------- FRACCIÓN DE RETENCIÓN DE CARBONO POR PRÁCTICAS ----------
// Qué parte del carbono aportado se vuelve secuestro neto estable.
// Calibrado para coincidir con el secuestro medido por Aapresid
// en zona húmeda/subhúmeda (0,3–0,5 t C/ha/año).
export const RETENCION_SIEMBRA_DIRECTA = 0.20;
export const RETENCION_CULTIVOS_COBERTURA = 0.10;

// ---------- GASOIL POR LABOR (valores por defecto sugeridos) ----------
// Fuente: Márgenes Agropecuarios / La Nación (BCR) para siembra,
// pulverización y cosecha. Labranza: INTA (2 pasadas de rastra pesada
// a 15 L/ha c/u + 1 pasada de rastra liviana a 5 L/ha = 35 L/ha).
export const GASOIL_SIEMBRA_DEFAULT_L_HA = 10;
export const GASOIL_PULVERIZACION_DEFAULT_L_HA = 8; // por cada pasada
export const PULVERIZACIONES_DEFAULT_CANTIDAD = 4;
export const GASOIL_COSECHA_DEFAULT_L_HA = 12;
export const GASOIL_LABRANZA_DEFAULT_L_HA = 35;

// ---------- FLETE (transporte de la cosecha) ----------
// Fuente: Bolsa de Comercio de Rosario. Consumo representativo de
// un camión: 0,40 L de gasoil por km. Capacidad de carga: 28 t/viaje.
export const GASOIL_POR_KM_CAMION = 0.40;
export const TONELADAS_POR_VIAJE_CAMION = 28;
export const DISTANCIA_FLETE_DEFAULT_KM = 30; // flete corto típico a acopio (BCR)

// ---------- FERTILIZANTES ----------
export interface Fertilizante {
  id: string;
  nombre: string;
  porcentajeN: number;
  liberaCO2: boolean;
}

export const FERTILIZANTES: Fertilizante[] = [
  { id: "urea", nombre: "Urea (46% N)", porcentajeN: 0.46, liberaCO2: true },
  { id: "uan", nombre: "UAN (32% N)", porcentajeN: 0.32, liberaCO2: false },
  { id: "can", nombre: "Nitrato de amonio calcáreo (27% N)", porcentajeN: 0.27, liberaCO2: false },
  { id: "sulfato", nombre: "Sulfato de amonio (21% N)", porcentajeN: 0.21, liberaCO2: false },
];

// ---------- CULTIVOS ----------
export interface Cultivo {
  id: string;
  nombre: string;
  usaNitrogeno: boolean;
  nPorTonelada: number;       // kg de N necesarios por tonelada de grano (IPNI/INTA)
  emisionQuemaCO2e: number;   // kg CO₂e/ha por quema de rastrojo
  coefAporteCarbono: number;  // C al humus por t de rinde (método Álvarez)
  rindes: { bajo: number; medio: number; alto: number }; // t/ha por ambiente (Marcos Juárez)
}

export const CULTIVOS: Cultivo[] = [
  {
    id: "soja", nombre: "Soja",
    usaNitrogeno: false, nPorTonelada: 0, emisionQuemaCO2e: 0,
    coefAporteCarbono: 0.37,
    rindes: { bajo: 3.0, medio: 3.7, alto: 4.2 },
  },
  {
    id: "maiz", nombre: "Maíz",
    usaNitrogeno: true, nPorTonelada: 22, emisionQuemaCO2e: 525,
    coefAporteCarbono: 0.20,
    rindes: { bajo: 7.5, medio: 9.5, alto: 11.0 },
  },
  {
    id: "trigo", nombre: "Trigo",
    usaNitrogeno: true, nPorTonelada: 30, emisionQuemaCO2e: 300,
    coefAporteCarbono: 0.40,
    rindes: { bajo: 3.0, medio: 4.0, alto: 5.0 },
  },
];