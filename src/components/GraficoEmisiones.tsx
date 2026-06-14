// ============================================================
//  GraficoEmisiones.tsx — Gráfico de torta de las emisiones
//  por fuente. Muestra de dónde viene la huella del lote.
// ============================================================

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import type { ResultadoCalculo } from "../calc/calculos";

interface Props {
  resultado: ResultadoCalculo;
}

// Colores para cada fuente de emisión.
const COLORES = ["#16a34a", "#65a30d", "#ca8a04", "#dc2626"];

export default function GraficoEmisiones({ resultado }: Props) {
  // Armamos los datos del gráfico, solo con las fuentes que tienen valor.
  const datos = [
    { nombre: "Fertilización N", valor: resultado.emisionPorN },
    { nombre: "Urea", valor: resultado.emisionPorUrea },
    { nombre: "Gasoil", valor: resultado.emisionPorGasoil },
    { nombre: "Quema", valor: resultado.emisionPorQuema },
  ].filter((d) => d.valor > 0); // descartamos las fuentes en cero

  // Si no hay emisiones (caso raro), no mostramos nada.
  if (datos.length === 0) return null;

  return (
    <div className="rounded-xl border border-gray-200 p-4 mb-4">
      <h2 className="text-sm font-bold text-gray-700 mb-2">
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
          >
            {datos.map((_, i) => (
              <Cell key={i} fill={COLORES[i % COLORES.length]} />
            ))}
          </Pie>
         <Tooltip
            formatter={(valor) =>
              `${Math.round(Number(valor)).toLocaleString("es-AR")} kg CO₂e`
            }
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}