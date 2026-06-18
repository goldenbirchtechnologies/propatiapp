# PROPATI Backend Structure Analysis

*Extracted from `oldpropati/BACKEND_STRUCTURE.md`*

---

## 📊 Database Schema (22 Tables)

### 1. `users`
**Primary Key:** `id` (TEXT, 'usr_' + 16 chars)

| Column | Type | Constraints |
|--------|------|-------------|
| id | TEXT | PRIMARY KEY |
| email | TEXT | UNIQUE NOT NULL |
| phone | TEXT | UNIQUE |
| password | TEXT | NOT NULL (bcrypt hash, cost 12) |
| role | TEXT | NOT NULL CHECK IN ('landlord','tenant','agent','admin','estate_manager') |
| full_name | TEXT | NOT NULL |
| avatar_url | TEXT | |
| nin_encrypted | TEXT | AES-256-GCM |
| nin_hash | TEXT | HMAC-SHA256 for lookup |
| nin_verified | BOOLEAN | DEFAULT FALSE |
| bvn_encrypted | TEXT | |
| id_type | TEXT | CHECK IN ('nin','bvn','passport','drivers_licence','voters_card') |
| id_number_enc | TEXT | |
| id_verified | BOOLEAN | DEFAULT FALSE |
| id_doc_url | TEXT | |
| phone_verified | BOOLEAN | DEFAULT FALSE |
| employment_status | TEXT | CHECK IN ('employed','self_employed','business_owner','student','retired','unemployed') |
| employment_type | TEXT | CHECK IN ('full_time','part_time','contract','freelance','internship') |
| employer_name | TEXT | |
| job_title | TEXT | |
| yearly_income | BIGINT | (encrypted conceptually) |
| income_verified | BOOLEAN | DEFAULT FALSE |
| profile_bio | TEXT | |
| profile_completed | BOOLEAN | DEFAULT FALSE |
| guarantor_name | TEXT | |
| guarantor_phone | TEXT | |
| guarantor_relationship | TEXT | |
| is_active | BOOLEAN | DEFAULT TRUE |
| is_banned | BOOLEAN | DEFAULT FALSE |
| ban_reason | TEXT | |
| agent_tier | TEXT | DEFAULT 'standard' CHECK IN ('standard','senior','probation') |
| agent_approved | BOOLEAN | DEFAULT FALSE |
| agent_bio | TEXT | |
| agent_areas | JSONB | array of area strings |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |
| last_login | TIMESTAMPTZ | |

**Indexes:** `idx_users_email`, `idx_users_nin_hash`

---

### 2. `refresh_tokens`
**Primary Key:** `id` (TEXT)

| Column | Type | Constraints |
|--------|------|-------------|
| id | TEXT | PRIMARY KEY |
| user_id | TEXT | REFERENCES users(id) ON DELETE CASCADE |
| token_hash | TEXT | NOT NULL (bcrypt hash) |
| expires_at | TIMESTAMPTZ | NOT NULL |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

---

### 3. `password_resets`
**Primary Key:** `id` (TEXT)

| Column | Type | Constraints |
|--------|------|-------------|
| id | TEXT | PRIMARY KEY |
| user_id | TEXT | UNIQUE REFERENCES users(id) ON DELETE CASCADE |
| token_hash | TEXT | NOT NULL |
| expires_at | TIMESTAMPTZ | NOT NULL (1 hour) |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

---

### 4. `phone_otps`
**Primary Key:** `id` (TEXT)

| Column | Type | Constraints |
|--------|------|-------------|
| id | TEXT | PRIMARY KEY |
| user_id | TEXT | REFERENCES users(id) ON DELETE CASCADE |
| otp_hash | TEXT | NOT NULL (bcrypt hash of 6-digit OTP) |
| expires_at | TIMESTAMPTZ | NOT NULL (10 minutes) |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

---

### 5. `listings`
**Primary Key:** `id` (TEXT, 'lst_' + 12 chars)

