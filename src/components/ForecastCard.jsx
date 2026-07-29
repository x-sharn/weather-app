"use client";

import { getWeatherIconUrl } from "@/lib/weather";

export default function ForecastCard({ items }) {
  if (items.length === 0) return null;

  return (
    <div className="w-full max-w-xl mx-auto animate-fade-in-up-delay-1">
      <h3 className="text-lg font-semibold text-slate-300 mb-3 px-1 drop-shadow-sm">5-Day Forecast</h3>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
        {items.map((item, index) => (
          <div
            key={item.dt}
            className="glass-strong rounded-xl p-3 sm:p-4 text-center hover:bg-slate-700/40 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/5"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <p className="text-xs sm:text-sm font-medium text-slate-400 mb-2">
              {index === 0
                ? "Today"
                : new Date(item.dt_txt).toLocaleDateString("en-US", { weekday: "short" })}
            </p>
            <div className="flex justify-center mb-1">
              <img
                src={getWeatherIconUrl(item.weather[0]?.icon || "01d")}
                alt={item.weather[0]?.description || "weather"}
                className="w-10 h-10 sm:w-12 sm:h-12 drop-shadow-lg"
              />
            </div>
            <p className="text-lg sm:text-xl font-bold text-slate-100 drop-shadow-sm">
              {Math.round(item.main.temp_max)}°
            </p>
            <p className="text-xs sm:text-sm text-slate-500">
              {Math.round(item.main.temp_min)}°
            </p>
            <p className="text-xs text-slate-400 capitalize mt-1 truncate">
              {item.weather[0]?.description}
            </p>
            <div className="flex items-center justify-center gap-1 mt-2 text-xs text-slate-500">
              <span>💧</span>
              <span>{item.main.humidity}%</span>
            </div>
            <div className="flex items-center justify-center gap-1 text-xs text-slate-500">
              <span>💨</span>
              <span>{item.wind.speed} m/s</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}