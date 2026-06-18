# Prembly Identity Verification - Setup Instructions

## 🚀 Quick Start

### Option 1: Development Mode (Mock - No Credentials Needed)

**Current Status:** ✅ Already configured and ready to use!

The integration is running in **MOCK MODE** because Prembly credentials are not configured. This allows you to:
- Test the full identity verification flow
- Develop and test frontend UI
- Validate API integration
- All without real Prembly API calls

**How it works:**
- Any 11-digit NIN/BVN with valid names returns success
- Mock data is returned with realistic fields
- No API costs or rate limits
- Console shows: `⚠️ Prembly running in MOCK MODE`

**To test:**
```bash
# Start dev server
npm run dev

# Make a test API call (or use frontend)
curl -X POST http://localhost:3000/api/verification/verify-identity \
  -H "Content-Type: application/json" \
  -d '{
    "verificationId": "ver_test123",
    "verificationType": "nin",
    "number": "12345678901",
    "firstName": "Test",
    "lastName": "User"
  }'

# Expected response (mock success):
{
  "success": true,
  "verified": true,
  "message": "Identity verified successfully!",
  "data": { ... }
}
```

---

### Option 2: Production Mode (Real Prembly API)

**When you need this:**
- Going to production
- Testing with real Nigerian NIN/BVN
- Final integration testing before launch

**Steps:**

#### 1. Get Prembly Credentials

Visit: https://prembly.com/ or https://identitypass.com/

1. Create an account
2. Create a new API application
3. Copy these credentials from your dashboard:
   - `API Key` (looks like: `pk_live_xxx` or `pk_test_xxx`)
   - `App ID` (looks like: `app_xxx`)

#### 2. Update Environment Variables

Open `.env` file and replace:

```bash
# Before (mock mode):
PREMBLY_API_KEY=your_api_key_here
PREMBLY_APP_ID=your_app_id_here

# After (production mode):
PREMBLY_API_KEY=pk_test_your_actual_key_here
PREMBLY_APP_ID=app_your_actual_id_here
```

#### 3. Restart Dev Server

```bash
# Stop current server (Ctrl+C)
# Start again
npm run dev

# Mock mode will be disabled automatically
# Console will NOT show the mock mode warning
```

#### 4. Test with Real Data

```bash
# Test with a real Nigerian NIN/BVN
curl -X POST http://localhost:3000/api/verification/verify-identity \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
    "verificationId": "ver_abc123",
    "verificationType": "nin",
    "number": "12345678901",  # Real NIN
    "firstName": "John",       # Must match NIN records
    "lastName": "Doe"          # Must match NIN records
  }'
```

---

## 📊 Database Setup (Optional but Recommended)

To store identity verification data in the database:

### 1. Update Prisma Schema

Open `prisma/schema.prisma` and add to the `Verification` model:

```prisma
model Verification {
  // ... existing fields ...

  // Layer 2: Identity Data (ADD THESE)
  identityVerified      Boolean   @default(false) @map("identity_verified")
  identityData          Json?     @map("identity_data")
  identityVerifiedAt    DateTime? @map("identity_verified_at")
  identityVerificationType String? @map("identity_verification_type")
  
  // ... rest of fields ...
}
```

### 2. Create and Apply Migration

```bash
# Create migration
npx prisma migrate dev --name add_identity_verification_fields

# Generate Prisma client
npx prisma generate

# Restart dev server
npm run dev
```

### 3. Update API Route (Optional)

If you added the fields, uncomment these lines in:
`src/app/api/verification/verify-identity/route.ts`

```typescript
// Find this section (around line 132):
const updatedVerification = await prisma.verification.update({
  where: { id: verification.id },
  data: {
    l2Status: 'approved',
    l2IdType: validated.verificationType,
    l2VerifiedAt: new Date(),
    currentLayer: 3,
    l3Status: 'pending',
    // UNCOMMENT THESE LINES:
    identityData: identityData,
    identityVerified: true,
    identityVerificationType: validated.verificationType,
  },
});
```

---

## ✅ Verification Checklist

### Backend Setup
- [x] Prembly utility created (`src/lib/prembly.ts`)
- [x] API endpoints created
- [x] Validators added
- [x] React hooks added
- [x] Mock mode enabled for development

### Configuration (Choose One)
- [ ] **Option A:** Using mock mode (no setup needed - already working!)
- [ ] **Option B:** Real Prembly credentials added to `.env`

### Database (Optional)
- [ ] Prisma schema updated with identity fields
- [ ] Migration created and applied
- [ ] Prisma client regenerated
- [ ] API route updated to store identity data

### Testing
- [ ] API endpoints tested (mock or real)
- [ ] Error handling verified
- [ ] Frontend integration started

---

## 🔍 Troubleshooting

### Issue: "Prembly running in MOCK MODE" Warning

**Solution:** This is normal! You're in development mode. No action needed unless you want to use real credentials.

### Issue: "PREMBLY_INVALID_CREDENTIALS" Error

**Causes:**
- API Key or App ID is incorrect
- Credentials are expired
- Using test credentials on production endpoint (or vice versa)

**Solution:**
1. Verify credentials in Prembly dashboard
2. Check for typos in `.env`
3. Ensure no extra spaces in credential values
4. Restart dev server after changing `.env`

### Issue: "PREMBLY_RECORD_NOT_FOUND" Error

**Causes:**
- NIN/BVN doesn't exist in NIMC/CBN database
- Number has typo
- Number format is incorrect

**Solution:**
- Verify the NIN/BVN is correct (11 digits)
- Try a different test number
- In mock mode, any 11-digit number works

### Issue: "PREMBLY_NAME_MISMATCH" Error

**Causes:**
- First name or last name doesn't match official records
- Name spelling differences (e.g., "Muhammad" vs "Mohammed")
- Extra spaces or special characters

**Solution:**
- Use exact name as appears in official documents
- Remove middle names
- Try variations of name spelling

### Issue: "PREMBLY_RATE_LIMIT" Error

**Causes:**
- Too many API calls in short time
- Exceeded Prembly API quota

**Solution:**
- Wait a few minutes before retrying
- Implement client-side rate limiting
- Check Prembly dashboard for quota limits

---

## 📞 Support

### Prembly API Issues
- Documentation: https://docs.prembly.com/
- Support Email: support@prembly.com
- Status Page: https://status.prembly.com/

### Integration Issues
1. Check `PREMBLY_INTEGRATION_SUMMARY.md` for detailed docs
2. Review error logs in console
3. Test with mock mode first
4. Verify all files are created correctly

---

## 🎯 Next Steps

1. **Now:** Start building frontend UI for identity verification
2. **Later:** Configure real Prembly credentials when ready for production
3. **Optional:** Add database fields for storing identity data
4. **Future:** Implement retry logic and better error messages

---

**Status:** ✅ Backend ready for development. Mock mode active. No setup required to start testing!
