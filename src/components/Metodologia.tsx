// ============================================================
//  Metodologia.tsx — Explica cómo se calcula la huella.
//  Muestra factores, fuentes y fórmulas. Blindaje para el jurado.
// ============================================================

import { motion } from "framer-motion";
import { BookMarked } from "lucide-react";

interface Props {
  onVolver: () => void;
}

export default function Metodologia({ onVolver }: Props) {
  return (
    <div className="max-w-md mx-auto p-5">
      <h1 className="text-2xl font-bold text-huella-700 dark:text-huella-400 mb-1">
        ¿Cómo calculamos?
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Toda la metodología, factores y fuentes detrás de Huella Verde
      </p>

      <div className="space-y-4">
        {/* EMISIONES */}
        <Seccion indice={0} titulo="Emisiones de gases de efecto invernadero">
          <Item
            titulo="Fertilización nitrogenada"
            detalle="El nitrógeno aplicado libera óxido nitroso (N₂O). Usamos el factor del IPCC: 1% del N se emite como N₂O, con un potencial de calentamiento 298 veces el del CO₂."
            fuente="IPCC (Panel Intergubernamental de Cambio Climático)"
          />
          <Item
            titulo="Descomposición de urea"
            detalle="La urea libera CO₂ al descomponerse: 0,733 kg de CO₂ por kg de urea."
            fuente="IPCC"
          />
          <Item
            titulo="Gasoil por labor"
            detalle="En vez de un valor único, el consumo de gasoil se desglosa por labor: siembra y fertilización (10 L/ha), pulverizaciones (8 L/ha por cada pasada, según la cantidad que declare el productor), cosecha (12 L/ha) y labranza convencional (35 L/ha, solo si el lote no hace siembra directa). Cada litro consumido emite 2,68 kg de CO₂."
            fuente="Márgenes Agropecuarios / La Nación (datos BCR) e INTA para labranza"
          />
          <Item
            titulo="Quema de rastrojos"
            detalle="Estimación de las emisiones de metano y óxido nitroso según la biomasa quemada por hectárea."
            fuente="Metodología IPCC"
          />
        </Seccion>

        {/* FLETE */}
        <Seccion indice={1} titulo="Transporte de la cosecha (flete)">
          <Item
            titulo="Emisión por distancia recorrida"
            detalle="Se calcula la cantidad de viajes de camión necesarios para transportar toda la cosecha (toneladas totales divididas por la capacidad de carga de 28 t por viaje), multiplicado por la distancia declarada al destino (ida y vuelta) y el consumo representativo de un camión: 0,40 L de gasoil por kilómetro."
            fuente="Bolsa de Comercio de Rosario (BCR)"
          />
        </Seccion>

        {/* CAPTURA */}
        <Seccion indice={2} titulo="Captura de carbono en el suelo">
          <Item
            titulo="Aporte según rendimiento"
            detalle="El carbono que el cultivo aporta al suelo se calcula con el rinde y un coeficiente propio de cada cultivo (soja 0,37; maíz 0,20; trigo 0,40)."
            fuente="Método de Álvarez et al. (INTA)"
          />
          <Item
            titulo="Retención por prácticas"
            detalle="La siembra directa y los cultivos de cobertura determinan qué parte de ese carbono queda retenida en el suelo. Calibrado al rango medido en la región (0,3–0,5 t C/ha/año)."
            fuente="Aapresid"
          />
        </Seccion>

        {/* NITRÓGENO */}
        <Seccion indice={3} titulo="Recomendación de nitrógeno">
          <Item
            titulo="Requerimiento por rendimiento"
            detalle="El objetivo de nitrógeno se calcula según el rinde esperado: cada tonelada de grano requiere cierta cantidad de N (maíz 22 kg/t; trigo 30 kg/t)."
            fuente="IPNI / INTA"
          />
        </Seccion>

        {/* RINDES */}
        <Seccion indice={4} titulo="Rindes de referencia">
          <Item
            titulo="Valores por ambiente"
            detalle="Los rindes sugeridos (bajo, medio, alto) corresponden a datos reales del departamento Marcos Juárez, Córdoba."
            fuente="INTA Marcos Juárez / IDECOR"
          />
        </Seccion>

        {/* NOTA FINAL */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 5 * 0.08, ease: "easeOut" }}
          className="rounded-xl bg-huella-50 dark:bg-huella-950 p-4"
        >
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
            Huella Verde usa metodología <strong>IPCC Tier 1</strong>, el estándar
            internacional para estimar emisiones. Los resultados son estimaciones
            orientativas basadas en factores de referencia, no mediciones exactas
            del lote. Para precisión total se requiere análisis de suelo.
          </p>
        </motion.div>
      </div>

      <button
        onClick={onVolver}
        className="w-full rounded-lg border border-huella-600 p-3 font-semibold text-huella-700 dark:text-huella-400 hover:bg-huella-50 dark:hover:bg-gray-800 active:scale-[0.98] transition-all mt-6"
      >
        ← Volver
      </button>
    </div>
  );
}

// Bloque de sección con título, aparece en cascada según su índice.
function Seccion({ indice, titulo, children }: { indice: number; titulo: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: indice * 0.08, ease: "easeOut" }}
      className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4"
    >
      <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3">{titulo}</h2>
      <div className="space-y-3">{children}</div>
    </motion.div>
  );
}

// Item individual: título, explicación y fuente.
function Item({ titulo, detalle, fuente }: { titulo: string; detalle: string; fuente: string }) {
  return (
    <div className="border-l-2 border-huella-400 pl-3">
      <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{titulo}</p>
      <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">{detalle}</p>
      <p className="text-[11px] text-huella-700 dark:text-huella-400 mt-1 flex items-center gap-1">
        <BookMarked size={12} /> {fuente}
      </p>
    </div>
  );
}