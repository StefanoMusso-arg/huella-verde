// ============================================================
//  calculos.ts — El motor de cálculo de Huella Verde
//  Toma los datos del lote y devuelve emisiones, captura y balance.
//  Usa SIEMPRE los factores definidos en factores.ts.
// ============================================================

import {
  FRACCION_N_A_N2O,
  CONVERSION_N_A_N2O,
  GWP_N2O,
  CO2_POR_LITRO_GASOIL,
  CO2_POR_KG_UREA,
  CONVERSION_C_A_CO2,
  CAPTURA_SIEMBRA_DIRECTA,
  CAPTURA_CULTIVOS_COBERTURA,
  FERTILIZANTES,
  CULTIVOS,
} from "./factores";
import type { DatosLote } from "../types";

// ---------- LO QUE DEVUELVE EL CÁLCULO (salida) ----------
export interface ResultadoCalculo {
  emisionPorN: number;        // kg CO₂e por el nitrógeno
  emisionPorGasoil: number;   // kg CO₂ por el gasoil
  emisionPorUrea: number;     // kg CO₂ por la urea
  emisionPorQuema: number;    // kg CO₂e por quema de rastrojos
  emisionesTotales: number;   // suma de todo lo emitido
  capturaTotal: number;       // kg CO₂e capturado por el suelo
  balanceNeto: number;        // emisiones - captura
}

// ============================================================
//  FUNCIÓN PRINCIPAL: calcula la huella de un lote
// ============================================================
export function calcularHuella(datos: DatosLote): ResultadoCalculo {
  // Buscamos el cultivo y el fertilizante elegidos en nuestras listas.
  const cultivo = CULTIVOS.find((c) => c.id === datos.cultivoId);
  const fertilizante = FERTILIZANTES.find((f) => f.id === datos.fertilizanteId);

  // Si no se encuentra el cultivo, no podemos calcular (seguridad).
  if (!cultivo) {
    throw new Error("Cultivo no encontrado: " + datos.cultivoId);
  }

  // --- 1) EMISIÓN POR NITRÓGENO (la fuente estrella) ---
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

  // --- 3) EMISIÓN POR QUEMA DE RASTROJOS (estimación) ---
  const emisionPorQuema = datos.quemaRastrojos
    ? cultivo.emisionQuemaCO2e * datos.superficieHa
    : 0;

  // --- SUMA DE TODAS LAS EMISIONES ---
  const emisionesTotales =
    emisionPorN + emisionPorGasoil + emisionPorUrea + emisionPorQuema;

  // --- 4) CAPTURA DE CARBONO EN EL SUELO ---
  let capturaTC = 0;
  if (datos.siembraDirecta) capturaTC += CAPTURA_SIEMBRA_DIRECTA;
  if (datos.cultivosCobertura) capturaTC += CAPTURA_CULTIVOS_COBERTURA;

  const capturaTotal =
    capturaTC * datos.superficieHa * CONVERSION_C_A_CO2 * 1000;

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