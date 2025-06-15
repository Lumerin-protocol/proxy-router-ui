import { useEffect } from "react";

const TRACKING_ID = "G-TN08K48RMS";

export default function useAnalytics({ loadOn = "idle" } = {}) {
  useEffect(() => {
    let initialized = false;

    const initGA = async () => {
      if (initialized) return;
      initialized = true;
      const { default: ReactGA } = await import("react-ga4");
      ReactGA.initialize(TRACKING_ID);
      ReactGA.send({ hitType: "pageview", page: window.location.pathname });
    };

    if (loadOn === "interaction") {
      const handleInteraction = () => {
        initGA();
        window.removeEventListener("click", handleInteraction);
        window.removeEventListener("scroll", handleInteraction);
      };
      window.addEventListener("click", handleInteraction);
      window.addEventListener("scroll", handleInteraction);
      return () => {
        window.removeEventListener("click", handleInteraction);
        window.removeEventListener("scroll", handleInteraction);
      };
    }

    if (loadOn === "idle") {
      if ("requestIdleCallback" in window) {
        requestIdleCallback(initGA);
      } else {
        setTimeout(initGA, 2000); // Fallback
      }
    }

    if (loadOn === "immediate") {
      initGA();
    }
  }, [loadOn]);
}
