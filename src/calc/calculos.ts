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
  GASOIL_POR_KM_CAMION,
  TONELADAS_POR_VIAJE_CAMION,
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
  emisionPorFlete: number;
  emisionesTotales: number;
  capturaTotal: number;
  balanceNeto: number;
}

// ============================================================
//  BLINDAJE: convierte cualquier valor sospechoso (NaN, Infinity,
//  negativo, undefined) en 0, para que el cálculo nunca "explote".
// ============================================================
function numeroSeguro(valor: number | undefined | null): number {
  if (valor === undefined || valor === null) return 0;
  if (typeof valor !== "number") return 0;
  if (isNaN(valor) || !isFinite(valor)) return 0;
  if (valor < 0) return 0;
  return valor;
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

  // Todos los valores numéricos de entrada pasan por el blindaje ANTES de usarse.
  const superficieHa = numeroSeguro(datos.superficieHa);
  const rindeTHa = numeroSeguro(datos.rindeTHa);
  const dosisFertilizanteKgHa = numeroSeguro(datos.dosisFertilizanteKgHa);
  const gasoilSiembraLHa = numeroSeguro(datos.gasoilSiembraLHa);
  const cantidadPulverizaciones = numeroSeguro(datos.cantidadPulverizaciones);
  const gasoilPulverizacionLHa = numeroSeguro(datos.gasoilPulverizacionLHa);
  const gasoilCosechaLHa = numeroSeguro(datos.gasoilCosechaLHa);
  const gasoilLabranzaLHa = numeroSeguro(datos.gasoilLabranzaLHa);
  const distanciaFleteKm = numeroSeguro(datos.distanciaFleteKm);

  // --- 1) EMISIÓN POR NITRÓGENO ---
  let emisionPorN = 0;
  let emisionPorUrea = 0;

  if (cultivo.usaNitrogeno && fertilizante) {
    const kgFertilizanteTotal = dosisFertilizanteKgHa * superficieHa;
    const kgNitrogeno = kgFertilizanteTotal * fertilizante.porcentajeN;

    const kgN2O = kgNitrogeno * FRACCION_N_A_N2O * CONVERSION_N_A_N2O;
    emisionPorN = kgN2O * GWP_N2O;

    if (fertilizante.liberaCO2) {
      emisionPorUrea = kgFertilizanteTotal * CO2_POR_KG_UREA;
    }
  }

  // --- 2) EMISIÓN POR GASOIL (desglosado por labor) ---
  // Labranza solo cuenta si el productor NO hace siembra directa.
  const gasoilLabranza = datos.siembraDirecta ? 0 : gasoilLabranzaLHa;

  const gasoilTotalLHa =
    gasoilSiembraLHa +
    (cantidadPulverizaciones * gasoilPulverizacionLHa) +
    gasoilCosechaLHa +
    gasoilLabranza;

  const emisionPorGasoil =
    gasoilTotalLHa * superficieHa * CO2_POR_LITRO_GASOIL;

  // --- 3) EMISIÓN POR QUEMA DE RASTROJOS ---
  const emisionPorQuema = datos.quemaRastrojos
    ? cultivo.emisionQuemaCO2e * superficieHa
    : 0;

  // --- 4) EMISIÓN POR FLETE (transporte de la cosecha al destino) ---
  // Toneladas totales cosechadas ÷ capacidad del camión = cantidad de viajes.
  // Cada viaje recorre la distancia ida y vuelta.
  // Blindaje extra: si TONELADAS_POR_VIAJE_CAMION fuera 0 por algún motivo,
  // esto evita una división por cero.
  const toneladasTotales = rindeTHa * superficieHa;
  const viajesDeCamion =
    TONELADAS_POR_VIAJE_CAMION > 0 ? toneladasTotales / TONELADAS_POR_VIAJE_CAMION : 0;
  const kmTotalesRecorridos = viajesDeCamion * distanciaFleteKm * 2; // ida y vuelta
  const litrosFlete = kmTotalesRecorridos * GASOIL_POR_KM_CAMION;
  const emisionPorFlete = numeroSeguro(litrosFlete * CO2_POR_LITRO_GASOIL);

  // --- SUMA DE EMISIONES ---
  const emisionesTotales =
    emisionPorN + emisionPorGasoil + emisionPorUrea + emisionPorQuema + emisionPorFlete;

  // --- 5) CAPTURA DE CARBONO (método del rinde + prácticas) ---
  // 5a. Carbono que el cultivo aporta al humus según su rinde (Álvarez).
  //     t C/ha = rinde (t/ha) × coeficiente del cultivo
  const aporteCarbonoTHa = rindeTHa * cultivo.coefAporteCarbono;

  // 5b. Qué fracción de ese aporte se retiene según las prácticas.
  //     Sin siembra directa, no hay retención neta estable.
  let fraccionRetencion = 0;
  if (datos.siembraDirecta) fraccionRetencion += RETENCION_SIEMBRA_DIRECTA;
  if (datos.cultivosCobertura) fraccionRetencion += RETENCION_CULTIVOS_COBERTURA;

  // 5c. Carbono retenido → pasado a CO₂ → por toda la superficie → a kg.
  const capturaTotal =
    aporteCarbonoTHa * fraccionRetencion *
    CONVERSION_C_A_CO2 * superficieHa * 1000;

  // --- 6) BALANCE NETO ---
  const balanceNeto = emisionesTotales - capturaTotal;

  return {
    emisionPorN: numeroSeguro(emisionPorN),
    emisionPorGasoil: numeroSeguro(emisionPorGasoil),
    emisionPorUrea: numeroSeguro(emisionPorUrea),
    emisionPorQuema: numeroSeguro(emisionPorQuema),
    emisionPorFlete: numeroSeguro(emisionPorFlete),
    emisionesTotales: numeroSeguro(emisionesTotales),
    capturaTotal: numeroSeguro(capturaTotal),
    balanceNeto, // este puede ser negativo legítimamente (sumidero), no se blinda a positivo
  };
}