<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
    style="font-family: Arial, sans-serif; border-collapse: collapse; margin:0 auto; border:1px solid #ccc;">
    <!-- Title -->
    <tr>
        <th colspan="2" align="center" bgcolor="#0074A2"
            style="color:white;font-size:18px;font-family:Arial,sans-serif;font-weight:bold;text-align:center;background-color:#007CA3;margin:0;padding:10px 0;">QUOTE EVALUATION</th>
    </tr> <!-- Meta (2 columns) -->
    <tr>
        <td width="350" style="padding:10px; border-bottom:1px solid #eee;"><b>PREPARED FOR:</b> {{ params.name }}</td>
        <td width="350" style="padding:10px; border-bottom:1px solid #eee;"><b>DATE:</b> {{ params.date }}</td>
    </tr>
    <tr>
        <td width="350" style="padding:10px; border-bottom:1px solid #eee;"><b>COMPANY:</b> {{ params.company }}</td>
        <td width="350" style="padding:10px; border-bottom:1px solid #eee;"><b>EMAIL:</b> {{ params.email }}</td>
    </tr>
    <tr>
        <td width="350" style="padding:10px; border-bottom:1px solid #eee;"><b>PHONE NUMBER:</b> {{ params.phone }}</td>
        <td width="350" style="padding:10px; border-bottom:1px solid #eee;"><b>MESSAGE:</b> {{ params.message }}</td>
    </tr>
    <tr>
        <td width="350" style="padding:10px; border-bottom:1px solid #eee;"><b>PREPARED BY:</b> {{ params.preparedBy }}</td>
        <td width="350" style="padding:10px; border-bottom:1px solid #eee;"><b>LOCATION:</b> {{ params.location }}</td>
    </tr> <!-- Product -->
    <tr>
         <th style="color:white;text-align:left;background-color:#007CA3;padding:8px;border:1px solid #AAAAAA;" colspan="2">Services - ITEM ORDERED:</th>
    </tr>
    <tr>
        <td width="490" style="padding:10px;">{{ params.productTitle }}</td>
        <td width="210" align="center" style="padding:10px;"> <img src="{{ params.productImage }}" width="120"
                alt="Product" style="display:block; border:0; outline:none; text-decoration:none;"> </td>
    </tr> <!-- Nested grid for item + totals (4 columns everywhere) -->
    <tr>
        <td colspan="2" style="padding:0 10px 10px 10px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
                <!-- Header -->
                <tr>
                    <td bgcolor="#0074A2"
                        style="color:#ffffff; font-weight:bold; padding:8px; border:1px solid #AAAAAA;">ITEM CODE</td>
                    <td bgcolor="#0074A2"
                        style="color:#ffffff; font-weight:bold; padding:8px; border:1px solid #AAAAAA;">UNIT PRICE</td>
                    <td bgcolor="#0074A2"
                        style="color:#ffffff; font-weight:bold; padding:8px; border:1px solid #AAAAAA;">QUANTITY</td>
                    <td bgcolor="#0074A2"
                        style="color:#ffffff; font-weight:bold; padding:8px; border:1px solid #AAAAAA;">SERVICE TOTAL PRICE
                    </td>
                </tr> <!-- Item row -->
                <tr>
                    <td style="padding:8px; border:1px solid #AAAAAA;">{{ params.itemCode }}</td>
                    <td style="padding:8px; border:1px solid #AAAAAA;">{{ params.unitPrice }}</td>
                    <td style="padding:8px; border:1px solid #AAAAAA;">{{ params.quantity }}</td>
                    <td style="padding:8px; border:1px solid #AAAAAA;">{{ params.serviceTotal }}</td>
                </tr> <!-- Subtotal -->
                <tr>
                    <td style="padding:8px; border:1px solid #AAAAAA;" colspan="3" align="right"><b>SUBTOTAL</b></td>
                    <td style="padding:8px; border:1px solid #AAAAAA;">{{ params.subtotal }}</td>
                </tr> <!-- Discount -->
                <tr>
                    <td style="padding:8px; border:1px solid #AAAAAA;" colspan="3" align="right"><b>DISCOUNT</b></td>
                    <td style="padding:8px; border:1px solid #AAAAAA;">{{ params.discount }}%</td>
                </tr> <!-- Tax -->
                <tr>
                    <td style="padding:8px; border:1px solid #AAAAAA;" colspan="3" align="right"><b>TAX</b></td>
                    <td style="padding:8px; border:1px solid #AAAAAA;">{{ params.tax }}%</td>
                </tr> <!-- Grand total -->
                <tr>
                    <td style="padding:8px; border:1px solid #AAAAAA; color:#ffffff; font-weight:bold; background-color:#007CA3;"
                        colspan="3" align="right">GRAND TOTAL</td>
                    <td
                        style="padding:8px; border:1px solid #AAAAAA; color:#ffffff; font-weight:bold; background-color:#007CA3;">
                        {{ params.grandTotal }}</td>
                </tr>
            </table>
        </td>
    </tr> <!-- Note -->
    <tr>
        <td colspan="2" style="padding:15px; color:#666; font-size:12px;"> CALCULATION: UNIT PRICE × QUANTITY = SERVICE
            TOTAL PRICE<br> SUM OF ALL SERVICE PRICE − DISCOUNT + TAX = GRAND SERVICE TOTAL PRICE </td>
    </tr>
</table>