import { useState, useEffect } from "react";
import FormularioLote from "./components/FormularioLote";
import Resultado from "./components/Resultado";
import Historial from "./components/Historial";
import Metodologia from "./components/Metodologia";
import { calcularHuella } from "./calc/calculos";
import { guardarCalculo } from "./storage/historial";
import type { DatosLote } from "./types";

type Pantalla = "formulario" | "resultado" | "historial" | "metodologia";

function App() {
  const [pantalla, setPantalla] = useState<Pantalla>("formulario");
  const [datos, setDatos] = useState<DatosLote | null>(null);

  // Modo oscuro: arranca leyendo lo que el usuario eligió antes.
  const [oscuro, setOscuro] = useState<boolean>(
    () => localStorage.getItem("huella-verde-tema") === "oscuro"
  );

  // Aplica o quita la marca "dark" y guarda la preferencia.
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

  function manejarCalculo(d: DatosLote) {
    const resultado = calcularHuella(d);
    guardarCalculo(d, resultado);
    setDatos(d);
    setPantalla("resultado");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors">
      {/* BOTÓN MODO OSCURO */}
      <div className="max-w-md mx-auto px-5 flex justify-end mb-2">
        <button
          onClick={() => setOscuro(!oscuro)}
          className="text-xl p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title="Cambiar modo claro/oscuro"
        >
          {oscuro ? "☀️" : "🌙"}
        </button>
      </div>

      {/* PANTALLA: FORMULARIO */}
      {pantalla === "formulario" && (
        <div>
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
        </div>
      )}

      {/* PANTALLA: RESULTADO */}
      {pantalla === "resultado" && datos && (
        <Resultado datos={datos} onVolver={() => setPantalla("formulario")} />
      )}

      {/* PANTALLA: HISTORIAL */}
      {pantalla === "historial" && (
        <Historial onVolver={() => setPantalla("formulario")} />
      )}

      {/* PANTALLA: METODOLOGÍA */}
      {pantalla === "metodologia" && (
        <Metodologia onVolver={() => setPantalla("formulario")} />
      )}
    </div>
  );
}

export default App;