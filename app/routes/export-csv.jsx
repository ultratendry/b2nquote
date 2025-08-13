// app/routes/export-csv.jsx
import { prisma } from "../db.server";
export async function loader({ request }) {
  const quotes = await prisma.quote.findMany();

  const headers = [
    "ID",
    "Full Name",
    "Company",
    "Location",
    "Message",
    "Email",
    "Phone",
    "Quantity",
    "Status",
    "Created At",
    "Updated At",
  ];

  const rows = quotes.map((q) => [
    q.id,
    q.fullName,
    q.company || "",
    q.location || "",
    q.message || "",
    q.email,
    q.phone,
    q.quantity,
    q.status,
    q.createdAt.toISOString(),
    q.updatedAt?.toISOString() || "",
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((val) => `"${val}"`).join(","))
    .join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="quotes.csv"',
    },
  });
}
