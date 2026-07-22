// ============================================================
//  FormularioLote.tsx — Pantalla de carga (con modo oscuro).
// ============================================================

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { CULTIVOS, FERTILIZANTES, GASOIL_DEFAULT_L_HA } from "../calc/factores";
import type { DatosLote } from "../types";

interface Props {
  onCalcular: (datos: DatosLote) => void;
}

type Ambiente = "bajo" | "medio" | "alto";

// Estilo base de inputs, reutilizable (claro + oscuro).
const inputBase =
  "w-full rounded-lg border p-3 focus:outline-none focus:ring-2 transition-shadow bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100";
const inputOk = "border-gray-300 dark:border-gray-600 focus:border-huella-500 focus:ring-huella-100 dark:focus:ring-huella-900";
const inputError = "border-red-400 focus:border-red-500 focus:ring-red-100 dark:focus:ring-red-900";

export default function FormularioLote({ onCalcular }: Props) {
  const [cultivoId, setCultivoId] = useState("maiz");
  const [superficieHa, setSuperficieHa] = useState("");
  const [ambiente, setAmbiente] = useState<Ambiente>("medio");
  const [rindeTHa, setRinde] = useState("");
  const [fertilizanteId, setFertilizanteId] = useState("urea");
  const [dosisFertilizanteKgHa, setDosis] = useState("");
  const [gasoilLHa, setGasoil] = useState(String(GASOIL_DEFAULT_L_HA));
  const [quemaRastrojos, setQuema] = useState(false);
  const [siembraDirecta, setSiembraDirecta] = useState(false);
  const [cultivosCobertura, setCobertura] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});

  // Referencias a cada campo, para poder hacerles scroll si tienen error.
  const refSuperficie = useRef<HTMLInputElement>(null);
  const refRinde = useRef<HTMLInputElement>(null);
  const refDosis = useRef<HTMLInputElement>(null);
  const refGasoil = useRef<HTMLInputElement>(null);

  const cultivoActual = CULTIVOS.find((c) => c.id === cultivoId);
  const usaNitrogeno = cultivoActual?.usaNitrogeno ?? false;
  const rindeSugerido = cultivoActual?.rindes[ambiente] ?? 0;
  const rindeFinal = rindeTHa !== "" ? Number(rindeTHa) : rindeSugerido;

  const dosisNum = Number(dosisFertilizanteKgHa);
  const avisoDosis =
    usaNitrogeno && dosisNum > 600
      ? "⚠️ Esa dosis parece muy alta. Verificá el valor."
      : "";
  const rindeNum = Number(rindeTHa);
  const avisoRinde =
    rindeTHa !== "" && rindeNum > 0 &&
    cultivoActual && rindeNum > cultivoActual.rindes.alto * 1.5
      ? "⚠️ Ese rinde parece muy alto para la zona. Verificá el valor."
      : "";

  // --- PROGRESO: cuántos campos "clave" están completos ---
  const camposClave = [
    superficieHa !== "" && Number(superficieHa) > 0, // superficie cargada
    true, // ambiente siempre tiene un valor por defecto
    !usaNitrogeno || dosisFertilizanteKgHa !== "", // dosis, solo si el cultivo la necesita
    gasoilLHa !== "", // gasoil (ya viene con default)
  ];
  const completados = camposClave.filter(Boolean).length;
  const progreso = Math.round((completados / camposClave.length) * 100);

  function validar(): boolean {
    const nuevos: Record<string, string> = {};
    const sup = Number(superficieHa);
    if (superficieHa === "") nuevos.superficie = "Ingresá la superficie.";
    else if (isNaN(sup) || sup <= 0) nuevos.superficie = "La superficie debe ser mayor a 0.";
    if (rindeTHa !== "" && (isNaN(rindeNum) || rindeNum <= 0)) nuevos.rinde = "El rinde debe ser mayor a 0.";
    if (usaNitrogeno && dosisFertilizanteKgHa !== "" && (isNaN(dosisNum) || dosisNum < 0)) nuevos.dosis = "La dosis no puede ser negativa.";
    const gas = Number(gasoilLHa);
    if (gasoilLHa !== "" && (isNaN(gas) || gas < 0)) nuevos.gasoil = "El gasoil no puede ser negativo.";
    setErrores(nuevos);

    // Si hay errores, hacemos scroll hasta el primero (en orden de aparición en pantalla).
    if (Object.keys(nuevos).length > 0) {
      const refsEnOrden: Array<[string, React.RefObject<HTMLInputElement | null>]> = [
        ["superficie", refSuperficie],
        ["rinde", refRinde],
        ["dosis", refDosis],
        ["gasoil", refGasoil],
      ];
      const primerError = refsEnOrden.find(([clave]) => nuevos[clave]);
      if (primerError) {
        const [, ref] = primerError;
        ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        ref.current?.focus({ preventScroll: true });
      }
    }

    return Object.keys(nuevos).length === 0;
  }

  function manejarCalcular() {
    if (!validar()) return;
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

  return (
    <div className="max-w-md mx-auto p-5">
      <h1 className="text-2xl font-bold text-huella-700 dark:text-huella-400 mb-1">Huella Verde 🌱</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
        Calculá la huella de carbono de tu campaña
      </p>

      {/* BARRA DE PROGRESO */}
      <div className="mb-6">
        <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <motion.div
            className="h-full bg-huella-500"
            initial={{ width: 0 }}
            animate={{ width: `${progreso}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
      </div>

      <div className="space-y-5">
        {/* CULTIVO */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">Cultivo</label>
          <select
            value={cultivoId}
            onChange={(e) => { setCultivoId(e.target.value); setRinde(""); }}
            className={`${inputBase} ${inputOk}`}
          >
            {CULTIVOS.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>

        {/* SUPERFICIE */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
            Superficie (hectáreas)
          </label>
          <input
            ref={refSuperficie}
            type="number"
            value={superficieHa}
            onChange={(e) => setSuperficieHa(e.target.value)}
            placeholder="Ej: 100"
            className={`${inputBase} ${errores.superficie ? inputError : inputOk}`}
          />
          {errores.superficie && <p className="text-xs text-red-500 mt-1">{errores.superficie}</p>}
        </div>

        {/* AMBIENTE + RINDE */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
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
                    ? "border-huella-600 bg-huella-50 dark:bg-huella-900 text-huella-700 dark:text-huella-300 font-semibold"
                    : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300"
                }`}
              >
                {amb}
              </button>
            ))}
          </div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            Rinde estimado (t/ha) — podés ajustarlo si sabés el tuyo
          </label>
          <input
            ref={refRinde}
            type="number"
            value={rindeTHa}
            onChange={(e) => setRinde(e.target.value)}
            placeholder={`${rindeSugerido} (sugerido para ambiente ${ambiente})`}
            className={`${inputBase} ${errores.rinde ? inputError : inputOk}`}
          />
          {errores.rinde && <p className="text-xs text-red-500 mt-1">{errores.rinde}</p>}
          {avisoRinde && <p className="text-xs text-cosecha-700 dark:text-cosecha-400 mt-1">{avisoRinde}</p>}
        </div>

        {/* FERTILIZANTE */}
        {usaNitrogeno && (
          <>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
                Fertilizante nitrogenado
              </label>
              <select
                value={fertilizanteId}
                onChange={(e) => setFertilizanteId(e.target.value)}
                className={`${inputBase} ${inputOk}`}
              >
                {FERTILIZANTES.map((f) => (
                  <option key={f.id} value={f.id}>{f.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
                Dosis de fertilizante (kg/ha)
              </label>
              <input
                ref={refDosis}
                type="number"
                value={dosisFertilizanteKgHa}
                onChange={(e) => setDosis(e.target.value)}
                placeholder="Ej: 150"
                className={`${inputBase} ${errores.dosis ? inputError : inputOk}`}
              />
              {errores.dosis && <p className="text-xs text-red-500 mt-1">{errores.dosis}</p>}
              {avisoDosis && <p className="text-xs text-cosecha-700 dark:text-cosecha-400 mt-1">{avisoDosis}</p>}
            </div>
          </>
        )}

        {/* GASOIL */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
            Gasoil (litros/ha)
          </label>
          <input
            ref={refGasoil}
            type="number"
            value={gasoilLHa}
            onChange={(e) => setGasoil(e.target.value)}
            className={`${inputBase} ${errores.gasoil ? inputError : inputOk}`}
          />
          {errores.gasoil && <p className="text-xs text-red-500 mt-1">{errores.gasoil}</p>}
        </div>

        {/* PRÁCTICAS */}
        <div className="space-y-3 pt-2">
          <CheckRow label="¿Quema los rastrojos?" checked={quemaRastrojos} onChange={setQuema} />
          <CheckRow label="¿Hace siembra directa?" checked={siembraDirecta} onChange={setSiembraDirecta} />
          <CheckRow label="¿Usa cultivos de cobertura?" checked={cultivosCobertura} onChange={setCobertura} />
        </div>

        {/* BOTÓN */}
        <button
          onClick={manejarCalcular}
          className="w-full rounded-lg bg-huella-600 p-3 font-semibold text-white hover:bg-huella-700 active:scale-[0.98] transition-all"
        >
          Calcular huella
        </button>
      </div>
    </div>
  );
}

function CheckRow({
  label, checked, onChange,
}: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between cursor-pointer py-1">
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
      <div className="relative h-6 w-6">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <motion.div
          onClick={() => onChange(!checked)}
          initial={false}
          animate={{ scale: checked ? [1, 1.15, 1] : 1 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className={`h-6 w-6 rounded-md border-2 flex items-center justify-center cursor-pointer transition-colors ${
            checked
              ? "bg-huella-600 border-huella-600"
              : "border-gray-300 dark:border-gray-600"
          }`}
        >
          {checked && (
            <motion.svg
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="white"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <motion.path d="M5 13l4 4L19 7" />
            </motion.svg>
          )}
        </motion.div>
      </div>
    </label>
  );
}