import { useEffect, useState } from "react";

export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    const root = document.getElementById("root");
    const meta = document.querySelector('meta[name="theme-color"]');
    if (isDark) {
      root.classList.add("dark");
      document.body.style.backgroundColor = "#030712";
      localStorage.setItem("theme", "dark");
      if (meta) meta.setAttribute("content", "#030712");
    } else {
      root.classList.remove("dark");
      document.body.style.backgroundColor = "#ffffff";
      localStorage.setItem("theme", "light");
      if (meta) meta.setAttribute("content", "#ffffff");
    }
  }, [isDark]);

  const toggle = () => setIsDark(prev => !prev);

  return { isDark, toggle };
}