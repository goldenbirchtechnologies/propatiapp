/**
 * Agreement HTML Templates
 * Nigerian statutory-compliant templates for rental, sale, short-let and share agreements.
 */

export interface StampDutyEndorsement {
  certificateNumber: string;
  amountPaid: number;
  paidAt: Date;
}

export interface AgreementTemplateData {
  agreementId: string;
  agreementType: 'rental' | 'sale' | 'short_let' | 'share';
  riskTier: 'self_serve' | 'review_required';
  jurisdictionState?: string | null;
  governingStatute?: string | null;
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
  noticePeriodText?: string;
  specialClauses: string;
  headTenantVerified?: boolean;
  stampDuty?: StampDutyEndorsement;
}

function meta(): string {
  return `
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  * { box-sizing: border-box; }
  body { font-family: "Segoe UI", Arial, sans-serif; max-width: 860px; margin: 40px auto; padding: 24px; line-height: 1.6; color: #1f2937; }
  h1 { text-align: center; color: #0f172a; border-bottom: 3px solid #0f172a; padding-bottom: 10px; margin-top: 0; }
  h2 { color: #0f172a; margin-top: 28px; font-size: 16px; text-transform: uppercase; letter-spacing: 0.05em; }
  .section { margin: 20px 0; }
  .party { background: #f8fafc; padding: 16px; margin: 10px 0; border-left: 4px solid #0f172a; }
  .term-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
  .term-label { font-weight: 600; color: #374151; }
  .term-value { color: #1f2937; }
  .clauses { background: #fffbeb; padding: 16px; border-radius: 8px; margin: 20px 0; border: 1px solid #fcd34d; }
  .footer { margin-top: 40px; text-align: center; color: #6b7280; font-size: 13px; }
  .agreement-id { text-align: center; color: #9ca3af; font-size: 12px; margin-top: 10px; }
  .notice-box { background: #eff6ff; border: 1px solid #bfdbfe; border-left: 4px solid #2563eb; padding: 12px 16px; border-radius: 6px; margin: 16px 0; font-size: 14px; color: #1e3a8a; }
  .statute-note { font-size: 12px; color: #6b7280; font-style: italic; margin-top: 4px; }
  .banner { padding: 10px 14px; border-radius: 6px; font-weight: 600; margin: 16px 0; font-size: 13px; }
  .banner.self-serve { background: #f0fdf4; color: #14532d; border: 1px solid #bbf7d0; }
  .banner.review-required { background: #fef2f2; color: #7f1d1d; border: 1px solid #fecaca; }
  .signature-block { margin-top: 48px; }
  .signature-row { display: flex; justify-content: space-between; gap: 24px; }
  .signature-box { width: 45%; }
  .signature-line { border-top: 2px solid #0f172a; padding-top: 10px; }
  .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
  .badge-rental { background: #dbeafe; color: #1e40af; }
  .badge-sale { background: #dcfce7; color: #14532d; }
  .badge-short-let { background: #fef3c7; color: #92400e; }
  .badge-share { background: #f3e8ff; color: #4c1d95; }
</style>
</head>
<body>`;
}

function header(data: AgreementTemplateData, title: string, badgeClass: string, badgeLabel: string): string {
  return `
<h1>${title}</h1>
<div class="agreement-id">Agreement ID: ${data.agreementId} · Type: <span class="badge ${badgeClass}">${badgeLabel}</span></div>
<p style="text-align:center;color:#6b7280;">Date: ${data.agreementDate}</p>
<div class="banner ${data.riskTier === 'self_serve' ? 'self-serve' : 'review-required'}">
  Tier: ${data.riskTier === 'self_serve' ? 'Self-Serve' : 'Lawyer Review Required'}${data.governingStatute ? ` · Governed by: ${data.governingStatute}` : ''}
</div>`;
}

function partiesBlock(data: AgreementTemplateData): string {
  return `
<div class="section">
  <h2>PARTIES TO THIS AGREEMENT</h2>
  <div class="party">
    <strong>LANDLORD</strong><br/>
    Name: ${data.landlordName}<br/>
    Email: ${data.landlordEmail}<br/>
    Phone: ${data.landlordPhone}
  </div>
  <div class="party">
    <strong>TENANT / FIRST PARTY</strong><br/>
    Name: ${data.tenantName}<br/>
    Email: ${data.tenantEmail}<br/>
    Phone: ${data.tenantPhone}
  </div>
  ${data.agentName !== 'N/A' && data.agentName ? `
  <div class="party">
    <strong>AGENT (WHERE APPLICABLE)</strong><br/>
    Name: ${data.agentName}<br/>
    Email: ${data.agentEmail}
  </div>` : ''}
</div>`;
}

