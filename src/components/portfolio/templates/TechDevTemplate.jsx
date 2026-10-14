import React from 'react';
import { CheckCircle2, Terminal, Code2, ShieldCheck } from 'lucide-react';

export const TechDevTemplate = ({ student, institution, portfolio: _portfolio, credentials = [], isPrint = false }) => {
  // Extract real technical tags strictly from actual record descriptions and categories
  const extractRealTags = (desc, category) => {
    const text = (desc + ' ' + category).toLowerCase();
    const candidates = [
      'llm', 'llms', 'iot', 'robotics', 'lorawan', 'ai', 'flutter',
      'cloud', 'pid', 'cryptography', 'bioplastics', 'federated learning',
      'full-stack', 'hackathon', 'research', 'telemetry', 'python', 'react'
    ];
    return candidates.filter(term => text.includes(term)).map(t => t.toUpperCase());
  };

  return (
    <div
      className="portfolio-template tech-dev"
      style={{
        background: isPrint ? '#FFFFFF' : '#0B0F19',
        color: isPrint ? '#0F172A' : '#F1F5F9',
        fontFamily: "'Inter', monospace",
        borderRadius: isPrint ? 0 : 'var(--radius-lg)',
        border: isPrint ? 'none' : '1px solid #1E293B',
        padding: isPrint ? '0' : '2.5rem',
        boxShadow: isPrint ? 'none' : '0 20px 25px -5px rgba(0, 0, 0, 0.4)'
      }}
    >
      {/* Dev Terminal Header */}
      <div
        style={{
          background: isPrint ? '#F8FAFC' : '#111827',
          border: '1px solid #1E293B',
          borderRadius: 'var(--radius-md)',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #1F2937', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#EF4444', display: 'inline-block' }} />
            <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#F59E0B', display: 'inline-block' }} />
            <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
            <span style={{ fontSize: '0.75rem', color: isPrint ? '#64748B' : '#94A3B8', marginLeft: 8, fontFamily: 'monospace' }}>
              dev://{student.studentId?.toLowerCase() || 'portfolio'}
            </span>
          </div>

          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              color: '#10B981',
              background: 'rgba(16, 185, 129, 0.1)',
              padding: '0.2rem 0.6rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <ShieldCheck size={13} />
            CRYPTO-VERIFIED RECORD
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            {student.avatar ? (
              <img
                src={student.avatar}
                alt={student.name}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 'var(--radius-md)',
                  objectFit: 'cover',
                  border: '2px solid #F97316'
                }}
              />
            ) : (
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(249, 115, 22, 0.15)',
                  color: '#F97316',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  border: '1px solid #F97316'
                }}
              >
                &gt;_
              </div>
            )}

            <div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: isPrint ? '#0F172A' : '#FFFFFF', letterSpacing: '-0.02em' }}>
                {student.name}
              </h1>
              <div style={{ fontSize: '0.86rem', color: isPrint ? '#475569' : '#94A3B8', marginTop: 2 }}>
                {student.program} • {student.departmentName}
              </div>
              <div style={{ fontSize: '0.76rem', color: '#F97316', fontFamily: 'monospace', marginTop: 3 }}>
                ROLL: {student.studentId} • {institution?.shortName || 'SKIT'}
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.72rem', color: isPrint ? '#64748B' : '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Institution Node
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.92rem', color: isPrint ? '#0F172A' : '#E2E8F0' }}>
              {institution?.name || 'SKIT Jaipur'}
            </div>
            <div style={{ fontSize: '0.74rem', color: isPrint ? '#475569' : '#94A3B8' }}>
              {institution?.accreditation || 'Autonomous Campus'}
            </div>
          </div>
        </div>
      </div>

      {/* Developer Bio */}
      {(student.headline || student.bio) && (
        <div
          style={{
            background: isPrint ? '#F1F5F9' : '#0F172A',
            border: '1px solid #1E293B',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            marginBottom: '2rem'
          }}
        >
          {student.headline && (
            <div style={{ fontWeight: 700, fontSize: '0.98rem', color: '#F97316', marginBottom: 4 }}>
              &gt; {student.headline}
            </div>
          )}
          {student.bio && (
            <p style={{ margin: 0, fontSize: '0.84rem', color: isPrint ? '#334155' : '#CBD5E1', lineHeight: 1.6 }}>
              {student.bio}
            </p>
          )}
        </div>
      )}

      {/* Verified Achievement Cards Grid */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Code2 size={18} style={{ color: '#F97316' }} />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: isPrint ? '#0F172A' : '#FFFFFF' }}>
              Technical Achievements & Competitions
            </h2>
          </div>

          <span
            style={{
              fontSize: '0.74rem',
              fontWeight: 700,
              padding: '0.2rem 0.6rem',
              borderRadius: 'var(--radius-sm)',
              background: '#F97316',
              color: '#FFFFFF'
            }}
          >
            {credentials.length} VERIFIED
          </span>
        </div>

        {credentials.length === 0 ? (
          <div
            style={{
              padding: '2.5rem',
              textAlign: 'center',
              background: isPrint ? '#F8FAFC' : '#111827',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed #334155',
              color: isPrint ? '#64748B' : '#64748B'
            }}
          >
            <Terminal size={32} style={{ marginBottom: 8, opacity: 0.6 }} />
            <p style={{ margin: 0, fontWeight: 600 }}>Zero achievements selected for public transmission.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: isPrint ? '1fr' : 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1rem' }}>
            {credentials.map((cred, idx) => {
              const tags = extractRealTags(cred.description || '', cred.category || '');
              return (
                <div
                  key={cred.id || idx}
                  style={{
                    background: isPrint ? '#FFFFFF' : '#111827',
                    border: '1px solid #1E293B',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 12,
                    pageBreakInside: 'avoid'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontFamily: 'monospace',
                          color: '#F97316',
                          background: 'rgba(249, 115, 22, 0.1)',
                          padding: '0.15rem 0.5rem',
                          borderRadius: 'var(--radius-sm)'
                        }}
                      >
                        {cred.category}
                      </span>

                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color: '#10B981',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        <CheckCircle2 size={12} />
                        VERIFIED
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: isPrint ? '#0F172A' : '#F8FAFC', margin: '8px 0 4px' }}>
                      {cred.title}
                    </h3>

                    {cred.description && (
                      <p style={{ fontSize: '0.8rem', color: isPrint ? '#475569' : '#94A3B8', margin: 0, lineHeight: 1.5 }}>
                        {cred.description}
                      </p>
                    )}

                    {/* Real extracted source tags */}
                    {tags.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                        {tags.map((t, tIdx) => (
                          <span
                            key={tIdx}
                            style={{
                              fontSize: '0.66rem',
                              fontFamily: 'monospace',
                              padding: '0.1rem 0.4rem',
                              borderRadius: 4,
                              background: isPrint ? '#E2E8F0' : '#1E293B',
                              color: isPrint ? '#334155' : '#CBD5E1'
                            }}
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      borderTop: '1px solid #1E293B',
                      paddingTop: '0.6rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.72rem',
                      color: isPrint ? '#64748B' : '#64748B',
                      fontFamily: 'monospace'
                    }}
                  >
                    <span>
                      LVL: <strong style={{ color: isPrint ? '#0F172A' : '#E2E8F0' }}>{cred.achievementLevel || 'Participant'}</strong>
                    </span>
                    {cred.certificateRef && (
                      <span title={cred.certificateRef}>
                        {cred.certificateRef}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Dev Card Footer */}
      <div
        style={{
          marginTop: '2.5rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid #1E293B',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.72rem',
          color: isPrint ? '#64748B' : '#64748B',
          fontFamily: 'monospace'
        }}
      >
        <div>
          STATUS: AUTHORITATIVE_LEDGER_SYNCED
        </div>
        <div>
          {institution?.shortName || 'SKIT'} • PEHCHAAN_PLATFORM_V1
        </div>
      </div>
    </div>
  );
};
