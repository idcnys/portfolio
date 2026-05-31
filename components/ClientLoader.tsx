"use client";

import dynamic from "next/dynamic";
import React from "react";

const PortfolioClient = dynamic(() => import("./PortfolioClient"), { ssr: false });

export default function ClientLoader() {
  const [visible, setVisible] = React.useState(false);
  const wrapperRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    // Fade in the client wrapper to smoothly cover the SSR placeholder.
    const el = wrapperRef.current;
    // ensure the client is painted before starting the fade to avoid a visible jump
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));

    const handleTransitionEnd = (e?: TransitionEvent) => {
      // ensure transitionend is for opacity
      if (e && (e.propertyName !== 'opacity')) return;
      // Remove SSR placeholder after the fade-in completes
      try {
        const placeholder = document.getElementById("portfolio-ssr");
        if (placeholder && placeholder.parentNode) placeholder.parentNode.removeChild(placeholder);
      } catch (e) {
        // ignore
      }
    };

    el?.addEventListener("transitionend", handleTransitionEnd);
    const fallback = window.setTimeout(() => handleTransitionEnd(), 900);

    return () => {
      el?.removeEventListener("transitionend", handleTransitionEnd);
      window.clearTimeout(fallback);
    };
  }, []);

  return (
    <div
      id="portfolio-client-wrapper"
      ref={wrapperRef}
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 420ms cubic-bezier(0.22, 1, 0.36, 1)",
        willChange: 'opacity, transform',
      }}
    >
      <PortfolioClient />
    </div>
  );
}
