"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const SELECTOR = [
  ".section-head",
  ".service-card",
  ".step-card",
  ".testimonial-card",
  ".promo-banner",
  ".tracker-panel",
  ".cta-banner",
  ".faq-intro",
  ".faq-list",
].join(",");

/**
 * Memberi animasi masuk yang halus saat elemen masuk viewport.
 * Elemen baru (mis. invoice setelah bayar) juga otomatis terdeteksi.
 */
export function MotionInit() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const passed = entry.boundingClientRect.top < window.innerHeight;
          if (entry.isIntersecting || passed) {
            (entry.target as HTMLElement).classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -32px 0px" },
    );

    let index = 0;
    const registered = new Set<HTMLElement>();
    const register = () => {
      document.querySelectorAll<HTMLElement>(SELECTOR).forEach((element) => {
        if (registered.has(element)) return;
        registered.add(element);
        element.classList.add("motion-reveal");
        element.style.animationDelay = `${Math.min(index % 4, 3) * 70}ms`;
        index += 1;
        observer.observe(element);
      });
    };

    register();
    const mutationObserver = new MutationObserver(() => register());
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [pathname]);

  return null;
}