| Column | Type | Constraints |
|--------|------|-------------|
| id | TEXT | PRIMARY KEY |
| owner_id | TEXT | REFERENCES users(id) |
| agent_id | TEXT | REFERENCES users(id) |
| title | TEXT | NOT NULL |
| description | TEXT | |
| listing_type | TEXT | NOT NULL CHECK IN ('rent','sale','short-let','share','commercial') |
| property_type | TEXT | CHECK IN ('apartment','house','duplex','land','office','shop','warehouse') |
| address | TEXT | NOT NULL |
| area | TEXT | NOT NULL |
| state | TEXT | DEFAULT 'Lagos' |
| price | NUMERIC | NOT NULL |
| price_period | TEXT | CHECK IN ('night','month','year','total') |
| caution_deposit | NUMERIC | |
| service_charge | NUMERIC | |
| bedrooms | INT | |
| bathrooms | INT | |
| toilets | INT | |
| size_sqm | NUMERIC | |
| floor_level | INT | |
| furnished | BOOLEAN | DEFAULT FALSE |
| parking_spaces | INT | DEFAULT 0 |
| amenities | JSONB | |
| available_from | DATE | |
| minimum_stay | INT | |
| status | TEXT | DEFAULT 'draft' CHECK IN ('draft','active','suspended','deleted') |
| verification_tier | TEXT | DEFAULT 'basic' CHECK IN ('basic','verified','inspected','certified') |
| is_featured | BOOLEAN | DEFAULT FALSE |
| views_count | INT | DEFAULT 0 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

**Indexes:** `idx_listings_owner`, `idx_listings_status`, `idx_listings_type`, `idx_listings_area`

---

### 6. `listing_images`
**Primary Key:** `id` (TEXT)

| Column | Type | Constraints |
|--------|------|-------------|
| id | TEXT | PRIMARY KEY |
| listing_id | TEXT | REFERENCES listings(id) ON DELETE CASCADE |
| url | TEXT | NOT NULL (Cloudinary secure_url) |
| public_id | TEXT | Cloudinary public_id for deletion |
| is_cover | BOOLEAN | DEFAULT FALSE |
| sort_order | INT | DEFAULT 0 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

---

### 7. `saved_listings`
**Primary Key:** `id` (TEXT)

| Column | Type | Constraints |
|--------|------|-------------|
| id | TEXT | PRIMARY KEY |
| user_id | TEXT | REFERENCES users(id) ON DELETE CASCADE |
| listing_id | TEXT | REFERENCES listings(id) ON DELETE CASCADE |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| **Unique** | | (user_id, listing_id) |

---

### 8. `listing_flags`
**Primary Key:** `id` (TEXT)

| Column | Type | Constraints |
|--------|------|-------------|
| id | TEXT | PRIMARY KEY |
| listing_id | TEXT | REFERENCES listings(id) ON DELETE CASCADE |
| flagged_by | TEXT | REFERENCES users(id) |
| type | TEXT | CHECK IN ('fraud','duplicate','misleading','wrong_price','harassment','other') |
| description | TEXT | |
| status | TEXT | DEFAULT 'open' CHECK IN ('open','reviewed','dismissed') |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

---

### 9. `verifications`
**Primary Key:** `id` (TEXT)

| Column | Type | Constraints |
|--------|------|-------------|
| id | TEXT | PRIMARY KEY |
| listing_id | TEXT | UNIQUE REFERENCES listings(id) ON DELETE CASCADE |
| owner_id | TEXT | REFERENCES users(id) |
| l1_status | TEXT | DEFAULT 'pending' CHECK IN ('pending','approved','rejected') |
| l1_doc_url | TEXT | |
| l1_submitted_at | TIMESTAMPTZ | |
| l2_status | TEXT | DEFAULT 'pending' CHECK IN ('pending','approved','rejected') |
| l2_id_type | TEXT | |
| l2_verified_at | TIMESTAMPTZ | |
| l3_status | TEXT | DEFAULT 'pending' |
| l4_status | TEXT | DEFAULT 'pending' |
| l5_status | TEXT | DEFAULT 'pending' |
| current_layer | INT | DEFAULT 1 |
| overall_status | TEXT | DEFAULT 'not_started' CHECK IN ('not_started','in_progress','certified','rejected') |
| admin_notes | TEXT | |
| reviewed_by | TEXT | REFERENCES users(id) |
| reviewed_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

---

### 10. `transactions`
**Primary Key:** `id` (TEXT, 'txn_' + 12 chars)

