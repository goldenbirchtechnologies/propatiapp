# 08 – Pattern Library

## 1. Authentication Pattern

- Clerk `auth()` and `currentUser()` in server components
- `withAuth(request, roles?)` helper in API routes (`src/lib/api-auth.ts`)
- Role persisted to Prisma `User` on webhook sync

## 2. Data Fetching Pattern

- Server components fetch directly via `prisma`
- Client components use hooks: `useSWR`, custom hooks in `src/hooks/`
- API routes return `NextResponse.json({ success, data, pagination })`

## 3. Form Pattern

- React Hook Form + Zod resolvers
- Schema definitions in `src/lib/validators.ts`
- Error responses: `{ error: 'Invalid request body', details: error.errors }`

## 4. Payment Pattern

1. Client calls `POST /api/payments/initiate`
2. Server creates `Transaction` (status `pending`), calls Paystack
3. Returns `authorization_url`
4. Client redirects
5. Paystack webhook validates HMAC, updates status, triggers events

## 5. Notification Pattern

- Server creates `Notification` record in relevant action
- Client polls `GET /api/notifications` + `unread-count`
- Mark read via `PATCH /api/notifications/[id]/read`

## 6. File Upload Pattern

- Client uploads to Cloudinary (direct or via API route)
- Server stores URL and `publicId` in Prisma
- Soft delete via `deletedAt` where applicable

## 7. Verification State Machine

- Defined in `src/lib/verification.ts`
- Valid transitions enforced server-side
- Admin actions via dedicated routes per layer

## 8. Role-Based Access

- `requireRole(...roles)` in server components
- `withAuth(request, roles?)` in API routes
- UI hides/shows via `user.role` checks

## 9. Error Handling Pattern

- Try/catch in API routes
- Zod errors → 400 with details
- Generic errors → 500
- Client shows toast via `sonner`

## 10. Pagination Pattern

- `page`, `limit`, `skip`, `take`
- Response includes `pagination: { page, limit, total, totalPages, hasNext }`
