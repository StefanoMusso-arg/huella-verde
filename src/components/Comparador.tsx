// ============================================================
//  Comparador.tsx — Compara 2 o más lotes del historial,
//  lado a lado: balance, emisiones y captura de cada uno.
// ============================================================

import { CULTIVOS } from "../calc/factores";
import type { CalculoGuardado } from "../storage/historial";

interface Props {
  items: CalculoGuardado[];
  onVolver: () => void;
}

function aTon(kg: number): string {
  return (kg / 1000).toLocaleString("es-AR", { maximumFractionDigits: 2 });
}

function nombreCultivo(id: string): string {
  return CULTIVOS.find((c) => c.id === id)?.nombre ?? id;
}

export default function Comparador({ items, onVolver }: Props) {
  return (
    <div className="max-w-md mx-auto p-5">
      <h1 className="text-2xl font-bold text-huella-700 dark:text-huella-400 mb-1">
        Comparar lotes
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        {items.length} lotes seleccionados
      </p>

      <div className="space-y-4 mb-6">
        {items.map((item) => {
          const r = item.resultado;
          const esSumidero = r.balanceNeto < 0;
          return (
            <div
              key={item.id}
              className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4"
            >
              <p className="font-semibold text-gray-800 dark:text-gray-100 mb-2">
                {nombreCultivo(item.datos.cultivoId)} · {item.datos.superficieHa} ha
              </p>

              <FilaComparativa label="Emisiones" valor={r.emisionesTotales} />
              <FilaComparativa label="Captura" valor={r.capturaTotal} />

              <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-100">
                    Balance neto
                  </span>
                  <span
                    className={`text-sm font-bold ${
                      esSumidero
                        ? "text-huella-700 dark:text-huella-400"
                        : "text-cosecha-700 dark:text-cosecha-400"
                    }`}
                  >
                    {esSumidero ? "−" : "+"}{aTon(Math.abs(r.balanceNeto))} t
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={onVolver}
        className="w-full rounded-lg border border-huella-600 p-3 font-semibold text-huella-700 dark:text-huella-400 hover:bg-huella-50 dark:hover:bg-gray-800 active:scale-[0.98] transition-all"
      >
        ← Volver al historial
      </button>
    </div>
  );
}

function FilaComparativa({ label, valor }: { label: string; valor: number }) {
  return (
    <div className="flex justify-between items-center py-0.5">
      <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
      <span className="text-xs text-gray-700 dark:text-gray-200">
        {Math.round(valor).toLocaleString("es-AR")} kg
      </span>
    </div>
  );
}