// ============================================================
//  recomendaciones.ts — Motor de recomendaciones de mitigación.
//  Cada consejo trae su ahorro estimado de CO₂e, calculado con
//  las mismas fórmulas y factores que el motor de cálculo.
// ============================================================

import {
  FRACCION_N_A_N2O,
  CONVERSION_N_A_N2O,
  GWP_N2O,
  CONVERSION_C_A_CO2,
  RETENCION_SIEMBRA_DIRECTA,
  RETENCION_CULTIVOS_COBERTURA,
  FERTILIZANTES,
  CULTIVOS,
} from "./factores";
import type { DatosLote } from "../types";

export interface Recomendacion {
  id: string;
  titulo: string;
  descripcion: string;
  ahorroEstimadoKgCO2e: number;
}

export function generarRecomendaciones(datos: DatosLote): Recomendacion[] {
  const recomendaciones: Recomendacion[] = [];

  const cultivo = CULTIVOS.find((c) => c.id === datos.cultivoId);
  const fertilizante = FERTILIZANTES.find((f) => f.id === datos.fertilizanteId);
  if (!cultivo) return recomendaciones;

  // Carbono que aporta el cultivo según su rinde (base para captura).
  const aporteCarbonoTHa = datos.rindeTHa * cultivo.coefAporteCarbono;

  // --- REGLA 1: exceso de nitrógeno ---
  if (cultivo.usaNitrogeno && fertilizante) {
    const nAplicadoHa = datos.dosisFertilizanteKgHa * fertilizante.porcentajeN;
    if (nAplicadoHa > cultivo.nReferencia) {
      const excesoNtotal = (nAplicadoHa - cultivo.nReferencia) * datos.superficieHa;
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
    // Lo que retendría si pasara a siembra directa (según su rinde).
    const ahorro =
      aporteCarbonoTHa * RETENCION_SIEMBRA_DIRECTA *
      CONVERSION_C_A_CO2 * datos.superficieHa * 1000;
    recomendaciones.push({
      id: "siembra-directa",
      titulo: "Pasá a siembra directa",
      descripcion: "La siembra directa ayuda a que el suelo retenga el carbono que aporta el cultivo y reduce el uso de combustible al evitar el laboreo.",
      ahorroEstimadoKgCO2e: ahorro,
    });
  }

  // --- REGLA 5: sumar cultivos de cobertura ---
  if (!datos.cultivosCobertura) {
    const ahorro =
      aporteCarbonoTHa * RETENCION_CULTIVOS_COBERTURA *
      CONVERSION_C_A_CO2 * datos.superficieHa * 1000;
    recomendaciones.push({
      id: "cultivos-cobertura",
      titulo: "Sumá cultivos de cobertura",
      descripcion: "Los cultivos de cobertura ayudan a retener más carbono en el suelo, lo protegen de la erosión y mejoran su estructura.",
      ahorroEstimadoKgCO2e: ahorro,
    });
  }

  return recomendaciones;
}