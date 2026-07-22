// ============================================================
//  Historial.tsx — Lista de cálculos guardados (con modo oscuro).
//  Cada tarjeta se puede tocar para ver el detalle completo.
//  Modo comparación: seleccionar 2+ lotes para verlos lado a lado.
// ============================================================

import { useState } from "react";
import { motion } from "framer-motion";
import { Scale, TrendingUp, Wheat, X } from "lucide-react";
import { leerHistorial, borrarCalculo, type CalculoGuardado } from "../storage/historial";
import { CULTIVOS } from "../calc/factores";
import type { DatosLote } from "../types";

interface Props {
  onVolver: () => void;
  onVerLote: (datos: DatosLote) => void; // para ver el detalle de un lote
  onComparar: (items: CalculoGuardado[]) => void; // para comparar varios
  onVerEvolucion: (items: CalculoGuardado[]) => void; // para ver la evolución en el tiempo
  onIrAFormulario: () => void; // para el estado vacío: ir directo a calcular
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

export default function Historial({ onVolver, onVerLote, onComparar, onVerEvolucion, onIrAFormulario }: Props) {
  const [items, setItems] = useState(leerHistorial());
  const [modoComparar, setModoComparar] = useState(false);
  const [seleccionados, setSeleccionados] = useState<string[]>([]);

  function manejarBorrar(id: string, e: React.MouseEvent) {
    e.stopPropagation(); // evita que el clic abra el detalle al borrar
    if (confirm("¿Seguro que querés borrar este cálculo?")) {
      borrarCalculo(id);
      setItems(leerHistorial());
    }
  }

  function manejarClickTarjeta(item: CalculoGuardado) {
    if (modoComparar) {
      setSeleccionados((prev) =>
        prev.includes(item.id)
          ? prev.filter((id) => id !== item.id)
          : [...prev, item.id]
      );
    } else {
      onVerLote(item.datos);
    }
  }

  function alternarModoComparar() {
    setModoComparar(!modoComparar);
    setSeleccionados([]);
  }

  function confirmarComparacion() {
    const elegidos = items.filter((i) => seleccionados.includes(i.id));
    onComparar(elegidos);
  }

  return (
    <div className="max-w-md mx-auto p-5">
      <h1 className="text-2xl font-bold text-huella-700 dark:text-huella-400 mb-1">Historial</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        {modoComparar
          ? "Elegí 2 o más lotes para compararlos"
          : "Tocá un cálculo para ver el detalle completo"}
      </p>

      {items.length > 1 && !modoComparar && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            onClick={alternarModoComparar}
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 p-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Scale size={16} /> Comparar
          </button>
          <button
            onClick={() => onVerEvolucion(items)}
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 p-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <TrendingUp size={16} /> Evolución
          </button>
        </div>
      )}

      {modoComparar && (
        <button
          onClick={alternarModoComparar}
          className="flex items-center justify-center gap-2 w-full rounded-lg border border-cosecha-600 bg-cosecha-50 dark:bg-cosecha-950 text-cosecha-700 dark:text-cosecha-400 p-2.5 text-sm font-semibold mb-4 transition-colors"
        >
          <X size={16} /> Cancelar comparación
        </button>
      )}

      {items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center py-12"
        >
          <Wheat size={56} className="mx-auto mb-4 text-huella-500 dark:text-huella-400" strokeWidth={1.5} />
          <p className="text-gray-700 dark:text-gray-200 font-semibold mb-1">
            Todavía no hay cálculos guardados
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-6 px-4">
            Cargá los datos de tu primer lote y empezá a ver tu huella de carbono.
          </p>
          <button
            onClick={onIrAFormulario}
            className="rounded-lg bg-huella-600 px-5 py-3 font-semibold text-white hover:bg-huella-700 active:scale-[0.98] transition-all"
          >
            Calcular tu primer lote
          </button>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {items.map((item, indice) => {
            const balance = item.resultado.balanceNeto;
            const esSumidero = balance < 0;
            const marcado = seleccionados.includes(item.id);
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: indice * 0.05, ease: "easeOut" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => manejarClickTarjeta(item)}
                className={`rounded-xl border p-4 cursor-pointer transition-colors ${
                  marcado
                    ? "border-huella-500 bg-huella-50 dark:bg-huella-950"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-huella-400 dark:hover:border-huella-600 hover:shadow-sm"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-2">
                    {modoComparar && (
                      <input
                        type="checkbox"
                        checked={marcado}
                        readOnly
                        className="h-4 w-4 mt-1 accent-huella-600"
                      />
                    )}
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-100">
                        {nombreCultivo(item.datos.cultivoId)} · {item.datos.superficieHa} ha
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        {fechaLinda(item.fecha)}
                      </p>
                    </div>
                  </div>
                  {!modoComparar && (
                    <button
                      onClick={(e) => manejarBorrar(item.id, e)}
                      className="text-xs text-red-400 hover:text-red-600"
                    >
                      Borrar
                    </button>
                  )}
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
                {!modoComparar && (
                  <p className="text-xs text-huella-600 dark:text-huella-400 mt-2">
                    Ver detalle →
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {modoComparar && seleccionados.length >= 2 && (
        <button
          onClick={confirmarComparacion}
          className="w-full rounded-lg bg-huella-600 p-3 font-semibold text-white hover:bg-huella-700 active:scale-[0.98] transition-all mt-4"
        >
          Comparar {seleccionados.length} lotes
        </button>
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