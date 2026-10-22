"use client";

import { useState } from "react";
import { faqs } from "@/lib/data";

export function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="faq-list">
      {faqs.map((item, index) => {
        const isOpen = open === index;
        return (
          <div className={`faq-item ${isOpen ? "is-open" : ""}`} key={item.question}>
            <button
              type="button"
              className="faq-question"
              onClick={() => setOpen(isOpen ? null : index)}
              aria-expanded={isOpen}
              aria-controls={`faq-answer-${index}`}
            >
              {item.question}
              <span className="faq-plus" aria-hidden="true" />
            </button>
            <div className="faq-answer" id={`faq-answer-${index}`} role="region">
              <div className="faq-answer-inner">
                <p>{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
