'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export type Faq = { q: string; a: string };

/**
 * Single-open accordion. Matches the hand-rolled pattern used across the marketing
 * pages, with the ARIA wiring the original was missing.
 */
export function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {faqs.map((faq, index) => {
        const open = openIndex === index;
        const buttonId = `faq-button-${index}`;
        const panelId = `faq-panel-${index}`;

        return (
          <div key={faq.q} className="glass-card overflow-hidden">
            <h3>
              <button
                id={buttonId}
                type="button"
                onClick={() => setOpenIndex(open ? null : index)}
                aria-expanded={open}
                aria-controls={panelId}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="text-sm font-semibold text-foreground">{faq.q}</span>
                <ChevronDown
                  aria-hidden
                  className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
                />
              </button>
            </h3>
            {open && (
              <p
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className="border-t border-border px-5 pb-5 pt-3 text-sm leading-relaxed text-muted-foreground"
              >
                {faq.a}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
