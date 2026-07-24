// ============================================================
//  MapaLote.tsx — Mapa donde el productor dibuja el contorno
//  de su lote tocando puntos. Calcula la superficie en hectáreas
//  automáticamente a partir del polígono dibujado.
// ============================================================

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Arreglo del ícono roto de Leaflet con bundlers como Vite.
import iconRetina from "leaflet/dist/images/marker-icon-2x.png";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetina,
  iconUrl: icon,
  shadowUrl: iconShadow,
});

export interface PuntoLote {
  lat: number;
  lng: number;
}

interface Props {
  puntosIniciales?: PuntoLote[];
  onCambiarPoligono?: (puntos: PuntoLote[], hectareas: number) => void;
  soloLectura?: boolean; // si es true, solo muestra el polígono, no permite editar
}

// Calcula la superficie de un polígono en hectáreas (fórmula del área
// esférica, apropiada para coordenadas de latitud/longitud reales).
function calcularHectareas(puntos: PuntoLote[]): number {
  if (puntos.length < 3) return 0;
  const R = 6378137; // radio de la Tierra en metros
  let area = 0;
  for (let i = 0; i < puntos.length; i++) {
    const p1 = puntos[i];
    const p2 = puntos[(i + 1) % puntos.length];
    const lambda1 = (p1.lng * Math.PI) / 180;
    const lambda2 = (p2.lng * Math.PI) / 180;
    const phi1 = (p1.lat * Math.PI) / 180;
    const phi2 = (p2.lat * Math.PI) / 180;
    area += (lambda2 - lambda1) * (2 + Math.sin(phi1) + Math.sin(phi2));
  }
  area = Math.abs((area * R * R) / 2);
  return area / 10000; // metros² → hectáreas
}

export default function MapaLote({ puntosIniciales = [], onCambiarPoligono, soloLectura = false }: Props) {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const mapaRef = useRef<L.Map | null>(null);
  const poligonoRef = useRef<L.Polygon | null>(null);
  const marcadoresRef = useRef<L.CircleMarker[]>([]);
  const [puntos, setPuntos] = useState<PuntoLote[]>(puntosIniciales);
  const [sinConexion, setSinConexion] = useState(!navigator.onLine);

  // Inicializa el mapa una sola vez.
  useEffect(() => {
    if (!contenedorRef.current || mapaRef.current) return;

    // Centro por defecto: Monte Buey, Córdoba (tu zona).
    const centroDefault: [number, number] = puntosIniciales.length > 0
      ? [puntosIniciales[0].lat, puntosIniciales[0].lng]
      : [-32.915666, -62.456255];
      
    const mapa = L.map(contenedorRef.current, {
      dragging: !soloLectura || puntosIniciales.length === 0 ? true : true, // el mapa siempre se puede mover/zoomear
      zoomControl: true,
    }).setView(centroDefault, 14);
    mapaRef.current = mapa;

    const capaSatelital = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: "Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics",
        maxZoom: 19,
      }
    ).addTo(mapa);

    // Capa de nombres de calles y lugares, superpuesta sobre la satelital.
    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: "",
        maxZoom: 19,
      }
    ).addTo(mapa);

    // Si las imágenes del mapa fallan en cargar (sin internet), avisamos.
    capaSatelital.on("tileerror", () => setSinConexion(true));
    capaSatelital.on("tileload", () => setSinConexion(false));

    if (!soloLectura) {
      mapa.on("click", (e: L.LeafletMouseEvent) => {
        setPuntos((prev) => [...prev, { lat: e.latlng.lat, lng: e.latlng.lng }]);
      });
    }

    // Si ya viene con un polígono (modo solo lectura), ajustamos el zoom para que se vea completo.
    if (puntosIniciales.length >= 3) {
      const bounds = L.latLngBounds(puntosIniciales.map((p) => [p.lat, p.lng]));
      mapa.fitBounds(bounds, { padding: [30, 30] });
    }

    return () => {
      mapa.remove();
      mapaRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Escucha cambios de conexión del dispositivo en general.
  useEffect(() => {
    function manejarOnline() { setSinConexion(false); }
    function manejarOffline() { setSinConexion(true); }
    window.addEventListener("online", manejarOnline);
    window.addEventListener("offline", manejarOffline);
    return () => {
      window.removeEventListener("online", manejarOnline);
      window.removeEventListener("offline", manejarOffline);
    };
  }, []);

  // Redibuja el polígono y los marcadores cada vez que cambian los puntos.
  useEffect(() => {
    const mapa = mapaRef.current;
    if (!mapa) return;

    // Limpiar dibujo anterior.
    if (poligonoRef.current) {
      mapa.removeLayer(poligonoRef.current);
      poligonoRef.current = null;
    }
    marcadoresRef.current.forEach((m) => mapa.removeLayer(m));
    marcadoresRef.current = [];

    // En modo solo lectura no mostramos los circulitos de cada punto, solo el polígono.
    if (!soloLectura) {
      puntos.forEach((p) => {
        const marcador = L.circleMarker([p.lat, p.lng], {
          radius: 5,
          color: "#3B6D11",
          fillColor: "#639922",
          fillOpacity: 1,
        }).addTo(mapa);
        marcadoresRef.current.push(marcador);
      });
    }

    // Dibujar el polígono si hay 3 o más puntos.
    if (puntos.length >= 3) {
      const poligono = L.polygon(
        puntos.map((p) => [p.lat, p.lng]),
        { color: "#3B6D11", fillColor: "#97C459", fillOpacity: 0.35, weight: 2 }
      ).addTo(mapa);
      poligonoRef.current = poligono;
    }

    const hectareas = calcularHectareas(puntos);
    onCambiarPoligono?.(puntos, hectareas);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puntos]);

  function borrarUltimoPunto() {
    setPuntos((prev) => prev.slice(0, -1));
  }

  function borrarTodo() {
    setPuntos([]);
  }

  const hectareasActuales = calcularHectareas(puntos);

  return (
    <div>
      <div className="relative">
        <div
          ref={contenedorRef}
          className="w-full h-64 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600"
        />
        {sinConexion && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/70 rounded-lg pointer-events-none">
            <p className="text-white text-xs text-center px-4">
              📡 El mapa satelital necesita conexión a internet.
              <br />
              Podés seguir usando la app sin él.
            </p>
          </div>
        )}
      </div>
      {!soloLectura && (
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {puntos.length === 0
              ? "Tocá el mapa para marcar las esquinas de tu lote"
              : `${puntos.length} puntos · ${hectareasActuales.toFixed(2)} ha calculadas`}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={borrarUltimoPunto}
              disabled={puntos.length === 0}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30"
            >
              Deshacer
            </button>
            <button
              type="button"
              onClick={borrarTodo}
              disabled={puntos.length === 0}
              className="text-xs text-red-400 hover:text-red-600 disabled:opacity-30"
            >
              Borrar todo
            </button>
          </div>
        </div>
      )}
      {soloLectura && puntos.length === 0 && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
          Este lote no tiene ubicación guardada.
        </p>
      )}
    </div>
  );
}