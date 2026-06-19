# Prembly Identity Verification Integration - Summary

## ✅ Files Created/Updated

### 1. **Prembly Utility** (`src/lib/prembly.ts`)
- ✅ Updated with Prembly IdentityPass v2 API integration
- ✅ Supports NIN and BVN verification
- ✅ Mock mode for development (when credentials not configured)
- ✅ Proper error handling for common Prembly errors:
  - Invalid credentials
  - NIN/BVN not found
  - Name mismatch
  - API rate limits
  - Network timeouts

### 2. **API Endpoints**
- ✅ `POST /api/verification/verify-identity` - Verify NIN or BVN
- ✅ `GET /api/verification/[id]/identity-status` - Check verification status

### 3. **Validators** (`src/lib/validators.ts`)
- ✅ Added `verifyIdentitySchema` for identity verification requests
- ✅ Added `VerifyIdentityInput` type export

### 4. **React Hooks** (`src/hooks/useVerifications.ts`)
- ✅ Added `useVerifyIdentity()` mutation hook
- ✅ Added `useIdentityStatus()` query hook
- ✅ Automatic query invalidation on success

---

## 🔧 Environment Variables

### Required Setup in `.env`:

```bash
# Prembly IdentityPass API Credentials
PREMBLY_API_KEY=your_actual_api_key_here
PREMBLY_APP_ID=your_actual_app_id_here
```

**Current Status:** 
- ⚠️ Credentials are set to placeholder values
- ✅ Mock mode is active (simulates successful verification for development)

**To Get Real Credentials:**
1. Sign up at https://prembly.com/ or https://identitypass.com/
2. Create an API application
3. Copy `API Key` and `App ID` from dashboard
4. Replace placeholders in `.env` file

---

## 📊 Prisma Schema Changes Required

The following fields should be added to the `Verification` model to fully support identity verification:

```prisma
model Verification {
  // ... existing fields ...

  // Layer 2: Identity Data (NEW FIELDS)
  identityVerified      Boolean   @default(false) @map("identity_verified")
  identityData          Json?     @map("identity_data")  // Store Prembly response
  identityVerifiedAt    DateTime? @map("identity_verified_at")
  identityVerificationType String? @map("identity_verification_type") // 'nin' | 'bvn'
  
  // ... rest of fields ...
}
```

**To apply these changes:**

```bash
# 1. Update prisma/schema.prisma with the fields above
# 2. Create and apply migration
npx prisma migrate dev --name add_identity_verification_fields

# 3. Generate Prisma client
npx prisma generate
```

**Note:** The API endpoints currently work without these fields, but storing `identityData` allows you to:
- Display verified identity information to admins
- Track verification history
- Provide proof of verification

---

## 🔄 API Flow

### Identity Verification Flow:

```
1. Frontend calls: POST /api/verification/verify-identity
   Body: {
     verificationId: "ver_abc123",
     verificationType: "nin",  // or "bvn"
     number: "12345678901",
     firstName: "John",
     lastName: "Doe"
   }

2. Backend:
   - Validates request
   - Checks Layer 1 is approved
   - Calls Prembly API (verifyNIN or verifyBVN)
   - Updates Verification record (l2Status = 'approved', currentLayer = 3)
   - Updates Listing (verificationTier = 'verified')
   - Updates User (idVerified = true)

3. Response (Success):
   {
     success: true,
     verified: true,
     message: "Identity verified successfully!",
     data: {
       verification: { ... },
       identityData: {
         firstName: "JOHN",
         lastName: "DOE",
         birthdate: "1990-01-15",
         phone: "08012345678"
       }
     }
   }

4. Response (Failure - Name Mismatch):
   {
     success: false,
     verified: false,
     message: "Name does not match the records. Please check your details."
   }

5. Response (Failure - Not Found):
   {
     success: false,
     verified: false,
     message: "NIN not found. Please check the number and try again."
   }
```

---

## 🧪 Testing

### Mock Mode Testing (Development)

When `PREMBLY_API_KEY` or `PREMBLY_APP_ID` are not configured, mock mode is active:

```typescript
// Any 11-digit number with valid names returns success
POST /api/verification/verify-identity
{
  verificationId: "ver_test123",
  verificationType: "nin",
  number: "12345678901",  // 11 digits
  firstName: "Test",
  lastName: "User"
}

// Response: Success with mock data
{
  success: true,
  verified: true,
  message: "Identity verified successfully!",
  data: {
    identityData: {
      firstName: "TEST",
      lastName: "USER",
      birthdate: "1990-01-15",
      phone: "08012345678"
    }
  }
}
```

