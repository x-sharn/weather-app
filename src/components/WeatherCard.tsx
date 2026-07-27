"use client";

import { WeatherData, formatTime, convertTemp, getAQILabel, getUVLabel } from "@/lib/weather";
import MapView from "@/components/MapView";

interface WeatherCardProps {
  data: WeatherData;
  unit: "C" | "F";
  aqiData: { aqi: number; components: Record<string, number> } | null;
  uvData: { value: number } | null;
  alerts: { event: string; description: string }[];
  onShare: () => void;
}

export default function WeatherCard({ data, unit, aqiData, uvData, alerts, onShare }: WeatherCardProps) {
  const temp = convertTemp(data.main.temp, unit);
  const feels = convertTemp(data.main.feels_like, unit);
  const unitLabel = unit === "C" ? "°C" : "°F";
  const aqi = aqiData ? getAQILabel(aqiData.aqi) : null;
  const uv = uvData ? getUVLabel(uvData.value) : null;

  return (
    <div id="weather-card" className="w-full max-w-xl mx-auto mb-6 rounded-2xl overflow-hidden border border-slate-700/30 backdrop-blur-xl shadow-2xl animate-fade-in-up">
      {/* Neon orange accent bar */}
      <div className="h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400" />

      {/* Alert banner */}
      {alerts.length > 0 && (
        <div className="px-4 py-2 bg-red-900/40 border-b border-red-700/30 text-sm">
          <p className="text-red-300 font-medium flex items-center gap-2">
            <span>⚠️</span>
            <span className="truncate">{alerts[0].event}</span>
          </p>
        </div>
      )}

      {/* City header + temperature */}
      <div className="px-6 pt-5 pb-3" style={{ background: "var(--card-bg)" }}>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold drop-shadow-sm" style={{ color: "var(--foreground)" }}>
              {data.name}, {data.sys.country}
            </h2>
            <p className="text-slate-400 text-sm capitalize">{data.weather[0]?.description}</p>
          </div>
          <div className="flex items-center gap-2">
            {/* AQI Badge */}
            {aqi && (
              <span
                className="text-xs font-bold px-2 py-1 rounded-full"
                style={{ background: `${aqi.color}22`, color: aqi.color, border: `1px solid ${aqi.color}44` }}
              >
                AQI {aqi.label}
              </span>
            )}
            {/* UV Badge */}
            {uv && (
              <span
                className="text-xs font-bold px-2 py-1 rounded-full"
                style={{ background: `${uv.color}22`, color: uv.color, border: `1px solid ${uv.color}44` }}
              >
                UV {uv.label}
              </span>
            )}
            <img src={`https://openweathermap.org/img/wn/${data.weather[0]?.icon || "01d"}@2x.png`}
              alt={data.weather[0]?.description || "weather"} className="w-12 h-12 sm:w-14 sm:h-14 drop-shadow-lg" />
          </div>
        </div>

        {/* Temperature + share button */}
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-start">
            <span className="text-5xl sm:text-6xl font-bold drop-shadow-sm" style={{ color: "var(--foreground)" }}>
              {temp}
            </span>
            <span className="text-xl sm:text-2xl font-bold text-slate-400 mt-1">{unitLabel}</span>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-slate-400 text-xs sm:text-sm">Feels like {feels}{unitLabel}</p>
            <button onClick={onShare} className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors text-sm" title="Share weather card">
              📤
            </button>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="-mx-6" style={{ marginTop: 0, marginBottom: 0 }}>
        <MapView lat={data.coord.lat} lon={data.coord.lon} city={data.name} />
      </div>

      {/* Stats grid */}
      <div className="px-6 py-4" style={{ background: "var(--card-bg)" }}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <StatItem label="Humidity" value={`${data.main.humidity}%`} />
          <StatItem label="Wind" value={`${data.wind.speed} m/s`} />
          <StatItem label="Pressure" value={`${data.main.pressure} hPa`} />
          <StatItem label="Visibility" value={`${(data.visibility / 1000).toFixed(1)} km`} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-2.5">
          <StatItem label="Sunrise" value={formatTime(data.sys.sunrise)} />
          <StatItem label="Sunset" value={formatTime(data.sys.sunset)} />
          {aqiData && <StatItem label="PM2.5" value={`${aqiData.components.pm2_5?.toFixed(1) || "—"} µg`} />}
          {aqiData && <StatItem label="PM10" value={`${aqiData.components.pm10?.toFixed(1) || "—"} µg`} />}
        </div>
      </div>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between bg-slate-900/40 rounded-xl px-3 py-2.5 border border-slate-700/15">
      <span className="text-xs text-slate-400">{label}</span>
      <span className="text-sm font-semibold text-slate-200">{value}</span>
    </div>
  );
}