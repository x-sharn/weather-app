export interface WeatherData {
  name: string;
  coord: {
    lat: number;
    lon: number;
  };
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  weather: {
    main: string;
    description: string;
    icon: string;
  }[];
  wind: {
    speed: number;
  };
  visibility: number;
  sys: {
    sunrise: number;
    sunset: number;
    country: string;
  };
  dt: number;
}

export interface ForecastItem {
  dt: number;
  main: {
    temp_min: number;
    temp_max: number;
    humidity: number;
  };
  weather: {
    main: string;
    description: string;
    icon: string;
  }[];
  wind: {
    speed: number;
  };
  dt_txt: string;
}

export interface ForecastData {
  list: ForecastItem[];
}

const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5";

export async function getCurrentWeather(city: string): Promise<WeatherData> {
  const res = await fetch(
    `${BASE_URL}/weather?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`,
    { next: { revalidate: 300 } }
  );

  if (!res.ok) {
    if (res.status === 404) throw new Error("City not found. Please check the spelling.");
    if (res.status === 401) throw new Error("Invalid API key. Please configure your .env.local file.");
    throw new Error("Failed to fetch weather data. Please try again.");
  }

  return res.json();
}

export async function getForecast(city: string): Promise<ForecastData> {
  const res = await fetch(
    `${BASE_URL}/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`,
    { next: { revalidate: 300 } }
  );

  if (!res.ok) {
    if (res.status === 404) throw new Error("City not found for forecast.");
    if (res.status === 401) throw new Error("Invalid API key.");
    throw new Error("Failed to fetch forecast data.");
  }

  return res.json();
}

export function getDailyForecast(list: ForecastItem[]): ForecastItem[] {
  const dailyMap = new Map<string, ForecastItem>();

  for (const item of list) {
    const date = item.dt_txt.split(" ")[0];
    if (!dailyMap.has(date) || item.dt_txt.includes("12:00:00")) {
      dailyMap.set(date, item);
    }
  }

  return Array.from(dailyMap.values()).slice(0, 5);
}

export function getWeatherIconUrl(icon: string): string {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`;
}

export function getWeatherGradient(condition: string): string {
  const gradients: Record<string, string> = {
    Clear: "from-amber-500/20 via-orange-500/10 to-yellow-500/20",
    Clouds: "from-slate-400/20 via-gray-500/10 to-zinc-500/20",
    Rain: "from-blue-600/20 via-indigo-500/10 to-slate-500/20",
    Drizzle: "from-blue-400/20 via-cyan-500/10 to-sky-500/20",
    Thunderstorm: "from-purple-700/20 via-indigo-600/10 to-gray-700/20",
    Snow: "from-blue-200/20 via-cyan-200/10 to-white/20",
    Mist: "from-gray-400/20 via-zinc-500/10 to-stone-500/20",
    Fog: "from-gray-400/20 via-zinc-500/10 to-stone-500/20",
    Haze: "from-yellow-600/20 via-amber-500/10 to-orange-500/20",
  };

  return gradients[condition] || "from-blue-500/20 via-indigo-500/10 to-purple-500/20";
}

export function formatTime(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function getWeatherEmoji(condition: string): string {
  const emojis: Record<string, string> = {
    Clear: "☀️",
    Clouds: "☁️",
    Rain: "🌧️",
    Drizzle: "🌦️",
    Thunderstorm: "⛈️",
    Snow: "❄️",
    Mist: "🌫️",
    Fog: "🌫️",
    Haze: "🌫️",
  };
  return emojis[condition] || "🌡️";
}