// app/routes/api.proxy.submit-quote.jsx
import { json } from "@remix-run/node";
import { prisma } from "../db.server";
import { sendBrevoTemplateMail } from "../utils/brevo";
import { getBulkDiscountForQty, safeParseNumber } from "../utils/pricing";

const gbp = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }); 
const fmt = (n) => (n != null && Number.isFinite(n) ? gbp.format(n) : "");

export async function loader() { return json({ ok: true }); }

export async function action({ request }) {
  try {
    const formData = await request.formData();

    const fullName = formData.get("full_name")?.toString() || "";
    const email    = formData.get("email")?.toString() || "";
    const company  = formData.get("company")?.toString() || "";
    const location = formData.get("location")?.toString() || "";
    const message  = formData.get("message")?.toString() || "";
    const phone    = formData.get("phone")?.toString() || "";

    const productTitle = formData.get("product_title")?.toString() || "";
    const productImage = formData.get("product_image")?.toString() || "";
    const itemCode     = formData.get("item_code")?.toString() || "";

    const unitPrice = safeParseNumber(formData.get("unit_price")?.toString() ?? "");
    const qtyRaw    = formData.get("quantity")?.toString();
    const quantity  = qtyRaw ? parseInt(qtyRaw, 10) : undefined;

    if (!fullName || !company || !location || !message || !email || !phone || !quantity || unitPrice == null) {
      return json({ success: false, error: "Missing or invalid required fields" }, { status: 400 });
    }

    const discountPct    = getBulkDiscountForQty(quantity);
    const discountedUnit = unitPrice * (1 - discountPct / 100);
    const subtotalVal    = discountedUnit * quantity;
    const VAT_RATE       = 20;
    const taxAmt         = subtotalVal * (VAT_RATE / 100);
    const grandTotalVal  = subtotalVal + taxAmt;

    const quoteRecord = await prisma.quote.create({
      data: { fullName, company, location, message, quantity, email, phone, status: "pending" },
    });
    const quoteNumber = quoteRecord?.id ?? "N/A";

    const params = {
      name: fullName,
      date: new Date().toLocaleDateString("en-GB"),
      company,
      location,
      email,
      phone,
      message,
      preparedBy: "PromoForBusiness",
      productTitle,
      productImage,
      itemCode,
      unitPrice: fmt(unitPrice),
      discount: discountPct.toString(),
      discountedUnit: fmt(discountedUnit),
      quantity,
      serviceTotal: fmt(subtotalVal),
      subtotal: fmt(subtotalVal),
      tax: VAT_RATE.toString(),
      grandTotal: fmt(grandTotalVal),
      quoteNumber, 
    };

    // Customer email
    await sendBrevoTemplateMail({
      to: email,
      templateId: process.env.BREVO_TEMPLATE_ID,
      subject: "Know Your Quote",
      params,
    });

    // Admin email with correct quoteNumber
    await sendBrevoTemplateMail({
      to: "asim.h@ultratend.com",
      templateId: process.env.BREVO_TEMPLATE_ID,
      subject: `New Quote Received - Quotation #${quoteNumber}`,
      params,
    });

    return json({ success: true });
  } catch (error) {
    console.error("❌ Unexpected error submitting quote:", error);
    return json({ success: false, error: error.message || "Unknown error" }, { status: 500 });
  }
}
