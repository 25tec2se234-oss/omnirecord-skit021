import React from 'react';
import { Award, CheckCircle2, Calendar, ShieldCheck } from 'lucide-react';

export const CleanMinimalTemplate = ({ student, institution, portfolio: _portfolio, credentials = [], isPrint = false }) => {
  return (
    <div
      className="portfolio-template clean-minimal"
      style={{
        background: '#FFFFFF',
        color: '#18181B',
        fontFamily: "'Inter', sans-serif",
        borderRadius: isPrint ? 0 : 'var(--radius-lg)',
        border: isPrint ? 'none' : '1px solid var(--border-light)',
        padding: isPrint ? '0' : '2.5rem',
        boxShadow: isPrint ? 'none' : 'var(--shadow-sm)'
      }}
    >
      {/* Header Banner */}
      <div
        style={{
          borderBottom: '1px solid var(--border-light)',
          paddingBottom: '2rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}
      >
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          {student.avatar ? (
            <img
              src={student.avatar}
              alt={student.name}
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid var(--orange-100)'
              }}
            />
          ) : (
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'var(--soft-orange)',
                color: 'var(--primary-orange)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 700
              }}
            >
              {student.name ? student.name.charAt(0) : 'S'}
            </div>
          )}

          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-full)',
                background: '#FFF7ED',
                color: '#EA580C',
                fontSize: '0.72rem',
                fontWeight: 600,
                marginBottom: 6
              }}
            >
              <ShieldCheck size={13} />
              VERIFIED STUDENT PORTFOLIO
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', color: '#09090B' }}>
              {student.name}
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {student.program} • {student.departmentName}
            </p>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
              ID: <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{student.studentId}</span> • Year: {student.year}
            </div>
          </div>
        </div>

        {/* Institution Badge */}
        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1.15rem',
            textAlign: 'right',
            maxWidth: 280
          }}
        >
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', fontWeight: 700 }}>
            Issuing Institution
          </div>
          <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#18181B', marginTop: 2 }}>
            {institution?.shortName || institution?.name || 'SKIT Jaipur'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>
            {institution?.accreditation || 'Autonomous Engineering Framework'}
          </div>
        </div>
      </div>

      {/* Student Headline & Bio */}
      {(student.headline || student.bio) && (
        <div
          style={{
            background: '#FAFAFA',
            borderLeft: '3px solid var(--primary-orange)',
            padding: '1rem 1.25rem',
            borderRadius: '0 var(--radius-md) var(--radius-md) 0',
            marginBottom: '2rem'
          }}
        >
          {student.headline && (
            <div style={{ fontWeight: 700, fontSize: '1rem', color: '#18181B', marginBottom: 4 }}>
              {student.headline}
            </div>
          )}
          {student.bio && (
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
              {student.bio}
            </p>
          )}
        </div>
      )}

      {/* Verified Credentials Section */}
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.25rem'
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#09090B' }}>
              Verified Achievements & Credentials
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Officially reviewed and endorsed by faculty authority
            </p>
          </div>
          <span
            style={{
              padding: '0.25rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              background: '#F0FDF4',
              color: '#16A34A',
              border: '1px solid #BBF7D0',
              fontSize: '0.75rem',
              fontWeight: 700
            }}
          >
            {credentials.length} {credentials.length === 1 ? 'Credential' : 'Credentials'} Verified
          </span>
        </div>

        {credentials.length === 0 ? (
          <div
            style={{
              padding: '2.5rem',
              textAlign: 'center',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--border-medium)',
              color: 'var(--text-secondary)'
            }}
          >
            <Award size={36} style={{ color: 'var(--text-tertiary)', marginBottom: 8 }} />
            <p style={{ margin: 0, fontWeight: 600 }}>No credentials currently selected for publication.</p>
            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
              Eligible verified credentials will be displayed here once selected in the portfolio builder.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {credentials.map((cred, idx) => (
              <div
                key={cred.id || idx}
                style={{
                  padding: '1.25rem 1.5rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-light)',
                  background: '#FFFFFF',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem',
                  transition: 'border-color 0.2s ease',
                  pageBreakInside: 'avoid'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        color: 'var(--primary-orange)',
                        background: 'var(--orange-50)',
                        padding: '0.15rem 0.5rem',
                        borderRadius: 'var(--radius-sm)'
                      }}
                    >
                      {cred.category}
                    </span>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#18181B', margin: '6px 0 2px' }}>
                      {cred.title}
                    </h3>
                  </div>

                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '0.2rem 0.6rem',
                      borderRadius: 'var(--radius-full)',
                      background: '#ECFDF5',
                      color: '#059669',
                      border: '1px solid #A7F3D0',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <CheckCircle2 size={13} />
                    Verified
                  </span>
                </div>

                {cred.description && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                    {cred.description}
                  </p>
                )}

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 8,
                    fontSize: '0.76rem',
                    color: 'var(--text-tertiary)',
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '0.6rem',
                    marginTop: '0.25rem'
                  }}
                >
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                    <span>
                      Level: <strong style={{ color: '#18181B' }}>{cred.achievementLevel || 'Participant'}</strong>
                    </span>
                    {cred.participationDate && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Calendar size={12} />
                        {new Date(cred.participationDate).toLocaleDateString('en-US', {
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    )}
                  </div>

                  {cred.certificateRef && (
                    <span style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                      Ref: {cred.certificateRef}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Official Footnote */}
      <div
        style={{
          marginTop: '2.5rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--border-light)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 10,
          fontSize: '0.75rem',
          color: 'var(--text-tertiary)'
        }}
      >
        <div>
          Official Verified Transcript • <strong>{institution?.name || 'SKIT Jaipur'}</strong>
        </div>
        <div>
          Authenticated via Pehchaan Verification Registry
        </div>
      </div>
    </div>
  );
};
