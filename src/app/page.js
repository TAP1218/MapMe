"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";

const DEFAULT_CENTER = [34.0489, -111.0937]; // Arizona center
const DEFAULT_ZOOM = 6;

// Auto-center the map when we have a user position
function AutoCenter({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, 14, { duration: 1.5 });
    }
  }, [position, map]);

  return null;
}

export default function HomePage() {
  const [currentPosition, setCurrentPosition] = useState(null);
  const [geoError, setGeoError] = useState(null);
  const [isClient, setIsClient] = useState(false);

  // Only render map on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  const getLocation = () => {
    // Guard against SSR: check typeof window
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setGeoError("Geolocation is not available in this environment.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCurrentPosition([latitude, longitude]);
        setGeoError(null);
      },
      (err) => {
        setGeoError(err.message || "Could not get your location.");
      }
    );
  };

  // Try once on mount
  useEffect(() => {
    getLocation();
  }, []);

  if (!isClient) {
    // Avoid any window / navigator usage during SSR
    return null;
  }

  return (
    <main className="h-screen w-screen flex flex-col bg-gray-100">
      {/* Top nav */}
      <header className="w-full bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Map Me – Locator
          </h1>
          <p className="text-sm text-gray-500">
            Shows where you are on the map.
          </p>
        </div>
        <button
          onClick={getLocation}
          className="bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700 transition text-sm"
        >
          Locate Me
        </button>
      </header>

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={currentPosition || DEFAULT_CENTER}
          zoom={currentPosition ? 14 : DEFAULT_ZOOM}
          scrollWheelZoom={true}
          className="h-full w-full z-0"
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {currentPosition && <AutoCenter position={currentPosition} />}

          {currentPosition && (
            <CircleMarker
              center={currentPosition}
              radius={10}
              pathOptions={{
                color: "#2563eb",
                fillColor: "#3b82f6",
                fillOpacity: 0.7,
              }}
            >
              <Popup>You are here</Popup>
            </CircleMarker>
          )}
        </MapContainer>

        {geoError && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-md text-sm text-gray-800 z-[999]">
            Location error: {geoError}
          </div>
        )}
      </div>
    </main>
  );
}