// ============================================================
//  GraficoEmisiones.tsx — Gráfico de torta de las emisiones
//  por fuente. Muestra de dónde viene la huella del lote.
// ============================================================

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import type { ResultadoCalculo } from "../calc/calculos";

interface Props {
  resultado: ResultadoCalculo;
}

// Colores para cada fuente de emisión (paleta huella + cosecha).
const COLORES = ["#3B6D11", "#639922", "#BA7517", "#D68A1A", "#854F0B"];

export default function GraficoEmisiones({ resultado }: Props) {
  // Armamos los datos del gráfico, solo con las fuentes que tienen valor.
  const datos = [
    { nombre: "Fertilización N", valor: resultado.emisionPorN },
    { nombre: "Urea", valor: resultado.emisionPorUrea },
    { nombre: "Gasoil", valor: resultado.emisionPorGasoil },
    { nombre: "Flete", valor: resultado.emisionPorFlete },
    { nombre: "Quema", valor: resultado.emisionPorQuema },
  ].filter((d) => d.valor > 0); // descartamos las fuentes en cero

  // Si no hay emisiones (caso raro), no mostramos nada.
  if (datos.length === 0) return null;

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 mb-4">
      <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">
        ¿De dónde viene tu huella?
      </h2>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={datos}
            dataKey="valor"
            nameKey="nombre"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label={(entry) =>
              `${((entry.percent ?? 0) * 100).toFixed(0)}%`
            }
            isAnimationActive={true}
            animationDuration={700}
            animationEasing="ease-out"
          >
            {datos.map((_, i) => (
              <Cell key={i} fill={COLORES[i % COLORES.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(valor) =>
              `${Math.round(Number(valor)).toLocaleString("es-AR")} kg CO₂e`
            }
            contentStyle={{
              backgroundColor: "var(--tooltip-bg, white)",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "13px",
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: "12px" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
} 