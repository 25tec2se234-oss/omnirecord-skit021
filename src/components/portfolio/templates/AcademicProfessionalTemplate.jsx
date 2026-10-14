import React from 'react';
import { BookOpen, GraduationCap, Check } from 'lucide-react';

export const AcademicProfessionalTemplate = ({ student, institution, portfolio: _portfolio, credentials = [], isPrint = false }) => {
  return (
    <div
      className="portfolio-template academic-professional"
      style={{
        background: '#FFFFFF',
        color: '#1E293B',
        fontFamily: "'Georgia', 'Times New Roman', serif",
        borderRadius: isPrint ? 0 : 'var(--radius-lg)',
        border: isPrint ? 'none' : '1px solid #CBD5E1',
        padding: isPrint ? '0' : '3rem',
        boxShadow: isPrint ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
      }}
    >
      {/* Formal University Crest & Letterhead */}
      <div
        style={{
          borderBottom: '2px solid #0F172A',
          paddingBottom: '1.75rem',
          marginBottom: '2rem',
          textAlign: 'center'
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, borderRadius: '50%', background: '#FFF7ED', color: '#EA580C', border: '1px solid #FDBA74', marginBottom: 12 }}>
          <GraduationCap size={30} />
        </div>
        <div style={{ textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: '0.78rem', fontWeight: 700, color: '#475569', fontFamily: "'Inter', sans-serif" }}>
          Autonomous Higher Education Framework • Institutional Verification Registry
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '6px 0 2px', color: '#0F172A', letterSpacing: '-0.01em' }}>
          {institution?.name || 'Swami Keshvanand Institute of Technology, Management & Gramothan'}
        </h1>
        <div style={{ fontSize: '0.86rem', color: '#64748B', fontFamily: "'Inter', sans-serif" }}>
          {institution?.accreditation || 'Affiliated to State Technical University & AICTE Approved'} • {institution?.code || 'SKIT-021'}
        </div>
        <div
          style={{
            marginTop: 12,
            display: 'inline-block',
            borderTop: '1px solid #E2E8F0',
            borderBottom: '1px solid #E2E8F0',
            padding: '4px 16px',
            fontSize: '0.76rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#0F172A',
            fontFamily: "'Inter', sans-serif"
          }}
        >
          Official Academic & Co-Curricular Verification Transcript
        </div>
      </div>

      {/* Candidate Dossier Header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isPrint ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          background: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: 8,
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem',
          fontFamily: "'Inter', sans-serif"
        }}
      >
        <div>
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#64748B', fontWeight: 700 }}>
            Student Candidate
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', marginTop: 2 }}>
            {student.name}
          </div>
          <div style={{ fontSize: '0.84rem', color: '#334155', marginTop: 2 }}>
            Roll / Registration No: <strong style={{ fontFamily: 'monospace' }}>{student.studentId}</strong>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#64748B', fontWeight: 700 }}>
            Academic Affiliation
          </div>
          <div style={{ fontSize: '0.94rem', fontWeight: 600, color: '#0F172A', marginTop: 2 }}>
            {student.program}
          </div>
          <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: 2 }}>
            Department of {student.departmentName} • {student.year}
          </div>
        </div>
      </div>

      {/* Headline & Statement */}
      {(student.headline || student.bio) && (
        <div style={{ marginBottom: '2rem', padding: '0 0.5rem' }}>
          {student.headline && (
            <h2 style={{ fontSize: '1.15rem', fontStyle: 'italic', margin: '0 0 6px', color: '#0F172A' }}>
              &ldquo;{student.headline}&rdquo;
            </h2>
          )}
          {student.bio && (
            <p style={{ margin: 0, fontSize: '0.94rem', lineHeight: 1.7, color: '#334155' }}>
              {student.bio}
            </p>
          )}
        </div>
      )}

      {/* Official Registry of Accomplishments */}
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            borderBottom: '1px solid #0F172A',
            paddingBottom: '0.5rem',
            marginBottom: '1rem',
            fontFamily: "'Inter', sans-serif"
          }}
        >
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Validated Academic & Extracurricular Accomplishments
          </h3>
          <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
            {credentials.length} Records Verified
          </span>
        </div>

        {credentials.length === 0 ? (
          <div
            style={{
              padding: '2.5rem',
              textAlign: 'center',
              background: '#F8FAFC',
              border: '1px dashed #CBD5E1',
              borderRadius: 6,
              color: '#64748B',
              fontFamily: "'Inter', sans-serif"
            }}
          >
            <BookOpen size={30} style={{ color: '#94A3B8', marginBottom: 6 }} />
            <p style={{ margin: 0, fontWeight: 600 }}>No institutional credentials currently listed for publication.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {credentials.map((cred, idx) => (
              <div
                key={cred.id || idx}
                style={{
                  border: '1px solid #E2E8F0',
                  borderRadius: 6,
                  padding: '1rem 1.25rem',
                  background: '#FFFFFF',
                  fontFamily: "'Inter', sans-serif",
                  pageBreakInside: 'avoid'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          color: '#0F172A',
                          border: '1px solid #CBD5E1',
                          padding: '0.1rem 0.4rem',
                          borderRadius: 3
                        }}
                      >
                        {cred.category}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                        Record ID: <code>{cred.recordNumber || cred.id}</code>
                      </span>
                    </div>

                    <h4 style={{ fontSize: '1.02rem', fontWeight: 700, color: '#0F172A', margin: '6px 0 3px', fontFamily: "'Georgia', serif" }}>
                      {cred.title}
                    </h4>
                  </div>

                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '0.2rem 0.55rem',
                      borderRadius: 4,
                      background: '#F0FDF4',
                      color: '#15803D',
                      border: '1px solid #86EFAC',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <Check size={12} strokeWidth={3} />
                    Verified by Institution
                  </span>
                </div>

                {cred.description && (
                  <p style={{ margin: '6px 0 8px', fontSize: '0.84rem', color: '#475569', lineHeight: 1.5 }}>
                    {cred.description}
                  </p>
                )}

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px dotted #E2E8F0',
                    paddingTop: '0.5rem',
                    fontSize: '0.74rem',
                    color: '#64748B'
                  }}
                >
                  <div>
                    Award Level: <strong style={{ color: '#0F172A' }}>{cred.achievementLevel || 'Participant'}</strong>
                    {cred.participationDate && (
                      <span style={{ marginLeft: 12 }}>
                        Date of Record: {new Date(cred.participationDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </span>
                    )}
                  </div>

                  {cred.certificateRef && (
                    <div style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                      Certificate No: {cred.certificateRef}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Official Sign-off & Audit Notice */}
      <div
        style={{
          marginTop: '3rem',
          paddingTop: '1.5rem',
          borderTop: '2px solid #0F172A',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2rem',
          fontFamily: "'Inter', sans-serif"
        }}
      >
        <div>
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#64748B', fontWeight: 700 }}>
            Authoritative Endorsement
          </div>
          <div style={{ fontSize: '0.82rem', color: '#334155', marginTop: 4 }}>
            Verified under the Autonomous Governance Regulation of {institution?.shortName || 'SKIT'}. Every listed credential corresponds to an immutable record confirmed by designated Faculty Reviewers.
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#64748B', fontWeight: 700 }}>
            Registry Verification Seal
          </div>
          <div style={{ fontSize: '0.82rem', fontFamily: 'monospace', color: '#0F172A', fontWeight: 700, marginTop: 4 }}>
            SEAL-{institution?.code || 'SKIT'}-AUTH-VALID
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: 2 }}>
            Generated on {new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}
          </div>
        </div>
      </div>
    </div>
  );
};
