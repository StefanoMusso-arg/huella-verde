// ============================================================
//  Historial.tsx — Lista de cálculos guardados (con modo oscuro).
//  Cada tarjeta se puede tocar para ver el detalle completo.
// ============================================================

import { useState } from "react";
import { motion } from "framer-motion";
import { leerHistorial, borrarCalculo } from "../storage/historial";
import { CULTIVOS } from "../calc/factores";
import type { DatosLote } from "../types";

interface Props {
  onVolver: () => void;
  onVerLote: (datos: DatosLote) => void; // para ver el detalle de un lote
}

function fechaLinda(iso: string): string {
  const f = new Date(iso);
  return f.toLocaleString("es-AR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function nombreCultivo(id: string): string {
  return CULTIVOS.find((c) => c.id === id)?.nombre ?? id;
}

export default function Historial({ onVolver, onVerLote }: Props) {
  const [items, setItems] = useState(leerHistorial());

  function manejarBorrar(id: string, e: React.MouseEvent) {
    e.stopPropagation(); // evita que el clic abra el detalle al borrar
    if (confirm("¿Seguro que querés borrar este cálculo?")) {
      borrarCalculo(id);
      setItems(leerHistorial());
    }
  }

  return (
    <div className="max-w-md mx-auto p-5">
      <h1 className="text-2xl font-bold text-huella-700 dark:text-huella-400 mb-1">Historial</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Tocá un cálculo para ver el detalle completo
      </p>

      {items.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            Todavía no hay cálculos guardados.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, indice) => {
            const balance = item.resultado.balanceNeto;
            const esSumidero = balance < 0;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: indice * 0.05, ease: "easeOut" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onVerLote(item.datos)}
                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 cursor-pointer hover:border-huella-400 dark:hover:border-huella-600 hover:shadow-sm transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-100">
                      {nombreCultivo(item.datos.cultivoId)} · {item.datos.superficieHa} ha
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      {fechaLinda(item.fecha)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => manejarBorrar(item.id, e)}
                    className="text-xs text-red-400 hover:text-red-600"
                  >
                    Borrar
                  </button>
                </div>
                <p
                  className={`text-sm font-bold mt-2 ${
                    esSumidero ? "text-huella-700 dark:text-huella-400" : "text-cosecha-700 dark:text-cosecha-400"
                  }`}
                >
                  Balance: {esSumidero ? "−" : "+"}
                  {(Math.abs(balance) / 1000).toLocaleString("es-AR", {
                    maximumFractionDigits: 2,
                  })} t CO₂e
                </p>
                <p className="text-xs text-huella-600 dark:text-huella-400 mt-2">
                  Ver detalle →
                </p>
              </motion.div>
            );
          })}
        </div>
      )}

      <button
        onClick={onVolver}
        className="w-full rounded-lg border border-huella-600 p-3 font-semibold text-huella-700 dark:text-huella-400 hover:bg-huella-50 dark:hover:bg-gray-800 active:scale-[0.98] transition-all mt-6"
      >
        ← Volver
      </button>
    </div>
  );
}
