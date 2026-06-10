// ============================================================
//  recomendaciones.ts — Motor de recomendaciones de mitigación
//  Según los datos del lote, genera consejos concretos con el
//  ahorro estimado de CO₂e de cada uno.
// ============================================================

import {
  FRACCION_N_A_N2O,
  CONVERSION_N_A_N2O,
  GWP_N2O,
  CAPTURA_SIEMBRA_DIRECTA,
  CAPTURA_CULTIVOS_COBERTURA,
  CONVERSION_C_A_CO2,
  FERTILIZANTES,
  CULTIVOS,
} from "./factores";
import type { DatosLote } from "./calculos";

// ---------- FORMA DE UNA RECOMENDACIÓN ----------
export interface Recomendacion {
  id: string;
  titulo: string;             // la acción, corta
  descripcion: string;        // explicación en lenguaje simple
  ahorroEstimadoKgCO2e: number; // cuánto CO₂e se ahorraría
}

// ============================================================
//  FUNCIÓN PRINCIPAL: genera las recomendaciones de un lote
// ============================================================
export function generarRecomendaciones(datos: DatosLote): Recomendacion[] {
  const recomendaciones: Recomendacion[] = [];

  const cultivo = CULTIVOS.find((c) => c.id === datos.cultivoId);
  const fertilizante = FERTILIZANTES.find((f) => f.id === datos.fertilizanteId);
  if (!cultivo) return recomendaciones; // sin cultivo no hay nada que sugerir

  // --- REGLA 1: exceso de nitrógeno ---
  // Si el cultivo usa N y la dosis aplicada supera la referencia del INTA.
  if (cultivo.usaNitrogeno && fertilizante) {
    const nAplicadoHa = datos.dosisFertilizanteKgHa * fertilizante.porcentajeN;

    if (nAplicadoHa > cultivo.nReferencia) {
      // Cuánto N de más se está aplicando por hectárea, en todo el lote.
      const excesoNHa = nAplicadoHa - cultivo.nReferencia;
      const excesoNtotal = excesoNHa * datos.superficieHa;
      // Ese exceso traducido a CO₂e (misma cadena N → N₂O → CO₂).
      const ahorro = excesoNtotal * FRACCION_N_A_N2O * CONVERSION_N_A_N2O * GWP_N2O;

      recomendaciones.push({
        id: "ajustar-n",
        titulo: "Ajustá la dosis de nitrógeno",
        descripcion: `Estás aplicando ~${Math.round(nAplicadoHa)} kg de N por hectárea, por encima del objetivo de referencia (${cultivo.nReferencia} kg/ha) para ${cultivo.nombre}. Un análisis de suelo te permite ajustar la dosis, ahorrar fertilizante y reducir emisiones.`,
        ahorroEstimadoKgCO2e: ahorro,
      });
    }
  }

  // --- REGLA 2: la soja no necesita nitrógeno ---
  if (!cultivo.usaNitrogeno && fertilizante && datos.dosisFertilizanteKgHa > 0) {
    const nAplicadoTotal =
      datos.dosisFertilizanteKgHa * fertilizante.porcentajeN * datos.superficieHa;
    const ahorro = nAplicadoTotal * FRACCION_N_A_N2O * CONVERSION_N_A_N2O * GWP_N2O;

    recomendaciones.push({
      id: "soja-sin-n",
      titulo: "La soja no necesita nitrógeno",
      descripcion: "La soja fija su propio nitrógeno del aire. Podés evitar el fertilizante nitrogenado, ahorrando ese costo y sus emisiones.",
      ahorroEstimadoKgCO2e: ahorro,
    });
  }

  // --- REGLA 3: no quemar rastrojos ---
  if (datos.quemaRastrojos) {
    const ahorro = cultivo.emisionQuemaCO2e * datos.superficieHa;
    recomendaciones.push({
      id: "no-quemar",
      titulo: "No quemes los rastrojos",
      descripcion: "Incorporar el rastrojo al suelo, en vez de quemarlo, evita emisiones y aporta materia orgánica que mejora la fertilidad.",
      ahorroEstimadoKgCO2e: ahorro,
    });
  }

  // --- REGLA 4: adoptar siembra directa ---
  if (!datos.siembraDirecta) {
    const ahorro =
      CAPTURA_SIEMBRA_DIRECTA * datos.superficieHa * CONVERSION_C_A_CO2 * 1000;
    recomendaciones.push({
      id: "siembra-directa",
      titulo: "Pasá a siembra directa",
      descripcion: "La siembra directa ayuda a que el suelo capture carbono y reduce el uso de combustible al evitar el laboreo.",
      ahorroEstimadoKgCO2e: ahorro,
    });
  }

  // --- REGLA 5: sumar cultivos de cobertura ---
  if (!datos.cultivosCobertura) {
    const ahorro =
      CAPTURA_CULTIVOS_COBERTURA * datos.superficieHa * CONVERSION_C_A_CO2 * 1000;
    recomendaciones.push({
      id: "cultivos-cobertura",
      titulo: "Sumá cultivos de cobertura",
      descripcion: "Los cultivos de cobertura capturan carbono, protegen el suelo de la erosión y mejoran su estructura.",
      ahorroEstimadoKgCO2e: ahorro,
    });
  }

  return recomendaciones;
}