| Column | Type | Constraints |
|--------|------|-------------|
| id | TEXT | PRIMARY KEY |
| reference | TEXT | UNIQUE (Paystack reference) |
| listing_id | TEXT | REFERENCES listings(id) |
| payer_id | TEXT | REFERENCES users(id) |
| payee_id | TEXT | REFERENCES users(id) |
| agent_id | TEXT | REFERENCES users(id) |
| type | TEXT | CHECK IN ('rent','caution','sale','short_let','subscription') |
| status | TEXT | CHECK IN ('pending','in_escrow','released','failed','refunded') |
| amount | BIGINT | NOT NULL (kobo) |
| platform_fee | BIGINT | DEFAULT 0 |
| agent_commission | BIGINT | DEFAULT 0 |
| payee_amount | BIGINT | |
| description | TEXT | |
| paystack_data | JSONB | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

---

### 11. `agreements`
**Primary Key:** `id` (TEXT, 'agr_' + 12 chars)

| Column | Type | Constraints |
|--------|------|-------------|
| id | TEXT | PRIMARY KEY |
| listing_id | TEXT | REFERENCES listings(id) |
| landlord_id | TEXT | REFERENCES users(id) |
| tenant_id | TEXT | REFERENCES users(id) |
| agent_id | TEXT | REFERENCES users(id) |
| type | TEXT | CHECK IN ('rental','sale','short_let','share') |
| status | TEXT | DEFAULT 'draft' CHECK IN ('draft','pending_landlord','pending_tenant','tenant_signed','landlord_signed','fully_signed','terminated','expired') |
| start_date | DATE | |
| end_date | DATE | |
| rent_amount | NUMERIC | |
| rent_period | TEXT | CHECK IN ('monthly','yearly') |
| caution_deposit | NUMERIC | |
| service_charge | NUMERIC | |
| notice_period_days | INT | DEFAULT 30 |
| special_clauses | TEXT | |
| landlord_signed_at | TIMESTAMPTZ | |
| tenant_signed_at | TIMESTAMPTZ | |
| template_vars | JSONB | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

---

### 12. `agreement_signatures`
**Primary Key:** `id` (TEXT)

| Column | Type | Constraints |
|--------|------|-------------|
| id | TEXT | PRIMARY KEY |
| agreement_id | TEXT | REFERENCES agreements(id) ON DELETE CASCADE |
| signer_id | TEXT | REFERENCES users(id) |
| role | TEXT | CHECK IN ('landlord','tenant','agent') |
| ip_address | TEXT | |
| user_agent | TEXT | |
| consent_text | TEXT | |
| signed_at | TIMESTAMPTZ | DEFAULT NOW() |
| checksum | TEXT | SHA256 of doc_url + signer_id + signed_at |

---

### 13. `rent_schedule`
**Primary Key:** `id` (TEXT)

| Column | Type | Constraints |
|--------|------|-------------|
| id | TEXT | PRIMARY KEY |
| agreement_id | TEXT | REFERENCES agreements(id) ON DELETE CASCADE |
| due_date | TEXT | 'YYYY-MM-DD' |
| amount | NUMERIC | |
| status | TEXT | DEFAULT 'upcoming' CHECK IN ('upcoming','paid','overdue') |
| paid_at | TIMESTAMPTZ | |
| transaction_id | TEXT | REFERENCES transactions(id) |
| reminder_sent | INT | DEFAULT 0 |

---

### 14. `conversations`
**Primary Key:** `id` (TEXT, 'cnv_' + 12 chars)

| Column | Type | Constraints |
|--------|------|-------------|
| id | TEXT | PRIMARY KEY |
| listing_id | TEXT | REFERENCES listings(id) ON DELETE SET NULL |
| landlord_id | TEXT | NOT NULL REFERENCES users(id) |
| tenant_id | TEXT | NOT NULL REFERENCES users(id) |
| subject | TEXT | |
| last_message | TEXT | |
| last_message_at | TIMESTAMPTZ | |
| unread_tenant | INT | DEFAULT 0 |
| unread_landlord | INT | DEFAULT 0 |
| status | TEXT | DEFAULT 'active' CHECK IN ('active','archived','blocked') |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

**Indexes:** `idx_conversations_landlord`, `idx_conversations_tenant`

---

### 15. `messages`
**Primary Key:** `id` (TEXT, 'msg_' + 12 chars)

| Column | Type | Constraints |
|--------|------|-------------|
| id | TEXT | PRIMARY KEY |
| conversation_id | TEXT | NOT NULL REFERENCES conversations(id) ON DELETE CASCADE |
| sender_id | TEXT | NOT NULL REFERENCES users(id) |
| content | TEXT | NOT NULL |
| attachment_url | TEXT | |
| attachment_type | TEXT | CHECK IN ('image','document','voice') |
| is_read | BOOLEAN | DEFAULT FALSE |
| read_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

