import React from 'react';
import { ArrowLeft, Shield } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
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
        <Shield size={32} style={{ color: 'var(--primary)' }} />
        <h1 style={{ fontSize: '32px', fontWeight: 800 }}>Privacy Policy</h1>
      </div>

      <p style={{ color: 'var(--text-dim)', fontSize: '14px', marginBottom: '32px' }}>
        Last updated: October 30, 2026
      </p>

      <div style={{ lineHeight: 1.7, color: '#cbd5e1', fontSize: '15px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', margin: '28px 0 12px' }}>
          1. Overview & Single-Purpose Commitment
        </h2>
        <p>
          Notion Highlight Sync ("we", "our", or "us") provides a browser extension and
          synchronization service designed for a single purpose: enabling users to select text on
          the web and save it directly into their personal Notion workspace, automatically grouped
          by source article.
        </p>

        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', margin: '28px 0 12px' }}>
          2. Information We Collect
        </h2>
        <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
          <li>
            <strong>Account Information:</strong> When you register or join our waitlist, we store
            your email address and an encrypted password hash.
          </li>
          <li>
            <strong>Notion OAuth Authorization:</strong> To create pages and append quotes to your
            Notion workspace, we store an OAuth access token encrypted with industry-standard
            AES-256-GCM. We never receive your Notion master password.
          </li>
          <li>
            <strong>Highlight Metadata:</strong> When you right-click to save text, we receive the
            quote text, the current page title, and the canonical webpage URL strictly to organize
            your Notion database.
          </li>
          <li>
            <strong>Anonymous Telemetry & Error Metrics:</strong> We collect aggregate technical
            metrics (such as feature usage counts and sync failure error codes) via PostHog. Raw
            quote text, passwords, and session tokens are strictly scrubbed before any telemetry
            dispatch. You can opt out of anonymous telemetry anytime in the extension popup.
          </li>
        </ul>

        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', margin: '28px 0 12px' }}>
          3. How We Use Your Information
        </h2>
        <p>
          Your data is used solely to provide the synchronization service. We do{' '}
          <strong>NOT</strong> sell, rent, or monetize your personal information or reading
          activity. We do <strong>NOT</strong> serve advertisements or share your browsing history
          with third parties.
        </p>

        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', margin: '28px 0 12px' }}>
          4. Data Storage & Security
        </h2>
        <p>
          All data in transit is protected using TLS/HTTPS encryption. Notion access tokens are
          encrypted using authenticated AES-256-GCM before database storage and decrypted only in
          server RAM during active sync requests.
        </p>

        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', margin: '28px 0 12px' }}>
          5. Your Rights & Account Deletion
        </h2>
        <p>
          Under GDPR, CCPA, and standard privacy principles, you have the right to access, export,
          or permanently delete your account and all associated data. You can disconnect Notion or
          request complete account deletion anytime by contacting{' '}
          <code>privacy@notionhighlight.com</code>.
        </p>

        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', margin: '28px 0 12px' }}>
          6. Contact Us
        </h2>
        <p>
          If you have questions regarding this Privacy Policy, please email us at{' '}
          <a
            href="mailto:privacy@notionhighlight.com"
            style={{ color: 'var(--primary)', textDecoration: 'underline' }}
          >
            privacy@notionhighlight.com
          </a>
          .
        </p>
      </div>
    </div>
  );
};
