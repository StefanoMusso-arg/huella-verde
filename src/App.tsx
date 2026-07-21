import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import FormularioLote from "./components/FormularioLote";
import Resultado from "./components/Resultado";
import Historial from "./components/Historial";
import Metodologia from "./components/Metodologia";
import { calcularHuella } from "./calc/calculos";
import { guardarCalculo } from "./storage/historial";
import type { DatosLote } from "./types";

type Pantalla = "formulario" | "resultado" | "historial" | "metodologia";

// Variantes de animación: entra con fade + desplazamiento suave hacia arriba.
const variantesPantalla = {
  inicial: { opacity: 0, y: 12 },
  animado: { opacity: 1, y: 0 },
  salida: { opacity: 0, y: -12 },
};

function App() {
  const [pantalla, setPantalla] = useState<Pantalla>("formulario");
  const [datos, setDatos] = useState<DatosLote | null>(null);
  // Recuerda si venimos del historial, para que "volver" regrese ahí.
  const [vieneDelHistorial, setVieneDelHistorial] = useState(false);

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
      </AnimatePresence>
    </div>
  );
}

export default App;