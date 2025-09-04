// app/routes/quote.js
import { json } from "@remix-run/node";
import { prisma } from "../db.server";
import { sendBrevoTemplateMail } from "../utils/brevo";
import { getBulkDiscountForQty, safeParseNumber } from "../utils/pricing";

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" });
const fmt = (n) => (n != null && Number.isFinite(n) ? inr.format(n) : "");

export async function action({ request }) {
  const formData = await request.formData();

  // Get form fields
  const name = formData.get("full_name")?.toString() || formData.get("name")?.toString() || "";
  const email = formData.get("email")?.toString() || "";
  const company = formData.get("company")?.toString() || "";
  const location = formData.get("location")?.toString() || "";
  const message = formData.get("message")?.toString() || formData.get("details")?.toString() || "";
  const phone = formData.get("phone")?.toString() || "";
  const productTitle = formData.get("product_title")?.toString() || "";
  const productImage = formData.get("product_image")?.toString() || "";
  const itemCode = formData.get("item_code")?.toString() || "";
  const unitPrice = safeParseNumber(formData.get("unit_price")?.toString() ?? "");
  const quantity = formData.get("quantity") ? parseInt(formData.get("quantity"), 10) : undefined;
  const taxPct = safeParseNumber(formData.get("tax")?.toString() ?? "") ?? 0;
  const discountPct = Number.isInteger(quantity) ? getBulkDiscountForQty(quantity) : 0;

  // Calculations
  const discountedUnit = unitPrice != null ? unitPrice * (1 - discountPct / 100) : undefined;
  const serviceTotal = discountedUnit != null && quantity != null ? discountedUnit * quantity : undefined;
  const subtotalVal = serviceTotal ?? 0;
  const taxAmt = subtotalVal * (taxPct / 100);
  const grandTotalVal = subtotalVal + taxAmt;

  // Save quote and get its ID for quote number
  let quoteRecord;
  try {
    quoteRecord = await prisma.quote.create({
      data: {
        fullName: name,
        company,
        location,
        message,
        quantity,
        email,
        phone,
        status: "pending",
      },
    });
    // console.log("✅ Created quote record:", quoteRecord); // Should show the id
  } catch (dbError) {
    console.error("❌ DB error:", dbError);
    return json({ success: false, error: dbError.message }, { status: 500 });
  }

  // Use DB id for quote number
  const quoteNumber = quoteRecord?.id ?? "N/A";

  const params = {
    name,
    date: new Date().toLocaleDateString("en-IN"),
    company,
    location,
    email,
    phone,
    message,
    preparedBy: "PromoForBusiness",
    productTitle,
    productImage,
    itemCode,
    unitPrice: unitPrice != null ? fmt(unitPrice) : "",
    discount: discountPct.toString(),
    discountedUnit: discountedUnit != null ? fmt(discountedUnit) : "",
    quantity: quantity ?? "",
    serviceTotal: serviceTotal != null ? fmt(serviceTotal) : "",
    subtotal: fmt(subtotalVal),
    tax: Number.isFinite(taxPct) ? taxPct.toString() : "0",
    grandTotal: fmt(grandTotalVal),
    quoteNumber, // Pass the DB id as quote number
  };

  try {
    // Customer email (no subject, uses Brevo template subject)
    await sendBrevoTemplateMail({
      to: email,
      templateId: process.env.BREVO_TEMPLATE_ID,
      params,
    });

    // Admin email (custom subject with quote number)
    await sendBrevoTemplateMail({
      to: "asim.h@ultratend.com",
      templateId: process.env.BREVO_TEMPLATE_ID,
      subject: `New Quote Received - Quotation #${quoteNumber}`,
      params: {
        ...params,
        adminName: "Admin Name",
      },
    });

    return json({ success: true });
  } catch (error) {
    console.error("❌ Brevo mail sending error:", error);
    return json({ success: false, error: error.message }, { status: 500 });
  }
}