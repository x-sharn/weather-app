"use client";

import { useState, useEffect, useCallback } from "react";
import SearchBar from "@/components/SearchBar";
import WeatherCard from "@/components/WeatherCard";
import ForecastCard from "@/components/ForecastCard";
import ThemeToggle from "@/components/ThemeToggle";
import RecentSearches from "@/components/RecentSearches";
import {
  getCurrentWeather, getCurrentWeatherByCoords,
  getForecast, getForecastByCoords,
  getDailyForecast, getHourlyForecast,
  getAQI, getUV, getAlerts,
} from "@/lib/weather";

const STORAGE_KEY = "weatherApp_recent";

export default function Home() {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [hourly, setHourly] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLight, setIsLight] = useState(false);
  const [unit, setUnit] = useState("C");
  const [recent, setRecent] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);

  // Load recent from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setRecent(JSON.parse(stored));
    } catch {}
  }, []);

  const saveRecent = useCallback((city) => {
    setRecent((prev) => {
      const next = [city, ...prev.filter((c) => c !== city)].slice(0, 5);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const fetchExtra = useCallback(async (lat, lon) => {
    try {
      const [aqiRes, uvRes, alertRes] = await Promise.allSettled([
        getAQI(lat, lon), getUV(lat, lon), getAlerts(lat, lon),
      ]);
      // Extra data can be added here if needed
    } catch {}
  }, []);

  const handleSearch = async (city) => {
    setIsLoading(true); setError(null);
    setWeather(null); setForecast([]); setHourly([]);
    try {
      const [w, f] = await Promise.all([getCurrentWeather(city), getForecast(city)]);
      setWeather(w); setForecast(getDailyForecast(f.list)); setHourly(getHourlyForecast(f.list));
      saveRecent(city);
      fetchExtra(w.coord.lat, w.coord.lon);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally { setIsLoading(false); }
  };

  const handleSearchByCoords = async (lat, lon, cityName) => {
    setIsLoading(true); setError(null);
    setWeather(null); setForecast([]); setHourly([]);
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
    if (!navigator.geolocation) { setError("Geolocation is not supported."); return; }
    navigator.geolocation.getCurrentPosition(
      async (pos) => await handleSearchByCoords(pos.coords.latitude, pos.coords.longitude, "My Location"),
      () => setError("Location access denied. Please search manually."),
    );
  };

  // Auto-detect location on mount
  useEffect(() => {
    const detectLocation = async () => {
      try {
        const geoRes = await fetch("https://ipapi.co/json/", { next: { revalidate: 3600 } });
        if (geoRes.ok) {
          const geo = await geoRes.json();
          if (geo.latitude && geo.longitude) {
            await handleSearchByCoords(geo.latitude, geo.longitude, geo.city || "My Location");
          }
        }
      } catch {
        // Silently fail
      } finally {
        setInitialLoading(false);
      }
    };
    detectLocation();
  }, []);

  // Show loading on initial load
  if (initialLoading) {
    return (
      <div className="relative min-h-screen z-10 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-blue-500/20" />
            <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 animate-spin" />
          </div>
          <p className="text-slate-400 text-sm">Detecting your location...</p>
        </div>
      </div>
    );
  }

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

        <RecentSearches onSelect={handleSearch} />
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
          <>
            <WeatherCard data={weather} unit={unit} aqiData={null} uvData={null} alerts={[]} onShare={() => {}} />
            {hourly.length > 0 && (
              <div className="w-full max-w-xl mx-auto mb-6 animate-fade-in-up-delay-1">
                <h3 className="text-lg font-semibold text-slate-300 mb-3 px-1 drop-shadow-sm">24-Hour Forecast</h3>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {hourly.slice(0, 8).map((item, i) => (
                    <div key={item.dt} className="shrink-0 glass-strong rounded-xl p-3 text-center min-w-[80px]">
                      <p className="text-xs text-slate-400 mb-1">
                        {i === 0 ? "Now" : new Date(item.dt_txt).toLocaleTimeString("en-US", { hour: "numeric" })}
                      </p>
                      <img src={`https://openweathermap.org/img/wn/${item.weather[0]?.icon || "01d"}.png`}
                        alt="" className="w-8 h-8 mx-auto drop-shadow-lg" />
                      <p className="text-sm font-bold text-slate-100">{Math.round(item.main.temp)}°</p>
                      <p className="text-xs text-slate-500">{item.main.humidity}%</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <ForecastCard items={forecast} />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-6 text-slate-600 text-xs border-t border-slate-800/30">
        <p>Powered by OpenWeatherMap API • Next.js • Tailwind CSS</p>
      </footer>
    </div>
  );
}