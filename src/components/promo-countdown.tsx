"use client";

import { useEffect, useState } from "react";

type Remaining = {
  hours: number;
  minutes: number;
  seconds: number;
};

function getRemaining(target: number): Remaining {
  const diff = Math.max(0, target - Date.now());
  return {
    hours: Math.floor(diff / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1000),
  };
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function PromoCountdown() {
  const [remaining, setRemaining] = useState<Remaining | null>(null);

  useEffect(() => {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const target = end.getTime();
    setRemaining(getRemaining(target));

    const interval = window.setInterval(() => {
      setRemaining(getRemaining(target));
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  const value = remaining ?? { hours: 0, minutes: 0, seconds: 0 };

  return (
    <div className="countdown-wrap">
      <div className="countdown-label">Berakhir dalam</div>
      <div className="countdown" role="timer" aria-label="Sisa waktu flash sale">
        <div className="countdown-cell">
          <strong suppressHydrationWarning>{pad(value.hours)}</strong>
          <span>Jam</span>
        </div>
        <span className="countdown-sep">:</span>
        <div className="countdown-cell">
          <strong suppressHydrationWarning>{pad(value.minutes)}</strong>
          <span>Menit</span>
        </div>
        <span className="countdown-sep">:</span>
        <div className="countdown-cell">
          <strong suppressHydrationWarning>{pad(value.seconds)}</strong>
          <span>Detik</span>
        </div>
      </div>
    </div>
  );
}
