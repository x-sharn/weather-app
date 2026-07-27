"use client";

import { WeatherData, getWeatherIconUrl, formatTime } from "@/lib/weather";
import MapView from "@/components/MapView";

interface WeatherCardProps {
  data: WeatherData;
}

export default function WeatherCard({ data }: WeatherCardProps) {
  return (
    <div className="w-full max-w-xl mx-auto mb-6 rounded-2xl overflow-hidden border border-slate-700/30 backdrop-blur-xl shadow-2xl animate-fade-in-up">
      {/* Neon orange accent bar */}
      <div className="h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400" />

      {/* City header + temperature */}
      <div className="px-6 pt-5 pb-3" style={{ background: "rgba(10, 10, 25, 0.85)" }}>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 drop-shadow-sm">
              {data.name}, {data.sys.country}
            </h2>
            <p className="text-slate-400 text-sm capitalize">
              {data.weather[0]?.description}
            </p>
          </div>
          <div className="text-right">
            <img
              src={getWeatherIconUrl(data.weather[0]?.icon || "01d")}
              alt={data.weather[0]?.description || "weather"}
              className="w-12 h-12 sm:w-14 sm:h-14 drop-shadow-lg"
            />
          </div>
        </div>

        {/* Temperature */}
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-start">
            <span className="text-5xl sm:text-6xl font-bold text-slate-100 drop-shadow-sm">
              {Math.round(data.main.temp)}
            </span>
            <span className="text-xl sm:text-2xl font-bold text-slate-400 mt-1">°C</span>
          </div>
          <div>
            <p className="text-slate-400 text-xs sm:text-sm">
              Feels like {Math.round(data.main.feels_like)}°C
            </p>
          </div>
        </div>
      </div>

      {/* Map — flush, no padding, seamless gradient fades */}
      <div className="-mx-6" style={{ marginTop: 0, marginBottom: 0 }}>
        <MapView lat={data.coord.lat} lon={data.coord.lon} city={data.name} />
      </div>

      {/* Stats grid */}
      <div className="px-6 py-4" style={{ background: "rgba(10, 10, 25, 0.85)" }}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <StatItem label="Humidity" value={`${data.main.humidity}%`} />
          <StatItem label="Wind" value={`${data.wind.speed} m/s`} />
          <StatItem label="Pressure" value={`${data.main.pressure} hPa`} />
          <StatItem label="Visibility" value={`${(data.visibility / 1000).toFixed(1)} km`} />
        </div>
        <div className="grid grid-cols-2 gap-2.5 mt-2.5">
          <StatItem label="Sunrise" value={formatTime(data.sys.sunrise)} />
          <StatItem label="Sunset" value={formatTime(data.sys.sunset)} />
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