"use client";

import { useState, FormEvent, useEffect, useRef, useCallback } from "react";
import { getCitySuggestions, getNearbyCities } from "@/lib/weather";

export default function SearchBar({ onSearch, onSearchByCoords, isLoading }) {
  const [city, setCity] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [nearbyCities, setNearbyCities] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showNearby, setShowNearby] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [noResults, setNoResults] = useState(false);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceRef = useRef(null);

  // Fetch suggestions with debounce
  useEffect(() => {
    if (city.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      setNoResults(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      const results = await getCitySuggestions(city.trim());
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
      setShowNearby(false);
      setNoResults(results.length === 0);
      setHighlightIndex(-1);
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [city]);

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target) &&
        inputRef.current &&
        !inputRef.current.contains(e.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectSuggestion = useCallback(
    (suggestion) => {
      const label = suggestion.state
        ? `${suggestion.name}, ${suggestion.state}, ${suggestion.country}`
        : `${suggestion.name}, ${suggestion.country}`;
      setCity(label);
      setShowSuggestions(false);
      setSuggestions([]);
      setNoResults(false);
      onSearchByCoords(suggestion.lat, suggestion.lon, suggestion.name);
      
      // Fetch nearby cities
      getNearbyCities(suggestion.lat, suggestion.lon).then((nearby) => {
        setNearbyCities(nearby);
        setShowNearby(true);
      });
    },
    [onSearchByCoords]
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!city.trim()) return;

    // If a suggestion is highlighted, select it
    if (highlightIndex >= 0 && highlightIndex < suggestions.length) {
      selectSuggestion(suggestions[highlightIndex]);
      return;
    }

    // Otherwise search by name directly
    onSearch(city.trim());
    setShowSuggestions(false);
    setSuggestions([]);
    setNoResults(false);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto mb-8" style={{ position: "relative", zIndex: 9999 }}>
      <div className="relative flex items-center group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm" />
        <input
          ref={inputRef}
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search for a city..."
          autoComplete="off"
          className="relative w-full px-5 py-3.5 pr-14 rounded-2xl bg-slate-900/80 border border-slate-700/50 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-transparent transition-all duration-300 text-base backdrop-blur-xl"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !city.trim()}
          className="absolute right-2 p-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white transition-all duration-200 shadow-lg shadow-orange-600/20"
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
            </svg>
          )}
        </button>
      </div>

      {/* Suggestions dropdown */}
      {(showSuggestions && suggestions.length > 0) && (
        <div
          ref={suggestionsRef}
          style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: "8px", zIndex: 10000 }}
          className="rounded-xl border border-slate-700/40 bg-slate-900/95 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/50 animate-fade-in-up"
        >
          {suggestions.map((s, i) => (
            <button
              key={`${s.lat}-${s.lon}-${i}`}
              type="button"
              onClick={() => selectSuggestion(s)}
              className={`w-full text-left px-4 py-3 transition-all duration-150 flex items-center gap-3 ${
                i === highlightIndex
                  ? "bg-orange-500/20 border-l-2 border-orange-500"
                  : "hover:bg-slate-800/80 border-l-2 border-transparent"
              } ${i > 0 ? "border-t border-slate-700/20" : ""}`}
            >
              <span className="text-lg">📍</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-200 truncate">
                  {s.name}
                  {s.state && (
                    <span className="text-slate-400 font-normal">, {s.state}</span>
                  )}
                </p>
                <p className="text-xs text-slate-500">
                  {s.country}
                  {s.local_names?.en && s.local_names.en !== s.name && (
                    <span className="ml-2">({s.local_names.en})</span>
                  )}
                </p>
              </div>
              <svg className="w-4 h-4 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
      )}

      {/* Nearby cities */}
      {showNearby && nearbyCities.length > 0 && (
        <div
          style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: "8px", zIndex: 10000 }}
          className="rounded-xl border border-slate-700/40 bg-slate-900/95 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/50 animate-fade-in-up"
        >
          <div className="px-4 py-2 bg-slate-800/50 border-b border-slate-700/20">
            <p className="text-xs text-slate-400 font-medium">Nearby Cities</p>
          </div>
          {nearbyCities.map((s, i) => (
            <button
              key={`nearby-${s.lat}-${s.lon}-${i}`}
              type="button"
              onClick={() => selectSuggestion(s)}
              className="w-full text-left px-4 py-3 transition-all duration-150 flex items-center gap-3 hover:bg-slate-800/80 border-l-2 border-transparent"
            >
              <span className="text-lg">🏙️</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-200 truncate">
                  {s.name}
                  {s.state && (
                    <span className="text-slate-400 font-normal">, {s.state}</span>
                  )}
                </p>
                <p className="text-xs text-slate-500">{s.country}</p>
              </div>
              <svg className="w-4 h-4 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {noResults && city.trim().length >= 2 && (
        <div
          style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: "8px", zIndex: 10000 }}
          className="rounded-xl border border-slate-700/30 bg-slate-900/90 backdrop-blur-xl p-4 text-center shadow-2xl shadow-black/50 animate-fade-in-up"
        >
          <p className="text-slate-400 text-sm">
            No cities found for &ldquo;<span className="text-orange-300">{city.trim()}</span>&rdquo;
          </p>
          <p className="text-slate-600 text-xs mt-1">Try a different spelling or search for a larger city</p>
        </div>
      )}
    </form>
  );
}