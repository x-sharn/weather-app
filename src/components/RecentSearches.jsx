"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "weatherApp_recent";

export default function RecentSearches({ onSelect }) {
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setRecent(JSON.parse(stored));
    } catch {}
  }, []);

  if (recent.length === 0) return null;

  return (
    <div className="max-w-xl mx-auto flex flex-wrap gap-2 mb-4">
      <span className="text-xs text-slate-500 py-1">🕘 Recent:</span>
      {recent.map((city) => (
        <button
          key={city}
          onClick={() => onSelect(city)}
          className="text-xs px-3 py-1 rounded-full glass hover:bg-slate-700/50 transition-colors"
        >
          {city}
        </button>
      ))}
    </div>
  );
}