import { json } from "@remix-run/node";
import { sendBrevoTemplateMail } from "../utils/brevo";
import { prisma } from "../db.server";
import { Buffer } from "buffer";

export const action = async ({ request }) => {
  console.log("✅ SITE-QUOTE ACTION HIT");
  try {
    const form = await request.formData();

    // --- 1. Handle optional images ---
    const file = form.get("productImage");
    const logoFile = form.get("logoImage");

    const productImageBuffer =
      file && typeof file === "object" && "arrayBuffer" in file
        ? Buffer.from(await file.arrayBuffer())
        : null;

    const logoImageBuffer =
      logoFile && typeof logoFile === "object" && "arrayBuffer" in logoFile
        ? Buffer.from(await logoFile.arrayBuffer())
        : null;

    const productMime = file?.type || "image/jpeg";
    const logoMime = logoFile?.type || "image/png";

    // --- 2. Build and validate data ---
    const name = form.get("name")?.toString().trim() || "";
    const company = form.get("company")?.toString().trim() || null;
    const location = form.get("location")?.toString().trim() || null;
    const email = form.get("email")?.toString().trim() || "";
    const phone = form.get("phone")?.toString().trim() || null;
const quantityRaw = form.get("quantity")?.toString().trim() || "0";
const quantity = parseInt(quantityRaw, 10);
    const message = form.get("message")?.toString().trim() || null;
    const product = form.get("product")?.toString().trim() || null;


console.log({ name, email, message, product, quantityRaw, quantity });

if (!name.trim() || !email.trim() || !message?.trim() || !product?.trim() || quantity <= 0) {
  return json(
    { success: false, error: "Missing or invalid required fields" },
    { status: 400 } // ✅ Correct status
  );
}



    // --- 3. Save to DB ---
    let savedQuote;
    try {
      savedQuote = await prisma.quoteRequest.create({
        data: {
          name,
          company,
          location,
          email,
          phone,
          quantity,
          message,
          product,
          productImage: productImageBuffer ? productImageBuffer.toString("base64") : null,
          logoImage: logoImageBuffer ? logoImageBuffer.toString("base64") : null,
        },
      });
    } catch (dbErr) {
      console.error("❌ Prisma DB error:", dbErr);
      return json(
        { success: false, error: dbErr.message || "DB error" },
        { status: 500 }
      );
    }

    // --- 4. Generate quote number & subject ---
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    const quoteNumber = savedQuote.id.toString().padStart(4, "0");

    const subject = `Your Quotation - ${day}/${month}/${year}/ ${quoteNumber}`;
    const adminSubject = `New Quote Received - ${day}/${month}/${year}/ ${quoteNumber}`;

    // --- 5. Send emails ---
    try {
      await sendBrevoTemplateMail({
        to: email,
        templateId: 8,
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
          date: now.toLocaleDateString("en-GB"),
          preparedBy: "PromoForBusiness",
          productImage: productImageBuffer
            ? `data:${productMime};base64,${productImageBuffer.toString("base64")}`
            : undefined,
          logoImage: logoImageBuffer
            ? `data:${logoMime};base64,${logoImageBuffer.toString("base64")}`
            : undefined,
        },
      });

      await sendBrevoTemplateMail({
        to: "asim.h@ultratend.com",
        templateId: 8,
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
          date: now.toLocaleDateString("en-GB"),
          productImage: productImageBuffer
            ? `data:${productMime};base64,${productImageBuffer.toString("base64")}`
            : undefined,
          logoImage: logoImageBuffer
            ? `data:${logoMime};base64,${logoImageBuffer.toString("base64")}`
            : undefined,
          preparedBy: "PromoForBusiness",
        },
      });
    } catch (mailErr) {
      console.error("❌ Error sending mail:", mailErr);
      return json(
        { success: false, error: mailErr.message || "Mail error" },
        { status: 500 }
      );
    }

    return json({ success: true });
  } catch (err) {
    console.error("❌ Error:", err);
    return json({ success: false, error: err.message }, { status: 500 });
  }
};

export default function () {
  return null;
}