**Indexes:** `idx_messages_conv` (conversation_id, created_at DESC), `idx_messages_sender`

---

### 16. `notifications`
**Primary Key:** `id` (TEXT)

| Column | Type | Constraints |
|--------|------|-------------|
| id | TEXT | PRIMARY KEY |
| user_id | TEXT | REFERENCES users(id) ON DELETE CASCADE |
| type | TEXT | |
| title | TEXT | |
| body | TEXT | |
| data | JSONB | |
| read | BOOLEAN | DEFAULT FALSE |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

**Indexes:** `idx_notifications_user` (user_id, read)

---

### 17. `organisations`
**Primary Key:** `id` (TEXT, 'org_' + 12 chars)

| Column | Type | Constraints |
|--------|------|-------------|
| id | TEXT | PRIMARY KEY |
| name | TEXT | NOT NULL |
| owner_id | TEXT | REFERENCES users(id) |
| billing_email | TEXT | |
| address | TEXT | |
| cac_number | TEXT | |
| plan_tier | TEXT | DEFAULT 'starter' CHECK IN ('starter','growth','enterprise') |
| max_units | INT | DEFAULT 20 |
| max_seats | INT | DEFAULT 1 |
| paystack_customer_id | TEXT | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | |

---

### 18. `org_members`
**Primary Key:** `id` (TEXT)

| Column | Type | Constraints |
|--------|------|-------------|
| id | TEXT | PRIMARY KEY |
| org_id | TEXT | REFERENCES organisations(id) ON DELETE CASCADE |
| user_id | TEXT | REFERENCES users(id) |
| email | TEXT | |
| role | TEXT | CHECK IN ('manager','accountant','maintenance','owner_view') |
| status | TEXT | DEFAULT 'pending' CHECK IN ('pending','active','removed') |
| invited_by | TEXT | REFERENCES users(id) |
| invite_token | TEXT | |
| joined_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| **Unique** | | (org_id, user_id) |

---

### 19. `org_listings`
**Primary Key:** `id` (TEXT)

| Column | Type | Constraints |
|--------|------|-------------|
| id | TEXT | PRIMARY KEY |
| org_id | TEXT | REFERENCES organisations(id) ON DELETE CASCADE |
| listing_id | TEXT | REFERENCES listings(id) ON DELETE CASCADE |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| **Unique** | | (org_id, listing_id) |

---

### 20. `maintenance_tickets`
**Primary Key:** `id` (TEXT, 'tkt_' + 12 chars)

| Column | Type | Constraints |
|--------|------|-------------|
| id | TEXT | PRIMARY KEY |
| org_id | TEXT | REFERENCES organisations(id) |
| listing_id | TEXT | REFERENCES listings(id) |
| tenant_id | TEXT | REFERENCES users(id) |
| raised_by | TEXT | REFERENCES users(id) |
| title | TEXT | NOT NULL |
| description | TEXT | |
| category | TEXT | CHECK IN ('plumbing','electrical','structural','security','cleaning','other') |
| priority | TEXT | DEFAULT 'medium' CHECK IN ('low','medium','high','urgent') |
| status | TEXT | DEFAULT 'open' CHECK IN ('open','assigned','in_progress','resolved','closed') |
| assigned_to | TEXT | REFERENCES users(id) |
| photo_urls | TEXT[] | |
| resolution_note | TEXT | |
| resolved_at | TIMESTAMPTZ | |
| closed_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | |

---

### 21. `org_subscriptions`
**Primary Key:** `id` (TEXT)

| Column | Type | Constraints |
|--------|------|-------------|
| id | TEXT | PRIMARY KEY |
| org_id | TEXT | REFERENCES organisations(id) ON DELETE CASCADE |
| paystack_sub_id | TEXT | UNIQUE |
| plan | TEXT | |
| status | TEXT | DEFAULT 'active' CHECK IN ('active','paused','cancelled') |
| amount | BIGINT | |
| current_period_start | TIMESTAMPTZ | |
| current_period_end | TIMESTAMPTZ | |
| next_billing_date | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

---

### 22. `disputes`
**Primary Key:** `id` (TEXT)

