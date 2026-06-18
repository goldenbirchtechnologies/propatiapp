/**
 * Agreement HTML Templates
 * Templates for different types of rental agreements
 */

export interface StampDutyEndorsement {
  certificateNumber: string;
  amountPaid: number;
  paidAt: Date;
}

export interface AgreementTemplateData {
  agreementId: string;
  agreementDate: string;
  listingTitle: string;
  listingArea: string;
  listingState: string;
  listingAddress: string;
  landlordName: string;
  landlordEmail: string;
  landlordPhone: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  agentName: string;
  agentEmail: string;
  startDate: string;
  endDate: string;
  rentAmount: string;
  rentPeriod: string;
  cautionDeposit: string;
  serviceCharge: string;
  noticePeriodDays: number;
  specialClauses: string;
  stampDuty?: StampDutyEndorsement;
}

function renderStampDutyEndorsement(sd: StampDutyEndorsement): string {
  const formattedDate = sd.paidAt.toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const formattedAmount = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(sd.amountPaid);

  return `
  <div style="margin-top:60px;padding:24px;border:2px solid #1a5276;border-radius:8px;background:#eaf4fb;">
    <h2 style="text-align:center;color:#1a5276;letter-spacing:2px;margin-bottom:16px;">ELECTRONIC STAMP DUTY CERTIFICATE</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr>
        <td style="padding:8px;font-weight:bold;color:#555;width:40%;">Certificate Number:</td>
        <td style="padding:8px;font-family:monospace;color:#1a5276;font-weight:bold;">${sd.certificateNumber}</td>
      </tr>
      <tr style="background:#d6eaf8;">
        <td style="padding:8px;font-weight:bold;color:#555;">Amount Paid:</td>
        <td style="padding:8px;">${formattedAmount}</td>
      </tr>
      <tr>
        <td style="padding:8px;font-weight:bold;color:#555;">Date of Payment:</td>
        <td style="padding:8px;">${formattedDate}</td>
      </tr>
    </table>
    <p style="margin-top:16px;font-size:12px;color:#555;text-align:center;font-style:italic;">
      This agreement has been duly stamped in accordance with the Stamp Duties Act, CAP S8, LFN 2004
    </p>
  </div>`;
}

