import { useState } from "react";
import FormularioLote from "./components/FormularioLote";
import Resultado from "./components/Resultado";
import Historial from "./components/Historial";
import { calcularHuella } from "./calc/calculos";
import { guardarCalculo } from "./storage/historial";
import type { DatosLote } from "./types";

// Las tres pantallas posibles de la app.
type Pantalla = "formulario" | "resultado" | "historial";

function App() {
  const [pantalla, setPantalla] = useState<Pantalla>("formulario");
  const [datos, setDatos] = useState<DatosLote | null>(null);

  // Cuando se calcula, guardamos el resultado UNA vez y vamos al resultado.
  function manejarCalculo(d: DatosLote) {
    const resultado = calcularHuella(d);
    guardarCalculo(d, resultado);
    setDatos(d);
    setPantalla("resultado");
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* PANTALLA: FORMULARIO */}
      {pantalla === "formulario" && (
        <div>
          <FormularioLote onCalcular={manejarCalculo} />
          {/* Botón para ir al historial */}
          <div className="max-w-md mx-auto px-5">
            <button
              onClick={() => setPantalla("historial")}
              className="w-full rounded-lg border border-gray-300 p-3 font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
            >
              📋 Ver historial
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
    </div>
  );
}

export default App;