function propertyBlock(data: AgreementTemplateData): string {
  return `
<div class="section">
  <h2>PROPERTY DETAILS</h2>
  <div class="term-row">
    <span class="term-label">Property:</span>
    <span class="term-value">${data.listingTitle}</span>
  </div>
  <div class="term-row">
    <span class="term-label">Address:</span>
    <span class="term-value">${data.listingAddress}</span>
  </div>
  <div class="term-row">
    <span class="term-label">Area / State:</span>
    <span class="term-value">${data.listingArea}, ${data.listingState}</span>
  </div>
</div>`;
}

function termsBlock(data: AgreementTemplateData): string {
  return `
<div class="section">
  <h2>AGREEMENT TERMS</h2>
  <div class="term-row">
    <span class="term-label">Start Date:</span>
    <span class="term-value">${data.startDate}</span>
  </div>
  <div class="term-row">
    <span class="term-label">End Date:</span>
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
</div>`;
}

function statutoryRentalClauses(noticePeriodDays: number): string {
  return `
<div class="section">
  <h2>STATUTORY TERMS & CONDITIONS</h2>
  <ol style="padding-left:20px;">
    <li>The Tenant is entitled to <strong>quiet enjoyment</strong> of the premises during the tenancy.</li>
    <li>Rent increases shall require at least ${noticePeriodDays} days written notice and shall comply with the Tenancy Law of the applicable state.</li>
    <li>The Landlord shall not disturb the Tenant’s peaceful possession; illegal eviction and self-help remedies are prohibited.</li>
    <li>Distress (seizure) of Tenant property for rent arrears must follow applicable Nigerian court process.</li>
    <li>Habitability standards: the Landlord shall maintain the premises in a fit and proper state for habitation.</li>
    <li>The Tenant shall use the property for lawful residential purposes only.</li>
    <li>Minor repairs shall be borne by the Tenant; major structural repairs by the Landlord.</li>
    <li>The Tenant may not sublet or assign without the Landlord’s prior written consent.</li>
    <li>The caution deposit shall be refundable within 30 days of vacation, subject to fair wear and tear.</li>
    <li>Any dispute shall be resolved in good faith and, where unresolved, may be referred to the appropriate Nigerian court or landlord-tenant tribunal.</li>
    <li><em>Disclaimer:</em> This agreement does not override the provisions of any applicable Rent Control or Tenancy Law.</li>
  </ol>
  <p class="statute-note">Tenancy Law ${noticePeriodDays} days · Stamp Duties Act CAP S8 LFN 2004 · Common law covenants apply where not inconsistent.</p>
</div>`;
}

function signatureBlock(landlordName: string, tenantName: string): string {
  return `
<div class="signature-block">
  <h2>SIGNATURES</h2>
  <p style="font-size:13px;color:#4b5563;">By signing below, the parties confirm they have read, understood, and agree to be bound by the terms of this agreement.</p>
  <div class="signature-row">
    <div class="signature-box">
      <div class="signature-line">
        <strong>${landlordName}</strong><br/>
        Landlord
      </div>
    </div>
    <div class="signature-box">
      <div class="signature-line">
        <strong>${tenantName}</strong><br/>
        Tenant
      </div>
    </div>
  </div>
</div>`;
}

export const residentialRentTemplate = (data: AgreementTemplateData) => `<!DOCTYPE html>
<html>
<head>
${meta()}
</head>
<body>
${header(data, 'RESIDENTIAL TENANCY AGREEMENT', 'badge-rental', 'RENTAL')}
${partiesBlock(data)}
${propertyBlock(data)}
${termsBlock(data)}
${statutoryRentalClauses(data.noticePeriodDays)}
${data.specialClauses ? `
<div class="section">
  <h2>SPECIAL CLAUSES</h2>
  <div class="clauses">
    ${data.specialClauses.split('\n').map((clause) => `<p>${clause}</p>`).join('')}
  </div>
</div>` : ''}
${signatureBlock(data.landlordName, data.tenantName)}
<div class="footer">
  <p>This agreement is facilitated by PROPATI – Nigeria's Verified Property Marketplace</p>
  <p>www.propati.ng</p>
</div>
${data.stampDuty ? renderStampDutyEndorsement(data.stampDuty) : ''}
</body>
</html>`;

