import { json } from "@remix-run/node";
import { prisma } from "../db.server";

export async function action({ request }) {
  console.log("✅ Submit Quote API hit");

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

    // Basic validation
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

    // Save to DB using Prisma
    await prisma.quote.create({ data });

    console.log("✅ Quote saved to DB:", data);
    return json({ success: true });
  } catch (error) {
    console.error("❌ Error submitting quote:", error);
    return json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}


