"use client";

import { useState } from "react";
import SearchBar from "@/components/SearchBar";
import WeatherCard from "@/components/WeatherCard";
import ForecastCard from "@/components/ForecastCard";
import {
  getCurrentWeather,
  getCurrentWeatherByCoords,
  getForecast,
  getForecastByCoords,
  getDailyForecast,
} from "@/lib/weather";
import type { WeatherData, ForecastItem } from "@/lib/weather";

export default function Home() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchedCity, setSearchedCity] = useState<string | null>(null);

  const handleSearch = async (city: string) => {
    setIsLoading(true);
    setError(null);
    setWeather(null);
    setForecast([]);
    setSearchedCity(city);

    try {
      const [weatherData, forecastData] = await Promise.all([
        getCurrentWeather(city),
        getForecast(city),
      ]);

      setWeather(weatherData);
      setForecast(getDailyForecast(forecastData.list));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchByCoords = async (lat: number, lon: number, cityName: string) => {
    setIsLoading(true);
    setError(null);
    setWeather(null);
    setForecast([]);
    setSearchedCity(cityName);

    try {
      const [weatherData, forecastData] = await Promise.all([
        getCurrentWeatherByCoords(lat, lon),
        getForecastByCoords(lat, lon),
      ]);

      setWeather(weatherData);
      setForecast(getDailyForecast(forecastData.list));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen z-10">
      {/* Header */}
      <header className="pt-10 pb-4 px-4 relative">
        <div className="max-w-xl mx-auto text-center mb-6 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-slate-900/50 backdrop-blur-xl border border-slate-700/30 rounded-full px-4 py-1.5 mb-4">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-slate-400">Live Weather</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-100 mb-2 drop-shadow-lg">
            <span className="inline-block mr-2">🌤️</span>
            Weather App
          </h1>
          <p className="text-slate-400 text-sm">
            Get real-time weather and a 5-day forecast for any city
          </p>
        </div>
        <SearchBar onSearch={handleSearch} onSearchByCoords={handleSearchByCoords} isLoading={isLoading} />
      </header>

      {/* Main Content */}
      <main className="px-4 pb-12 relative z-10">
        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16 animate-fade-in-up">
            <div className="relative w-16 h-16 mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-blue-500/20" />
              <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
              <div className="absolute inset-2 rounded-full border-4 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent animate-spin animation-delay-150" style={{ animationDirection: "reverse" }} />
            </div>
            <p className="text-slate-400 text-sm">Fetching weather data...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="max-w-xl mx-auto animate-fade-in-up">
            <div className="glass-strong rounded-2xl p-6 text-center border border-red-700/30">
              <div className="text-4xl mb-3">⚠️</div>
              <p className="text-red-300 text-base mb-2 font-medium">{error}</p>
              <p className="text-slate-400 text-sm">
                {error.includes("API key")
                  ? "Add your OpenWeatherMap API key to the .env.local file."
                  : "Make sure you typed the city name correctly and try again."}
              </p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !weather && !error && (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in-up">
            <div className="relative mb-6">
              <div className="text-7xl">🌍</div>
              <div className="absolute -top-2 -right-2 text-3xl animate-pulse">✨</div>
            </div>
            <h2 className="text-2xl font-bold text-slate-300 mb-3 drop-shadow-sm">
              Welcome to Weather App
            </h2>
            <p className="text-slate-500 max-w-md text-sm leading-relaxed">
              Search for a city above to see the current weather conditions and 5-day forecast.
            </p>
            <div className="mt-6 grid grid-cols-3 gap-4 text-slate-600 text-xs">
              <div className="glass rounded-xl p-3">
                <div className="text-xl mb-1">🌡️</div>
                <div>Current Temp</div>
              </div>
              <div className="glass rounded-xl p-3">
                <div className="text-xl mb-1">💧</div>
                <div>Humidity</div>
              </div>
              <div className="glass rounded-xl p-3">
                <div className="text-xl mb-1">📅</div>
                <div>5-Day Forecast</div>
              </div>
            </div>
          </div>
        )}

        {/* Weather Data */}
        {weather && !isLoading && (
          <>
            <WeatherCard data={weather} />
            <ForecastCard items={forecast} />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-6 text-slate-600 text-xs border-t border-slate-800/30">
        <p>Powered by OpenWeatherMap API &bull; Next.js &bull; Tailwind CSS</p>
      </footer>
    </div>
  );
}