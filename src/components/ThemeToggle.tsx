"use client";

interface ThemeToggleProps {
  isLight: boolean;
  onToggle: () => void;
}

export default function ThemeToggle({ isLight, onToggle }: ThemeToggleProps) {
  return (
    <button
      onClick={onToggle}
      className="fixed top-4 right-4 z-50 p-2.5 rounded-xl glass-strong hover:bg-slate-700/50 transition-all duration-200 text-lg"
      title={isLight ? "Switch to dark mode" : "Switch to light mode"}
    >
      {isLight ? "🌙" : "☀️"}
    </button>
  );
}