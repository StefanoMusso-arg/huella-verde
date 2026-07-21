// ============================================================
//  useCountUp.ts — Anima un número contando desde 0 hasta el valor final.
// ============================================================
import { useEffect, useState } from "react";

export function useCountUp(valorFinal: number, duracionMs = 900) {
  const [valor, setValor] = useState(0);

  useEffect(() => {
    let inicio: number | null = null;
    let frame: number;

    function paso(timestamp: number) {
      if (inicio === null) inicio = timestamp;
      const progreso = Math.min((timestamp - inicio) / duracionMs, 1);
      const easing = 1 - Math.pow(1 - progreso, 3);
      setValor(valorFinal * easing);
      if (progreso < 1) frame = requestAnimationFrame(paso);
    }

    frame = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(frame);
  }, [valorFinal, duracionMs]);

  return valor;
}