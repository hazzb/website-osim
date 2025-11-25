// src/components/ScrollToTop.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Geser window ke paling atas setiap kali pathname (URL) berubah
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
