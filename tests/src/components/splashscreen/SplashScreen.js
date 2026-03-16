import React, { useEffect, useState } from "react";
import "./SplashScreen.css";

/* ⬇️ Replace these paths with your actual assets if different */
import JaenLogo from "../../assets/images/jaenlogo.png";
import SagipBayanLogo from "../../assets/images/sagipbayanlogo.png";

function SplashScreen({ onFinish }) {
  const [dotCount, setDotCount] = useState(0);

  // Animate dots 0 → 3 → repeat, and auto-finish at ~4s
  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount((prev) => (prev + 1) % 4);
    }, 300);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (onFinish) onFinish();
    }, 4000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [onFinish]);

  return (
    <div className="splash-overlay" role="dialog" aria-label="Loading">
      {/* Logos side-by-side (left: Jaen, right: SagipBayan) */}
      <div className="splash-logos" aria-hidden="true">
        <img
          src={JaenLogo}
          alt="Jaen Seal"
          className="splash-logo splash-logo--left"
        />
        <img
          src={SagipBayanLogo}
          alt="SagipBayan Logo"
          className="splash-logo splash-logo--right"
        />
      </div>

      {/* Dots */}
      <div className="dots-container" aria-live="polite" aria-atomic="true">
        {[0, 1, 2].map((i) => (
          <span key={i} className={`dot ${i <= dotCount ? "active" : ""}`} />
        ))}
      </div>

      {/* Text */}
      <h2 className="splash-text">Connecting to the main server</h2>
    </div>
  );
}

export default SplashScreen;
