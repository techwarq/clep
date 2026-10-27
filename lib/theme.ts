"use client";

import { useCallback, useEffect, useState } from "react";

export type ThemeChoice = "light" | "dark" | "system";
import { THEME_STORAGE_KEY as STORAGE_KEY } from "./theme-boot";


const resolve = (choice: ThemeChoice): "light" | "dark" =>
  choice === "system" ? (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark") : choice;

function readChoice(): ThemeChoice {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : "system";
  } catch {
    return "system";
  }
}

export function useTheme() {
  const [choice, setChoice] = useState<ThemeChoice>("system");
  const [applied, setApplied] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const initial = readChoice();
    setChoice(initial);
    setApplied(resolve(initial));
  }, []);

  useEffect(() => {
    if (choice !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: light)");
    const follow = () => {
      document.documentElement.dataset.theme = resolve("system");
      setApplied(resolve("system"));
    };
    media.addEventListener("change", follow);
    return () => media.removeEventListener("change", follow);
  }, [choice]);

  const choose = useCallback((next: ThemeChoice) => {
    try {
      if (next === "system") window.localStorage.removeItem(STORAGE_KEY);
      else window.localStorage.setItem(STORAGE_KEY, next);
    } catch {}
    const theme = resolve(next);
    document.documentElement.dataset.theme = theme;
    setChoice(next);
    setApplied(theme);
  }, []);

  return { choice, applied, choose };
}
