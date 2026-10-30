import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
}

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      q: 'How does automatic article grouping work?',
      a: 'When you select text, the extension canonicalizes the webpage URL (stripping out marketing tags like UTM parameters and query junk). Every highlight from the same canonical URL is automatically grouped as a new quote block under the single existing Notion page for that article.',
    },
    {
      q: 'What permissions does the extension require from Notion?',
      a: 'We use official Notion OAuth 2.0. You only grant access to the specific Notion workspace and database you choose. Your access token is encrypted with AES-256-GCM and only used to append highlights to your chosen database.',
    },
    {
      q: 'Is my reading data private and secure?',
      a: 'Yes, 100%. We do not sell your data or log your raw highlight content for marketing. All error logs and telemetry explicitly scrub tokens, passwords, and raw quotes.',
    },
    {
      q: 'Can I choose which Notion database to save into?',
      a: 'Yes! In the extension popup, you can either select any existing database in your workspace or use the 1-click "Create Highlights Database" button to set up a clean, ready-to-use database automatically.',
    },
    {
      q: 'Is the Closed Beta free?',
      a: 'Yes, the Closed Beta is 100% free with no credit card required. Beta participants will also get free perks when public release launches.',
    },
    {
      q: 'Which browsers are supported?',
      a: 'All Chromium-based browsers are supported: Google Chrome, Brave, Microsoft Edge, Arc, and Opera.',
    },
  ];

  return (
    <section id="faq" className="faq-section">
      <div className="section-head">
        <h2 className="section-title">Frequently Asked Questions</h2>
        <p className="section-subtitle">
          Everything you need to know about the product, permissions, and beta program.
        </p>
      </div>

      <div>
        {faqs.map((f, i) => (
          <div key={i} className="faq-item">
            <button
              className="faq-question"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            >
              <span>{f.q}</span>
              {openIndex === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {openIndex === i && <div className="faq-answer">{f.a}</div>}
          </div>
        ))}
      </div>
    </section>
  );
};