| Column | Type | Constraints |
|--------|------|-------------|
| id | TEXT | PRIMARY KEY |
| listing_id | TEXT | REFERENCES listings(id) |
| raised_by | TEXT | REFERENCES users(id) |
| type | TEXT | |
| status | TEXT | DEFAULT 'open' |
| description | TEXT | |
| resolution | TEXT | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

---

### 23. `screening_calls`
**Primary Key:** `id` (TEXT)

| Column | Type | Constraints |
|--------|------|-------------|
| id | TEXT | PRIMARY KEY |
| listing_id | TEXT | REFERENCES listings(id) |
| landlord_id | TEXT | REFERENCES users(id) |
| tenant_id | TEXT | REFERENCES users(id) |
| scheduled_at | TIMESTAMPTZ | |
| status | TEXT | DEFAULT 'scheduled' |
| notes | TEXT | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

---

### 24. `email_log`
**Primary Key:** `id` (TEXT)

| Column | Type | Constraints |
|--------|------|-------------|
| id | TEXT | PRIMARY KEY |
| to_email | TEXT | |
| subject | TEXT | |
| status | TEXT | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

---

## 🔍 Database Indexes

```sql
CREATE INDEX idx_users_email        ON users(email);
CREATE INDEX idx_users_nin_hash     ON users(nin_hash);
CREATE INDEX idx_listings_owner     ON listings(owner_id);
CREATE INDEX idx_listings_status    ON listings(status);
CREATE INDEX idx_listings_type      ON listings(listing_type);
CREATE INDEX idx_listings_area      ON listings(area);
CREATE INDEX idx_conversations_landlord ON conversations(landlord_id);
CREATE INDEX idx_conversations_tenant   ON conversations(tenant_id);
CREATE INDEX idx_messages_conv      ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender    ON messages(sender_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, read);
```

---

## 🌐 All API Endpoints (100+)

### 📋 Auth — `/api/auth`
| Method | Endpoint | Auth | Body / Query |
|--------|----------|------|--------------|
| POST | `/signup` | ❌ | `{email, password, full_name, role, phone?}` |
| POST | `/login` | ❌ | `{email, password}` |
| POST | `/logout` | ✅ | — |
| GET | `/me` | ✅ | — |
| POST | `/refresh` | ❌ | `{refresh_token}` |
| POST | `/forgot-password` | ❌ | `{email}` |
| POST | `/reset-password` | ❌ | `{token, user_id, password}` |
| POST | `/send-phone-otp` | ✅ | — |
| POST | `/verify-phone` | ✅ | `{otp}` |

---

### 🏠 Listings — `/api/listings`
| Method | Endpoint | Auth | Body / Query |
|--------|----------|------|--------------|
| GET | `/` | ❌ (optional) | `type, area, min_price, max_price, bedrooms, verified, q, page, limit, sort` |
| GET | `/owner/mine` | ✅ | — |
| GET | `/:id` | ❌ (optional) | — |
| POST | `/` | ✅ (landlord\|agent\|admin\|estate_manager) | listing fields |
| PATCH | `/:id` | ✅ (owner\|admin) | listing fields |
| DELETE | `/:id` | ✅ (owner\|admin) | — |
| POST | `/:id/images` | ✅ (owner\|admin) | Multipart: `images[]` (max 10) |
| POST | `/:id/save` | ✅ | — |
| POST | `/:id/flag` | ✅ | `{type, description?}` |

---

### ✅ Verification — `/api/verification`
| Method | Endpoint | Auth | Body / Query |
|--------|----------|------|--------------|
| GET | `/:listing_id` | ✅ | — |
| POST | `/upload-doc` | ✅ (landlord\|estate_manager) | Multipart: `document` |
| POST | `/submit-layer1` | ✅ (landlord\|estate_manager) | `{listing_id}` |
| POST | `/identity` | ✅ (landlord\|estate_manager) | — |
| POST | `/inspection` | ✅ (landlord\|estate_manager) | `{listing_id, preferred_date, preferred_time, address}` |
| POST | `/verify-identity` | ✅ | `{type, number, dob?}` |
| POST | `/confirm-identity` | ✅ | `{listing_id, type, confirmed}` |
| GET | `/admin/queue` | ✅ (admin) | — |
| POST | `/admin/review` | ✅ (admin) | `{listing_id, layer, decision, notes?}` |

---

