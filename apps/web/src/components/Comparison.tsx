import React from 'react';
import { Check, X } from 'lucide-react';

export const Comparison: React.FC = () => {
  const rows = [
    {
      feature: 'Auto-groups quotes from the same article',
      notionHighlight: true,
      standardClipper: false,
      manualCopy: 'Painful',
    },
    {
      feature: 'Saves only selected quotes (no junk ads/menus)',
      notionHighlight: true,
      standardClipper: false,
      manualCopy: true,
    },
    {
      feature: '1-click right click menu shortcut',
      notionHighlight: true,
      standardClipper: false,
      manualCopy: false,
    },
    {
      feature: 'Preserves original URL & article title',
      notionHighlight: true,
      standardClipper: true,
      manualCopy: 'Manual',
    },
    {
      feature: 'Does not slow down browser tabs',
      notionHighlight: true,
      standardClipper: false,
      manualCopy: true,
    },
    {
      feature: '1-click "Open in Notion" toast link',
      notionHighlight: true,
      standardClipper: false,
      manualCopy: false,
    },
  ];

  return (
    <section id="comparison" className="comparison-section">
      <div className="container">
        <div className="section-head">
          <h2 className="section-title">Why Notion Highlight Sync?</h2>
          <p className="section-subtitle">
            See how smart quote grouping compares to traditional web clippers and manual
            copy-pasting.
          </p>
        </div>

        <div className="comparison-table-wrapper">
          <table className="comparison-table">
            <thead>
              <tr>
                <th style={{ width: '40%' }}>Feature</th>
                <th className="highlight-column" style={{ width: '25%', color: '#a5b4fc' }}>
                  Notion Highlight Sync
                </th>
                <th style={{ width: '20%' }}>Standard Web Clipper</th>
                <th style={{ width: '15%' }}>Manual Copy-Paste</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 500 }}>{r.feature}</td>
                  <td className="highlight-column">
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: 'var(--emerald)',
                      }}
                    >
                      <Check size={16} />
                      <span>Yes</span>
                    </div>
                  </td>
                  <td>
                    {r.standardClipper === true ? (
                      <span style={{ color: 'var(--emerald)' }}>
                        <Check size={16} />
                      </span>
                    ) : (
                      <span style={{ color: '#ef4444' }}>
                        <X size={16} />
                      </span>
                    )}
                  </td>
                  <td>
                    {r.manualCopy === true ? (
                      <span style={{ color: 'var(--emerald)' }}>
                        <Check size={16} />
                      </span>
                    ) : r.manualCopy === false ? (
                      <span style={{ color: '#ef4444' }}>
                        <X size={16} />
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                        {r.manualCopy}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
