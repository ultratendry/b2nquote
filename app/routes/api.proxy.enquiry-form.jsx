import { json } from "@remix-run/node";
import { sendBrevoTemplateMail } from "../utils/brevo";
import { prisma } from "../db.server";
import { getBulkDiscountForQty, safeParseNumber } from "../utils/pricing";

const gbp = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" });
const fmt = (n) => (n != null && Number.isFinite(n) ? gbp.format(n) : "");

export const action = async ({ request }) => {
    try {
        const form = await request.formData();

        const name = form.get("name")?.toString().trim();
        const email = form.get("email")?.toString().trim();
        const phone = form.get("phone")?.toString().trim();
        const location = form.get("location")?.toString().trim();
        const productTitle = form.get("product_title")?.toString().trim();
        const productImage = form.get("product_image")?.toString().trim();
        const itemCode = form.get("item_code")?.toString() || "";
        const unitPrice = safeParseNumber(form.get("unit_price")?.toString() ?? "");
        const qtyRaw = form.get("quantity")?.toString();
        const quantity = qtyRaw ? parseInt(qtyRaw, 10) : undefined;

        if (!name || !email || !phone || !location) {
            return json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        const enquiry = await prisma.enquiryRequest.create({
            data: {
                name,
                email,
                phone,
                location,
                productTitle,
                productImage,
                itemCode,
                unitPrice: fmt(unitPrice),
                quantity,
            },
        });

        const now = new Date();
        const quoteNumber = enquiry.id.toString().padStart(4, "0");

        const subject = `Enquiry Received - ${quoteNumber}`;
        const adminSubject = `New Enquiry Received - ${quoteNumber}`;

        await sendBrevoTemplateMail({
            to: email,
            templateId: 10,
            subject,
            params: {
                name,
                email,
                phone,
                location,
                productTitle,
                productImage,
                itemCode,
                unitPrice: fmt(unitPrice),
                quantity,
                date: now.toLocaleDateString("en-GB"),
            },
        });

        await sendBrevoTemplateMail({
            to: "ravindra.y@ultratend.com",
            templateId: 10,
            subject: adminSubject,
            params: {
                name,
                email,
                phone,
                location,
                productTitle,
                productImage,
                itemCode,
                unitPrice: fmt(unitPrice),
                quantity,
                date: now.toLocaleDateString("en-GB"),
            },
        });

        return json({ success: true });

    } catch (err) {
        console.error("❌ Enquiry error:", err);
        return json({ success: false, error: "Server error" }, { status: 500 });
    }
};

export default function () {
    return null;
};
