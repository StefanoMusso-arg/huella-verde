// ============================================================
//  Resultado.tsx — Pantalla de resultados (con modo oscuro).
// ============================================================

import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import type { DatosLote } from "../types";
import { calcularHuella } from "../calc/calculos";
import { generarRecomendaciones } from "../calc/recomendaciones";
import GraficoEmisiones from "./GraficoEmisiones";
import Equivalencias from "./Equivalencias";
import { useCountUp } from "../hooks/useCountUp";
import Simulador from "./Simulador";
import { CULTIVOS } from "../calc/factores";

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
  const balanceAnimado = useCountUp(Math.abs(r.balanceNeto));
  const capturableRef = useRef<HTMLDivElement>(null);
  const [exportando, setExportando] = useState(false);
  const [compartiendo, setCompartiendo] = useState(false);

  // Genera el canvas de la captura (reutilizado por descargar y compartir).
  async function generarCanvas() {
    if (!capturableRef.current) return null;
    return html2canvas(capturableRef.current, {
      backgroundColor: document.documentElement.classList.contains("dark") ? "#111827" : "#ffffff",
      scale: 2,
    });
  }

  function nombreArchivo() {
    const nombreCultivo = CULTIVOS.find((c) => c.id === datos.cultivoId)?.nombre ?? "lote";
    return `huella-verde-${nombreCultivo}-${datos.superficieHa}ha.png`;
  }

  async function exportarComoImagen() {
    setExportando(true);
    try {
      const canvas = await generarCanvas();
      if (!canvas) return;
      const link = document.createElement("a");
      link.download = nombreArchivo();
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      alert("No se pudo generar la imagen. Probá de nuevo.");
    } finally {
      setExportando(false);
    }
  }

  async function compartirResultado() {
    setCompartiendo(true);
    try {
      const canvas = await generarCanvas();
      if (!canvas) return;

      canvas.toBlob(async (blob) => {
        if (!blob) {
          setCompartiendo(false);
          return;
        }
        const archivo = new File([blob], nombreArchivo(), { type: "image/png" });

        // Si el celular soporta compartir archivos nativamente, lo usamos.
        if (navigator.canShare && navigator.canShare({ files: [archivo] })) {
          try {
            await navigator.share({
              files: [archivo],
              title: "Mi huella de carbono — Huella Verde",
              text: "Calculé la huella de carbono de mi campaña con Huella Verde.",
            });
          } catch {
            // El usuario canceló el compartir, no hacemos nada.
          }
        } else {
          // Si no hay soporte (ej. compu de escritorio), descargamos directo.
          const link = document.createElement("a");
          link.download = nombreArchivo();
          link.href = URL.createObjectURL(blob);
          link.click();
        }
        setCompartiendo(false);
      }, "image/png");
    } catch (e) {
      alert("No se pudo compartir. Probá de nuevo.");
      setCompartiendo(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-5">
      {/* Todo lo que va DENTRO de la imagen exportada */}
      <div ref={capturableRef} className="bg-gray-50 dark:bg-gray-900 p-1">
        {/* BALANCE NETO — hero moment */}
        <div
          className={`rounded-2xl p-7 text-center mb-5 shadow-sm ${
            esSumidero
              ? "bg-huella-50 dark:bg-huella-900"
              : "bg-cosecha-50 dark:bg-cosecha-900"
          }`}
        >
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
            Balance neto de tu campaña
          </p>
          <p
            className={`text-5xl font-extrabold tabular-nums tracking-tight ${
              esSumidero
                ? "text-huella-700 dark:text-huella-100"
                : "text-cosecha-700 dark:text-cosecha-100"
            }`}
          >
            {esSumidero ? "−" : "+"}{aTon(balanceAnimado)} t
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">CO₂ equivalente</p>
          <p
            className={`text-sm mt-3 font-semibold ${
              esSumidero
                ? "text-huella-800 dark:text-huella-200"
                : "text-cosecha-800 dark:text-cosecha-200"
            }`}
          >
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
          <FilaDato label="Gasoil (labores agrícolas)" valor={r.emisionPorGasoil} />
          {r.emisionPorFlete > 0 && (
            <FilaDato label="Flete (transporte de la cosecha)" valor={r.emisionPorFlete} />
          )}
          {r.emisionPorQuema > 0 && (
            <FilaDato label="Quema de rastrojos" valor={r.emisionPorQuema} />
          )}
          <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
            <FilaDato label="Total emitido" valor={r.emisionesTotales} negrita />
          </div>
        </div>

        {/* GRÁFICO DE TORTA */}
        <GraficoEmisiones resultado={r} />

        {/* EQUIVALENCIAS VISUALES */}
        <Equivalencias emisionesKg={r.emisionesTotales} />

        {/* CAPTURA */}
        <div className="rounded-xl border border-huella-200 dark:border-huella-800 bg-huella-50 dark:bg-huella-950 p-4 mb-5">
          <h2 className="text-sm font-bold text-huella-800 dark:text-huella-300 mb-2">
            Carbono capturado por el suelo
          </h2>
          <FilaDato label="Captura total" valor={r.capturaTotal} verde />
        </div>
      </div>

      {/* BOTONES EXPORTAR Y COMPARTIR (fuera de la captura) */}
      <div className="grid grid-cols-2 gap-2 mb-5">
        <button
          onClick={compartirResultado}
          disabled={compartiendo}
          className="rounded-lg bg-huella-600 p-3 font-semibold text-white hover:bg-huella-700 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {compartiendo ? "..." : "📤 Compartir"}
        </button>
        <button
          onClick={exportarComoImagen}
          disabled={exportando}
          className="rounded-lg border border-gray-300 dark:border-gray-600 p-3 font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {exportando ? "..." : "📥 Descargar"}
        </button>
      </div>

      {/* SIMULADOR "QUÉ PASARÍA SI" */}
      <Simulador datosOriginales={datos} />

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
                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 hover:border-cosecha-300 dark:hover:border-cosecha-700 transition-colors"
              >
                <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">
                  {rec.titulo}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{rec.descripcion}</p>
                <p className="text-xs font-semibold text-cosecha-700 dark:text-cosecha-400 mt-2">
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
        className="w-full rounded-lg border border-huella-600 p-3 font-semibold text-huella-700 dark:text-huella-400 hover:bg-huella-50 dark:hover:bg-gray-800 transition-colors"
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
          verde ? "text-huella-700 dark:text-huella-400 font-semibold" : "text-gray-800 dark:text-gray-100"
        }`}
      >
        {Math.round(valor).toLocaleString("es-AR")} kg
      </span>
    </div>
  );
}