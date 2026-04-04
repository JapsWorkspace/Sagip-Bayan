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

function drawLabelValue(doc, label, value, x, y, labelWidth = 120, valueWidth = 380) {
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .text(label, x, y, { width: labelWidth, continued: false });

  doc
    .font("Helvetica")
    .fontSize(10)
    .text(value || "-", x + labelWidth, y, { width: valueWidth });
}

function drawTableHeader(doc, y) {
  const columns = [
    { label: "No.", x: 40, width: 28, align: "center" },
    { label: "Evacuation Center", x: 68, width: 150, align: "left" },
    { label: "Households", x: 218, width: 48, align: "center" },
    { label: "Families", x: 266, width: 45, align: "center" },
    { label: "Male", x: 311, width: 38, align: "center" },
    { label: "Female", x: 349, width: 42, align: "center" },
    { label: "LGBTQ", x: 391, width: 38, align: "center" },
    { label: "PWD", x: 429, width: 34, align: "center" },
    { label: "Preg.", x: 463, width: 40, align: "center" },
    { label: "Senior", x: 503, width: 38, align: "center" },
    { label: "Food Packs", x: 541, width: 40, align: "center" },
  ];

  doc.save();
  doc.rect(40, y, 541, 22).stroke();
  doc.font("Helvetica-Bold").fontSize(8);

  columns.forEach((col) => {
    doc.text(col.label, col.x + 2, y + 7, {
      width: col.width - 4,
      align: col.align,
    });
  });

  doc.restore();
  return columns;
}

function drawTableRow(doc, row, index, y, columns) {
  const values = [
    String(index + 1),
    safeText(row.evacuationCenterName),
    String(Number(row.households) || 0),
    String(Number(row.families) || 0),
    String(Number(row.male) || 0),
    String(Number(row.female) || 0),
    String(Number(row.lgbtq) || 0),
    String(Number(row.pwd) || 0),
    String(Number(row.pregnant) || 0),
    String(Number(row.senior) || 0),
    String(Number(row.requestedFoodPacks) || 0),
  ];

  const rowHeight = 22;

  doc.rect(40, y, 541, rowHeight).stroke();
  doc.font("Helvetica").fontSize(8);

  columns.forEach((col, i) => {
    doc.text(values[i], col.x + 2, y + 7, {
      width: col.width - 4,
      align: col.align,
    });
  });

  return rowHeight;
}

function addPdfHeader(doc, request) {
  doc
    .font("Helvetica-Bold")
    .fontSize(16)
    .text("MUNICIPAL DISASTER RISK REDUCTION AND MANAGEMENT OFFICE", 40, 40, {
      align: "center",
      width: 520,
    });

  doc
    .font("Helvetica")
    .fontSize(10)
    .text("Relief Assistance Request Report", 40, 62, {
      align: "center",
      width: 520,
    });

  doc.moveTo(40, 82).lineTo(570, 82).stroke();

  let y = 98;

  drawLabelValue(doc, "Request No:", safeText(request.requestNo), 40, y);
  y += 18;
  drawLabelValue(doc, "Barangay:", safeText(request.barangayName), 40, y);
  y += 18;
  drawLabelValue(doc, "Disaster:", safeText(request.disaster), 40, y);
  y += 18;
  drawLabelValue(
    doc,
    "Request Date:",
    request.requestDate ? new Date(request.requestDate).toLocaleString() : "-",
    40,
    y
  );
  y += 18;
  drawLabelValue(doc, "Status:", safeText(request.status), 40, y);
  y += 18;
  drawLabelValue(doc, "Remarks:", safeText(request.remarks) || "-", 40, y, 120, 400);
  y += 28;

  return y;
}

function addPdfFooter(doc) {
  const bottomY = 740;

  doc
    .font("Helvetica")
    .fontSize(9)
    .text("Prepared by: ________________________________", 40, bottomY);

  doc
    .font("Helvetica")
    .fontSize(9)
    .text("Received by: ________________________________", 320, bottomY);

  doc
    .font("Helvetica-Oblique")
    .fontSize(8)
    .text("System Generated Document", 40, bottomY + 24, {
      align: "center",
      width: 520,
    });
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

      let y = addPdfHeader(doc, request);

      doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .text("Evacuation Details", 40, y);

      y += 18;

      let columns = drawTableHeader(doc, y);
      y += 22;

      (request.rows || []).forEach((row, index) => {
        if (y > 680) {
          addPdfFooter(doc);
          doc.addPage();
          y = addPdfHeader(doc, request);
          doc
            .font("Helvetica-Bold")
            .fontSize(11)
            .text("Evacuation Details (continued)", 40, y);
          y += 18;
          columns = drawTableHeader(doc, y);
          y += 22;
        }

        y += drawTableRow(doc, row, index, y, columns);
      });

      y += 20;

      if (y > 640) {
        addPdfFooter(doc);
        doc.addPage();
        y = addPdfHeader(doc, request);
      }

      const totals = request.totals || {};

      doc.font("Helvetica-Bold").fontSize(11).text("Totals Summary", 40, y);
      y += 18;

      doc.font("Helvetica").fontSize(10);
      doc.text(`Households: ${Number(totals.households) || 0}`, 40, y);
      doc.text(`Families: ${Number(totals.families) || 0}`, 200, y);
      doc.text(`Male: ${Number(totals.male) || 0}`, 360, y);
      y += 18;

      doc.text(`Female: ${Number(totals.female) || 0}`, 40, y);
      doc.text(`LGBTQ: ${Number(totals.lgbtq) || 0}`, 200, y);
      doc.text(`PWD: ${Number(totals.pwd) || 0}`, 360, y);
      y += 18;

      doc.text(`Pregnant: ${Number(totals.pregnant) || 0}`, 40, y);
      doc.text(`Senior: ${Number(totals.senior) || 0}`, 200, y);
      doc.text(
        `Requested Food Packs: ${Number(totals.requestedFoodPacks) || 0}`,
        360,
        y
      );

      addPdfFooter(doc);
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

  let pdfResult;

  try {
    pdfResult = await generateReliefRequestPdf(request);
  } catch (err) {
    console.error("PDF generation failed:", err);
    throw new Error("Failed to generate relief request PDF.");
  }

  await ReliefRequest.findByIdAndUpdate(request._id, {
    pdfFile: pdfResult.relativeFilePath,
    pdfGeneratedAt: new Date(),
    emailSent: true,
  });

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
};

module.exports = sendReliefRequestEmail;