export const residentialRentTemplate = (data: AgreementTemplateData) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; }
    h1 { text-align: center; color: #333; border-bottom: 3px solid #0066cc; padding-bottom: 10px; }
    h2 { color: #0066cc; margin-top: 30px; }
    .section { margin: 20px 0; }
    .party { background: #f5f5f5; padding: 15px; margin: 10px 0; border-left: 4px solid #0066cc; }
    .terms { margin: 20px 0; }
    .term-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
    .term-label { font-weight: bold; color: #555; }
    .term-value { color: #333; }
    .clauses { background: #fff9e6; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .footer { margin-top: 40px; text-align: center; color: #777; font-size: 14px; }
    .agreement-id { text-align: center; color: #999; font-size: 12px; margin-top: 10px; }
  </style>
</head>
<body>
  <h1>RESIDENTIAL RENTAL AGREEMENT</h1>
  <div class="agreement-id">Agreement ID: ${data.agreementId}</div>
  <p style="text-align: center; color: #777;">Date: ${data.agreementDate}</p>

  <div class="section">
    <h2>PARTIES TO THIS AGREEMENT</h2>
    <div class="party">
      <strong>LANDLORD (Property Owner)</strong><br/>
      Name: ${data.landlordName}<br/>
      Email: ${data.landlordEmail}<br/>
      Phone: ${data.landlordPhone}
    </div>
    <div class="party">
      <strong>TENANT</strong><br/>
      Name: ${data.tenantName}<br/>
      Email: ${data.tenantEmail}<br/>
      Phone: ${data.tenantPhone}
    </div>
    ${data.agentName !== 'N/A' ? `
    <div class="party">
      <strong>AGENT</strong><br/>
      Name: ${data.agentName}<br/>
      Email: ${data.agentEmail}
    </div>
    ` : ''}
  </div>

  <div class="section">
    <h2>PROPERTY DETAILS</h2>
    <div class="terms">
      <div class="term-row">
        <span class="term-label">Property:</span>
        <span class="term-value">${data.listingTitle}</span>
      </div>
      <div class="term-row">
        <span class="term-label">Address:</span>
        <span class="term-value">${data.listingAddress}</span>
      </div>
      <div class="term-row">
        <span class="term-label">Area:</span>
        <span class="term-value">${data.listingArea}, ${data.listingState}</span>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>RENTAL TERMS</h2>
    <div class="terms">
      <div class="term-row">
        <span class="term-label">Lease Start Date:</span>
        <span class="term-value">${data.startDate}</span>
      </div>
      <div class="term-row">
        <span class="term-label">Lease End Date:</span>
        <span class="term-value">${data.endDate}</span>
      </div>
      <div class="term-row">
        <span class="term-label">Rent Amount:</span>
        <span class="term-value">₦${data.rentAmount} per ${data.rentPeriod}</span>
      </div>
      <div class="term-row">
        <span class="term-label">Caution Deposit:</span>
        <span class="term-value">₦${data.cautionDeposit}</span>
      </div>
      <div class="term-row">
        <span class="term-label">Service Charge:</span>
        <span class="term-value">₦${data.serviceCharge}</span>
      </div>
      <div class="term-row">
        <span class="term-label">Notice Period:</span>
        <span class="term-value">${data.noticePeriodDays} days</span>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>TERMS AND CONDITIONS</h2>
    <ol style="padding-left: 20px;">
      <li>The Tenant agrees to pay rent on or before the due date each ${data.rentPeriod}.</li>
      <li>The Tenant shall use the property solely for residential purposes.</li>
      <li>The Tenant is responsible for minor repairs and maintenance of the property.</li>
      <li>The Landlord is responsible for major structural repairs.</li>
      <li>The Tenant shall not sublet the property without written consent from the Landlord.</li>
      <li>Either party may terminate this agreement by giving ${data.noticePeriodDays} days written notice.</li>
      <li>The caution deposit shall be refunded within 30 days after the tenant vacates, subject to deductions for damages.</li>
      <li>All disputes shall be resolved through mediation or in accordance with Nigerian law.</li>
    </ol>
  </div>

  ${data.specialClauses ? `
  <div class="section">
    <h2>SPECIAL CLAUSES</h2>
    <div class="clauses">
      ${data.specialClauses.split('\n').map(clause => `<p>${clause}</p>`).join('')}
    </div>
  </div>
  ` : ''}

  <div class="section" style="margin-top: 60px;">
    <h2>SIGNATURES</h2>
    <p>By signing this agreement, all parties confirm that they have read, understood, and agree to be bound by the terms and conditions outlined above.</p>
    <div style="margin-top: 40px; display: flex; justify-content: space-between;">
      <div style="width: 45%;">
        <div style="border-top: 2px solid #333; padding-top: 10px;">
          <strong>Landlord Signature</strong><br/>
          ${data.landlordName}<br/>
          Date: _________________
        </div>
      </div>
      <div style="width: 45%;">
        <div style="border-top: 2px solid #333; padding-top: 10px;">
          <strong>Tenant Signature</strong><br/>
          ${data.tenantName}<br/>
          Date: _________________
        </div>
      </div>
    </div>
  </div>

  <div class="footer">
    <p>This agreement is facilitated by PROPATI - Nigeria's Verified Property Marketplace</p>
    <p>www.propati.ng</p>
  </div>

  ${data.stampDuty ? renderStampDutyEndorsement(data.stampDuty) : ''}
</body>
</html>
`;

export const commercialRentTemplate = (data: AgreementTemplateData) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; }
    h1 { text-align: center; color: #333; border-bottom: 3px solid #0066cc; padding-bottom: 10px; }
    h2 { color: #0066cc; margin-top: 30px; }
    .section { margin: 20px 0; }
    .party { background: #f5f5f5; padding: 15px; margin: 10px 0; border-left: 4px solid #0066cc; }
    .terms { margin: 20px 0; }
    .term-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
    .term-label { font-weight: bold; color: #555; }
    .term-value { color: #333; }
  </style>
</head>
<body>
  <h1>COMMERCIAL LEASE AGREEMENT</h1>
  <div style="text-align: center; color: #999; font-size: 12px; margin-top: 10px;">Agreement ID: ${data.agreementId}</div>
  <p style="text-align: center; color: #777;">Date: ${data.agreementDate}</p>

  <div class="section">
    <h2>PARTIES</h2>
    <div class="party">
      <strong>LANDLORD</strong><br/>
      ${data.landlordName} (${data.landlordEmail})
    </div>
    <div class="party">
      <strong>TENANT</strong><br/>
      ${data.tenantName} (${data.tenantEmail})
    </div>
  </div>

  <div class="section">
    <h2>COMMERCIAL PROPERTY</h2>
    <p><strong>Property:</strong> ${data.listingTitle}</p>
    <p><strong>Location:</strong> ${data.listingAddress}, ${data.listingArea}, ${data.listingState}</p>
  </div>

  <div class="section">
    <h2>LEASE TERMS</h2>
    <div class="terms">
      <div class="term-row">
        <span class="term-label">Lease Period:</span>
        <span class="term-value">${data.startDate} to ${data.endDate}</span>
      </div>
      <div class="term-row">
        <span class="term-label">Rent:</span>
        <span class="term-value">₦${data.rentAmount} per ${data.rentPeriod}</span>
      </div>
      <div class="term-row">
        <span class="term-label">Security Deposit:</span>
        <span class="term-value">₦${data.cautionDeposit}</span>
      </div>
      <div class="term-row">
        <span class="term-label">Service Charge:</span>
        <span class="term-value">₦${data.serviceCharge}</span>
      </div>
    </div>
  </div>

  ${data.specialClauses ? `
  <div class="section">
    <h2>SPECIAL CONDITIONS</h2>
    <div style="background: #fff9e6; padding: 15px; border-radius: 5px;">
      ${data.specialClauses.split('\n').map(clause => `<p>${clause}</p>`).join('')}
    </div>
  </div>
  ` : ''}

  <div class="section" style="margin-top: 60px;">
    <p>IN WITNESS WHEREOF, the parties have executed this Commercial Lease Agreement.</p>
  </div>

  ${data.stampDuty ? renderStampDutyEndorsement(data.stampDuty) : ''}
</body>
</html>
`;

export const shortLetTemplate = (data: AgreementTemplateData) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; }
    h1 { text-align: center; color: #333; border-bottom: 3px solid #ff6b6b; padding-bottom: 10px; }
    h2 { color: #ff6b6b; margin-top: 30px; }
    .section { margin: 20px 0; }
    .party { background: #f5f5f5; padding: 15px; margin: 10px 0; border-left: 4px solid #ff6b6b; }
    .terms { margin: 20px 0; }
    .term-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
  </style>
</head>
<body>
  <h1>SHORT-LET AGREEMENT</h1>
  <div style="text-align: center; color: #999; font-size: 12px;">Agreement ID: ${data.agreementId}</div>
  <p style="text-align: center; color: #777;">Date: ${data.agreementDate}</p>

  <div class="section">
    <h2>BOOKING DETAILS</h2>
    <div class="party">
      <strong>HOST:</strong> ${data.landlordName} (${data.landlordEmail})
    </div>
    <div class="party">
      <strong>GUEST:</strong> ${data.tenantName} (${data.tenantEmail})
    </div>
  </div>

  <div class="section">
    <h2>PROPERTY</h2>
    <p><strong>${data.listingTitle}</strong></p>
    <p>${data.listingArea}, ${data.listingState}</p>
  </div>

  <div class="section">
    <h2>STAY DETAILS</h2>
    <div class="terms">
      <div class="term-row">
        <span style="font-weight: bold;">Check-in:</span>
        <span>${data.startDate}</span>
      </div>
      <div class="term-row">
        <span style="font-weight: bold;">Check-out:</span>
        <span>${data.endDate}</span>
      </div>
      <div class="term-row">
        <span style="font-weight: bold;">Rate:</span>
        <span>₦${data.rentAmount} per night</span>
      </div>
      <div class="term-row">
        <span style="font-weight: bold;">Security Deposit:</span>
        <span>₦${data.cautionDeposit}</span>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>HOUSE RULES</h2>
    <ul>
      <li>No smoking inside the property</li>
      <li>No loud noise after 10 PM</li>
      <li>Guest is liable for any damages to the property</li>
      <li>Check-out must be completed by 12 PM on the final day</li>
    </ul>
  </div>

  ${data.specialClauses ? `
  <div class="section">
    <h2>ADDITIONAL TERMS</h2>
    <div style="background: #fff9e6; padding: 15px; border-radius: 5px;">
      ${data.specialClauses.split('\n').map(clause => `<p>${clause}</p>`).join('')}
    </div>
  </div>
  ` : ''}
</body>
</html>
`;

export const saleAgreementTemplate = (data: AgreementTemplateData) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; }
    h1 { text-align: center; color: #333; border-bottom: 3px solid #28a745; padding-bottom: 10px; }
    h2 { color: #28a745; margin-top: 30px; }
    .section { margin: 20px 0; }
    .party { background: #f5f5f5; padding: 15px; margin: 10px 0; border-left: 4px solid #28a745; }
    .terms { margin: 20px 0; }
    .term-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
  </style>
</head>
<body>
  <h1>PROPERTY SALE AGREEMENT</h1>
  <div style="text-align: center; color: #999; font-size: 12px;">Agreement ID: ${data.agreementId}</div>
  <p style="text-align: center; color: #777;">Date: ${data.agreementDate}</p>

  <div class="section">
    <h2>PARTIES</h2>
    <div class="party">
      <strong>SELLER:</strong> ${data.landlordName} (${data.landlordEmail})
    </div>
    <div class="party">
      <strong>BUYER:</strong> ${data.tenantName} (${data.tenantEmail})
    </div>
  </div>

  <div class="section">
    <h2>PROPERTY BEING SOLD</h2>
    <p><strong>Property:</strong> ${data.listingTitle}</p>
    <p><strong>Address:</strong> ${data.listingAddress}, ${data.listingArea}, ${data.listingState}</p>
  </div>

  <div class="section">
    <h2>SALE TERMS</h2>
    <div class="terms">
      <div class="term-row">
        <span style="font-weight: bold;">Sale Price:</span>
        <span>₦${data.rentAmount}</span>
      </div>
      <div class="term-row">
        <span style="font-weight: bold;">Deposit Paid:</span>
        <span>₦${data.cautionDeposit}</span>
      </div>
      <div class="term-row">
        <span style="font-weight: bold;">Completion Date:</span>
        <span>${data.endDate}</span>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>TERMS & CONDITIONS</h2>
    <ol>
      <li>The Seller warrants that they have good title to the property and the right to sell it.</li>
      <li>The Buyer agrees to pay the full purchase price on or before the completion date.</li>
      <li>All necessary documentation will be prepared and executed upon completion.</li>
      <li>The Seller will deliver vacant possession on the completion date.</li>
      <li>This agreement is governed by the laws of the Federal Republic of Nigeria.</li>
    </ol>
  </div>

  ${data.specialClauses ? `
  <div class="section">
    <h2>SPECIAL CONDITIONS</h2>
    <div style="background: #e8f5e9; padding: 15px; border-radius: 5px;">
      ${data.specialClauses.split('\n').map(clause => `<p>${clause}</p>`).join('')}
    </div>
  </div>
  ` : ''}

  ${data.stampDuty ? renderStampDutyEndorsement(data.stampDuty) : ''}
</body>
</html>
`;

export function renderAgreementTemplate(
  type: string,
  data: AgreementTemplateData
): string {
  switch (type) {
    case 'rental':
      return residentialRentTemplate(data);
    case 'sale':
      return saleAgreementTemplate(data);
    case 'short_let':
      return shortLetTemplate(data);
    case 'share':
      return residentialRentTemplate(data); // Use same template for shared accommodation
    default:
      return residentialRentTemplate(data);
  }
}
