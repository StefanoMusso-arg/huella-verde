import { useState } from "react";
import FormularioLote from "./components/FormularioLote";
import Resultado from "./components/Resultado";
import type { DatosLote } from "./types";

function App() {
  // Guardamos los datos calculados. Si es null, mostramos el formulario.
  const [datos, setDatos] = useState<DatosLote | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {datos === null ? (
        <FormularioLote onCalcular={(d) => setDatos(d)} />
      ) : (
        <Resultado datos={datos} onVolver={() => setDatos(null)} />
      )}
    </div>
  );
}

export default App;