import { v2 as cloudinary } from 'cloudinary';
import { prisma } from './prisma';
import { renderAgreementTemplate } from './agreement-templates';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Generate PDF for a fully signed agreement
 * Uses HTML to PDF conversion via Cloudinary or similar service
 */
export async function generateAgreementPDF(agreementId: string): Promise<{ url: string; publicId: string }> {
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
          signer: {
            select: { fullName: true },
          },
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

  // Check if fully signed
  if (agreement.status !== 'fully_signed') {
    throw new Error('Agreement must be fully signed before generating PDF');
  }

  // Prepare template data
  const templateData = {
    agreementId: agreement.id,
    agreementDate: new Date().toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
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
            amountPaid: agreement.stampDuty.amount,
            paidAt: agreement.stampDuty.paidAt,
          }
        : undefined,
  };

  // Render HTML
  const html = renderAgreementTemplate(agreement.type, templateData);

  // Add signature information to HTML
  const signatureSection = `
    <div style="margin-top: 60px; page-break-before: always;">
      <h2 style="color: #0066cc;">DIGITAL SIGNATURES</h2>
      <p>This agreement was digitally signed by all parties on the following dates:</p>
      ${agreement.signatures.map(sig => `
        <div style="margin: 20px 0; padding: 15px; background: #f5f5f5; border-left: 4px solid #0066cc;">
          <strong>${sig.role.toUpperCase()}</strong><br/>
          Name: ${sig.signer.fullName}<br/>
          Signed on: ${sig.signedAt.toLocaleString('en-NG', {
            dateStyle: 'long',
            timeStyle: 'short'
          })}<br/>
          Signature ID: ${sig.id}
        </div>
      `).join('')}
      <p style="margin-top: 40px; padding: 15px; background: #e8f5e9; border-radius: 5px;">
        <strong>Document Verification:</strong><br/>
        This document is legally binding and has been verified by PROPATI.<br/>
        Agreement ID: ${agreement.id}<br/>
        Generated on: ${new Date().toLocaleString('en-NG')}
      </p>
    </div>
  `;

  const fullHtml = html.replace('</body>', `${signatureSection}</body>`);

  // For now, we'll store the HTML in a simple format and return a mock URL
  // In production, you would use a service like Puppeteer, wkhtmltopdf, or a cloud service
  // to convert HTML to PDF

  // Save HTML to a buffer or file temporarily
  const htmlBuffer = Buffer.from(fullHtml, 'utf-8');

  // Upload to Cloudinary as HTML file (or convert to PDF using external service)
  const publicId = `propati/agreements/${agreementId}`;

  try {
    // Upload HTML as raw file to Cloudinary
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
  } catch (error) {
    console.error('Error uploading agreement to Cloudinary:', error);
    throw new Error('Failed to generate agreement PDF');
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
