import { json } from "@remix-run/node";
import { sendQuoteMail } from "../utils/mail";
import { sendBrevoTemplateMail } from "../utils/brevo";
import { prisma } from "../db.server";
import { Buffer } from "buffer";

export const action = async ({ request }) => {
  try {
    const form = await request.formData();

    // Handle optional product image
    let productImageBuffer = null;
    const file = form.get("productImage");
    if (file && typeof file === "object" && "arrayBuffer" in file) {
      const arrayBuffer = await file.arrayBuffer();
      productImageBuffer = Buffer.from(arrayBuffer);
    }

    // Handle optional logo image
    let logoImageBuffer = null;
    const logoFile = form.get("logoImage");
    if (logoFile && typeof logoFile === "object" && "arrayBuffer" in logoFile) {
      const logoArrayBuffer = await logoFile.arrayBuffer();
      logoImageBuffer = Buffer.from(logoArrayBuffer);
    }

    // Build data (ensure all fields are correct types for Prisma)
    const name = form.get("name")?.toString().trim() || "";
    const company = form.get("company")?.toString().trim() || null;
    const location = form.get("location")?.toString().trim() || null;
    const email = form.get("email")?.toString().trim() || "";
    const phone = form.get("phone")?.toString().trim() || null;
    const quantityRaw = form.get("quantity")?.toString().trim() || null;
    const quantity = quantityRaw ? parseInt(quantityRaw, 10) : null;
    const message = form.get("message")?.toString().trim() || null;
    const product = form.get("product")?.toString().trim() || null;

    // Validation (all required fields, including company, location, product)
    if (!name || !company || !location || !email || !phone || !quantity || !message || !product) {
      return json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // Save to DB
    try {
      await prisma.quoteRequest.create({
        data: {
          name,
          company,
          location,
          email,
          phone,
          quantity: quantityRaw, // Save as string, matches schema
          message,
          product,
          productImage: productImageBuffer ? productImageBuffer.toString('base64') : null, 
          logoImage: logoImageBuffer ? logoImageBuffer.toString('base64') : null,
        },
      });
    } catch (dbErr) {
      console.error("❌ Prisma DB error:", dbErr);
      return json({ success: false, error: dbErr.message || dbErr.toString() || "DB error" }, { status: 500 });
    }

    // Generate subject in format: DD/MM/YYYY/ 0008
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const latest = await prisma.quoteRequest.findFirst({
      orderBy: { id: 'desc' },
      select: { id: true },
    });
    const quoteNumber = latest?.id ? latest.id.toString().padStart(4, '0') : "0000";
    const subject = `Your Quotation - ${day}/${month}/${year}/ ${quoteNumber}`;
    const adminSubject = `New Quote Received - ${day}/${month}/${year}/ ${quoteNumber}`;

    // Send customer and admin emails using Brevo template (template 8 for site-quote)
    try {
      await sendBrevoTemplateMail({
        to: email,
        templateId: 8, // Use template 8 for site-quote
        subject,
        params: {
          name,
          company,
          location,
          email,
          phone,
          quantity,
          message,
          product,
          date: new Date().toLocaleDateString("en-GB"),
          preparedBy: "PromoForBusiness",
          productImage: productImageBuffer ? `data:image/jpeg;base64,${productImageBuffer.toString('base64')}` : undefined,
          logoImage: logoImageBuffer ? `data:image/png;base64,${logoImageBuffer.toString('base64')}` : undefined,
        },
      });
      await sendBrevoTemplateMail({
        to: "asim.h@ultratend.com",
        templateId: 8, // Use template 8 for site-quote
        subject: adminSubject,
        params: {
          name,
          company,
          location,
          email,
          phone,
          quantity,
          message,
          product,
          date: new Date().toLocaleDateString("en-GB"),
          productImage: productImageBuffer ? `data:image/jpeg;base64,${productImageBuffer.toString('base64')}` : undefined,
          logoImage: logoImageBuffer ? `data:image/png;base64,${logoImageBuffer.toString('base64')}` : undefined,
          preparedBy: "PromoForBusiness",
        },
      });
    } catch (mailErr) {
      console.error("❌ Error sending mail:", mailErr);
      if (mailErr && mailErr.stack) {
        console.error("❌ Error stack:", mailErr.stack);
      }
      return json({ success: false, error: mailErr.message || mailErr.toString() || "Mail error" }, { status: 500 });
    }

    return json({ success: true });
  } catch (err) {
    console.error("❌ Error saving quote request or sending mail:", err);
    return json({ success: false, error: err.message }, { status: 500 });
  }
};

export default function () {
  return null;
}
