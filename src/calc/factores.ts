// ============================================================
//  factores.ts — Constantes y factores de cálculo de Huella Verde
//  TODOS los números viven acá. Si hay que cambiar un valor,
//  se cambia en este archivo y se actualiza en toda la app.
//  Cada factor lleva su fuente para poder defenderlo.
// ============================================================

// ---------- FACTORES DE EMISIÓN (conversión) ----------

// Fracción del nitrógeno aplicado que se emite como N₂O.
// Fuente: IPCC, metodología Tier 1 (emisión directa) → 1% del N.
export const FRACCION_N_A_N2O = 0.01;

// Conversión de N (nitrógeno) a N₂O (molécula completa).
// Surge de los pesos moleculares: 44/28. Estequiometría.
export const CONVERSION_N_A_N2O = 44 / 28;

// Potencial de Calentamiento Global del N₂O respecto al CO₂.
// Fuente: IPCC (AR4), valor usado por el Inventario Nacional argentino.
export const GWP_N2O = 298;

// Emisión de CO₂ por litro de gasoil quemado.
// Factor estándar de combustión del diésel.
export const CO2_POR_LITRO_GASOIL = 2.68; // kg CO₂ / litro

// CO₂ liberado por la descomposición de la urea en el suelo.
// Fuente: IPCC (0,20 kg C por kg de urea × 44/12).
export const CO2_POR_KG_UREA = 0.733; // kg CO₂ / kg urea

// Conversión de Carbono (C) a CO₂. Estequiometría: 44/12.
export const CONVERSION_C_A_CO2 = 44 / 12;

// ---------- FERTILIZANTES ----------
// Lista centralizada. Para sumar uno nuevo, se agrega una línea acá
// y aparece solo en toda la app (formulario, cálculo, etc.).

export interface Fertilizante {
  id: string;
  nombre: string;
  porcentajeN: number;   // fracción de nitrógeno (0.46 = 46%)
  liberaCO2: boolean;    // true solo para la urea (descomposición)
}

export const FERTILIZANTES: Fertilizante[] = [
  { id: "urea", nombre: "Urea", porcentajeN: 0.46, liberaCO2: true },
  // Para sumar más adelante, descomentá estas líneas:
  // { id: "uan", nombre: "UAN", porcentajeN: 0.32, liberaCO2: false },
  // { id: "can", nombre: "CAN", porcentajeN: 0.27, liberaCO2: false },
];

// ---------- CULTIVOS ----------
// nReferencia = dosis de N (kg/ha) objetivo total para el cultivo.
// El motor de recomendaciones la usa para detectar sobrefertilización.

export interface Cultivo {
  id: string;
  nombre: string;
  usaNitrogeno: boolean; // la soja NO se fertiliza con N (fija el suyo)
  nReferencia: number;   // kg N/ha objetivo. Fuente: INTA
  emisionQuemaCO2e: number; // kg CO₂e/ha estimado por quema de rastrojo
}

export const CULTIVOS: Cultivo[] = [
  // La soja fija su propio nitrógeno → no se fertiliza con N.
  { id: "soja",  nombre: "Soja",  usaNitrogeno: false, nReferencia: 0,   emisionQuemaCO2e: 0 },
  // Maíz: dosis óptimas 90–170 kg N/ha. Fuente: INTA. Quema estimada.
  { id: "maiz",  nombre: "Maíz",  usaNitrogeno: true,  nReferencia: 150, emisionQuemaCO2e: 525 },
  // Trigo: objetivo 140–150 kg N/ha. Fuente: INTA Marcos Juárez. Quema estimada.
  { id: "trigo", nombre: "Trigo", usaNitrogeno: true,  nReferencia: 150, emisionQuemaCO2e: 300 },
];

// ---------- CAPTURA DE CARBONO EN SUELO ----------
// Valores en toneladas de C por hectárea por año.
// Fuente: Aapresid (Red de Brechas de Carbono), zona húmeda/subhúmeda.

export const CAPTURA_SIEMBRA_DIRECTA = 0.3;   // t C/ha/año
export const CAPTURA_CULTIVOS_COBERTURA = 0.2; // t C/ha/año (adicional)

// ---------- VALORES POR DEFECTO ----------

// Consumo de gasoil típico por hectárea (proceso productivo).
// Fuente: Bolsa de Comercio de Rosario (~25 L/ha).
export const GASOIL_DEFAULT_L_HA = 25;