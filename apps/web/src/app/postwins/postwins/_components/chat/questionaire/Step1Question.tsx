"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import LabeledInput from "./LabeledInput";
import { DecisionButton } from "../UI/DecisionButton";

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
  const [resolved, setResolved] = useState(Boolean(value?.lat && value?.lng));
  const [loading, setLoading] = useState(false);

  /* =========================================================
     Resolve GhanaPost → geo (debounced, abort-safe)
  ========================================================= */

  useEffect(() => {
    if (digitalAddress.trim().length < 5) {
      setResolved(false);
      setMapData(null);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `/api/intake/resolve-location?code=${encodeURIComponent(
            digitalAddress.trim(),
          )}`,
          { signal: controller.signal },
        );

        if (!res.ok) throw new Error("Failed to resolve address");

        const data = await res.json();

        setMapData(data);
        setResolved(true);
      } catch (err) {
        if ((err as any)?.name !== "AbortError") {
          setResolved(false);
          setMapData(null);
        }
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [digitalAddress]);

  function confirm() {
    if (!resolved || !mapData) return;

    onAnswer({
      digitalAddress: digitalAddress.trim(),
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
        onChangeValue={setDigitalAddress}
      />

      {loading && (
        <div
          role="status"
          aria-live="polite"
          className="text-xs text-ark-navy/60"
        >
          Resolving address…
        </div>
      )}

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

      <DecisionButton
        variant="primary"
        loading={loading}
        disabled={!resolved}
        onClick={confirm}
      >
        Use this location
      </DecisionButton>
    </div>
  );
}
