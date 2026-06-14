// ============================================================
//  Resultado.tsx — La pantalla estrella. Muestra el balance,
//  el desglose de emisiones, la captura y las recomendaciones.
// ============================================================

import type { DatosLote } from "../types";
import { calcularHuella } from "../calc/calculos";
import { generarRecomendaciones } from "../calc/recomendaciones";
import GraficoEmisiones from "./GraficoEmisiones";
interface Props {
  datos: DatosLote;
  onVolver: () => void; // para volver al formulario y recalcular
}

// Pasa kilos a toneladas con un decimal, prolijo.
function aTon(kg: number): string {
  return (kg / 1000).toLocaleString("es-AR", { maximumFractionDigits: 2 });
}
// Redondea kilos con separador de miles.
function aKg(kg: number): string {
  return Math.round(kg).toLocaleString("es-AR");
}

export default function Resultado({ datos, onVolver }: Props) {
  // Usamos el cerebro que ya construimos.
  const r = calcularHuella(datos);
  const recomendaciones = generarRecomendaciones(datos);

  // El balance: si es negativo, el campo captura más de lo que emite.
  const esSumidero = r.balanceNeto < 0;

  return (
    <div className="max-w-md mx-auto p-5">
      {/* BALANCE NETO — el número protagonista */}
      <div
        className={`rounded-2xl p-6 text-center mb-5 ${
          esSumidero ? "bg-green-100" : "bg-orange-50"
        }`}
      >
        <p className="text-sm font-medium text-gray-600 mb-1">
          Balance neto de tu campaña
        </p>
        <p
          className={`text-4xl font-bold ${
            esSumidero ? "text-green-700" : "text-orange-600"
          }`}
        >
          {esSumidero ? "−" : "+"}{aTon(Math.abs(r.balanceNeto))} t
        </p>
        <p className="text-xs text-gray-500 mt-1">CO₂ equivalente</p>
        <p className="text-sm mt-3 font-medium text-gray-700">
          {esSumidero
            ? "🌱 Tu campo captura más carbono del que emite"
            : "Tu campo emite más carbono del que captura"}
        </p>
      </div>

      {/* DESGLOSE DE EMISIONES */}
      <div className="rounded-xl border border-gray-200 p-4 mb-4">
        <h2 className="text-sm font-bold text-gray-700 mb-3">
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
        <div className="border-t border-gray-200 mt-2 pt-2">
          <FilaDato label="Total emitido" valor={r.emisionesTotales} negrita />
        </div>
      </div>

      {/* GRÁFICO DE TORTA */}
      <GraficoEmisiones resultado={r} />

      {/* CAPTURA */}

      {/* CAPTURA */}
      <div className="rounded-xl border border-green-200 bg-green-50 p-4 mb-5">
        <h2 className="text-sm font-bold text-green-800 mb-2">
          Carbono capturado por el suelo
        </h2>
        <FilaDato label="Captura total" valor={r.capturaTotal} verde />
      </div>

      {/* RECOMENDACIONES */}
      {recomendaciones.length > 0 && (
        <div className="mb-5">
          <h2 className="text-base font-bold text-gray-800 mb-3">
            💡 Cómo reducir tu huella
          </h2>
          <div className="space-y-3">
            {recomendaciones.map((rec) => (
              <div
                key={rec.id}
                className="rounded-xl border border-gray-200 p-4"
              >
                <p className="font-semibold text-gray-800 text-sm">
                  {rec.titulo}
                </p>
                <p className="text-xs text-gray-600 mt-1">{rec.descripcion}</p>
                <p className="text-xs font-semibold text-green-700 mt-2">
                  Ahorro estimado: {aKg(rec.ahorroEstimadoKgCO2e)} kg CO₂e
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NOTA sobre la captura, para ser honestos ante el jurado */}
      <p className="text-[11px] text-gray-400 mb-5 leading-relaxed">
        La captura de carbono es una tasa anual estimada según buenas prácticas
        y no reemplaza la reducción de emisiones. Valores calculados con
        metodología IPCC y datos de referencia locales (INTA, Aapresid).
      </p>

      {/* BOTÓN VOLVER */}
      <button
        onClick={onVolver}
        className="w-full rounded-lg border border-green-600 p-3 font-semibold text-green-700 hover:bg-green-50 transition-colors"
      >
        ← Calcular otro lote
      </button>
    </div>
  );
}

// Fila reutilizable para mostrar un dato con su valor.
function FilaDato({
  label, valor, negrita, verde,
}: { label: string; valor: number; negrita?: boolean; verde?: boolean }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className={`text-sm ${negrita ? "font-bold text-gray-800" : "text-gray-600"}`}>
        {label}
      </span>
      <span
        className={`text-sm ${negrita ? "font-bold" : ""} ${
          verde ? "text-green-700 font-semibold" : "text-gray-800"
        }`}
      >
        {Math.round(valor).toLocaleString("es-AR")} kg
      </span>
    </div>
  );
}