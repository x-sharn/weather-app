"use client";

interface ThemeToggleProps {
  isLight: boolean;
  onToggle: () => void;
}

export default function ThemeToggle({ isLight, onToggle }: ThemeToggleProps) {
  return (
    <button
      onClick={onToggle}
      className="fixed top-4 right-4 z-50 p-3 rounded-xl glass-strong hover:bg-slate-700/50 transition-all duration-200"
      title={isLight ? "Switch to dark mode" : "Switch to light mode"}
    >
      {isLight ? (
        // Bulb OFF (day mode)
        <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ) : (
        // Bulb ON (night mode)
        <svg className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )}
    </button>
  );
}