"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Radio } from "lucide-react";
import { transactionFeed } from "@/lib/data";
import { relativeTime } from "@/lib/format";

type FeedItem = {
  id: string;
  name: string;
  service: string;
  city: string;
  seconds: number;
};

const EXTRA_FEED = [
  { name: "Arif H.", service: "Token PLN 200.000", city: "Bekasi" },
  { name: "Laras W.", service: "Top Up GoPay 100.000", city: "Malang" },
  { name: "Yoga P.", service: "Iuran BPJS Kelas 3", city: "Solo" },
  { name: "Mira K.", service: "Paket Data 15 GB", city: "Balikpapan" },
  { name: "Doni S.", service: "PDAM Bulan Ini", city: "Bandar Lampung" },
  { name: "Ina R.", service: "Pulsa 50.000", city: "Makassar" },
  { name: "Bayu N.", service: "Angsuran FIF", city: "Cirebon" },
];

function initialItems(): FeedItem[] {
  return transactionFeed.slice(0, 4).map((item, index) => ({
    ...item,
    id: `initial-${index}`,
  }));
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function TransactionFeed() {
  const [items, setItems] = useState<FeedItem[]>(initialItems);
  const tick = useRef(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      tick.current += 1;
      const next = EXTRA_FEED[tick.current % EXTRA_FEED.length];
      setItems((current) => {
        const aged = current.map((item) => ({ ...item, seconds: item.seconds + 4 }));
        return [
          {
            ...next,
            id: `live-${tick.current}`,
            seconds: 3,
          },
          ...aged,
        ].slice(0, 4);
      });
    }, 4000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="live-card panel">
      <div className="live-card-head">
        <div className="live-card-title">
          <span className="live-dot" />
          Transaksi terbaru
        </div>
        <span className="live-label">
          <Radio size={10} />
          Live
        </span>
      </div>
      <div className="feed-list" aria-live="off">
        {items.map((item) => (
          <div className="feed-item" key={item.id}>
            <span className="feed-avatar">{initials(item.name)}</span>
            <div className="feed-body">
              <strong>{item.name}</strong>
              <span>
                {item.service} · {item.city}
              </span>
            </div>
            <div className="feed-side">
              <span className="feed-status">
                <Check size={10} strokeWidth={3} />
                Berhasil
              </span>
              <span className="feed-time">{relativeTime(item.seconds)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
