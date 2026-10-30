import React, { useState } from 'react';
import { X, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { webAnalytics } from '../lib/analytics.js';

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WaitlistModal: React.FC<WaitlistModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'email' | 'survey' | 'done'>('email');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Survey Answers (Epic 7.3)
  const [currentTools, setCurrentTools] = useState('');
  const [destinations, setDestinations] = useState('');
  const [willingToPay, setWillingToPay] = useState('');
  const [feedback, setFeedback] = useState('');

  if (!isOpen) return null;

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'landing_modal' }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || 'Failed to join waitlist');
      }

      webAnalytics.track('waitlist_submitted', { email });
      setStep('survey');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSurveySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          currentTools,
          destinations,
          willingToPay,
          feedback,
          source: 'landing_survey',
        }),
      });

      webAnalytics.track('survey_submitted', {
        currentTools,
        destinations,
        willingToPay,
      });

      setStep('done');
    } catch {
      // Even if network fails, user already registered email
      setStep('done');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        {step === 'email' && (
          <div>
            <div className="badge-pill" style={{ marginBottom: '14px' }}>
              <Sparkles size={12} />
              <span>Closed Beta Access</span>
            </div>
            <h2 className="modal-title">Get Early Access to Notion Highlight Sync</h2>
            <p className="modal-subtitle">
              Join 50+ knowledge workers and researchers trying out seamless quote grouping in
              Notion.
            </p>

            {errorMsg && (
              <div style={{ color: '#ef4444', fontSize: '13px', marginBottom: '12px' }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleEmailSubmit}>
              <div className="form-group">
                <label className="form-label">Your Email</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Joining...' : 'Request Beta Invite'}
                <ArrowRight size={16} />
              </button>

              <div
                style={{
                  fontSize: '12px',
                  color: 'var(--text-dim)',
                  textAlign: 'center',
                  marginTop: '14px',
                }}
              >
                We respect your privacy. Zero spam, unsubscribe at any time.
              </div>
            </form>
          </div>
        )}

        {step === 'survey' && (
          <div>
            <div className="badge-pill" style={{ marginBottom: '12px' }}>
              <CheckCircle size={12} style={{ color: 'var(--emerald)' }} />
              <span>You're on the waitlist!</span>
            </div>
            <h2 className="modal-title">Quick 1-Minute Survey (Optional)</h2>
            <p className="modal-subtitle">
              Help us shape the roadmap for features and integrations you care most about.
            </p>

            <form onSubmit={handleSurveySubmit}>
              <div className="form-group">
                <label className="form-label">
                  What tools do you currently use to save web clips?
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Notion Web Clipper, Pocket, Raindrop, Omnivore"
                  value={currentTools}
                  onChange={(e) => setCurrentTools(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  What other platforms would you like to connect in the future?
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Obsidian, Readwise, Google Docs, Logseq"
                  value={destinations}
                  onChange={(e) => setDestinations(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Would you consider a paid plan for unlimited sync ($2–$4/mo)?
                </label>
                <select
                  className="form-input"
                  value={willingToPay}
                  onChange={(e) => setWillingToPay(e.target.value)}
                >
                  <option value="">Select an option</option>
                  <option value="yes_2_3_mo">Yes, $2–$3/mo is reasonable</option>
                  <option value="yes_lifetime">
                    Yes, but prefer a one-time lifetime license ($29–$39)
                  </option>
                  <option value="free_only">I only use free plans</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Any specific feature request or thought?</label>
                <textarea
                  className="form-input"
                  rows={2}
                  placeholder="e.g. Support PDF highlighting, AI auto-summaries..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 1, justifyContent: 'center' }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Submit Answers'}
                </button>
                <button type="button" className="btn-secondary" onClick={() => setStep('done')}>
                  Skip
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 'done' && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--emerald)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 18px',
              }}
            >
              <CheckCircle size={32} />
            </div>
            <h2 className="modal-title">Thank You! You're All Set.</h2>
            <p className="modal-subtitle" style={{ maxWidth: '380px', margin: '0 auto 24px' }}>
              We've reserved your spot for the Closed Beta release. You'll receive an email with
              installation instructions very soon!
            </p>
            <button className="btn-primary" onClick={onClose} style={{ margin: '0 auto' }}>
              Back to Site
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
