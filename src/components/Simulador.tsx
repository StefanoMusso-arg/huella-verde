// ============================================================
//  Simulador.tsx — "¿Qué pasaría si...?"
//  Sliders interactivos que recalculan el balance en vivo,
//  sin tocar el cálculo guardado. Pura simulación en memoria.
// ============================================================

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { calcularHuella } from "../calc/calculos";
import type { DatosLote } from "../types";

interface Props {
  datosOriginales: DatosLote;
}

function aTon(kg: number): string {
  return (kg / 1000).toLocaleString("es-AR", { maximumFractionDigits: 2 });
}

export default function Simulador({ datosOriginales }: Props) {
  // Estados propios del simulador, arrancan iguales al cálculo real.
  const [dosis, setDosis] = useState(datosOriginales.dosisFertilizanteKgHa);
  const [siembraDirecta, setSiembraDirecta] = useState(datosOriginales.siembraDirecta);
  const [cultivosCobertura, setCultivosCobertura] = useState(datosOriginales.cultivosCobertura);

  // Recalcula SOLO en memoria, con los valores movidos. No toca el historial.
  const resultadoSimulado = useMemo(() => {
    const datosSimulados: DatosLote = {
      ...datosOriginales,
      dosisFertilizanteKgHa: dosis,
      siembraDirecta,
      cultivosCobertura,
    };
    return calcularHuella(datosSimulados);
  }, [datosOriginales, dosis, siembraDirecta, cultivosCobertura]);

  const resultadoOriginal = useMemo(
    () => calcularHuella(datosOriginales),
    [datosOriginales]
  );

  const esSumidero = resultadoSimulado.balanceNeto < 0;
  const diferencia = resultadoOriginal.balanceNeto - resultadoSimulado.balanceNeto;
  const mejoro = diferencia > 0; // si el balance bajó (menos emisión neta), mejoró

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 mb-4">
      <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-1">
        🔧 ¿Qué pasaría si...?
      </h2>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
        Movés los valores y mirás cómo cambia tu balance, en el momento.
      </p>

      {/* SLIDER DOSIS DE FERTILIZANTE */}
      {datosOriginales.dosisFertilizanteKgHa > 0 && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Dosis de fertilizante
            </label>
            <span className="text-sm font-bold text-huella-700 dark:text-huella-400">
              {dosis} kg/ha
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={Math.max(datosOriginales.dosisFertilizanteKgHa * 2, 100)}
            step={5}
            value={dosis}
            onChange={(e) => setDosis(Number(e.target.value))}
            className="w-full accent-huella-600"
          />
        </div>
      )}

      {/* TOGGLE SIEMBRA DIRECTA */}
      <label className="flex items-center justify-between cursor-pointer py-2">
        <span className="text-sm text-gray-700 dark:text-gray-300">Siembra directa</span>
        <input
          type="checkbox"
          checked={siembraDirecta}
          onChange={(e) => setSiembraDirecta(e.target.checked)}
          className="h-5 w-5 accent-huella-600"
        />
      </label>

      {/* TOGGLE CULTIVOS DE COBERTURA */}
      <label className="flex items-center justify-between cursor-pointer py-2 mb-3">
        <span className="text-sm text-gray-700 dark:text-gray-300">Cultivos de cobertura</span>
        <input
          type="checkbox"
          checked={cultivosCobertura}
          onChange={(e) => setCultivosCobertura(e.target.checked)}
          className="h-5 w-5 accent-huella-600"
        />
      </label>

      {/* RESULTADO EN VIVO */}
      <motion.div
        key={`${dosis}-${siembraDirecta}-${cultivosCobertura}`}
        initial={{ opacity: 0.5, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className={`rounded-lg p-3 text-center ${
          esSumidero ? "bg-huella-50 dark:bg-huella-950" : "bg-cosecha-50 dark:bg-cosecha-950"
        }`}
      >
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Balance simulado</p>
        <p
          className={`text-2xl font-extrabold ${
            esSumidero ? "text-huella-700 dark:text-huella-300" : "text-cosecha-700 dark:text-cosecha-300"
          }`}
        >
          {esSumidero ? "−" : "+"}{aTon(Math.abs(resultadoSimulado.balanceNeto))} t CO₂
        </p>
        {Math.abs(diferencia) > 1 && (
          <p className={`text-xs font-semibold mt-1 ${mejoro ? "text-huella-600 dark:text-huella-400" : "text-cosecha-600 dark:text-cosecha-400"}`}>
            {mejoro ? "↓" : "↑"} {aTon(Math.abs(diferencia))} t respecto a tu cálculo real
          </p>
        )}
      </motion.div>
    </div>
  );
}
