import React from 'react';
import { Layers, Zap, FolderCheck, Shield, MousePointer, BookOpen } from 'lucide-react';

export const Features: React.FC = () => {
  const features = [
    {
      icon: <Layers size={24} />,
      title: 'Smart Canonical Grouping',
      desc: 'Highlight 10 different quotes across the same article over days or weeks. They will all neatly gather under the exact same Notion page.',
    },
    {
      icon: <Zap size={24} />,
      title: '1-Click Context Menu Sync',
      desc: 'No heavy sidebars or intrusive popups blocking your reading flow. Select text, right-click, and you are done in 200 milliseconds.',
    },
    {
      icon: <FolderCheck size={24} />,
      title: 'Auto-Create Database',
      desc: 'Do not want to spend time setting up schemas? The extension automatically creates and formats a "Web Highlights" database in Notion with 1 click.',
    },
    {
      icon: <BookOpen size={24} />,
      title: 'Preserves Source Context',
      desc: 'Every Notion page stores the canonical article URL, original website title, and timestamp so you can jump back to the original source anytime.',
    },
    {
      icon: <Shield size={24} />,
      title: 'Privacy-First Architecture',
      desc: 'Your Notion OAuth tokens are encrypted with military-grade AES-256-GCM. We never track or sell your reading content.',
    },
    {
      icon: <MousePointer size={24} />,
      title: 'Instant Notion Page Redirect',
      desc: 'A sleek in-page floating toast lets you jump straight to the created Notion page in a new tab with one click.',
    },
  ];

  return (
    <section id="features" className="features-section">
      <div className="container">
        <div className="section-head">
          <h2 className="section-title">Built for Serious Readers & Researchers</h2>
          <p className="section-subtitle">
            Everything you need to capture insights cleanly without turning your Notion workspace
            into a disorganized dumping ground.
          </p>
        </div>

        <div className="feature-grid">
          {features.map((f, i) => (
            <div key={i} className="feature-card">
              <div className="feature-icon-box">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
