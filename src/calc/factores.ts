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

// ---------- VALOR POR DEFECTO ----------
export const GASOIL_DEFAULT_L_HA = 25;         // Bolsa de Comercio de Rosario

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
  nReferencia: number;        // kg N/ha objetivo (INTA)
  emisionQuemaCO2e: number;   // kg CO₂e/ha por quema de rastrojo
  coefAporteCarbono: number;  // C al humus por t de rinde (método Álvarez)
  rindes: { bajo: number; medio: number; alto: number }; // t/ha por ambiente (Marcos Juárez)
}

export const CULTIVOS: Cultivo[] = [
  {
    id: "soja", nombre: "Soja",
    usaNitrogeno: false, nReferencia: 0, emisionQuemaCO2e: 0,
    coefAporteCarbono: 0.37,
    rindes: { bajo: 3.0, medio: 3.7, alto: 4.2 },
  },
  {
    id: "maiz", nombre: "Maíz",
    usaNitrogeno: true, nReferencia: 150, emisionQuemaCO2e: 525,
    coefAporteCarbono: 0.20,
    rindes: { bajo: 7.5, medio: 9.5, alto: 11.0 },
  },
  {
    id: "trigo", nombre: "Trigo",
    usaNitrogeno: true, nReferencia: 150, emisionQuemaCO2e: 300,
    coefAporteCarbono: 0.40,
    rindes: { bajo: 3.0, medio: 4.0, alto: 5.0 },
  },
];