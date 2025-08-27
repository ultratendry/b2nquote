// app/utils/mailTemplate.js

export function quoteMailTemplate({
  name = "Customer",
  email = "",
  phone = "",
  productName = "",
  date = "",
  items = "",
  quoteDetails = "",
  subtotal = "",
  discount = "",
  tax = "",
  grandTotal = "",
  advisor = "Mr. Asim",
  type = "customer"
}) {
  // Dynamic heading/message based on type
  const heading = type === "admin"
    ? `<h2 style="color:#ff6600;">New Quote Received</h2>`
    : `<h2 style="color:#ff6600;">Quote Submitted</h2>`;

  const message = type === "admin"
    ? `<p>Dear Mr. Asim,</p>
       <p>A new quote has been received. Please follow up with this client.</p>`
    : `<p>
          Greetings! Thank you for reaching out to us regarding your service inquiry. 
          We are pleased to provide you with the following quotation tailored to your needs. 
          Please feel free to reach out with any questions.
       </p>`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Quotation — PromoForBusiness</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    @page { size: A4; margin: 0; }
    html, body { height: 100%; }
    body {
      margin: 0;
      background: #dfe6ef;
      font-family: "Helvetica Neue", Arial, Inter, system-ui, sans-serif;
      color: #0f1115;
    }
    .sheet { width: 210mm; margin: 0 auto; background: #fff; overflow: hidden; }
    .space { height: 6mm; }
    .container { padding: 0 14mm; }
    // .brand { height: 22mm; background: linear-gradient(90deg, #0e1016 0%, #1f2430 70%, #283142 100%); color: #fff; display: flex; align-items: center; justify-content: space-between; padding: 0 14mm; }
    .brand .title { font-weight: 800; font-size: 5mm; letter-spacing: .2mm; margin: 0; }
    .brand .tag { margin: 1mm 0 0; color: #eaeef7; font-weight: 600; font-size: 3.2mm; }
    .brand .logo { border: 0.6mm dashed #ffbb94; color: #ffbb94; padding: 2mm 4mm; border-radius: 3mm; font-weight: 700; font-size: 3.2mm; }
    .greet { margin-top: 6mm; border: 0.3mm solid #e8ebf2; border-left: 1.2mm solid #ff6a00; border-radius: 2.5mm; padding: 4mm; font-size: 3.4mm; color: #2b2f39; }
    .greet p { margin: 0 0 2mm; }
    .greet .advisor { display: flex; justify-content: space-between; font-size: 3.2mm; color: #556070; }
    .card { border: 0.3mm solid #e8ebf2; border-radius: 2.5mm; padding: 5mm; }
    .section-title { margin: 0 0 4mm; font-size: 4.2mm; color: #0c4a6e; border-left: 1.2mm solid #ff6a00; padding-left: 3mm; font-weight: 800; }
    .meta { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4mm; }
    .meta .cell { border: 0.3mm solid #edf1f7; background: #f8fbff; border-radius: 2mm; padding: 3mm; }
    .meta .label { color: #6b7280; text-transform: uppercase; font-size: 2.8mm; }
    .meta .value { font-weight: 700; font-size: 3.4mm; margin-top: 0.8mm; }
    .list-head { font-size: 3.6mm; font-weight: 700; margin: 0 0 2mm; }
    .ul { margin: 0 0 4mm 5mm; font-size: 3.2mm; color: #404552; }
    .ul li { margin: 0.8mm 0; }
    .table-wrap { border: 0.3mm solid #e6eaf2; border-radius: 2mm; overflow: hidden; }
    table { width: 100%; border-collapse: collapse; font-size: 3.2mm; }
    thead th { background: #eef3fa; color: #2d3340; text-align: left; padding: 3mm; border-bottom: 0.3mm solid #e1e7f0; font-weight: 800; }
    tbody td { padding: 3mm; border-bottom: 0.3mm solid #eef2f7; }
    tbody tr:nth-child(odd) { background: #fbfdff; }
    .num { text-align: right; white-space: nowrap; }
    tfoot td { padding: 3mm; font-weight: 700; background: #f8fbff; }
    tfoot .label { text-align: right; color: #3a3f4a; border-top: 0.5mm solid #e6ebf3; }
    tfoot .value { text-align: right; border-top: 0.5mm solid #e6ebf3; }
    tfoot .grand td { background: #fff4ec; border-top: 0.5mm solid #ffd9c3; color: #131720; }
    .note { margin-top: 3mm; background: #f7f9fd; border: 0.3mm dashed #e2e8f0; border-radius: 2mm; padding: 3mm; color: #4b5563; font-size: 3.1mm; }
    .terms { display: grid; grid-template-columns: 1fr 1fr; gap: 4mm; }
    .term h4 { margin: 0 0 1.2mm; color: #0c4a6e; font-size: 3.6mm; }
    .term p { margin: 0; color: #475569; font-size: 3.1mm; }
    .footer { border-top: 0.3mm solid #e8ebf2; padding: 4mm 14mm; margin-top: 1.5rem; }
    .foot-grid { display: flex; justify-content: space-between; align-items: center; }
    .foot-left .name { font-weight: 800; color: #0c4a6e; font-size: 3.6mm; }
    .foot-left .tag { color: #ff8a3d; font-weight: 700; font-size: 3.1mm; }
    .foot-right { text-align: right; color: #4b5563; font-size: 3.1mm; }
  </style>
</head>
<body>
  <section class="sheet" style="width: 210mm; margin: 0 auto; background: #fff !important; overflow: hidden;">
    <!-- Brand Bar -->
    <div class="brand" style="height: 22mm; background: #0e1016 !important; color: #fff; display: flex; align-items: center; justify-content: space-between; padding: 0 14mm;">
      <div>
        <h1 class="title" style="color:green">PromoForBusiness.com</h1>
        <div class="tag" style="color:green">POWER YOUR BRAND. PROMOTE WITH PURPOSE</div>
      </div>
    </div>

    <div class="container">
      <!-- Greeting -->
      <div class="greet" style="margin-top:8mm">
        ${heading}
        ${message}
        ${
          type === "admin"
            ? `<div style="margin-top:12px;">
                 <strong>Client Name:</strong> ${name}<br>
                 <strong>Client Email:</strong> ${email}
               </div>`
            : `<div class="advisor">
                 <div>
                   <strong>${advisor}</strong><br>Product Advisor
                 </div>
                 <div>Contact: (44) 203807 9480 • hello@promoforbusiness.com</div>
               </div>`
        }
      </div>

      <div class="space"></div>

      <!-- Quote Evaluation -->
      <div class="card" style="border: 0.3mm solid #e8ebf2; border-radius: 2.5mm; padding: 5mm;">
        <div class="section-title">Quote Evaluation</div>
        <table style="width:100%;border-collapse:collapse;margin-bottom:8mm;">
          <tr>
            <td style="width:33%;padding:4mm;border-right:1px solid #e8ebf2;">
              <div class="label" style="color:#6b7280;text-transform:uppercase;font-size:2.8mm;">Prepared for</div>
              <div class="value" style="font-weight:700;font-size:3.4mm;">${name}</div>
            </td>
            <td style="width:33%;padding:4mm;border-right:1px solid #e8ebf2;">
              <div class="label" style="color:#6b7280;text-transform:uppercase;font-size:2.8mm;">Date</div>
              <div class="value" style="font-weight:700;font-size:3.4mm;">${date}</div>
            </td>
            <td style="width:33%;padding:4mm;">
              <div class="label" style="color:#6b7280;text-transform:uppercase;font-size:2.8mm;">Prepared by</div>
              <div class="value" style="font-weight:700;font-size:3.4mm;">${advisor}</div>
            </td>
          </tr>
        </table>
      </div>

      <div class="space"></div>

      <!-- Services + Table -->
      <div class="card">
        <div class="list-head">Quote Details</div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Company</th>
                <th>Location</th>
                <th class="num">Qty</th>
                <th class="num">Phone</th>
                <th class="num">Message</th>
              </tr>
            </thead>
            <tbody>
              ${quoteDetails}
            </tbody>
          </table>
        </div>
      </div>

      <div class="space"></div>

      <!-- Terms -->
      <div class="card">
        <div class="section-title" style="margin-bottom:3mm">Terms and Conditions</div>
        <div class="terms">
          <div class="term"><h4>1. Quotation</h4><p>Orders are accepted subject to adjustment for law, duties, or costs...</p></div>
          <div class="term"><h4>2. Price</h4><p>Prices may be subject to VAT and typically exclude setup, branding, shipping...</p></div>
          <div class="term"><h4>3. Terms of Payment</h4><p>Payment due within 30 days unless otherwise agreed...</p></div>
          <div class="term"><h4>4. Confidentiality</h4><p>All information in this quotation is confidential...</p></div>
          <div class="term"><h4>5. Governing Law</h4><p>This quotation observes relevant industry standards...</p></div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="foot-grid">
        <div class="foot-left">
          <div class="name">PromoForBusiness.com</div>
          <div class="tag">POWER YOUR BRAND. PROMOTE WITH PURPOSE</div>
        </div>
        <div class="foot-right">
          Mr. Asim • 71-75 Shelton Street, London, WC2H 9JQ, UK<br>
          (44) 20 3807 9480 • hello@promoforbusiness.com
        </div>
      </div>
    </div>
  </section>
</body>
</html>
  `;
}
