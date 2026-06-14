// ============================================================
//  FormularioLote.tsx — Pantalla de carga de datos del lote.
//  Incluye rinde con selector de ambiente (alto/medio/bajo).
// ============================================================

import { useState } from "react";
import { CULTIVOS, FERTILIZANTES, GASOIL_DEFAULT_L_HA } from "../calc/factores";
import type { DatosLote } from "../types";

interface Props {
  onCalcular: (datos: DatosLote) => void;
}

type Ambiente = "bajo" | "medio" | "alto";

export default function FormularioLote({ onCalcular }: Props) {
  const [cultivoId, setCultivoId] = useState("maiz");
  const [superficieHa, setSuperficieHa] = useState("");
  const [ambiente, setAmbiente] = useState<Ambiente>("medio");
  const [rindeTHa, setRinde] = useState(""); // si está vacío, usamos el del ambiente
  const [fertilizanteId, setFertilizanteId] = useState("urea");
  const [dosisFertilizanteKgHa, setDosis] = useState("");
  const [gasoilLHa, setGasoil] = useState(String(GASOIL_DEFAULT_L_HA));
  const [quemaRastrojos, setQuema] = useState(false);
  const [siembraDirecta, setSiembraDirecta] = useState(false);
  const [cultivosCobertura, setCobertura] = useState(false);

  const cultivoActual = CULTIVOS.find((c) => c.id === cultivoId);
  const usaNitrogeno = cultivoActual?.usaNitrogeno ?? false;

  // El rinde sugerido según el ambiente elegido (valor por defecto).
  const rindeSugerido = cultivoActual?.rindes[ambiente] ?? 0;

  // El rinde final: si el productor escribió uno, ese; si no, el sugerido.
  const rindeFinal = rindeTHa !== "" ? Number(rindeTHa) : rindeSugerido;

  function manejarCalcular() {
    onCalcular({
      cultivoId,
      superficieHa: Number(superficieHa) || 0,
      rindeTHa: rindeFinal,
      fertilizanteId,
      dosisFertilizanteKgHa: usaNitrogeno ? Number(dosisFertilizanteKgHa) || 0 : 0,
      gasoilLHa: Number(gasoilLHa) || 0,
      quemaRastrojos,
      siembraDirecta,
      cultivosCobertura,
    });
  }

  const puedeCalcular = Number(superficieHa) > 0;

  return (
    <div className="max-w-md mx-auto p-5">
      <h1 className="text-2xl font-bold text-green-800 mb-1">Huella Verde 🌱</h1>
      <p className="text-sm text-gray-500 mb-6">
        Calculá la huella de carbono de tu campaña
      </p>

      <div className="space-y-5">
        {/* CULTIVO */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Cultivo
          </label>
          <select
            value={cultivoId}
            onChange={(e) => { setCultivoId(e.target.value); setRinde(""); }}
            className="w-full rounded-lg border border-gray-300 p-3 text-gray-800 focus:border-green-500 focus:outline-none"
          >
            {CULTIVOS.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>

        {/* SUPERFICIE */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Superficie (hectáreas)
          </label>
          <input
            type="number"
            value={superficieHa}
            onChange={(e) => setSuperficieHa(e.target.value)}
            placeholder="Ej: 100"
            className="w-full rounded-lg border border-gray-300 p-3 text-gray-800 focus:border-green-500 focus:outline-none"
          />
        </div>

        {/* AMBIENTE + RINDE */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Ambiente del lote
          </label>
          <div className="grid grid-cols-3 gap-2 mb-2">
            {(["bajo", "medio", "alto"] as Ambiente[]).map((amb) => (
              <button
                key={amb}
                type="button"
                onClick={() => { setAmbiente(amb); setRinde(""); }}
                className={`rounded-lg border p-2 text-sm capitalize transition-colors ${
                  ambiente === amb
                    ? "border-green-600 bg-green-50 text-green-700 font-semibold"
                    : "border-gray-300 text-gray-600"
                }`}
              >
                {amb}
              </button>
            ))}
          </div>
          <label className="block text-xs text-gray-500 mb-1">
            Rinde estimado (t/ha) — podés ajustarlo si sabés el tuyo
          </label>
          <input
            type="number"
            value={rindeTHa}
            onChange={(e) => setRinde(e.target.value)}
            placeholder={`${rindeSugerido} (sugerido para ambiente ${ambiente})`}
            className="w-full rounded-lg border border-gray-300 p-3 text-gray-800 focus:border-green-500 focus:outline-none"
          />
        </div>

        {/* FERTILIZANTE (solo si usa nitrógeno) */}
        {usaNitrogeno && (
          <>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Fertilizante nitrogenado
              </label>
              <select
                value={fertilizanteId}
                onChange={(e) => setFertilizanteId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-3 text-gray-800 focus:border-green-500 focus:outline-none"
              >
                {FERTILIZANTES.map((f) => (
                  <option key={f.id} value={f.id}>{f.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Dosis de fertilizante (kg/ha)
              </label>
              <input
                type="number"
                value={dosisFertilizanteKgHa}
                onChange={(e) => setDosis(e.target.value)}
                placeholder="Ej: 150"
                className="w-full rounded-lg border border-gray-300 p-3 text-gray-800 focus:border-green-500 focus:outline-none"
              />
            </div>
          </>
        )}

        {/* GASOIL */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Gasoil (litros/ha)
          </label>
          <input
            type="number"
            value={gasoilLHa}
            onChange={(e) => setGasoil(e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-3 text-gray-800 focus:border-green-500 focus:outline-none"
          />
        </div>

        {/* PRÁCTICAS */}
        <div className="space-y-3 pt-2">
          <CheckRow label="¿Quema los rastrojos?" checked={quemaRastrojos} onChange={setQuema} />
          <CheckRow label="¿Hace siembra directa?" checked={siembraDirecta} onChange={setSiembraDirecta} />
          <CheckRow label="¿Usa cultivos de cobertura?" checked={cultivosCobertura} onChange={setCobertura} />
        </div>

        {/* BOTÓN CALCULAR */}
        <button
          onClick={manejarCalcular}
          disabled={!puedeCalcular}
          className="w-full rounded-lg bg-green-600 p-3 font-semibold text-white hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Calcular huella
        </button>
        {!puedeCalcular && (
          <p className="text-xs text-gray-400 text-center">
            Ingresá la superficie para calcular
          </p>
        )}
      </div>
    </div>
  );
}

function CheckRow({
  label, checked, onChange,
}: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-sm text-gray-700">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-5 w-5 accent-green-600"
      />
    </label>
  );
}