export const commercialRentTemplate = (data: AgreementTemplateData) => `<!DOCTYPE html>
<html>
<head>
${meta()}
</head>
<body>
${header(data, 'COMMERCIAL LEASE AGREEMENT', 'badge-rental', 'RENTAL')}
${partiesBlock(data)}
${propertyBlock(data)}
${termsBlock(data)}
<div class="section">
  <h2>COMMERCIAL TENANCY TERMS</h2>
  <ol style="padding-left:20px;">
    <li>The Tenant shall use the premises solely for commercial activities as agreed.</li>
    <li>The Tenant shall comply with all zoning, environment, and fire-safety regulations of the relevant state.</li>
    <li>Assignment and subletting of the lease require the Landlord’s prior written consent.</li>
    <li>The Tenant is responsible for insurance of business equipment and contents.</li>
    <li>Arrears of rent to a 30-day period entitles the Landlord to terminate per Lagos State Tenancy Law or applicable statute.</li>
  </ol>
  <div class="notice-box">
    <strong>Jurisdiction:</strong> ${data.jurisdictionState || 'Applicable state tenancy/county law'}.
    ${data.governingStatute ? ` ${data.governingStatute} governs interpretation.` : ''}
  </div>
</div>
${data.specialClauses ? `
<div class="section">
  <h2>SPECIAL CONDITIONS</h2>
  <div class="clauses">
    ${data.specialClauses.split('\n').map((clause) => `<p>${clause}</p>`).join('')}
  </div>
</div>` : ''}
${signatureBlock(data.landlordName, data.tenantName)}
<div class="footer">
  <p>www.propati.ng</p>
</div>
${data.stampDuty ? renderStampDutyEndorsement(data.stampDuty) : ''}
</body>
</html>`;

export const shortLetTemplate = (data: AgreementTemplateData) => `<!DOCTYPE html>
<html>
<head>
${meta()}
</head>
<body>
${header(data, 'SHORT-LET / HOLIDAY LET AGREEMENT', 'badge-short-let', 'SHORT-LET')}
${partiesBlock(data)}
${propertyBlock(data)}
<div class="section">
  <h2>BOOKING & PAYMENT TERMS</h2>
  <div class="term-row">
    <span class="term-label">Check-in:</span>
    <span class="term-value">${data.startDate}</span>
  </div>
  <div class="term-row">
    <span class="term-label">Check-out:</span>
    <span class="term-value">${data.endDate}</span>
  </div>
  <div class="term-row">
    <span class="term-label">Booking Rate:</span>
    <span class="term-value">₦${data.rentAmount} per ${data.rentPeriod}</span>
  </div>
  <div class="term-row">
    <span class="term-label">Security Deposit:</span>
    <span class="term-value">₦${data.cautionDeposit}</span>
  </div>
</div>
<div class="section">
  <h2>HOUSE RULES & GUEST RESPONSIBILITIES</h2>
  <ol style="padding-left:20px;">
    <li>No smoking inside the property.</li>
    <li>No loud noise after 10 PM.</li>
    <li>Guest is liable for any damages or shortages.</li>
    <li>Check-out must be completed by 12 PM on the final day unless otherwise agreed.</li>
    <li>This agreement is jurisdiction-specific: ${data.jurisdictionState || 'N/A'}.</li>
  </ol>
  <p class="statute-note">Stamp Duties Act CAP S8 LFN 2004 applies to consideration where payable.</p>
</div>
${data.specialClauses ? `
<div class="section">
  <h2>ADDITIONAL TERMS</h2>
  <div class="clauses">
    ${data.specialClauses.split('\n').map((clause) => `<p>${clause}</p>`).join('')}
  </div>
</div>` : ''}
<div class="signature-block">
  <h2>ACKNOWLEDGEMENT</h2>
  <div class="signature-row">
    <div class="signature-box">
      <div class="signature-line">
        <strong>${data.landlordName}</strong><br/>
        Host / Landlord
      </div>
    </div>
    <div class="signature-box">
      <div class="signature-line">
        <strong>${data.tenantName}</strong><br/>
        Guest / Tenant
      </div>
    </div>
  </div>
</div>
<div class="footer">
  <p>www.propati.ng</p>
</div>
${data.stampDuty ? renderStampDutyEndorsement(data.stampDuty) : ''}
</body>
</html>`;

