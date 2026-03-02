"use client";

import { useEffect } from "react";

export default function PredictiveProvider() {
  useEffect(() => {
    // 🚀 1. SÉCURITÉ RÉSEAU (Éco-Intelligence)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const conn = (navigator as any).connection;
    const isSlow = conn && (
      conn.saveData || 
      conn.effectiveType?.includes('2g') || 
      conn.effectiveType?.includes('3g')
    );

    if (isSlow) return; 

    // --- VARIABLES DE NETTOYAGE ---
    let script: HTMLScriptElement | null = null;
    let fallbackCleanup: (() => void) | null = null;

    // 🚀 2. LE CERVEAU PRÉDICTIF (Moteur Chrome/Edge/Android)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supportsSpeculation = (HTMLScriptElement as any).supports && (HTMLScriptElement as any).supports("speculationrules");

    if (supportsSpeculation) {
      script = document.createElement("script");
      script.type = "speculationrules";
      
      script.text = JSON.stringify({
        prerender: [
          {
            source: "document",
            where: {
              and: [
                { href_matches: "/*" },
                { not: { href_matches: "/studio/*" } },
                { not: { href_matches: "/api/*" } }
              ]
            },
            eagerness: "moderate"
          }
        ]
      });
      document.head.appendChild(script);
    } 
    // 🚀 3. LE FALLBACK QUANTIQUE (Moteur Safari/Firefox/iPhone)
    else {
      const prefetchCache = new Set<string>();
      
      const handleHover = (e: MouseEvent | TouchEvent) => {
        const target = e.target as HTMLElement;
        const anchor = target.closest("a");
        
        if (anchor && anchor.href) {
          try {
            const url = new URL(anchor.href, window.location.origin);
            
            if (
              url.origin === window.location.origin && 
              !prefetchCache.has(url.pathname) &&
              !url.pathname.startsWith('/studio')
            ) {
              prefetchCache.add(url.pathname); 
              const link = document.createElement("link");
              link.rel = "prefetch";
              link.href = url.href;
              document.head.appendChild(link);
            }
          } catch {
            // Silencieux
          }
        }
      };
      
      document.addEventListener("mouseover", handleHover, { passive: true });
      document.addEventListener("touchstart", handleHover, { passive: true });
      
      fallbackCleanup = () => {
        document.removeEventListener("mouseover", handleHover);
        document.removeEventListener("touchstart", handleHover);
      };
    }

    // 🚀 4. LE NETTOYAGE CHIRURGICAL
    return () => {
      if (script && document.head.contains(script)) {
        document.head.removeChild(script);
      }
      if (fallbackCleanup) {
        fallbackCleanup();
      }
    };
  }, []);

  return null;
}