### 📄 Agreements — `/api/agreements`
| Method | Endpoint | Auth | Body / Query |
|--------|----------|------|--------------|
| POST | `/` | ✅ (landlord\|agent\|admin\|estate_manager) | — |
| GET | `/` | ✅ | — |
| GET | `/:id` | ✅ | — |
| POST | `/:id/sign` | ✅ | `{consent: true, consent_text?}` |
| GET | `/:id/preview` | ✅ | Returns HTML |
| PATCH | `/:id` | ✅ (landlord\|admin) | `{status?, special_clauses?}` |

---

### 💬 Messages — `/api/messages`
| Method | Endpoint | Auth | Body / Query |
|--------|----------|------|--------------|
| GET | `/conversations` | ✅ | — |
| POST | `/conversations` | ✅ | `{landlord_id, listing_id?, subject?, initial_message?}` |
| GET | `/conversations/:id` | ✅ | — |
| GET | `/conversations/:id/messages` | ✅ | `since? (ISO8601), limit?` |
| POST | `/conversations/:id/messages` | ✅ | `{content, attachment_url?, attachment_type?}` |
| PATCH | `/conversations/:id/read` | ✅ | — |
| DELETE | `/conversations/:id` | ✅ | — |
| GET | `/unread-count` | ✅ | — |

---

### 👤 Users — `/api/users`
| Method | Endpoint | Auth | Body / Query |
|--------|----------|------|--------------|
| GET | `/profile` | ✅ | — |
| PATCH | `/profile` | ✅ | Multipart: `{full_name?, phone?, avatar?}` |
| PATCH | `/tenant-profile` | ✅ (tenant) | employment fields |
| GET | `/tenant-profile/:userId` | ✅ (landlord\|agent\|admin) | — |
| GET | `/notifications` | ✅ | — |
| POST | `/notifications/read-all` | ✅ | — |
| GET | `/saved-listings` | ✅ | — |
| GET | `/agents` | ❌ (public) | `area?, page?, limit?` |
| GET | `/receipts` | ✅ (tenant) | — |
| GET | `/admin/all` | ✅ (admin) | `role?, q?, page?, limit?` |
| GET | `/admin/stats` | ✅ (admin) | — |
| POST | `/admin/:userId/suspend` | ✅ (admin) | `{reason}` |
| POST | `/admin/:userId/approve-agent` | ✅ (admin) | `{approved: bool}` |

---

### 💳 Payments — `/api/payments`
| Method | Endpoint | Auth | Body / Query |
|--------|----------|------|--------------|
| POST | `/initiate` | ✅ | `{listing_id, agreement_id, amount, type}` |
| POST | `/webhook` | ❌ (Paystack webhook, raw body) | Paystack payload |
| GET | `/transactions` | ✅ | — |
| GET | `/transactions/:id` | ✅ | — |
| POST | `/release-escrow/:id` | ✅ (admin) | — |

---

### 🏢 Organisations — `/api/orgs`
| Method | Endpoint | Auth | Body / Query |
|--------|----------|------|--------------|
| POST | `/` | ✅ | `{name, billing_email, address?, cac_number?}` |
| GET | `/mine` | ✅ | — |
| GET | `/bulk-template.csv` | ❌ (public) | — |
| PATCH | `/:id` | ✅ (manager) | org fields |
| GET | `/:id/portfolio` | ✅ (org member) | — |
| GET | `/:id/team` | ✅ (org member) | — |
| POST | `/:id/invite` | ✅ (manager) | `{email, role}` |
| DELETE | `/:id/members/:uid` | ✅ (manager) | — |
| GET | `/:id/tickets` | ✅ (org member) | `status?, priority?, category?` |
| POST | `/:id/tickets` | ✅ (manager\|maintenance) | `{title, category?, priority?, property_id?, tenant_id?}` |
| PATCH | `/:id/tickets/:tid` | ✅ (manager\|maintenance) | `{status?, assigned_to?, resolution_note?, priority?}` |
| GET | `/:id/ledger` | ✅ (manager\|accountant) | — |
| GET | `/:id/subscription` | ✅ (manager\|accountant) | — |
| POST | `/:id/subscribe` | ✅ (manager) | `{plan}` |
| POST | `/:id/bulk-upload` | ✅ (manager) | Multipart: `file` (CSV) |
| GET | `/:id/reports/:month` | ✅ (manager\|accountant\|owner_view) | Param: `YYYY-MM` |

---

## ⚙️ Key Implementation Details

### Middleware Stack

#### `authenticate` (auth.js)
- Extracts JWT from `Authorization: Bearer <token>` header
- Attaches `req.user` (full user row from DB)
- Returns **401** if missing/invalid