export const shareAgreementTemplate = (data: AgreementTemplateData) => `<!DOCTYPE html>
<html>
<head>
${meta()}
</head>
<body>
${header(data, 'SHARED ACCOMMODATION AGREEMENT', 'badge-share', 'SHARE')}
${partiesBlock(data)}
${propertyBlock(data)}
${termsBlock(data)}
<div class="section">
  <h2>SHARED OCCUPANCY TERMS</h2>
  <ol style="padding-left:20px;">
    <li>All parties share common areas equally unless otherwise stated in special clauses.</li>
    <li>Utilities shall be allocated as per the schedule in special clauses or equally where not specified.</li>
    <li>No party may assign or sublet their share without unanimous written consent of the others.</li>
    <li>Either party may seek inclusion of a replacement tenant agreeable to all parties.</li>
    <li>Landlord obligations of quiet enjoyment and habitability apply equally to each occupant.</li>
  </ol>
</div>
<div class="notice-box">
  <strong>Sharing Risk Notice:</strong> Shared occupancy carries additional operational risks compared to single-occupancy tenancies. Ensure you have read the ${data.jurisdictionState || 'state'} shared-occupancy guidance before signing.
  ${data.headTenantVerified ? ' All signatories have been verified as authorised occupants.' : ''}
</div>
${data.specialClauses ? `
<div class="section">
  <h2>SPECIAL CLAUSES</h2>
  <div class="clauses">
    ${data.specialClauses.split('\n').map((clause) => `<p>${clause}</p>`).join('')}
  </div>
</div>` : ''}
<div class="section">
  <h2>ALL PARTIES</h2>
  <div class="signature-row">
    <div class="signature-box">
      <div class="signature-line">
        <strong>${data.landlordName}</strong><br/>
        Landlord
      </div>
    </div>
    <div class="signature-box">
      <div class="signature-line">
        <strong>${data.tenantName}</strong><br/>
        Occupant 1
      </div>
    </div>
  </div>
</div>
<div class="footer">
  <p>www.propati.ng</p>
</div>
${data.stampDuty ? renderStampDutyEndorsement(data.stampDuty) : ''}
</body>
</html>`;

export function renderAgreementTemplate(type: string, data: AgreementTemplateData): string {
  switch (type) {
    case 'rental':
      return residentialRentTemplate(data);
    case 'sale':
      return saleAgreementTemplate(data);
    case 'short_let':
      return shortLetTemplate(data);
    case 'share':
      return shareAgreementTemplate(data);
    default:
      return residentialRentTemplate(data);
  }
}

export const saleAgreementTemplate = (data: AgreementTemplateData) => `<!DOCTYPE html>
<html>
<head>
${meta()}
</head>
<body>
${header(data, 'PROPERTY SALE AGREEMENT', 'badge-sale', 'SALE')}
${partiesBlock(data)}
${propertyBlock(data)}
${termsBlock(data)}
<div class="section">
  <h2>STATUTORY SALE TERMS</h2>
  <ol style="padding-left:20px;">
    <li>The Seller warrants they have good title to the property and the right to sell it.</li>
    <li>The Buyer agrees to pay the purchase price on or before the completion date stated above.</li>
    <li>All necessary documentation (including consent, title documents and transfer instruments) shall be prepared and executed on completion.</li>
    <li>The Seller shall deliver vacant possession on the completion date.</li>
    <li>Risk passes to the Buyer on completion; title remains with the Seller until executed where legally required.</li>
    <li>Stamp duty and registration costs shall be borne in accordance with applicable Nigerian law or as otherwise agreed.</li>
    <li>This agreement is governed by the laws of the Federal Republic of Nigeria ${data.governingStatute ? `with specific reference to ${data.governingStatute}` : ''} and the parties submit to the jurisdiction of the ${data.jurisdictionState || 'Federal High Court (Property Division)'}.</li>
  </ol>
</div>
${data.specialClauses ? `
<div class="section">
  <h2>SPECIAL CONDITIONS</h2>
  <div class="clauses">
    ${data.specialClauses.split('\n').map((clause) => `<p>${clause}</p>`).join('')}
  </div>
</div>` : ''}
${signatureBlock(data.landlordName, data.tenantName)}
<div class="footer">
  <p>www.propati.ng</p>
</div>
${data.stampDuty ? renderStampDutyEndorsement(data.stampDuty) : ''}
</body>
</html>`;
