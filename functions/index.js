const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { defineSecret, defineString } = require("firebase-functions/params");
const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");

initializeApp();

// ---------------------------------------------------------------------------
// Report email notification
// Sends an email to the admin whenever a user submits a report.
//
// One-time setup (see REPORTS_EMAIL_SETUP.md in the project root):
//   firebase functions:secrets:set SMTP_PASS        (e.g. a Gmail app password)
//   Set SMTP_USER / ADMIN_EMAIL when deploying, or accept the CLI prompts.
// If the email settings are missing, the function logs a warning and skips
// sending — report creation itself never fails because of email problems.
// ---------------------------------------------------------------------------
const SMTP_USER = defineString("SMTP_USER", { default: "" });
const SMTP_HOST = defineString("SMTP_HOST", { default: "smtp.gmail.com" });
const SMTP_PORT = defineString("SMTP_PORT", { default: "465" });
const ADMIN_EMAIL = defineString("ADMIN_EMAIL", { default: "" });
const SMTP_PASS = defineSecret("SMTP_PASS");

exports.onReportCreated = onDocumentCreated(
  { document: "reports/{reportId}", secrets: [SMTP_PASS] },
  async (event) => {
    const report = event.data?.data();
    if (!report) return;

    const user = SMTP_USER.value();
    const pass = SMTP_PASS.value();
    const to = ADMIN_EMAIL.value() || user;
    if (!user || !pass || !to) {
      console.warn(
        "[reports] Email not sent — SMTP_USER / SMTP_PASS / ADMIN_EMAIL are not configured."
      );
      return;
    }

    const nodemailer = require("nodemailer");
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST.value(),
      port: Number(SMTP_PORT.value()) || 465,
      secure: (Number(SMTP_PORT.value()) || 465) === 465,
      auth: { user, pass },
    });

    const isListing = report.type === "listing" || Boolean(report.listingId);
    const subject = `[RIT Marketplace] New ${isListing ? "listing" : "general"} report: ${
      report.categoryLabel || report.category || "Uncategorized"
    }`;

    const lines = [
      `A new report was submitted on RIT Marketplace.`,
      ``,
      `Type:        ${isListing ? "Listing report" : "General report"}`,
      `Category:    ${report.categoryLabel || report.category || "—"}`,
      `Description: ${report.reason || "—"}`,
      ``,
      `Reporter:    ${report.reporterName || "Unknown"} <${report.reporterEmail || "no email"}>`,
    ];
    if (isListing) {
      lines.push(
        `Listing:     ${report.listingTitle || report.listingId || "—"}`,
        `Seller:      ${report.sellerName || "Unknown"} <${report.sellerEmail || "no email"}>`
      );
    }
    lines.push(
      ``,
      `Review it in the admin panel: https://rit-marketplace.web.app/admin/reports`
    );

    try {
      await transporter.sendMail({
        from: `"RIT Marketplace Reports" <${user}>`,
        to,
        subject,
        text: lines.join("\n"),
      });
      console.log(`[reports] Notification email sent to ${to}`);
    } catch (err) {
      console.error("[reports] Failed to send notification email:", err);
    }
  }
);

exports.adminDeleteUser = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Sign in is required.");
  const db = getFirestore();
  const admin = await db.doc(`users/${request.auth.uid}`).get();
  if (admin.data()?.role !== "admin") throw new HttpsError("permission-denied", "Administrator access is required.");
  const userId = request.data?.userId;
  if (!userId || userId === request.auth.uid) throw new HttpsError("invalid-argument", "A different user account is required.");
  await getAuth().deleteUser(userId);
  await db.doc(`users/${userId}`).delete();
  return { deleted: true };
});
