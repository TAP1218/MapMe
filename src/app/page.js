"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";

// Rough center of Arizona
const DEFAULT_CENTER = [34.0489, -111.0937];
const DEFAULT_ZOOM = 6;

// This component listens for changes to "position" and moves the map there
function AutoCenter({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      // Smooth fly animation to the user's location
      map.flyTo(position, 14, { duration: 1.5 });
    }
  }, [position, map]);

  return null;
}

export default function HomePage() {
  const [currentPosition, setCurrentPosition] = useState(null);
  const [geoError, setGeoError] = useState(null);
  const [isClient, setIsClient] = useState(false);

  // Make sure this only runs in the browser (not during SSR)
  useEffect(() => {
    setIsClient(true);
  }, []);

  const getLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported in this browser.");
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

  // Try to get location on first load
  useEffect(() => {
    getLocation();
  }, []);

  if (!isClient) {
    // Avoid rendering map on the server
    return null;
  }

  return (
    <main className="h-screen w-screen flex flex-col bg-gray-100">
      {/* Top Nav Bar */}
      <header className="w-full bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Find My Location
          </h1>
          <p className="text-sm text-gray-500">
            View a map of wherever you are located and see where you are.
          </p>
        </div>

        <button
          onClick={getLocation}
          className="bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700 transition text-sm"
        >
          Locate Me
        </button>
      </header>

      {/* Map area */}
      <div className="flex-1 relative">
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={DEFAULT_ZOOM}
          scrollWheelZoom={true}
          className="h-full w-full z-0"
        >
          {/* Base map tiles */}
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Auto-center to user when we have a position */}
          {currentPosition && <AutoCenter position={currentPosition} />}

          {/* User marker */}
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

        {/* Error toast */}
        {geoError && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-md text-sm text-gray-800 z-[999]">
            Location error: {geoError}
          </div>
        )}
      </div>
    </main>
  );
}