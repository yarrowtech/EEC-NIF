const nodemailer = require('nodemailer');

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const getTransporter = () => {
  const { SMTP_USER, SMTP_PASS, SMTP_HOST, SMTP_PORT, SMTP_SECURE } = process.env;
  if (!SMTP_USER || !SMTP_PASS) {
    throw new Error('SMTP credentials are missing');
  }
  const host = SMTP_HOST || 'smtp.gmail.com';
  const port = Number(SMTP_PORT) || 465;
  const secure = typeof SMTP_SECURE === 'string'
    ? SMTP_SECURE === 'true'
    : port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });
};

const buildSchoolApprovalEmail = ({ schoolName, campuses, loginUrl }) => {
  const safeSchool = escapeHtml(schoolName || 'Your School');
  const safeLoginUrl = loginUrl ? escapeHtml(loginUrl) : '';
  const rows = campuses.map((campus, index) => {
    const campusName = escapeHtml(campus.campusName || `Campus ${index + 1}`);
    const campusType = escapeHtml(campus.campusType || 'Campus');
    const username = escapeHtml(campus.username || '—');
    const password = escapeHtml(campus.password || '—');
    return `
      <tr>
        <td style="padding:12px 10px;border-bottom:1px solid #e5e7eb;">
          <div style="font-weight:600;color:#0f172a;">${campusName}</div>
          <div style="font-size:12px;color:#64748b;">${campusType}</div>
        </td>
        <td style="padding:12px 10px;border-bottom:1px solid #e5e7eb;font-family:Courier,monospace;color:#0f172a;">${username}</td>
        <td style="padding:12px 10px;border-bottom:1px solid #e5e7eb;font-family:Courier,monospace;color:#0f172a;">${password}</td>
      </tr>
    `;
  }).join('');

  const loginSection = safeLoginUrl
    ? `<a href="${safeLoginUrl}" style="display:inline-block;background:#0f172a;color:#ffffff;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:600;">Go to Admin Login</a>`
    : '';

  return {
    subject: `EEC Approval Confirmed - ${safeSchool}`,
    html: `
      <div style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;color:#0f172a;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0;">
          <tr>
            <td align="center">
              <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
                <tr>
                  <td style="background:linear-gradient(120deg,#0f172a,#1d4ed8);padding:28px 32px;color:#ffffff;">
                    <div style="font-size:14px;letter-spacing:2px;text-transform:uppercase;color:#fde68a;">EEC Platform</div>
                    <div style="font-size:24px;font-weight:700;margin-top:6px;">Congratulations, ${safeSchool}!</div>
                    <div style="font-size:14px;margin-top:8px;color:#e2e8f0;">Your school has been approved and activated.</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px 32px;">
                    <p style="margin:0 0 16px;color:#334155;font-size:14px;">
                      Welcome to the EEC platform. Below are the campus-wise admin login credentials for your school.
                      For security, please reset each password on first login.
                    </p>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
                      <thead>
                        <tr style="background:#f1f5f9;text-align:left;font-size:12px;text-transform:uppercase;color:#64748b;">
                          <th style="padding:10px;">Campus</th>
                          <th style="padding:10px;">Username</th>
                          <th style="padding:10px;">Password</th>
                        </tr>
                      </thead>
                      <tbody style="font-size:13px;color:#0f172a;">
                        ${rows}
                      </tbody>
                    </table>
                    <div style="margin-top:20px;">
                      ${loginSection}
                    </div>
                    <p style="margin:20px 0 0;font-size:12px;color:#64748b;">
                      Need help? Reply to this email and our team will assist you.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 32px;background:#f8fafc;color:#94a3b8;font-size:12px;">
                    EEC Platform • Secure Education Management
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    `,
    text: [
      `Congratulations, ${schoolName || 'Your School'}!`,
      'Your school has been approved and activated.',
      '',
      'Campus credentials:',
      ...campuses.map((campus, index) => {
        const name = campus.campusName || `Campus ${index + 1}`;
        const type = campus.campusType || 'Campus';
        return `${name} (${type}) - Username: ${campus.username || '—'}, Password: ${campus.password || '—'}`;
      }),
      '',
      loginUrl ? `Login: ${loginUrl}` : '',
      'Please reset each password on first login.'
    ].filter(Boolean).join('\n')
  };
};

const sendSchoolApprovalEmail = async ({ to, schoolName, campuses, loginUrl }) => {
  const transporter = getTransporter();
  const fromName = process.env.SMTP_FROM_NAME || 'EEC Platform';
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;
  const payload = buildSchoolApprovalEmail({ schoolName, campuses, loginUrl });

  return transporter.sendMail({
    from: `${fromName} <${fromEmail}>`,
    to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text
  });
};

module.exports = {
  sendSchoolApprovalEmail
};
