// ============================================================
//  historial.ts — Guarda y lee los cálculos en el dispositivo.
//  Usa localStorage: los datos NUNCA salen del celular del usuario.
// ============================================================

import type { DatosLote } from "../types";
import type { ResultadoCalculo } from "../calc/calculos";

// La "forma" de un cálculo guardado en el historial.
export interface CalculoGuardado {
  id: string;
  fecha: string;
  datos: DatosLote;
  resultado: ResultadoCalculo;
}

// La "llave" con la que guardamos todo en el dispositivo.
const CLAVE = "huella-verde-historial";

// --- Leer todo el historial ---
export function leerHistorial(): CalculoGuardado[] {
  try {
    const texto = localStorage.getItem(CLAVE);
    if (!texto) return [];
    return JSON.parse(texto) as CalculoGuardado[];
  } catch {
    return [];
  }
}

// --- Guardar un cálculo nuevo (lo agrega al principio de la lista) ---
export function guardarCalculo(
  datos: DatosLote,
  resultado: ResultadoCalculo
): void {
  const historial = leerHistorial();

  const nuevo: CalculoGuardado = {
    id: crypto.randomUUID(),
    fecha: new Date().toISOString(),
    datos,
    resultado,
  };

  const actualizado = [nuevo, ...historial];
  localStorage.setItem(CLAVE, JSON.stringify(actualizado));
}

// --- Borrar un cálculo por su id ---
export function borrarCalculo(id: string): void {
  const historial = leerHistorial();
  const filtrado = historial.filter((c) => c.id !== id);
  localStorage.setItem(CLAVE, JSON.stringify(filtrado));
}