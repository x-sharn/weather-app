export interface WeatherData {
  name: string;
  coord: { lat: number; lon: number };
  main: { temp: number; feels_like: number; humidity: number; pressure: number };
  weather: { main: string; description: string; icon: string }[];
  wind: { speed: number };
  visibility: number;
  sys: { sunrise: number; sunset: number; country: string };
  dt: number;
}

export interface ForecastItem {
  dt: number;
  main: { temp: number; temp_min: number; temp_max: number; humidity: number };
  weather: { main: string; description: string; icon: string }[];
  wind: { speed: number };
  dt_txt: string;
}

export interface ForecastData { list: ForecastItem[] }

export interface CitySuggestion {
  name: string; lat: number; lon: number; country: string;
  state?: string; local_names?: Record<string, string>;
}

export interface AQIData {
  list: { main: { aqi: number }; components: { pm2_5: number; pm10: number; o3: number; no2: number; so2: number; co: number } }[];
}

export interface UVData { value: number }

export interface AlertData {
  sender_name?: string; event: string; start: number; end: number;
  description: string;
}

const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5";
const GEO_URL = "https://api.openweathermap.org/geo/1.0";

export async function getCitySuggestions(query: string): Promise<CitySuggestion[]> {
  if (!query || query.length < 2) return [];
  const res = await fetch(`${GEO_URL}/direct?q=${encodeURIComponent(query)}&limit=5&appid=${API_KEY}`);
  if (!res.ok) return [];
  return res.json();
}

export async function getCurrentWeather(city: string): Promise<WeatherData> {
  const res = await fetch(`${BASE_URL}/weather?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`);
  if (!res.ok) { if (res.status === 404) throw new Error("City not found."); if (res.status === 401) throw new Error("Invalid API key."); throw new Error("Failed to fetch."); }
  return res.json();
}

export async function getCurrentWeatherByCoords(lat: number, lon: number): Promise<WeatherData> {
  const res = await fetch(`${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
  if (!res.ok) throw new Error("Failed to fetch weather.");
  return res.json();
}

export async function getForecast(city: string): Promise<ForecastData> {
  const res = await fetch(`${BASE_URL}/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`);
  if (!res.ok) { if (res.status === 404) throw new Error("City not found."); throw new Error("Failed to fetch."); }
  return res.json();
}

export async function getForecastByCoords(lat: number, lon: number): Promise<ForecastData> {
  const res = await fetch(`${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
  if (!res.ok) throw new Error("Failed to fetch forecast.");
  return res.json();
}

export async function getAQI(lat: number, lon: number): Promise<AQIData> {
  const res = await fetch(`${BASE_URL}/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
  if (!res.ok) return { list: [{ main: { aqi: 0 }, components: { pm2_5: 0, pm10: 0, o3: 0, no2: 0, so2: 0, co: 0 } }] };
  return res.json();
}

export async function getUV(lat: number, lon: number): Promise<UVData> {
  const res = await fetch(`${BASE_URL}/uvi?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
  if (!res.ok) return { value: 0 };
  return res.json();
}

export async function getAlerts(lat: number, lon: number): Promise<AlertData[]> {
  const res = await fetch(`${BASE_URL}/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,daily&appid=${API_KEY}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.alerts || [];
}

export function getDailyForecast(list: ForecastItem[]): ForecastItem[] {
  const dailyMap = new Map<string, ForecastItem>();
  for (const item of list) {
    const date = item.dt_txt.split(" ")[0];
    if (!dailyMap.has(date) || item.dt_txt.includes("12:00:00")) dailyMap.set(date, item);
  }
  return Array.from(dailyMap.values()).slice(0, 5);
}

export function getHourlyForecast(list: ForecastItem[]): ForecastItem[] {
  return list.slice(0, 8); // next ~24 hours (3-hour intervals)
}

export function getWeatherIconUrl(icon: string): string {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`;
}

export function formatTime(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
}

export function convertTemp(temp: number, unit: "C" | "F"): number {
  return unit === "F" ? Math.round(temp * 9 / 5 + 32) : Math.round(temp);
}

export function getAQILabel(aqi: number): { label: string; color: string } {
  const map: Record<number, { label: string; color: string }> = {
    1: { label: "Good", color: "#22c55e" },
    2: { label: "Fair", color: "#eab308" },
    3: { label: "Moderate", color: "#f97316" },
    4: { label: "Poor", color: "#ef4444" },
    5: { label: "Very Poor", color: "#881337" },
  };
  return map[aqi] || { label: "N/A", color: "#6b7280" };
}

export function getUVLabel(value: number): { label: string; color: string } {
  if (value <= 2) return { label: "Low", color: "#22c55e" };
  if (value <= 5) return { label: "Moderate", color: "#eab308" };
  if (value <= 7) return { label: "High", color: "#f97316" };
  if (value <= 10) return { label: "Very High", color: "#ef4444" };
  return { label: "Extreme", color: "#881337" };
}

export function getWeatherEmoji(condition: string): string {
  const emojis: Record<string, string> = {
    Clear: "☀️", Clouds: "☁️", Rain: "🌧️", Drizzle: "🌦️",
    Thunderstorm: "⛈️", Snow: "❄️", Mist: "🌫️", Fog: "🌫️", Haze: "🌫️"
  };
  return emojis[condition] || "🌡️";
}