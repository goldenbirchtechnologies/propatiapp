# 16 – Asset Library

## Status: Managed via Cloudinary

All image, document, PDF, and video assets are stored in Cloudinary.

### Configuration

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### Usage

- Listing images: uploaded via `src/routes/upload.js` or direct client upload
- Verification documents: `VerificationDocument.url`
- Inspection reports: `Verification.l4ReportUrl`
- Agreement PDFs: served via `/api/agreements/[id]/pdf`
- Maintenance photos: `MaintenanceTicket.photoUrls`

### Transformations

- Responsive: `f_auto,q_auto,w_800`
- Cover images: `c_fill,w_800,h_600`
- Thumbnails: `c_fill,w_200,h_150`

### Organization

Assets are not version-controlled in git. Referential URLs are stored in Prisma.

### Future

- CDN fallback for Cloudinary outages
- Signed uploads for security
- Asset cleanup on record delete
