// ============================================================
//  Evolucion.tsx — Gráfico de línea con el balance de cada
//  cálculo guardado, ordenados en el tiempo. Muestra la tendencia.
// ============================================================

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { CULTIVOS } from "../calc/factores";
import type { CalculoGuardado } from "../storage/historial";

interface Props {
  items: CalculoGuardado[];
  onVolver: () => void;
}

function nombreCultivo(id: string): string {
  return CULTIVOS.find((c) => c.id === id)?.nombre ?? id;
}

function fechaCorta(iso: string): string {
  const f = new Date(iso);
  return f.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" });
}

export default function Evolucion({ items, onVolver }: Props) {
  // Ordenamos del más viejo al más nuevo (para que el gráfico avance en el tiempo).
  const ordenados = [...items].sort(
    (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
  );

  const datosGrafico = ordenados.map((item) => ({
    fecha: fechaCorta(item.fecha),
    balanceTon: Number((item.resultado.balanceNeto / 1000).toFixed(2)),
  }));

  const cultivosPresentes = Array.from(
    new Set(items.map((i) => i.datos.cultivoId))
  );

  return (
    <div className="max-w-md mx-auto p-5">
      <h1 className="text-2xl font-bold text-huella-700 dark:text-huella-400 mb-1">
        Evolución
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        {cultivosPresentes.length === 1
          ? `Balance neto en el tiempo — ${nombreCultivo(cultivosPresentes[0])}`
          : "Balance neto de todos tus cálculos, en el tiempo"}
      </p>

      {items.length < 2 ? (
        <div className="text-center py-10">
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            Necesitás al menos 2 cálculos guardados para ver la evolución.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 mb-6">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={datosGrafico}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.4} />
              <XAxis dataKey="fecha" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(valor) => [`${valor} t CO₂e`, "Balance"]}
                contentStyle={{ borderRadius: "8px", fontSize: "13px" }}
              />
              <Line
                type="monotone"
                dataKey="balanceTon"
                stroke="#3B6D11"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#3B6D11" }}
                isAnimationActive={true}
                animationDuration={700}
              />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-2 leading-relaxed">
            Valores negativos indican que el lote captura más carbono del que emite (sumidero).
          </p>
        </div>
      )}

      <button
        onClick={onVolver}
        className="w-full rounded-lg border border-huella-600 p-3 font-semibold text-huella-700 dark:text-huella-400 hover:bg-huella-50 dark:hover:bg-gray-800 active:scale-[0.98] transition-all"
      >
        ← Volver al historial
      </button>
    </div>
  );
}