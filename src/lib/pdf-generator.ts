import { v2 as cloudinary } from 'cloudinary';
import PDFDocument from 'pdfkit';
import { prisma } from './prisma';
import { renderAgreementTemplate } from './agreement-templates';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Build a real PDF buffer from agreement HTML-like data using pdfkit
 */
function buildAgreementPDFBuffer(
  templateData: Record<string, unknown>,
  agreement: {
    signatures: {
      role: string;
      signedAt: Date;
      signer: { fullName: string };
      id: string;
    }[];
    id: string;
  }
): Promise<Buffer> {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const chunks: Buffer[] = [];

  doc.on('data', (chunk: Buffer) => chunks.push(chunk));

  const data = templateData as {
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
    stampDuty?: { certificateNumber: string; amountPaid: number; paidAt: Date } | undefined;
  };

  // Title
  doc.fontSize(20).text('AGREEMENT', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(14).text(`Agreement ID: ${data.agreementId}`, { align: 'center' });
  doc.text(`Date: ${data.agreementDate}`, { align: 'center' });
  doc.moveDown();

  // Parties section
  doc.fontSize(16).text('PARTIES TO THIS AGREEMENT', { underline: true });
  doc.moveDown(0.3);
  doc.fontSize(12);
  doc.text('LANDLORD (Property Owner)');
  doc.font('Helvetica-Bold').text(`Name: ${data.landlordName}`);
  doc.font('Helvetica').text(`Email: ${data.landlordEmail}`);
  doc.text(`Phone: ${data.landlordPhone || 'N/A'}`);
  doc.moveDown();

  doc.text('TENANT');
  doc.font('Helvetica-Bold').text(`Name: ${data.tenantName}`);
  doc.font('Helvetica').text(`Email: ${data.tenantEmail}`);
  doc.text(`Phone: ${data.tenantPhone || 'N/A'}`);
  doc.moveDown();

  if (data.agentName && data.agentName !== 'N/A') {
    doc.text('AGENT');
    doc.font('Helvetica-Bold').text(`Name: ${data.agentName}`);
    doc.font('Helvetica').text(`Email: ${data.agentEmail}`);
    doc.moveDown();
  }

  doc.moveDown(0.5);

  // Property details
  doc.fontSize(16).text('PROPERTY DETAILS', { underline: true });
  doc.moveDown(0.3);
  doc.fontSize(12);
  doc.text(`Property: ${data.listingTitle}`);
  doc.text(`Address: ${data.listingAddress}`);
  doc.text(`Location: ${data.listingArea}, ${data.listingState}`);
  doc.moveDown(0.5);

  // Terms section
  const isSale = data.rentPeriod === 'sale';
  const title = isSale ? 'SALE TERMS' : 'RENTAL TERMS';
  doc.fontSize(16).text(title, { underline: true });
  doc.moveDown(0.3);
  doc.fontSize(12);

  if (isSale) {
    doc.text(`Sale Price: ₦${data.rentAmount}`);
    doc.text(`Deposit Paid: ₦${data.cautionDeposit}`);
    doc.text(`Completion Date: ${data.endDate}`);
  } else {
    doc.text(`Lease Start Date: ${data.startDate}`);
    doc.text(`Lease End Date: ${data.endDate}`);
    doc.text(`Rent Amount: ₦${data.rentAmount} per ${data.rentPeriod}`);
    doc.text(`Caution Deposit: ₦${data.cautionDeposit}`);
    doc.text(`Service Charge: ₦${data.serviceCharge}`);
    doc.text(`Notice Period: ${data.noticePeriodDays} days`);
  }
  doc.moveDown(0.5);

  // Terms and Conditions
  doc.fontSize(16).text('TERMS AND CONDITIONS', { underline: true });
  doc.moveDown(0.3);
  doc.fontSize(11);
  const conditions = isSale
    ? [
        'The Seller warrants that they have good title to the property and the right to sell it.',
        'The Buyer agrees to pay the full purchase price on or before the completion date.',
        'All necessary documentation will be prepared and executed upon completion.',
        'The Seller will deliver vacant possession on the completion date.',
        'This agreement is governed by the laws of the Federal Republic of Nigeria.',
      ]
    : [
        `The Tenant agrees to pay rent on or before the due date each ${data.rentPeriod}.`,
        'The Tenant shall use the property solely for residential purposes.',
        'The Tenant is responsible for minor repairs and maintenance of the property.',
        'The Landlord is responsible for major structural repairs.',
        'The Tenant shall not sublet the property without written consent from the Landlord.',
        `Either party may terminate this agreement by giving ${data.noticePeriodDays} days written notice.`,
        'The caution deposit shall be refunded within 30 days after the tenant vacates, subject to deductions for damages.',
        'All disputes shall be resolved through mediation or in accordance with Nigerian law.',
      ];

  conditions.forEach((c) => {
    doc.text(`• ${c}`, { indent: 10 });
  });
  doc.moveDown();

  if (data.specialClauses) {
    doc.moveDown(0.3);
    doc.fontSize(16).text('SPECIAL CLAUSES', { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(11);
    data.specialClauses
      .split('\n')
      .filter(Boolean)
      .forEach((clause: string) => {
        doc.text(`• ${clause}`, { indent: 10 });
      });
  }

  if (data.stampDuty) {
    doc.moveDown(1);
    doc
      .fontSize(14)
      .text('ELECTRONIC STAMP DUTY CERTIFICATE', { align: 'center', underline: true });
    doc.moveDown(0.3);
    doc.fontSize(11);
    doc.text(`Certificate Number: ${data.stampDuty.certificateNumber}`, { align: 'center' });
    doc.text(
      `Amount Paid: ₦${new Intl.NumberFormat('en-NG').format(data.stampDuty.amountPaid)}`,
      { align: 'center' }
    );
    doc.text(
      `Date of Payment: ${data.stampDuty.paidAt.toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}`,
      { align: 'center' }
    );
    doc.moveDown();
    doc
      .fontSize(10)
      .text(
        'This agreement has been duly stamped in accordance with the Stamp Duties Act, CAP S8, LFN 2004',
        { align: 'center', color: '#555555', italic: true }
      );
  }

  // Digital Signatures
  doc.addPage();
  doc.fontSize(16).text('DIGITAL SIGNATURES', { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(11);
  doc.text(
    'This agreement was digitally signed by all parties on the following dates:'
  );
  doc.moveDown();

  agreement.signatures.forEach((sig) => {
    doc.font('Helvetica-Bold').text(sig.role.toUpperCase());
    doc.font('Helvetica').text(`Name: ${sig.signer.fullName}`);
    doc.text(
      `Signed on: ${sig.signedAt.toLocaleString('en-NG', { dateStyle: 'long', timeStyle: 'short' })}`
    );
    doc.text(`Signature ID: ${sig.id}`);
    doc.moveDown(0.3);
  });

  doc.moveDown(0.5);
  doc
    .font('Helvetica-Bold')
    .text('Document Verification:', { continued: false });
  doc.font('Helvetica').text('This document is legally binding and has been verified by PROPATI.');
  doc.text(`Agreement ID: ${agreement.id}`);
  doc.text(`Generated on: ${new Date().toLocaleString('en-NG')}`);

  doc.end();

  return new Promise<Buffer>((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });
}

/**
 * Convert raw/uploaded Buffer to a PDF data URI for Cloudinary upload
 */
function bufferToDataUri(buffer: Buffer, mimeType = 'application/pdf'): string {
  return `data:${mimeType};base64,${buffer.toString('base64')}`;
}

/**
 * Generate PDF for a fully signed agreement using pdfkit, then upload to Cloudinary as PDF
 */
export async function generateAgreementPDF(
  agreementId: string
): Promise<{ url: string; publicId: string }> {
  const agreement = await prisma.agreement.findUnique({
    where: { id: agreementId },
    include: {
      listing: { select: { id: true, title: true, area: true, state: true, address: true } },
      landlord: { select: { id: true, fullName: true, email: true, phone: true } },
      tenant: { select: { id: true, fullName: true, email: true, phone: true } },
      agent: { select: { id: true, fullName: true, email: true } },
      signatures: {
        select: {
          id: true,
          role: true,
          signedAt: true,
          signer: { select: { fullName: true } },
        },
      },
      stampDuty: {
        select: {
          certificateNumber: true,
          amount: true,
          paidAt: true,
          status: true,
        },
      },
    },
  });

  if (!agreement) {
    throw new Error('Agreement not found');
  }

  if (agreement.status !== 'fully_signed') {
    throw new Error('Agreement must be fully signed before generating PDF');
  }

  const templateData = {
    agreementId: agreement.id,
    agreementDate: new Date().toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    listingTitle: agreement.listing.title,
    listingArea: agreement.listing.area,
    listingState: agreement.listing.state,
    listingAddress: agreement.listing.address,
    landlordName: agreement.landlord.fullName,
    landlordEmail: agreement.landlord.email,
    landlordPhone: agreement.landlord.phone || 'N/A',
    tenantName: agreement.tenant.fullName,
    tenantEmail: agreement.tenant.email,
    tenantPhone: agreement.tenant.phone || 'N/A',
    agentName: agreement.agent?.fullName || 'N/A',
    agentEmail: agreement.agent?.email || 'N/A',
    startDate: agreement.startDate?.toLocaleDateString('en-NG') || 'TBD',
    endDate: agreement.endDate?.toLocaleDateString('en-NG') || 'TBD',
    rentAmount: agreement.rentAmount ? Number(agreement.rentAmount).toLocaleString('en-NG') : 'N/A',
    rentPeriod: agreement.rentPeriod || 'monthly',
    cautionDeposit: agreement.cautionDeposit ? Number(agreement.cautionDeposit).toLocaleString('en-NG') : 'N/A',
    serviceCharge: agreement.serviceCharge ? Number(agreement.serviceCharge).toLocaleString('en-NG') : 'N/A',
    noticePeriodDays: agreement.noticePeriodDays,
    specialClauses: agreement.specialClauses || '',
    stampDuty:
      agreement.stampDuty?.certificateNumber && agreement.stampDuty?.paidAt
        ? {
              certificateNumber: agreement.stampDuty.certificateNumber,
              amountPaid: Number(agreement.stampDuty.amount),
              paidAt: agreement.stampDuty.paidAt,
            }
        : undefined,
  };

  const publicId = `propati/agreements/${agreementId}`;

  try {
    // Generate PDF with pdfkit
    const pdfBuffer = await buildAgreementPDFBuffer(templateData, agreement as Parameters<typeof buildAgreementPDFBuffer>[1]);

    // Upload PDF to Cloudinary as PDF
    const uploadResult = await cloudinary.uploader.upload(
      bufferToDataUri(pdfBuffer),
      {
        public_id: publicId,
        resource_type: 'raw',
        folder: 'propati/agreements',
        format: 'pdf',
      }
    );

    return {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    };
  } catch (error) {
    console.error('Error uploading PDF to Cloudinary, falling back to HTML:', error);

    // Fallback: render HTML and upload as raw HTML to preserve existing behavior
    const html = renderAgreementTemplate(agreement.type, templateData);

    const signatureSection = `
      <div style="margin-top: 60px; page-break-before: always;">
        <h2 style="color: #0066cc;">DIGITAL SIGNATURES</h2>
        <p>This agreement was digitally signed by all parties on the following dates:</p>
        ${agreement.signatures
          .map(
            (sig) => `
        <div style="margin: 20px 0; padding: 15px; background: #f5f5f5; border-left: 4px solid #0066cc;">
          <strong>${sig.role.toUpperCase()}</strong><br/>
          Name: ${sig.signer.fullName}<br/>
          Signed on: ${sig.signedAt.toLocaleString('en-NG', { dateStyle: 'long', timeStyle: 'short' })}<br/>
          Signature ID: ${sig.id}
        </div>
      `
          )
          .join('')}
        <p style="margin-top: 40px; padding: 15px; background: #e8f5e9; border-radius: 5px;">
          <strong>Document Verification:</strong><br/>
          This document is legally binding and has been verified by PROPATI.<br/>
          Agreement ID: ${agreement.id}<br/>
          Generated on: ${new Date().toLocaleString('en-NG')}
        </p>
      </div>
    `;

    const fullHtml = html.replace('</body>', `${signatureSection}</body>`);
    const htmlBuffer = Buffer.from(fullHtml, 'utf-8');

    const uploadResult = await cloudinary.uploader.upload(
      `data:text/html;base64,${htmlBuffer.toString('base64')}`,
      {
        public_id: publicId,
        resource_type: 'raw',
        folder: 'propati/agreements',
        format: 'html',
      }
    );

    return {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    };
  }
}

/**
 * Store the PDF URL in the agreement record
 */
export async function savePDFToAgreement(
  agreementId: string,
  pdfUrl: string,
  publicId: string
): Promise<void> {
  await prisma.agreement.update({
    where: { id: agreementId },
    data: {
      templateVars: {
        pdfUrl,
        pdfPublicId: publicId,
        generatedAt: new Date().toISOString(),
      },
    },
  });
}

/**
 * Delete PDF from Cloudinary
 */
export async function deletePDF(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
  } catch (error) {
    console.error('Error deleting PDF from Cloudinary:', error);
    // Don't throw error, just log it
  }
}

/**
 * Generate and save PDF for an agreement
 */
export async function generateAndSaveAgreementPDF(agreementId: string) {
  const { url, publicId } = await generateAgreementPDF(agreementId);
  await savePDFToAgreement(agreementId, url, publicId);
  return { url, publicId };
}
