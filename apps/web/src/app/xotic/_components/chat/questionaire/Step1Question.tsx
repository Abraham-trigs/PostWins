"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import LabeledInput from "./LabeledInput";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false },
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false },
);
const Rectangle = dynamic(
  () => import("react-leaflet").then((mod) => mod.Rectangle),
  { ssr: false },
);

type Step1Answer = {
  digitalAddress: string;
  lat?: number;
  lng?: number;
  bounds?: any;
};

type Step1QuestionProps = {
  value?: Step1Answer;
  onAnswer: (value: Step1Answer) => void;
};

export default function Step1Question({ value, onAnswer }: Step1QuestionProps) {
  const [digitalAddress, setDigitalAddress] = useState(
    value?.digitalAddress ?? "",
  );
  const [mapData, setMapData] = useState<any>(value ?? null);
  const [resolved, setResolved] = useState(false);

  // Resolve GhanaPost → geo
  useEffect(() => {
    if (digitalAddress.length < 5) return;

    fetch(`/api/ghanaPost?code=${digitalAddress}`)
      .then((res) => res.json())
      .then((data) => {
        setMapData(data);
        setResolved(true);
      })
      .catch(() => {
        setResolved(false);
      });
  }, [digitalAddress]);

  function confirm() {
    if (!resolved || !mapData) return;

    onAnswer({
      digitalAddress,
      lat: mapData.lat,
      lng: mapData.lng,
      bounds: mapData.bounds,
    });
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="space-y-1">
        <h3 className="text-lg font-semibold text-ark-navy">
          Where is this case located?
        </h3>
        <p className="text-sm text-ark-navy/70">
          Enter a GhanaPost Digital Address to locate the case.
        </p>
      </header>

      <LabeledInput
        label="Digital Address"
        placeholder="e.g. GA-123-4567"
        value={digitalAddress}
        onChange={(e) => setDigitalAddress(e.target.value)}
      />

      {mapData && (
        <div className="h-64 rounded overflow-hidden border">
          <MapContainer
            center={[mapData.lat, mapData.lng]}
            zoom={15}
            className="h-full w-full"
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[mapData.lat, mapData.lng]} />
            {mapData.bounds && (
              <Rectangle
                bounds={mapData.bounds}
                pathOptions={{ color: "cyan" }}
              />
            )}
          </MapContainer>
        </div>
      )}

      <button
        disabled={!resolved}
        onClick={confirm}
        className="rounded bg-ark-navy px-4 py-2 text-white disabled:opacity-50"
      >
        Use this location
      </button>
    </div>
  );
}
