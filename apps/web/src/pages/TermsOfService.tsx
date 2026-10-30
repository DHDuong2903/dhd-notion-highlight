import React from 'react';
import { ArrowLeft, FileText } from 'lucide-react';

interface TermsOfServiceProps {
  onBack: () => void;
}

export const TermsOfService: React.FC<TermsOfServiceProps> = ({ onBack }) => {
  return (
    <div
      className="container"
      style={{ padding: '60px 24px', maxWidth: '820px', minHeight: '80vh' }}
    >
      <button
        onClick={onBack}
        className="btn-secondary"
        style={{ marginBottom: '32px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
      >
        <ArrowLeft size={16} />
        <span>Back to Home</span>
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <FileText size={32} style={{ color: 'var(--primary)' }} />
        <h1 style={{ fontSize: '32px', fontWeight: 800 }}>Terms of Service</h1>
      </div>

      <p style={{ color: 'var(--text-dim)', fontSize: '14px', marginBottom: '32px' }}>
        Last updated: October 30, 2026
      </p>

      <div style={{ lineHeight: 1.7, color: '#cbd5e1', fontSize: '15px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', margin: '28px 0 12px' }}>
          1. Acceptance of Terms
        </h2>
        <p>
          By installing the Notion Highlight Sync extension or accessing our website and services,
          you agree to be bound by these Terms of Service. If you disagree with any part of these
          terms, you may not use our software.
        </p>

        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', margin: '28px 0 12px' }}>
          2. Description of Service
        </h2>
        <p>
          Notion Highlight Sync provides tools to clip and organize text excerpts from webpages into
          your authorized Notion workspace. The software is provided "as is" and "as available".
        </p>

        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', margin: '28px 0 12px' }}>
          3. Third-Party Integrations & Notion
        </h2>
        <p>
          Our service relies upon the Notion API provided by Notion Labs, Inc. We are not
          responsible for any downtime, service interruptions, or API rate limitations imposed by
          third-party services beyond our reasonable control.
        </p>

        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', margin: '28px 0 12px' }}>
          4. User Conduct & Fair Use
        </h2>
        <p>
          You agree not to abuse, reverse-engineer, attack, or spam the synchronization APIs. We
          reserve the right to terminate or suspend access for any account found violating fair use
          policies or attempting unauthorized penetration of the service.
        </p>

        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', margin: '28px 0 12px' }}>
          5. Limitation of Liability
        </h2>
        <p>
          In no event shall Notion Highlight Sync or its contributors be liable for any indirect,
          incidental, special, or consequential damages resulting from the use or inability to use
          the service.
        </p>
      </div>
    </div>
  );
};
