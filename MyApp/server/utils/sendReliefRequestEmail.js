const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const ReliefRequest = require("../models/ReliefRequest");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function safeText(value) {
  if (value === null || value === undefined) return "";
  return String(value);
}

function generateReliefRequestPdf(request) {
  return new Promise((resolve, reject) => {
    try {
      const uploadDir = path.join(__dirname, "../uploads/relief-requests");
      ensureDirectoryExists(uploadDir);

      const fileName = `${request.requestNo}.pdf`;
      const absoluteFilePath = path.join(uploadDir, fileName);
      const relativeFilePath = `/uploads/relief-requests/${fileName}`;

      const doc = new PDFDocument({
        margin: 40,
        size: "A4",
      });

      const stream = fs.createWriteStream(absoluteFilePath);
      doc.pipe(stream);

      doc
        .fontSize(18)
        .text("Relief Request Report", { align: "center" })
        .moveDown(1);

      doc.fontSize(11);
      doc.text(`Request No: ${safeText(request.requestNo)}`);
      doc.text(`Barangay: ${safeText(request.barangayName)}`);
      doc.text(`Disaster: ${safeText(request.disaster)}`);
      doc.text(
        `Request Date: ${
          request.requestDate
            ? new Date(request.requestDate).toLocaleString()
            : "-"
        }`
      );
      doc.text(`Status: ${safeText(request.status)}`);
      doc.text(`Remarks: ${safeText(request.remarks) || "-"}`);
      doc.moveDown();

      doc.fontSize(12).text("Evacuation Details", { underline: true });
      doc.moveDown(0.5);

      const headers = [
        "No",
        "Evacuation Center",
        "Households",
        "Families",
        "Male",
        "Female",
        "LGBTQ",
        "PWD",
        "Pregnant",
        "Senior",
        "Food Packs",
      ];

      const colX = [40, 75, 210, 255, 300, 340, 380, 420, 455, 500, 545];
      let y = doc.y;

      headers.forEach((header, index) => {
        doc.fontSize(8).text(header, colX[index], y, {
          width: index === 1 ? 130 : 40,
          align: index === 1 ? "left" : "center",
        });
      });

      y += 20;
      doc.moveTo(40, y - 5).lineTo(570, y - 5).stroke();

      (request.rows || []).forEach((row, index) => {
        const values = [
          index + 1,
          safeText(row.evacuationCenterName),
          Number(row.households) || 0,
          Number(row.families) || 0,
          Number(row.male) || 0,
          Number(row.female) || 0,
          Number(row.lgbtq) || 0,
          Number(row.pwd) || 0,
          Number(row.pregnant) || 0,
          Number(row.senior) || 0,
          Number(row.requestedFoodPacks) || 0,
        ];

        const rowHeight = 22;

        if (y > 720) {
          doc.addPage();
          y = 50;
        }

        values.forEach((value, colIndex) => {
          doc.fontSize(8).text(String(value), colX[colIndex], y, {
            width: colIndex === 1 ? 130 : 40,
            align: colIndex === 1 ? "left" : "center",
          });
        });

        y += rowHeight;
      });

      y += 10;

      if (y > 680) {
        doc.addPage();
        y = 50;
      }

      doc.moveTo(40, y).lineTo(570, y).stroke();
      y += 15;

      const totals = request.totals || {};

      doc.fontSize(12).text("Totals", 40, y, { underline: true });
      y += 20;

      doc.fontSize(10);
      doc.text(`Households: ${Number(totals.households) || 0}`, 40, y);
      doc.text(`Families: ${Number(totals.families) || 0}`, 200, y);
      doc.text(`Male: ${Number(totals.male) || 0}`, 350, y);
      y += 18;

      doc.text(`Female: ${Number(totals.female) || 0}`, 40, y);
      doc.text(`LGBTQ: ${Number(totals.lgbtq) || 0}`, 200, y);
      doc.text(`PWD: ${Number(totals.pwd) || 0}`, 350, y);
      y += 18;

      doc.text(`Pregnant: ${Number(totals.pregnant) || 0}`, 40, y);
      doc.text(`Senior: ${Number(totals.senior) || 0}`, 200, y);
      doc.text(
        `Requested Food Packs: ${Number(totals.requestedFoodPacks) || 0}`,
        350,
        y
      );

      doc.moveDown(2);
      doc.text("System Generated Document", { align: "center" });

      doc.end();

      stream.on("finish", () => {
        resolve({
          absoluteFilePath,
          relativeFilePath,
        });
      });

      stream.on("error", reject);
    } catch (error) {
      reject(error);
    }
  });
}

const sendReliefRequestEmail = async (request) => {
  const recipients = String(process.env.DRRMO_EMAIL || "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);

  if (!recipients.length) {
    throw new Error("No DRRMO_EMAIL recipients found in environment variables.");
  }

  const rowsHtml = (request.rows || [])
    .map(
      (row, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${safeText(row.evacuationCenterName)}</td>
        <td>${Number(row.households) || 0}</td>
        <td>${Number(row.families) || 0}</td>
        <td>${Number(row.male) || 0}</td>
        <td>${Number(row.female) || 0}</td>
        <td>${Number(row.lgbtq) || 0}</td>
        <td>${Number(row.pwd) || 0}</td>
        <td>${Number(row.pregnant) || 0}</td>
        <td>${Number(row.senior) || 0}</td>
        <td>${Number(row.requestedFoodPacks) || 0}</td>
      </tr>
    `
    )
    .join("");

  const pdfResult = await generateReliefRequestPdf(request);

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: recipients,
    subject: `New Relief Request - ${request.requestNo}`,
    html: `
      <h2>New Relief Request Submitted</h2>
      <p><strong>Request No:</strong> ${safeText(request.requestNo)}</p>
      <p><strong>Barangay:</strong> ${safeText(request.barangayName)}</p>
      <p><strong>Disaster:</strong> ${safeText(request.disaster)}</p>
      <p><strong>Date:</strong> ${
        request.requestDate
          ? new Date(request.requestDate).toLocaleDateString()
          : "-"
      }</p>
      <p><strong>Remarks:</strong> ${safeText(request.remarks) || "-"}</p>

      <h3>Evacuation Details</h3>
      <table border="1" cellpadding="6" cellspacing="0" style="border-collapse: collapse; width: 100%;">
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
        <li>Households: ${Number(request.totals?.households) || 0}</li>
        <li>Families: ${Number(request.totals?.families) || 0}</li>
        <li>Male: ${Number(request.totals?.male) || 0}</li>
        <li>Female: ${Number(request.totals?.female) || 0}</li>
        <li>LGBTQ: ${Number(request.totals?.lgbtq) || 0}</li>
        <li>PWD: ${Number(request.totals?.pwd) || 0}</li>
        <li>Pregnant: ${Number(request.totals?.pregnant) || 0}</li>
        <li>Senior: ${Number(request.totals?.senior) || 0}</li>
        <li>Requested Food Packs: ${Number(request.totals?.requestedFoodPacks) || 0}</li>
      </ul>

      <p><strong>Attached:</strong> PDF copy of the relief request</p>
    `,
    attachments: [
      {
        filename: `${request.requestNo}.pdf`,
        path: pdfResult.absoluteFilePath,
        contentType: "application/pdf",
      },
    ],
  });

  await ReliefRequest.findByIdAndUpdate(request._id, {
    pdfFile: pdfResult.relativeFilePath,
    pdfGeneratedAt: new Date(),
    emailSent: true,
  });
};

module.exports = sendReliefRequestEmail;
