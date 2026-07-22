// ============================================================
//  Onboarding.tsx — Pantalla de bienvenida, solo la primera vez.
//  2-3 tarjetas explicando qué hace la app antes de empezar.
//  En la última, el usuario elige si quiere volver a verla o no.
// ============================================================

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onTerminar: (noMostrarDeNuevo: boolean) => void;
}

const PASOS = [
  {
    titulo: "Medí tu huella de carbono",
    texto: "Cargá los datos de tu lote y descubrí en segundos cuánto emite tu campaña y cuánto carbono captura tu suelo.",
    icono: "🌱",
  },
  {
    titulo: "Con respaldo científico real",
    texto: "Cada número usa metodología del IPCC, INTA y Aapresid. Nada inventado, todo con fuente y transparente.",
    icono: "📊",
  },
  {
    titulo: "Recomendaciones para mejorar",
    texto: "Recibí sugerencias concretas para reducir tu huella, con el ahorro estimado de cada una. Gratis y sin conexión.",
    icono: "💡",
  },
];

export default function Onboarding({ onTerminar }: Props) {
  const [paso, setPaso] = useState(0);
  const [noMostrarDeNuevo, setNoMostrarDeNuevo] = useState(true);
  const esUltimo = paso === PASOS.length - 1;

  function siguiente() {
    if (esUltimo) {
      onTerminar(noMostrarDeNuevo);
    } else {
      setPaso(paso + 1);
    }
  }

  return (
    <div className="max-w-md mx-auto p-5 min-h-[80vh] flex flex-col justify-between">
      <div>
        {/* SALTAR */}
        <div className="flex justify-end mb-8">
          <button
            onClick={() => onTerminar(noMostrarDeNuevo)}
            className="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
          >
            Saltar
          </button>
        </div>

        {/* TARJETA DEL PASO ACTUAL */}
        <AnimatePresence mode="wait">
          <motion.div
            key={paso}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="text-center"
          >
            <p className="text-6xl mb-6">{PASOS[paso].icono}</p>
            <h1 className="text-2xl font-bold text-huella-700 dark:text-huella-400 mb-3">
              {PASOS[paso].titulo}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed px-2">
              {PASOS[paso].texto}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div>
        {/* PUNTITOS DE PROGRESO */}
        <div className="flex justify-center gap-2 mb-6">
          {PASOS.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${
                i === paso
                  ? "w-6 bg-huella-600"
                  : "w-2 bg-gray-300 dark:bg-gray-600"
              }`}
            />
          ))}
        </div>

        {/* CHECKBOX "NO VOLVER A MOSTRAR" — solo en la última tarjeta */}
        {esUltimo && (
          <motion.label
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-2 mb-4 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={noMostrarDeNuevo}
              onChange={(e) => setNoMostrarDeNuevo(e.target.checked)}
              className="h-4 w-4 accent-huella-600"
            />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              No volver a mostrar esto
            </span>
          </motion.label>
        )}

        {/* BOTÓN SIGUIENTE / EMPEZAR */}
        <button
          onClick={siguiente}
          className="w-full rounded-lg bg-huella-600 p-3 font-semibold text-white hover:bg-huella-700 active:scale-[0.98] transition-all"
        >
          {esUltimo ? "Empezar" : "Siguiente"}
        </button>
      </div>
    </div>
  );
}