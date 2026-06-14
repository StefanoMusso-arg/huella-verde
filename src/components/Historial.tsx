// ============================================================
//  Historial.tsx — Muestra la lista de cálculos guardados en
//  el dispositivo. Permite volver a ver uno o borrarlo.
// ============================================================

import { useState } from "react";
import { leerHistorial, borrarCalculo } from "../storage/historial";
import { CULTIVOS } from "../calc/factores";

interface Props {
  onVolver: () => void; // volver a la pantalla principal
}

// Convierte una fecha ISO en algo legible (ej: 14/06/2026 15:30).
function fechaLinda(iso: string): string {
  const f = new Date(iso);
  return f.toLocaleString("es-AR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// Nombre del cultivo a partir de su id.
function nombreCultivo(id: string): string {
  return CULTIVOS.find((c) => c.id === id)?.nombre ?? id;
}

export default function Historial({ onVolver }: Props) {
  // Leemos el historial guardado. El estado nos deja refrescar al borrar.
  const [items, setItems] = useState(leerHistorial());

  // Borra un cálculo y actualiza la lista en pantalla.
  function manejarBorrar(id: string) {
    if (confirm("¿Seguro que querés borrar este cálculo?")) {
      borrarCalculo(id);
      setItems(leerHistorial()); // volvemos a leer para refrescar
    }
  }

  return (
    <div className="max-w-md mx-auto p-5">
      <h1 className="text-2xl font-bold text-green-800 mb-1">Historial</h1>
      <p className="text-sm text-gray-500 mb-6">
        Tus cálculos guardados en este dispositivo
      </p>

      {/* Si no hay nada guardado todavía */}
      {items.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-400 text-sm">
            Todavía no hay cálculos guardados.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const balance = item.resultado.balanceNeto;
            const esSumidero = balance < 0;
            return (
              <div
                key={item.id}
                className="rounded-xl border border-gray-200 p-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-800">
                      {nombreCultivo(item.datos.cultivoId)} · {item.datos.superficieHa} ha
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {fechaLinda(item.fecha)}
                    </p>
                  </div>
                  <button
                    onClick={() => manejarBorrar(item.id)}
                    className="text-xs text-red-400 hover:text-red-600"
                  >
                    Borrar
                  </button>
                </div>
                <p
                  className={`text-sm font-bold mt-2 ${
                    esSumidero ? "text-green-700" : "text-orange-600"
                  }`}
                >
                  Balance: {esSumidero ? "−" : "+"}
                  {(Math.abs(balance) / 1000).toLocaleString("es-AR", {
                    maximumFractionDigits: 2,
                  })} t CO₂e
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* BOTÓN VOLVER */}
      <button
        onClick={onVolver}
        className="w-full rounded-lg border border-green-600 p-3 font-semibold text-green-700 hover:bg-green-50 transition-colors mt-6"
      >
        ← Volver
      </button>
    </div>
  );
}
