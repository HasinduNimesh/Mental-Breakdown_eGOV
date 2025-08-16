"use client";
import React from "react";
import { useTheme } from "../context/ThemeContext";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-slate-800"
      aria-label="Toggle theme"
      title="Toggle light/dark"
    >
      {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
    </button>
  );
}
