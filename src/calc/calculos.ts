// ============================================================
//  calculos.ts — El motor de cálculo de Huella Verde
//  Emisiones por fuente + captura según rinde (método Álvarez/INTA)
//  modulada por las prácticas de manejo. Devuelve el balance.
// ============================================================

import {
  FRACCION_N_A_N2O,
  CONVERSION_N_A_N2O,
  GWP_N2O,
  CO2_POR_LITRO_GASOIL,
  CO2_POR_KG_UREA,
  CONVERSION_C_A_CO2,
  RETENCION_SIEMBRA_DIRECTA,
  RETENCION_CULTIVOS_COBERTURA,
  FERTILIZANTES,
  CULTIVOS,
} from "./factores";
import type { DatosLote } from "../types";

// ---------- LO QUE DEVUELVE EL CÁLCULO ----------
export interface ResultadoCalculo {
  emisionPorN: number;
  emisionPorGasoil: number;
  emisionPorUrea: number;
  emisionPorQuema: number;
  emisionesTotales: number;
  capturaTotal: number;
  balanceNeto: number;
}

// ============================================================
//  FUNCIÓN PRINCIPAL
// ============================================================
export function calcularHuella(datos: DatosLote): ResultadoCalculo {
  const cultivo = CULTIVOS.find((c) => c.id === datos.cultivoId);
  const fertilizante = FERTILIZANTES.find((f) => f.id === datos.fertilizanteId);

  if (!cultivo) {
    throw new Error("Cultivo no encontrado: " + datos.cultivoId);
  }

  // --- 1) EMISIÓN POR NITRÓGENO ---
  let emisionPorN = 0;
  let emisionPorUrea = 0;

  if (cultivo.usaNitrogeno && fertilizante) {
    const kgFertilizanteTotal = datos.dosisFertilizanteKgHa * datos.superficieHa;
    const kgNitrogeno = kgFertilizanteTotal * fertilizante.porcentajeN;

    const kgN2O = kgNitrogeno * FRACCION_N_A_N2O * CONVERSION_N_A_N2O;
    emisionPorN = kgN2O * GWP_N2O;

    if (fertilizante.liberaCO2) {
      emisionPorUrea = kgFertilizanteTotal * CO2_POR_KG_UREA;
    }
  }

  // --- 2) EMISIÓN POR GASOIL ---
  const emisionPorGasoil =
    datos.gasoilLHa * datos.superficieHa * CO2_POR_LITRO_GASOIL;

  // --- 3) EMISIÓN POR QUEMA DE RASTROJOS ---
  const emisionPorQuema = datos.quemaRastrojos
    ? cultivo.emisionQuemaCO2e * datos.superficieHa
    : 0;

  // --- SUMA DE EMISIONES ---
  const emisionesTotales =
    emisionPorN + emisionPorGasoil + emisionPorUrea + emisionPorQuema;

  // --- 4) CAPTURA DE CARBONO (método del rinde + prácticas) ---
  // 4a. Carbono que el cultivo aporta al humus según su rinde (Álvarez).
  //     t C/ha = rinde (t/ha) × coeficiente del cultivo
  const aporteCarbonoTHa = datos.rindeTHa * cultivo.coefAporteCarbono;

  // 4b. Qué fracción de ese aporte se retiene según las prácticas.
  //     Sin siembra directa, no hay retención neta estable.
  let fraccionRetencion = 0;
  if (datos.siembraDirecta) fraccionRetencion += RETENCION_SIEMBRA_DIRECTA;
  if (datos.cultivosCobertura) fraccionRetencion += RETENCION_CULTIVOS_COBERTURA;

  // 4c. Carbono retenido → pasado a CO₂ → por toda la superficie → a kg.
  const capturaTotal =
    aporteCarbonoTHa * fraccionRetencion *
    CONVERSION_C_A_CO2 * datos.superficieHa * 1000;

  // --- 5) BALANCE NETO ---
  const balanceNeto = emisionesTotales - capturaTotal;

  return {
    emisionPorN,
    emisionPorGasoil,
    emisionPorUrea,
    emisionPorQuema,
    emisionesTotales,
    capturaTotal,
    balanceNeto,
  };
}