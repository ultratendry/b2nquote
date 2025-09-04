// app/utils/brevo.js
import fetch from "node-fetch";

export async function sendBrevoTemplateMail({ to, templateId, params, subject }) {
  const apiKey = process.env.BREVO_API_KEY;
  const sender = { name: "PromoForBusiness", email: "hello@promoforbusiness.com" };

  const payload = {
    sender,
    to: Array.isArray(to) ? to.map((email) => ({ email })) : [{ email: to }],
    subject,
    templateId: Number(templateId),
    params,
  };

  // console.log("📧 Brevo API payload:", payload);

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  // console.log("📧 Brevo API status:", res.status);

  if (!res.ok) {
    const error = await res.text();
    console.error("❌ Brevo send failed:", error);
    throw new Error("Brevo send failed: " + error);
  }

  const result = await res.json();
  console.log("📧 Brevo API result:", result);
  return result;
}
