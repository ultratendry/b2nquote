import { json } from "@remix-run/node";
import { prisma } from "../db.server";
import { sendQuoteMail } from "../utils/mail";
import { quoteMailTemplate } from "../utils/mailTemplate";

export async function loader() {
  return json({ ok: true });
}

export async function action({ request }) {
  // console.log("✅ Submit Quote API hit");

  try {
    const formData = await request.formData();

    const data = {
      fullName: formData.get("full_name")?.toString() || "",
      company: formData.get("company")?.toString() || "",
      location: formData.get("location")?.toString() || "",
      message: formData.get("message")?.toString() || "",
      quantity: parseInt(formData.get("quantity")?.toString() || "0", 10),
      email: formData.get("email")?.toString() || "",
      phone: formData.get("phone")?.toString() || "",
      status: "pending",
    };

    // Validation
    if (
      !data.fullName ||
      !data.company ||
      !data.location ||
      !data.message ||
      !data.email ||
      !data.phone ||
      !data.quantity
    ) {
      return json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    try {
      // Save to DB
      await prisma.quote.create({ data });

      // console.log("✅ Quote saved to DB:", data);

      // Prepare template fields
      const items = `
        <li>${data.company}</li>
      `;
      // Format quoteDetails as table rows matching the image
      const quoteDetails = `
        <tr>
          <td>${data.company}</td>
          <td>${data.location}</td>
          <td class="num">${data.quantity}</td>
          <td class="num">${data.phone}</td>
          <td class="num">${data.message}</td>
        </tr>
      `;

      // You can set these to empty or calculated values
      const subtotal = "";
      const discount = "";
      const tax = "";
      const grandTotal = "";

      // Send mails
      await sendQuoteMail({
        to: data.email,
        subject: "Your Quote Submission",
        html: quoteMailTemplate({
          name: data.fullName,
          email: data.email,
          date: new Date().toLocaleDateString(),
          items,
          quoteDetails,
          subtotal,
          discount,
          tax,
          grandTotal,
          type: "customer"
        }),
      });

      await sendQuoteMail({
        to: "ravindra.y@ultratend.com",
        subject: "New Quote Submitted",
        html: quoteMailTemplate({
          name: data.fullName,
          email: data.email,
          date: new Date().toLocaleDateString(),
          items,
          quoteDetails,
          subtotal,
          discount,
          tax,
          grandTotal,
          type: "admin"
        }),
      });

      return json({ success: true });
    } catch (innerError) {
      console.error("❌ Error in DB or mail:", innerError);
      if (innerError.stack) console.error(innerError.stack);
      return json({ success: false, error: innerError.message || "Unknown error" }, { status: 500 });
    }
  } catch (error) {
    console.error("❌ Unexpected error submitting quote:", error);
    return json({ success: false, error: error.message || "Unknown error" }, { status: 500 });
  }
}
