import React from 'react';

export const PortfolioTranscriptView = ({ student, institution, portfolio: _portfolio, credentials = [] }) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="printable-transcript-container" id="printable-transcript">
      <style>{`
        @media screen {
          .printable-transcript-container {
            display: none;
          }
        }
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-transcript, #printable-transcript * {
            visibility: visible;
          }
          #printable-transcript {
            display: block !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: #ffffff !important;
            color: #000000 !important;
            padding: 20mm;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          }
          .app-container, .navbar, .sidebar, .app-header, .btn, .no-print {
            display: none !important;
          }
          .page-break-inside-avoid {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
      `}</style>

      {/* Official Institutional Header */}
      <div style={{ borderBottom: '2px solid #000', paddingBottom: '12px', marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '10pt', fontWeight: 700, color: '#333' }}>
            OFFICIAL PARTICIPATION & ACHIEVEMENT TRANSCRIPT
          </div>
          <h1 style={{ fontSize: '18pt', fontWeight: 800, margin: '4px 0 2px', color: '#000' }}>
            {institution?.name || 'Swami Keshvanand Institute of Technology, Management & Gramothan'}
          </h1>
          <div style={{ fontSize: '9pt', color: '#444' }}>
            {institution?.accreditation || 'Autonomous Engineering Framework'} • Institution Code: {institution?.code || 'SKIT-021'}
          </div>
        </div>

        <div style={{ textAlign: 'right', border: '1px solid #333', padding: '6px 12px', borderRadius: '4px' }}>
          <div style={{ fontSize: '8pt', textTransform: 'uppercase', fontWeight: 700, color: '#555' }}>Verification Status</div>
          <div style={{ fontSize: '11pt', fontWeight: 800, color: '#000' }}>AUTHENTICATED</div>
          <div style={{ fontSize: '8pt', color: '#555' }}>{currentDate}</div>
        </div>
      </div>

      {/* Student Dossier Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '18px', fontSize: '9.5pt' }}>
        <tbody>
          <tr style={{ borderBottom: '1px solid #ddd' }}>
            <td style={{ padding: '6px 0', width: '25%', color: '#555' }}>Candidate Name:</td>
            <td style={{ padding: '6px 0', width: '35%', fontWeight: 700, color: '#000' }}>{student.name}</td>
            <td style={{ padding: '6px 0', width: '20%', color: '#555' }}>Registration / Roll No:</td>
            <td style={{ padding: '6px 0', width: '20%', fontWeight: 700, fontFamily: 'monospace' }}>{student.studentId}</td>
          </tr>
          <tr style={{ borderBottom: '1px solid #ddd' }}>
            <td style={{ padding: '6px 0', color: '#555' }}>Academic Program:</td>
            <td style={{ padding: '6px 0', fontWeight: 600 }}>{student.program}</td>
            <td style={{ padding: '6px 0', color: '#555' }}>Department / Year:</td>
            <td style={{ padding: '6px 0', fontWeight: 600 }}>{student.departmentName} ({student.year})</td>
          </tr>
          <tr>
            <td style={{ padding: '6px 0', color: '#555' }}>Portfolio Headline:</td>
            <td colSpan={3} style={{ padding: '6px 0', fontStyle: 'italic', color: '#222' }}>
              {student.headline || 'Verified Student Co-Curricular & Technical Records'}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Verified Records Table */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '11pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid #000', paddingBottom: '4px', marginBottom: '8px' }}>
          Verified Co-Curricular & Technical Credentials ({credentials.length} Records)
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9pt' }}>
          <thead>
            <tr style={{ background: '#f5f5f5', borderBottom: '1px solid #000', textAlign: 'left' }}>
              <th style={{ padding: '6px 8px', width: '12%' }}>Record ID</th>
              <th style={{ padding: '6px 8px', width: '32%' }}>Achievement / Event</th>
              <th style={{ padding: '6px 8px', width: '14%' }}>Category</th>
              <th style={{ padding: '6px 8px', width: '12%' }}>Level</th>
              <th style={{ padding: '6px 8px', width: '12%' }}>Date</th>
              <th style={{ padding: '6px 8px', width: '18%' }}>Certificate Ref</th>
            </tr>
          </thead>
          <tbody>
            {credentials.map((cred, idx) => (
              <tr key={cred.id || idx} className="page-break-inside-avoid" style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '8px 8px', fontFamily: 'monospace', fontWeight: 600 }}>{cred.recordNumber || cred.id}</td>
                <td style={{ padding: '8px 8px' }}>
                  <div style={{ fontWeight: 700, color: '#000' }}>{cred.title}</div>
                  {cred.description && (
                    <div style={{ fontSize: '8pt', color: '#444', marginTop: '2px', lineHeight: 1.3 }}>
                      {cred.description}
                    </div>
                  )}
                </td>
                <td style={{ padding: '8px 8px' }}>{cred.category}</td>
                <td style={{ padding: '8px 8px', fontWeight: 600 }}>{cred.achievementLevel || 'Participant'}</td>
                <td style={{ padding: '8px 8px' }}>
                  {cred.participationDate
                    ? new Date(cred.participationDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                    : '-'}
                </td>
                <td style={{ padding: '8px 8px', fontFamily: 'monospace' }}>
                  {cred.certificateRef || 'CONFIRMED'}
                  <div style={{ fontSize: '7.5pt', color: '#059669', fontWeight: 700 }}>VERIFIED</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Official Sign-off & Security Notice */}
      <div className="page-break-inside-avoid" style={{ marginTop: '30px', borderTop: '2px solid #000', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: '8.5pt' }}>
        <div style={{ width: '60%' }}>
          <div style={{ fontWeight: 700 }}>INSTITUTIONAL VALIDATION CERTIFICATE</div>
          <div style={{ color: '#444', marginTop: '3px', lineHeight: 1.4 }}>
            This document represents an authoritative transcript generated from the Pehchaan Institutional Registry for {institution?.name || 'SKIT'}. Each record has undergone independent review and verification by designated faculty coordinators in accordance with the institution's autonomous evaluation charter.
          </div>
          <div style={{ fontSize: '8pt', color: '#666', marginTop: '6px' }}>
            Registry Verification Hash: AUTH-SKIT-TRANSCRIPT-{student.studentId}-{Date.now().toString().slice(-6)}
          </div>
        </div>

        <div style={{ textAlign: 'right', width: '35%' }}>
          <div style={{ height: '35px' }} />
          <div style={{ borderTop: '1px solid #000', paddingTop: '4px', fontWeight: 700 }}>
            Office of Dean of Student Affairs
          </div>
          <div style={{ fontSize: '8pt', color: '#555' }}>
            {institution?.shortName || 'SKIT Jaipur'}
          </div>
        </div>
      </div>
    </div>
  );
};
