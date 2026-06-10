// ============================================================
//  FormularioLote.tsx — La pantalla donde el productor carga
//  los datos de su lote. Al apretar "Calcular", avisa al padre.
// ============================================================

import { useState } from "react";
import { CULTIVOS, FERTILIZANTES, GASOIL_DEFAULT_L_HA } from "../calc/factores";
import type { DatosLote } from "../types";

// El formulario recibe una función "onCalcular": cuando el productor
// termina y aprieta el botón, le pasa los datos cargados al componente padre.
interface Props {
  onCalcular: (datos: DatosLote) => void;
}

export default function FormularioLote({ onCalcular }: Props) {
  // Cada campo guarda su valor en el "estado" del componente.
  const [cultivoId, setCultivoId] = useState("maiz");
  const [superficieHa, setSuperficieHa] = useState("");
  const [fertilizanteId, setFertilizanteId] = useState("urea");
  const [dosisFertilizanteKgHa, setDosis] = useState("");
  const [gasoilLHa, setGasoil] = useState(String(GASOIL_DEFAULT_L_HA));
  const [quemaRastrojos, setQuema] = useState(false);
  const [siembraDirecta, setSiembraDirecta] = useState(false);
  const [cultivosCobertura, setCobertura] = useState(false);

  // Averiguamos si el cultivo elegido usa nitrógeno (la soja no).
  const cultivoActual = CULTIVOS.find((c) => c.id === cultivoId);
  const usaNitrogeno = cultivoActual?.usaNitrogeno ?? false;

  // Cuando se aprieta "Calcular", armamos el objeto y lo mandamos arriba.
  function manejarCalcular() {
    onCalcular({
      cultivoId,
      superficieHa: Number(superficieHa) || 0,
      fertilizanteId,
      dosisFertilizanteKgHa: usaNitrogeno ? Number(dosisFertilizanteKgHa) || 0 : 0,
      gasoilLHa: Number(gasoilLHa) || 0,
      quemaRastrojos,
      siembraDirecta,
      cultivosCobertura,
    });
  }

  // ¿Están los datos mínimos para calcular? (superficie > 0)
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
            onChange={(e) => setCultivoId(e.target.value)}
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

        {/* FERTILIZANTE (solo si el cultivo usa nitrógeno) */}
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

        {/* PRÁCTICAS (los sí/no) */}
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

// Componentito reutilizable para las preguntas de sí/no.
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