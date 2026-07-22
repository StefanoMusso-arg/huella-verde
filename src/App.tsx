import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Onboarding from "./components/Onboarding";
import FormularioLote from "./components/FormularioLote";
import Resultado from "./components/Resultado";
import Historial from "./components/Historial";
import Metodologia from "./components/Metodologia";
import Comparador from "./components/Comparador";
import Evolucion from "./components/Evolucion";
import { calcularHuella } from "./calc/calculos";
import { guardarCalculo, type CalculoGuardado } from "./storage/historial";
import type { DatosLote } from "./types";

type Pantalla = "formulario" | "resultado" | "historial" | "metodologia" | "comparador" | "evolucion";

// Variantes de animación: entra con fade + desplazamiento suave hacia arriba.
const variantesPantalla = {
  inicial: { opacity: 0, y: 12 },
  animado: { opacity: 1, y: 0 },
  salida: { opacity: 0, y: -12 },
};

const CLAVE_ONBOARDING = "huella-verde-onboarding-visto";

function App() {
  const [pantalla, setPantalla] = useState<Pantalla>("formulario");
  const [datos, setDatos] = useState<DatosLote | null>(null);
  // Recuerda si venimos del historial, para que "volver" regrese ahí.
  const [vieneDelHistorial, setVieneDelHistorial] = useState(false);
  // Lotes elegidos para comparar.
  const [lotesComparar, setLotesComparar] = useState<CalculoGuardado[]>([]);
  // Lotes para el gráfico de evolución.
  const [lotesEvolucion, setLotesEvolucion] = useState<CalculoGuardado[]>([]);
  // Si todavía no vio el onboarding, se lo mostramos antes que nada.
  const [mostrarOnboarding, setMostrarOnboarding] = useState<boolean>(
    () => localStorage.getItem(CLAVE_ONBOARDING) !== "true"
  );

  const [oscuro, setOscuro] = useState<boolean>(
    () => localStorage.getItem("huella-verde-tema") === "oscuro"
  );

  useEffect(() => {
    const raiz = document.documentElement;
    if (oscuro) {
      raiz.classList.add("dark");
      localStorage.setItem("huella-verde-tema", "oscuro");
    } else {
      raiz.classList.remove("dark");
      localStorage.setItem("huella-verde-tema", "claro");
    }
  }, [oscuro]);

  function terminarOnboarding(noMostrarDeNuevo: boolean) {
    if (noMostrarDeNuevo) {
      localStorage.setItem(CLAVE_ONBOARDING, "true");
    }
    setMostrarOnboarding(false);
  }
  // Cálculo NUEVO desde el formulario: guarda y muestra.
  function manejarCalculo(d: DatosLote) {
    const resultado = calcularHuella(d);
    guardarCalculo(d, resultado);
    setDatos(d);
    setVieneDelHistorial(false);
    setPantalla("resultado");
  }

  // VER un cálculo guardado desde el historial: NO guarda, solo muestra.
  function verDelHistorial(d: DatosLote) {
    setDatos(d);
    setVieneDelHistorial(true);
    setPantalla("resultado");
  }

  // El botón "volver" del resultado: si vino del historial, vuelve ahí.
  function volverDesdeResultado() {
    setPantalla(vieneDelHistorial ? "historial" : "formulario");
  }

  // Recibe los lotes elegidos en el historial y abre el comparador.
  function manejarComparar(items: CalculoGuardado[]) {
    setLotesComparar(items);
    setPantalla("comparador");
  }

  // Recibe todos los lotes del historial y abre la evolución.
  function manejarVerEvolucion(items: CalculoGuardado[]) {
    setLotesEvolucion(items);
    setPantalla("evolucion");
  }

  // ONBOARDING: se muestra solo, tapando toda la app, hasta que termine o lo salten.
  if (mostrarOnboarding) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors">
        <Onboarding onTerminar={terminarOnboarding} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors">
      <div className="max-w-md mx-auto px-5 flex justify-end mb-2">
        <motion.button
          onClick={() => setOscuro(!oscuro)}
          whileTap={{ scale: 0.9, rotate: 15 }}
          className="text-xl p-2 rounded-full bg-huella-50 dark:bg-huella-900 hover:bg-huella-100 dark:hover:bg-huella-800 transition-colors shadow-sm"
          title="Cambiar modo claro/oscuro"
        >
          {oscuro ? "☀️" : "🌙"}
        </motion.button>
      </div>

      <AnimatePresence mode="wait">
        {/* FORMULARIO */}
        {pantalla === "formulario" && (
          <motion.div
            key="formulario"
            variants={variantesPantalla}
            initial="inicial"
            animate="animado"
            exit="salida"
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <FormularioLote onCalcular={manejarCalculo} />
            <div className="max-w-md mx-auto px-5 space-y-3">
              <button
                onClick={() => setPantalla("historial")}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 p-3 font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                📋 Ver historial
              </button>
              <button
                onClick={() => setPantalla("metodologia")}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 p-3 font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                📖 ¿Cómo calculamos?
              </button>
            </div>
          </motion.div>
        )}

        {/* RESULTADO */}
        {pantalla === "resultado" && datos && (
          <motion.div
            key="resultado"
            variants={variantesPantalla}
            initial="inicial"
            animate="animado"
            exit="salida"
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <Resultado datos={datos} onVolver={volverDesdeResultado} />
          </motion.div>
        )}

        {/* HISTORIAL */}
        {pantalla === "historial" && (
          <motion.div
            key="historial"
            variants={variantesPantalla}
            initial="inicial"
            animate="animado"
            exit="salida"
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <Historial
              onVolver={() => setPantalla("formulario")}
              onVerLote={verDelHistorial}
              onComparar={manejarComparar}
              onVerEvolucion={manejarVerEvolucion}
            />
          </motion.div>
        )}

        {/* METODOLOGÍA */}
        {pantalla === "metodologia" && (
          <motion.div
            key="metodologia"
            variants={variantesPantalla}
            initial="inicial"
            animate="animado"
            exit="salida"
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <Metodologia onVolver={() => setPantalla("formulario")} />
          </motion.div>
        )}

        {/* COMPARADOR */}
        {pantalla === "comparador" && (
          <motion.div
            key="comparador"
            variants={variantesPantalla}
            initial="inicial"
            animate="animado"
            exit="salida"
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <Comparador items={lotesComparar} onVolver={() => setPantalla("historial")} />
          </motion.div>
        )}

        {/* EVOLUCIÓN */}
        {pantalla === "evolucion" && (
          <motion.div
            key="evolucion"
            variants={variantesPantalla}
            initial="inicial"
            animate="animado"
            exit="salida"
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <Evolucion items={lotesEvolucion} onVolver={() => setPantalla("historial")} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;