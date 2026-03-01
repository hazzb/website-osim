"use client";

import { AuthProvider } from "./context/AuthContext";
import { LightboxProvider } from "./context/LightboxContext";
import { ThemeProvider } from "next-themes";

export function Providers({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <AuthProvider>
        <LightboxProvider>{children}</LightboxProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
