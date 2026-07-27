"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import SearchBar from "@/components/SearchBar";
import WeatherCard from "@/components/WeatherCard";
import ForecastCard from "@/components/ForecastCard";
import ThemeToggle from "@/components/ThemeToggle";
import {
  getCurrentWeather, getCurrentWeatherByCoords,
  getForecast, getForecastByCoords,
  getDailyForecast, getHourlyForecast,
  getAQI, getUV, getAlerts,
} from "@/lib/weather";
import type { WeatherData, ForecastItem, AQIData, UVData, AlertData } from "@/lib/weather";

const STORAGE_KEY = "weatherApp_recent";

export default function Home() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastItem[]>([]);
  const [hourly, setHourly] = useState<ForecastItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLight, setIsLight] = useState(false);
  const [unit, setUnit] = useState<"C" | "F">("C");
  const [recent, setRecent] = useState<string[]>([]);
  const [aqiData, setAqiData] = useState<{ aqi: number; components: Record<string, number> } | null>(null);
  const [uvData, setUVData] = useState<UVData | null>(null);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const cardRef = useRef<HTMLDivElement>(null);

  // Load recent from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setRecent(JSON.parse(stored));
    } catch {}
  }, []);

  const saveRecent = useCallback((city: string) => {
    setRecent((prev) => {
      const next = [city, ...prev.filter((c) => c !== city)].slice(0, 5);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const fetchExtra = useCallback(async (lat: number, lon: number) => {
    try {
      const [aqiRes, uvRes, alertRes] = await Promise.allSettled([
        getAQI(lat, lon), getUV(lat, lon), getAlerts(lat, lon),
      ]);
      if (aqiRes.status === "fulfilled") {
        const item = aqiRes.value.list[0];
        setAqiData({ aqi: item.main.aqi, components: item.components });
      }
      if (uvRes.status === "fulfilled") setUVData(uvRes.value);
      if (alertRes.status === "fulfilled") setAlerts(alertRes.value);
    } catch {}
  }, []);

  const handleSearch = async (city: string) => {
    setIsLoading(true); setError(null);
    setWeather(null); setForecast([]); setHourly([]);
    setAqiData(null); setUVData(null); setAlerts([]);
    try {
      const [w, f] = await Promise.all([getCurrentWeather(city), getForecast(city)]);
      setWeather(w); setForecast(getDailyForecast(f.list)); setHourly(getHourlyForecast(f.list));
      saveRecent(city);
      fetchExtra(w.coord.lat, w.coord.lon);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally { setIsLoading(false); }
  };

  const handleSearchByCoords = async (lat: number, lon: number, cityName: string) => {
    setIsLoading(true); setError(null);
    setWeather(null); setForecast([]); setHourly([]);
    setAqiData(null); setUVData(null); setAlerts([]);
    try {
      const [w, f] = await Promise.all([getCurrentWeatherByCoords(lat, lon), getForecastByCoords(lat, lon)]);
      setWeather(w); setForecast(getDailyForecast(f.list)); setHourly(getHourlyForecast(f.list));
      saveRecent(cityName);
      fetchExtra(lat, lon);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally { setIsLoading(false); }
  };

  const handleGeolocate = () => {
    if (!navigator.geolocation) { setError("Geolocation is not supported by your browser."); return; }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await handleSearchByCoords(pos.coords.latitude, pos.coords.longitude, "My Location");
      },
      () => setError("Location access denied. Please search for a city manually."),
    );
  };

  const handleShare = async () => {
    const el = document.getElementById("weather-card");
    if (!el) return;
    try {
      const canvas = await (window as any).html2canvas?.(el) as HTMLCanvasElement;
      if (!canvas) { throw new Error("html2canvas not available"); }
      const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r));
      if (!blob) throw new Error("Failed to create image");
      if (navigator.share) {
        await navigator.share({
          title: "Weather",
          files: [new File([blob], "weather.png", { type: "image/png" })],
        });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = "weather.png"; a.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      // Fallback: copy text
      if (weather && navigator.clipboard) {
        navigator.clipboard.writeText(
          `${weather.name}: ${Math.round(weather.main.temp)}°C, ${weather.weather[0]?.description}`
        );
      }
    }
  };

  // Load html2canvas dynamically
  useEffect(() => {
    if (typeof (window as any).html2canvas === "undefined") {
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
      s.async = true;
      document.head.appendChild(s);
    }
  }, []);

  return (
    <div className={`relative min-h-screen z-10 ${isLight ? "light" : ""}`}>
      <ThemeToggle isLight={isLight} onToggle={() => setIsLight(!isLight)} />

      {/* Header */}
      <header className="pt-10 pb-4 px-4 relative">
        <div className="max-w-xl mx-auto text-center mb-6 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-slate-900/50 backdrop-blur-xl border border-slate-700/30 rounded-full px-4 py-1.5 mb-4">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-slate-400">Live Weather</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-2 drop-shadow-lg" style={{ color: "var(--foreground)" }}>
            <span className="inline-block mr-2">🌤️</span>
            Weather App
          </h1>
          <p className="text-slate-400 text-sm">Get real-time weather and a 5-day forecast for any city</p>
        </div>

        {/* Toolbar */}
        <div className="max-w-xl mx-auto flex items-center gap-2 mb-4">
          <button
            onClick={handleGeolocate}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl glass-strong hover:bg-slate-700/50 transition-all text-sm"
          >
            📍 Use My Location
          </button>
          <button
            onClick={() => setUnit(unit === "C" ? "F" : "C")}
            className="px-4 py-2.5 rounded-xl glass-strong hover:bg-slate-700/50 transition-all text-sm font-semibold"
          >
            °{unit === "C" ? "F" : "C"}
          </button>
        </div>

        <SearchBar onSearch={handleSearch} onSearchByCoords={handleSearchByCoords} isLoading={isLoading} />

        {/* Recent searches */}
        {recent.length > 0 && !weather && (
          <div className="max-w-xl mx-auto flex flex-wrap gap-2 mb-4">
            <span className="text-xs text-slate-500 py-1">🕘 Recent:</span>
            {recent.map((city) => (
              <button
                key={city}
                onClick={() => handleSearch(city)}
                className="text-xs px-3 py-1 rounded-full glass hover:bg-slate-700/50 transition-colors"
              >
                {city}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="px-4 pb-12 relative z-10">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16 animate-fade-in-up">
            <div className="relative w-16 h-16 mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-blue-500/20" />
              <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 animate-spin" />
              <div className="absolute inset-2 rounded-full border-4 border-t-purple-500 animate-spin" style={{ animationDirection: "reverse" }} />
            </div>
            <p className="text-slate-400 text-sm">Fetching weather data...</p>
          </div>
        )}

        {error && (
          <div className="max-w-xl mx-auto animate-fade-in-up">
            <div className="glass-strong rounded-2xl p-6 text-center border border-red-700/30">
              <div className="text-4xl mb-3">⚠️</div>
              <p className="text-red-300 text-base mb-2 font-medium">{error}</p>
              <p className="text-slate-400 text-sm">
                {error.includes("API key")
                  ? "Add your API key to Vercel environment variables."
                  : "Check the spelling and try again."}
              </p>
            </div>
          </div>
        )}

        {!isLoading && !weather && !error && (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in-up">
            <div className="relative mb-6">
              <div className="text-7xl">🌍</div>
              <div className="absolute -top-2 -right-2 text-3xl animate-pulse">✨</div>
            </div>
            <h2 className="text-2xl font-bold mb-3 drop-shadow-sm" style={{ color: "var(--foreground)" }}>
              Welcome to Weather App
            </h2>
            <p className="text-slate-500 max-w-md text-sm leading-relaxed">
              Search for a city above or use your location to see current weather and forecast.
            </p>
          </div>
        )}

        {weather && !isLoading && (
          <div ref={cardRef}>
            <WeatherCard
              data={weather}
              unit={unit}
              aqiData={aqiData}
              uvData={uvData}
              alerts={alerts}
              onShare={handleShare}
            />
            {/* Hourly forecast */}
            {hourly.length > 0 && (
              <div className="w-full max-w-xl mx-auto mb-6 animate-fade-in-up-delay-1">
                <h3 className="text-lg font-semibold text-slate-300 mb-3 px-1 drop-shadow-sm">24-Hour Forecast</h3>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                  {hourly.map((item, i) => (
                    <div key={item.dt} className="shrink-0 glass-strong rounded-xl p-3 text-center min-w-[80px]">
                      <p className="text-xs text-slate-400 mb-1">
                        {i === 0 ? "Now" : new Date(item.dt_txt).toLocaleTimeString("en-US", { hour: "numeric" })}
                      </p>
                      <img src={`https://openweathermap.org/img/wn/${item.weather[0]?.icon || "01d"}.png`}
                        alt="" className="w-8 h-8 mx-auto drop-shadow-lg" />
                      <p className="text-sm font-bold text-slate-100">
                        {unit === "F" ? Math.round(item.main.temp * 9 / 5 + 32) : Math.round(item.main.temp)}°
                      </p>
                      <p className="text-xs text-slate-500">{item.main.humidity}%</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <ForecastCard items={forecast} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-6 text-slate-600 text-xs border-t border-slate-800/30">
        <p>Powered by OpenWeatherMap API &bull; Next.js &bull; Tailwind CSS</p>
      </footer>
    </div>
  );
}