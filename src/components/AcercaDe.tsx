// ============================================================
//  AcercaDe.tsx — Info del proyecto: qué es, quién lo hizo,
//  versión y contacto. Le da seriedad de producto a la app.
// ============================================================

import { motion } from "framer-motion";
import { Info, Users, Trophy, Mail } from "lucide-react";

interface Props {
  onVolver: () => void;
}

const VERSION_APP = "2.0";

export default function AcercaDe({ onVolver }: Props) {
  return (
    <div className="max-w-md mx-auto p-5">
      <h1 className="text-2xl font-bold text-huella-700 dark:text-huella-400 mb-1">
        Acerca de Huella Verde
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Quiénes somos y qué hace esta aplicación
      </p>

      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4"
        >
          <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-2">
            <Info size={16} className="text-huella-600 dark:text-huella-400" /> Qué es
          </h2>
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
            Huella Verde es una aplicación gratuita que permite a productores
            agropecuarios calcular la huella de carbono de su campaña, entender
            de dónde vienen sus emisiones, y recibir recomendaciones concretas
            para reducirlas. Funciona sin conexión y no requiere registro.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.08, ease: "easeOut" }}
          className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4"
        >
          <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-2">
            <Users size={16} className="text-huella-600 dark:text-huella-400" /> Equipo
          </h2>
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
            Desarrollada por Stefano Musso y Lucas Córdoba, estudiantes del
            Instituto Técnico Agrario Industrial (ITAI) de Monte Buey, Córdoba.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.16, ease: "easeOut" }}
          className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4"
        >
          <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-2">
            <Trophy size={16} className="text-huella-600 dark:text-huella-400" /> Copa Climática 2026
          </h2>
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
            Este proyecto fue desarrollado en el marco de la Copa Climática 2026,
            en el eje de tecnología y mitigación de emisiones agropecuarias.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.24, ease: "easeOut" }}
          className="rounded-xl bg-huella-50 dark:bg-huella-950 p-4"
        >
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
            Todos los datos que cargás quedan guardados únicamente en tu
            dispositivo. Huella Verde no envía tu información a ningún servidor.
          </p>
        </motion.div>

        <div className="flex items-center justify-between px-1 pt-2">
          <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
            <Mail size={13} /> stefmusso@icloud.com
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            v{VERSION_APP}
          </p>
        </div>
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