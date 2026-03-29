const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendReliefRequestEmail = async (request) => {
  const recipients = String(process.env.DRRMO_EMAIL || '')
    .split(',')
    .map((email) => email.trim())
    .filter(Boolean);

  const rowsHtml = (request.rows || [])
    .map((row, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${row.evacuationCenterName}</td>
        <td>${row.households}</td>
        <td>${row.families}</td>
        <td>${row.male}</td>
        <td>${row.female}</td>
        <td>${row.lgbtq}</td>
        <td>${row.pwd}</td>
        <td>${row.pregnant}</td>
        <td>${row.senior}</td>
        <td>${row.requestedFoodPacks}</td>
      </tr>
    `)
    .join('');

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: recipients,
    subject: `New Relief Request - ${request.requestNo}`,
    html: `
      <h2>New Relief Request Submitted</h2>
      <p><strong>Request No:</strong> ${request.requestNo}</p>
      <p><strong>Barangay:</strong> ${request.barangayName}</p>
      <p><strong>Disaster:</strong> ${request.disaster}</p>
      <p><strong>Date:</strong> ${new Date(request.requestDate).toLocaleDateString()}</p>
      <p><strong>Remarks:</strong> ${request.remarks || '-'}</p>

      <h3>Evacuation Details</h3>
      <table border="1" cellpadding="6" cellspacing="0" style="border-collapse: collapse;">
        <thead>
          <tr>
            <th>No.</th>
            <th>Evacuation Center</th>
            <th>Households</th>
            <th>Families</th>
            <th>Male</th>
            <th>Female</th>
            <th>LGBTQ</th>
            <th>PWD</th>
            <th>Pregnant</th>
            <th>Senior</th>
            <th>Requested Food Packs</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <h3>Totals</h3>
      <ul>
        <li>Households: ${request.totals.households}</li>
        <li>Families: ${request.totals.families}</li>
        <li>Male: ${request.totals.male}</li>
        <li>Female: ${request.totals.female}</li>
        <li>LGBTQ: ${request.totals.lgbtq}</li>
        <li>PWD: ${request.totals.pwd}</li>
        <li>Pregnant: ${request.totals.pregnant}</li>
        <li>Senior: ${request.totals.senior}</li>
        <li>Requested Food Packs: ${request.totals.requestedFoodPacks}</li>
      </ul>
    `
  });
};

module.exports = sendReliefRequestEmail;