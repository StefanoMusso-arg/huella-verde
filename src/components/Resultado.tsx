// ============================================================
//  Resultado.tsx — Pantalla de resultados (con modo oscuro).
// ============================================================

import type { DatosLote } from "../types";
import { calcularHuella } from "../calc/calculos";
import { generarRecomendaciones } from "../calc/recomendaciones";
import GraficoEmisiones from "./GraficoEmisiones";

interface Props {
  datos: DatosLote;
  onVolver: () => void;
}

function aTon(kg: number): string {
  return (kg / 1000).toLocaleString("es-AR", { maximumFractionDigits: 2 });
}
function aKg(kg: number): string {
  return Math.round(kg).toLocaleString("es-AR");
}

export default function Resultado({ datos, onVolver }: Props) {
  const r = calcularHuella(datos);
  const recomendaciones = generarRecomendaciones(datos);
  const esSumidero = r.balanceNeto < 0;

  return (
    <div className="max-w-md mx-auto p-5">
      {/* BALANCE NETO */}
      <div
        className={`rounded-2xl p-6 text-center mb-5 ${
          esSumidero ? "bg-green-100 dark:bg-green-900" : "bg-orange-50 dark:bg-orange-950"
        }`}
      >
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
          Balance neto de tu campaña
        </p>
        <p
          className={`text-4xl font-bold ${
            esSumidero ? "text-green-700 dark:text-green-300" : "text-orange-600 dark:text-orange-400"
          }`}
        >
          {esSumidero ? "−" : "+"}{aTon(Math.abs(r.balanceNeto))} t
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">CO₂ equivalente</p>
        <p className="text-sm mt-3 font-medium text-gray-700 dark:text-gray-200">
          {esSumidero
            ? "🌱 Tu campo captura más carbono del que emite"
            : "Tu campo emite más carbono del que captura"}
        </p>
      </div>

      {/* DESGLOSE DE EMISIONES */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 mb-4">
        <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3">
          Emisiones por fuente
        </h2>
        <FilaDato label="Fertilización nitrogenada" valor={r.emisionPorN} />
        {r.emisionPorUrea > 0 && (
          <FilaDato label="Descomposición de urea" valor={r.emisionPorUrea} />
        )}
        <FilaDato label="Gasoil (maquinaria)" valor={r.emisionPorGasoil} />
        {r.emisionPorQuema > 0 && (
          <FilaDato label="Quema de rastrojos" valor={r.emisionPorQuema} />
        )}
        <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
          <FilaDato label="Total emitido" valor={r.emisionesTotales} negrita />
        </div>
      </div>

      {/* GRÁFICO DE TORTA */}
      <GraficoEmisiones resultado={r} />

      {/* CAPTURA */}
      <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950 p-4 mb-5">
        <h2 className="text-sm font-bold text-green-800 dark:text-green-300 mb-2">
          Carbono capturado por el suelo
        </h2>
        <FilaDato label="Captura total" valor={r.capturaTotal} verde />
      </div>

      {/* RECOMENDACIONES */}
      {recomendaciones.length > 0 && (
        <div className="mb-5">
          <h2 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-3">
            💡 Cómo reducir tu huella
          </h2>
          <div className="space-y-3">
            {recomendaciones.map((rec) => (
              <div
                key={rec.id}
                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4"
              >
                <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">
                  {rec.titulo}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{rec.descripcion}</p>
                <p className="text-xs font-semibold text-green-700 dark:text-green-400 mt-2">
                  Ahorro estimado: {aKg(rec.ahorroEstimadoKgCO2e)} kg CO₂e
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NOTA */}
      <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-5 leading-relaxed">
        La captura de carbono es una tasa anual estimada según buenas prácticas
        y no reemplaza la reducción de emisiones. Valores calculados con
        metodología IPCC y datos de referencia locales (INTA, Aapresid).
      </p>

      {/* BOTÓN VOLVER */}
      <button
        onClick={onVolver}
        className="w-full rounded-lg border border-green-600 p-3 font-semibold text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-gray-800 transition-colors"
      >
        ← Calcular otro lote
      </button>
    </div>
  );
}

function FilaDato({
  label, valor, negrita, verde,
}: { label: string; valor: number; negrita?: boolean; verde?: boolean }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className={`text-sm ${negrita ? "font-bold text-gray-800 dark:text-gray-100" : "text-gray-600 dark:text-gray-300"}`}>
        {label}
      </span>
      <span
        className={`text-sm ${negrita ? "font-bold" : ""} ${
          verde ? "text-green-700 dark:text-green-400 font-semibold" : "text-gray-800 dark:text-gray-100"
        }`}
      >
        {Math.round(valor).toLocaleString("es-AR")} kg
      </span>
    </div>
  );
}
