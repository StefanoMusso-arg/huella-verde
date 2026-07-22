// ============================================================
//  Equivalencias.tsx — Traduce los kg de CO₂ a cosas tangibles
//  (árboles para compensar, km en auto). Hace el número más claro.
// ============================================================

import { motion } from "framer-motion";
import { TreePine, Car } from "lucide-react";

// Factores (con fuente):
// - Un árbol absorbe ~22 kg CO₂/año (Fundación Aquae, valor conservador).
// - Un auto emite ~0,19 kg CO₂/km (EPA: 2,35 kg/litro ÷ ~12 km/litro).
const CO2_POR_ARBOL_ANUAL = 22;
const CO2_POR_KM_AUTO = 0.19;

interface Props {
  emisionesKg: number; // emisiones totales en kg de CO₂
}

export default function Equivalencias({ emisionesKg }: Props) {
  if (emisionesKg <= 0) return null;

  const arboles = Math.round(emisionesKg / CO2_POR_ARBOL_ANUAL);
  const km = Math.round(emisionesKg / CO2_POR_KM_AUTO);

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 mb-4">
      <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3">
        Para que te des una idea, tus emisiones equivalen a:
      </h2>

      <div className="grid grid-cols-2 gap-3">
        {/* ÁRBOLES */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
          className="rounded-lg bg-huella-50 dark:bg-huella-950 p-3 text-center"
        >
          <TreePine size={32} className="mx-auto mb-1 text-huella-600 dark:text-huella-400" strokeWidth={1.5} />
          <p className="text-xl font-bold text-huella-700 dark:text-huella-400">
            {arboles.toLocaleString("es-AR")}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
            árboles para absorberlas en un año
          </p>
        </motion.div>

        {/* AUTO */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2, ease: "easeOut" }}
          className="rounded-lg bg-cosecha-50 dark:bg-cosecha-950 p-3 text-center"
        >
          <Car size={32} className="mx-auto mb-1 text-cosecha-600 dark:text-cosecha-400" strokeWidth={1.5} />
          <p className="text-xl font-bold text-cosecha-700 dark:text-cosecha-400">
            {km.toLocaleString("es-AR")}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
            km recorridos en auto
          </p>
        </motion.div>
      </div>
    </div>
  );
}