### Production Testing

Once you have real Prembly credentials:

1. Update `.env` with real credentials
2. Restart the dev server
3. Mock mode will be disabled automatically
4. Test with real Nigerian NIN/BVN numbers

---

## 🛡️ Error Handling

The integration handles these error scenarios:

| Error | HTTP Status | Response |
|-------|-------------|----------|
| Invalid request body | 400 | Validation error details |
| Verification not found | 404 | "Verification record not found" |
| Not owner | 403 | "Unauthorized" |
| Layer 1 not approved | 400 | "Layer 1 must be approved..." |
| NIN/BVN not found | 400 | "NIN not found..." |
| Name mismatch | 400 | "Name does not match..." |
| Rate limit exceeded | 429 | "Too many verification attempts..." |
| Service unavailable | 503 | "Identity verification service unavailable..." |
| Timeout | 504 | "Verification service timeout..." |
| Server error | 500 | "Internal server error" |

---

## 📝 Usage Example (Frontend)

```typescript
import { useVerifyIdentity } from '@/hooks/useVerifications';
import { useState } from 'react';

function IdentityVerificationForm({ verificationId }) {
  const [formData, setFormData] = useState({
    verificationType: 'nin',
    number: '',
    firstName: '',
    lastName: '',
  });

  const verifyIdentity = useVerifyIdentity();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const result = await verifyIdentity.mutateAsync({
        verificationId,
        ...formData,
      });

      if (result.verified) {
        alert('Identity verified successfully!');
        // Navigate to next layer
      }
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <select
        value={formData.verificationType}
        onChange={(e) => setFormData({ ...formData, verificationType: e.target.value })}
      >
        <option value="nin">NIN (National Identity Number)</option>
        <option value="bvn">BVN (Bank Verification Number)</option>
      </select>

      <input
        placeholder="Enter NIN/BVN"
        value={formData.number}
        onChange={(e) => setFormData({ ...formData, number: e.target.value })}
      />

      <input
        placeholder="First Name"
        value={formData.firstName}
        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
      />

      <input
        placeholder="Last Name"
        value={formData.lastName}
        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
      />

      <button type="submit" disabled={verifyIdentity.isPending}>
        {verifyIdentity.isPending ? 'Verifying...' : 'Verify Identity'}
      </button>

      {verifyIdentity.error && (
        <div className="error">{verifyIdentity.error.message}</div>
      )}
    </form>
  );
}
```

---

## 🔐 Security Notes

1. **Credentials Protection:**
   - Never commit `.env` file to git
   - Never expose `PREMBLY_API_KEY` or `PREMBLY_APP_ID` to frontend
   - All Prembly calls happen server-side only

2. **Data Privacy:**
   - NIN/BVN numbers are sensitive PII
   - Store only encrypted versions if you need to persist them
   - Current implementation doesn't store raw NIN/BVN

3. **Rate Limiting:**
   - Prembly has API rate limits
   - Handle 429 errors gracefully
   - Consider implementing client-side rate limiting

4. **Authorization:**
   - Only the listing owner can verify their identity
   - Admins can view verification status
   - Checks are enforced in API routes

---

## 🚀 Next Steps (Not Implemented)

The following were **NOT** implemented as requested:

- ❌ Frontend UI components
- ❌ Other verification layers (Layer 1, 3, 4, 5)
- ❌ Verification state machine modifications
- ❌ Admin verification queue enhancements

---

## 📞 Support

For issues with Prembly API:
- Documentation: https://docs.prembly.com/
- Support: support@prembly.com

For issues with this integration:
- Check error logs for detailed error messages
- Verify `.env` credentials are correct
- Test with mock mode first (no credentials needed)

---

## ✅ Integration Checklist

- [x] Prembly client utility created
- [x] API endpoints implemented
- [x] Validation schemas added
- [x] React hooks created
- [x] Error handling implemented
- [x] Mock mode for development
- [ ] Prisma schema updated (manual step required)
- [ ] Real Prembly credentials configured (manual step required)
- [ ] Database migration applied (manual step required)

---

**Status:** Backend integration complete. Ready for testing and frontend integration.
