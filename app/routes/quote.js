// app/routes/quote.js
import { json } from "@remix-run/node";
import { sendQuoteMail } from "../utils/mail";
import { quoteMailTemplate } from "../utils/mailTemplate";

export async function action({ request }) {
  const formData = await request.formData();
  const name = formData.get("name");
  const email = formData.get("email");
  const quantity = formData.get("quantity");
  const location = formData.get("location");
  const message = formData.get("details");
  const company = formData.get("company");
  const phone = formData.get("phone");

  // Format quote details for the email template
  const quoteDetails = `
    <table style="width:100%;border-collapse:collapse;">
      <tr>
        <td><strong>Company</strong></td>
        <td>${company}</td>
      </tr>
      <tr>
        <td><strong>Location</strong></td>
        <td>${location}</td>
      </tr>
      <tr>
        <td><strong>Quantity</strong></td>
        <td>${quantity}</td>
      </tr>
      <tr>
        <td><strong>Phone</strong></td>
        <td>${phone}</td>
      </tr>
      <tr>
        <td><strong>Message</strong></td>
        <td>${message}</td>
      </tr>
    </table>
  `;

  // console.log("✅ Attempting to send mail to:", email, "and admin");

  try {
    // Customer confirmation email
    const userHtml = quoteMailTemplate({ name, email, phone, quoteDetails, type: "customer" });
    const userMailInfo = await sendQuoteMail({
      to: email,
      subject: "Your Quote Has Been Submitted",
      html: userHtml,
    });
    // console.log("✅ User mail sent:", userMailInfo);

    // Admin notification email
    const adminHtml = quoteMailTemplate({ name, email, phone, quoteDetails, type: "admin" });
    const adminMailInfo = await sendQuoteMail({
      to: "ravindra.y@ultratend.com",
      subject: "New Quote Received",
      html: adminHtml,
    });
    // console.log("✅ Admin mail sent:", adminMailInfo);

    return json({ success: true });
  } catch (error) {
    console.error("❌ Mail sending error:", error);
    return json({ success: false, error: error.message }, { status: 500 });
  }
}