#### `requireRole(...roles)` (auth.js)
```javascript
requireRole('landlord', 'admin')
// Returns 403 if req.user.role not in roles array
```

#### `optionalAuth` (auth.js)
- Attaches `req.user` if valid token present
- Continues without it if not (no 401)

#### `requireOrgAccess(allowedRoles)` (orgs.js inline)
- Checks `org_members` table for membership
- Falls back to checking `organisations.owner_id`
- Attaches `req.orgRole`

#### File Upload Middlewares (upload.js)
- `uploadImages` / `uploadDocument` / `uploadVideo`
- Multer with **memory storage**
- Max **10MB** files (**100MB** for video)
- Calls `uploadToCloudinary(file.buffer, options)` after parsing

#### `uploadToCloudinary(buffer, options)`
```javascript
options = {
  subfolder: 'images' | 'documents' | 'videos' | 'avatars',
  resource_type: 'image' | 'raw' | 'video'
}
// Returns { secure_url, public_id }
// Dev fallback (no Cloudinary env): returns placeholder URL
```

---

### 📤 Response Format

**All endpoints return:**

```json
// Success (200/201)
{ "success": true, ...data }

// Error
{ "success": false, "error": "Human readable message", "details": [...] }
```

**HTTP Status Codes:**
| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthenticated |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict (duplicate) |
| 422 | Validation Failed |
| 500 | Server Error |

---

### 💰 Fee Calculation Logic

```javascript
function computeFees(type, amount) {
  const rates = {
    rent: 0.10,
    sale: amount > 20_000_000 ? 0.01 : 0.02,
    short_let: 0.05,
    commercial: 0.08,
    share: 0.05
  };
  const agentRate = {
    rent: 0.10,
    sale: amount > 20_000_000 ? 0.01 : 0.015,
    short_let: 0.03
  };
  const platformFee     = Math.round(amount * (rates[type] || 0.10));
  const agentCommission = Math.round(amount * (agentRate[type] || 0));
  const payeeAmount     = amount - platformFee;
  return { platformFee, agentCommission, payeeAmount };
}
```

**Fee Structure:**
| Transaction Type | Platform Fee | Agent Commission |
|------------------|--------------|------------------|
| rent | 10% | 10% |
| sale (>20M) | 1% | 1% |
| sale (≤20M) | 2% | 1.5% |
| short_let | 5% | 3% |
| commercial | 8% | — |
| share | 5% | — |

*Amounts stored in **kobo** (smallest currency unit)*

---

### 🔐 Security Notes

1. **All SQL queries use PostgreSQL parameterized syntax** (`$1`, `$2`, etc.) — never string concatenation
2. **Passwords:** bcrypt with cost 12
3. **Refresh tokens:** bcrypt hash stored
4. **OTPs:** bcrypt hash of 6-digit code, 10-min expiry
5. **KYC encryption:** AES-256-GCM for NIN/BVN, HMAC-SHA256 hash for lookup
6. **Agreement signatures:** SHA256 checksum of `doc_url + signer_id + signed_at`
7. **File uploads:** Cloudinary with secure URLs, public_id retained for deletion

---

### 🏷️ ID Prefix Conventions

| Entity | Prefix | Example |
|--------|--------|---------|
| users | `usr_` | `usr_a1b2c3d4e5f6g7h8` |
| listings | `lst_` | `lst_a1b2c3d4e5f6` |
| transactions | `txn_` | `txn_a1b2c3d4e5f6` |
| agreements | `agr_` | `agr_a1b2c3d4e5f6` |
| conversations | `cnv_` | `cnv_a1b2c3d4e5f6` |
| messages | `msg_` | `msg_a1b2c3d4e5f6` |
| organisations | `org_` | `org_a1b2c3d4e5f6` |
| maintenance tickets | `tkt_` | `tkt_a1b2c3d4e5f6` |

---

## 📦 External Integrations

| Service | Purpose |
|---------|---------|
| **Paystack** | Payments, webhooks, subscriptions, escrow |
| **Cloudinary** | Image/document/video storage (secure URLs) |
| **Email Service** | Notifications, OTPs, transactional emails (logged in `email_log`) |

---

*Generated from `oldpropati/BACKEND_STRUCTURE.md` — 22 tables (plus 2 auxiliary), 100+ endpoints across 7 domains*