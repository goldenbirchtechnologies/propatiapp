
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('@prisma/client/runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  clerkId: 'clerkId',
  email: 'email',
  phone: 'phone',
  password: 'password',
  role: 'role',
  fullName: 'fullName',
  avatarUrl: 'avatarUrl',
  ninEncrypted: 'ninEncrypted',
  ninHash: 'ninHash',
  ninVerified: 'ninVerified',
  bvnEncrypted: 'bvnEncrypted',
  idType: 'idType',
  idNumberEnc: 'idNumberEnc',
  idVerified: 'idVerified',
  idDocUrl: 'idDocUrl',
  phoneVerified: 'phoneVerified',
  employmentStatus: 'employmentStatus',
  employmentType: 'employmentType',
  employerName: 'employerName',
  jobTitle: 'jobTitle',
  yearlyIncome: 'yearlyIncome',
  incomeVerified: 'incomeVerified',
  profileBio: 'profileBio',
  profileCompleted: 'profileCompleted',
  guarantorName: 'guarantorName',
  guarantorPhone: 'guarantorPhone',
  guarantorRelationship: 'guarantorRelationship',
  isActive: 'isActive',
  isBanned: 'isBanned',
  banReason: 'banReason',
  agentTier: 'agentTier',
  agentApproved: 'agentApproved',
  agentBio: 'agentBio',
  agentAreas: 'agentAreas',
  notificationPreferences: 'notificationPreferences',
  pushSubscription: 'pushSubscription',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  lastLogin: 'lastLogin'
};

exports.Prisma.RefreshTokenScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  tokenHash: 'tokenHash',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt'
};

exports.Prisma.PasswordResetScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  tokenHash: 'tokenHash',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt'
};

exports.Prisma.PhoneOtpScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  otpHash: 'otpHash',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt'
};

exports.Prisma.ListingScalarFieldEnum = {
  id: 'id',
  ownerId: 'ownerId',
  agentId: 'agentId',
  title: 'title',
  description: 'description',
  listingType: 'listingType',
  propertyType: 'propertyType',
  address: 'address',
  area: 'area',
  state: 'state',
  price: 'price',
  pricePeriod: 'pricePeriod',
  cautionDeposit: 'cautionDeposit',
  serviceCharge: 'serviceCharge',
  bedrooms: 'bedrooms',
  bathrooms: 'bathrooms',
  toilets: 'toilets',
  sizeSqm: 'sizeSqm',
  floorLevel: 'floorLevel',
  furnished: 'furnished',
  parkingSpaces: 'parkingSpaces',
  amenities: 'amenities',
  availableFrom: 'availableFrom',
  minimumStay: 'minimumStay',
  status: 'status',
  verificationTier: 'verificationTier',
  isFeatured: 'isFeatured',
  allowShortlet: 'allowShortlet',
  viewsCount: 'viewsCount',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ListingImageScalarFieldEnum = {
  id: 'id',
  listingId: 'listingId',
  url: 'url',
  publicId: 'publicId',
  isCover: 'isCover',
  sortOrder: 'sortOrder',
  createdAt: 'createdAt'
};

exports.Prisma.SavedListingScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  listingId: 'listingId',
  createdAt: 'createdAt'
};

exports.Prisma.ListingFlagScalarFieldEnum = {
  id: 'id',
  listingId: 'listingId',
  flaggedBy: 'flaggedBy',
  type: 'type',
  description: 'description',
  status: 'status',
  createdAt: 'createdAt'
};

exports.Prisma.VerificationScalarFieldEnum = {
  id: 'id',
  listingId: 'listingId',
  ownerId: 'ownerId',
  l1Status: 'l1Status',
  l1DocUrl: 'l1DocUrl',
  l1SubmittedAt: 'l1SubmittedAt',
  l2Status: 'l2Status',
  l2IdType: 'l2IdType',
  l2VerifiedAt: 'l2VerifiedAt',
  l3Status: 'l3Status',
  l3VideoUrl: 'l3VideoUrl',
  l3QrCode: 'l3QrCode',
  l4Status: 'l4Status',
  l4AgentId: 'l4AgentId',
  l4ScheduledAt: 'l4ScheduledAt',
  l4CompletedAt: 'l4CompletedAt',
  l4ReportUrl: 'l4ReportUrl',
  l5Status: 'l5Status',
  currentLayer: 'currentLayer',
  overallStatus: 'overallStatus',
  adminNotes: 'adminNotes',
  reviewedBy: 'reviewedBy',
  reviewedAt: 'reviewedAt',
  frozenReason: 'frozenReason',
  frozenAt: 'frozenAt',
  frozenBy: 'frozenBy',
  updatedAt: 'updatedAt'
};

exports.Prisma.VerificationDocumentScalarFieldEnum = {
  id: 'id',
  verificationId: 'verificationId',
  listingId: 'listingId',
  documentType: 'documentType',
  url: 'url',
  publicId: 'publicId',
  fileName: 'fileName',
  fileSize: 'fileSize',
  mimeType: 'mimeType',
  uploadedAt: 'uploadedAt',
  deletedAt: 'deletedAt'
};

exports.Prisma.TransactionScalarFieldEnum = {
  id: 'id',
  reference: 'reference',
  listingId: 'listingId',
  payerId: 'payerId',
  payeeId: 'payeeId',
  agentId: 'agentId',
  type: 'type',
  status: 'status',
  amount: 'amount',
  currency: 'currency',
  platformFee: 'platformFee',
  agentCommission: 'agentCommission',
  payeeAmount: 'payeeAmount',
  paystackRef: 'paystackRef',
  description: 'description',
  paystackData: 'paystackData',
  paidAt: 'paidAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AgreementScalarFieldEnum = {
  id: 'id',
  listingId: 'listingId',
  landlordId: 'landlordId',
  tenantId: 'tenantId',
  agentId: 'agentId',
  type: 'type',
  status: 'status',
  startDate: 'startDate',
  endDate: 'endDate',
  rentAmount: 'rentAmount',
  rentPeriod: 'rentPeriod',
  cautionDeposit: 'cautionDeposit',
  serviceCharge: 'serviceCharge',
  noticePeriodDays: 'noticePeriodDays',
  specialClauses: 'specialClauses',
  landlordSignedAt: 'landlordSignedAt',
  tenantSignedAt: 'tenantSignedAt',
  pdfUrl: 'pdfUrl',
  templateVars: 'templateVars',
  riskTier: 'riskTier',
  jurisdictionState: 'jurisdictionState',
  governingStatute: 'governingStatute',
  headTenantVerified: 'headTenantVerified',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  pdfContentHash: 'pdfContentHash',
  finalizedAt: 'finalizedAt',
  lockStatus: 'lockStatus',
  integrityChainHash: 'integrityChainHash',
  lockedBy: 'lockedBy'
};

exports.Prisma.AgreementSignatureScalarFieldEnum = {
  id: 'id',
  agreementId: 'agreementId',
  signerId: 'signerId',
  role: 'role',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  consentText: 'consentText',
  signedAt: 'signedAt',
  checksum: 'checksum',
  documentHash: 'documentHash',
  bindingHash: 'bindingHash'
};

exports.Prisma.RentScheduleScalarFieldEnum = {
  id: 'id',
  agreementId: 'agreementId',
  dueDate: 'dueDate',
  amount: 'amount',
  status: 'status',
  paidAt: 'paidAt',
  transactionId: 'transactionId',
  reminderSent: 'reminderSent'
};

exports.Prisma.ConversationScalarFieldEnum = {
  id: 'id',
  listingId: 'listingId',
  propertyId: 'propertyId',
  orgId: 'orgId',
  landlordId: 'landlordId',
  tenantId: 'tenantId',
  participants: 'participants',
  subject: 'subject',
  lastMessage: 'lastMessage',
  lastMessageAt: 'lastMessageAt',
  unreadCounts: 'unreadCounts',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.MessageScalarFieldEnum = {
  id: 'id',
  conversationId: 'conversationId',
  senderId: 'senderId',
  content: 'content',
  attachmentUrl: 'attachmentUrl',
  attachmentType: 'attachmentType',
  isRead: 'isRead',
  readAt: 'readAt',
  createdAt: 'createdAt'
};

exports.Prisma.NotificationScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  type: 'type',
  title: 'title',
  body: 'body',
  data: 'data',
  read: 'read',
  createdAt: 'createdAt'
};

exports.Prisma.OrganisationScalarFieldEnum = {
  id: 'id',
  name: 'name',
  ownerId: 'ownerId',
  billingEmail: 'billingEmail',
  address: 'address',
  cacNumber: 'cacNumber',
  verified: 'verified',
  verifiedAt: 'verifiedAt',
  planTier: 'planTier',
  maxUnits: 'maxUnits',
  maxSeats: 'maxSeats',
  paystackCustomerId: 'paystackCustomerId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.OrgMemberScalarFieldEnum = {
  id: 'id',
  orgId: 'orgId',
  userId: 'userId',
  email: 'email',
  role: 'role',
  status: 'status',
  invitedBy: 'invitedBy',
  inviteToken: 'inviteToken',
  joinedAt: 'joinedAt',
  createdAt: 'createdAt'
};

exports.Prisma.OrgListingScalarFieldEnum = {
  id: 'id',
  orgId: 'orgId',
  listingId: 'listingId',
  createdAt: 'createdAt'
};

exports.Prisma.MaintenanceTicketScalarFieldEnum = {
  id: 'id',
  orgId: 'orgId',
  listingId: 'listingId',
  tenantId: 'tenantId',
  raisedBy: 'raisedBy',
  title: 'title',
  description: 'description',
  category: 'category',
  priority: 'priority',
  status: 'status',
  assignedTo: 'assignedTo',
  photoUrls: 'photoUrls',
  resolutionNote: 'resolutionNote',
  resolvedAt: 'resolvedAt',
  closedAt: 'closedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.OrgSubscriptionScalarFieldEnum = {
  id: 'id',
  orgId: 'orgId',
  paystackSubId: 'paystackSubId',
  plan: 'plan',
  status: 'status',
  amount: 'amount',
  currentPeriodStart: 'currentPeriodStart',
  currentPeriodEnd: 'currentPeriodEnd',
  nextBillingDate: 'nextBillingDate',
  createdAt: 'createdAt'
};

exports.Prisma.DisputeScalarFieldEnum = {
  id: 'id',
  listingId: 'listingId',
  raisedBy: 'raisedBy',
  type: 'type',
  status: 'status',
  description: 'description',
  resolution: 'resolution',
  adminId: 'adminId',
  createdAt: 'createdAt',
  resolvedAt: 'resolvedAt'
};

exports.Prisma.ScreeningCallScalarFieldEnum = {
  id: 'id',
  listingId: 'listingId',
  landlordId: 'landlordId',
  tenantId: 'tenantId',
  scheduledAt: 'scheduledAt',
  status: 'status',
  notes: 'notes',
  createdAt: 'createdAt'
};

exports.Prisma.EmailLogScalarFieldEnum = {
  id: 'id',
  toEmail: 'toEmail',
  subject: 'subject',
  status: 'status',
  error: 'error',
  createdAt: 'createdAt',
  userId: 'userId'
};

exports.Prisma.AdminAuditLogScalarFieldEnum = {
  id: 'id',
  adminId: 'adminId',
  action: 'action',
  targetType: 'targetType',
  targetId: 'targetId',
  details: 'details',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  createdAt: 'createdAt'
};

exports.Prisma.UnitScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  listingId: 'listingId',
  buildingName: 'buildingName',
  unitNumber: 'unitNumber',
  type: 'type',
  bedrooms: 'bedrooms',
  bathrooms: 'bathrooms',
  sizeSqm: 'sizeSqm',
  rent: 'rent',
  cautionDeposit: 'cautionDeposit',
  serviceCharge: 'serviceCharge',
  status: 'status',
  occupancy: 'occupancy',
  currentTenantId: 'currentTenantId',
  leaseStartDate: 'leaseStartDate',
  leaseEndDate: 'leaseEndDate',
  lastMaintenanceDate: 'lastMaintenanceDate',
  nextMaintenanceDate: 'nextMaintenanceDate',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ApplicationScalarFieldEnum = {
  id: 'id',
  listingId: 'listingId',
  tenantId: 'tenantId',
  landlordId: 'landlordId',
  status: 'status',
  message: 'message',
  landlordNotes: 'landlordNotes',
  reviewedAt: 'reviewedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.StampDutyScalarFieldEnum = {
  id: 'id',
  agreementId: 'agreementId',
  amount: 'amount',
  remitaRrr: 'remitaRrr',
  transactionId: 'transactionId',
  certificateNumber: 'certificateNumber',
  certificateUrl: 'certificateUrl',
  status: 'status',
  paidAt: 'paidAt',
  issuedAt: 'issuedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  agreementPdfHash: 'agreementPdfHash',
  certificateHash: 'certificateHash',
  linkageHash: 'linkageHash'
};

exports.Prisma.CalendarSlotScalarFieldEnum = {
  id: 'id',
  listingId: 'listingId',
  date: 'date',
  status: 'status',
  price: 'price',
  reason: 'reason',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PricingRuleScalarFieldEnum = {
  id: 'id',
  listingId: 'listingId',
  name: 'name',
  ruleType: 'ruleType',
  priority: 'priority',
  multiplier: 'multiplier',
  fixedPrice: 'fixedPrice',
  dayOfWeek: 'dayOfWeek',
  minNights: 'minNights',
  maxNights: 'maxNights',
  advanceDays: 'advanceDays',
  startDate: 'startDate',
  endDate: 'endDate',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BookingScalarFieldEnum = {
  id: 'id',
  listingId: 'listingId',
  guestId: 'guestId',
  checkIn: 'checkIn',
  checkOut: 'checkOut',
  nights: 'nights',
  basePrice: 'basePrice',
  totalPrice: 'totalPrice',
  status: 'status',
  paymentStatus: 'paymentStatus',
  transactionId: 'transactionId',
  guestName: 'guestName',
  guestPhone: 'guestPhone',
  guestEmail: 'guestEmail',
  specialRequests: 'specialRequests',
  cancelledAt: 'cancelledAt',
  checkedInAt: 'checkedInAt',
  checkedOutAt: 'checkedOutAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TenantShortletScalarFieldEnum = {
  id: 'id',
  listingId: 'listingId',
  tenantId: 'tenantId',
  landlordId: 'landlordId',
  status: 'status',
  approvedAt: 'approvedAt',
  rejectedAt: 'rejectedAt',
  revokedAt: 'revokedAt',
  notes: 'notes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.LawFirmScalarFieldEnum = {
  id: 'id',
  name: 'name',
  cacNumber: 'cacNumber',
  email: 'email',
  phone: 'phone',
  address: 'address',
  billingEmail: 'billingEmail',
  jurisdiction: 'jurisdiction',
  verified: 'verified',
  verificationStatus: 'verificationStatus',
  callToBarNumber: 'callToBarNumber',
  yearOfCall: 'yearOfCall',
  nbaEnrollmentNumber: 'nbaEnrollmentNumber',
  nbaEnrollmentYear: 'nbaEnrollmentYear',
  principalPartnerName: 'principalPartnerName',
  principalPartnerCall: 'principalPartnerCall',
  specializations: 'specializations',
  feeStructure: 'feeStructure',
  rating: 'rating',
  reviewCount: 'reviewCount',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.LawFirmCaseScalarFieldEnum = {
  id: 'id',
  disputeId: 'disputeId',
  firmId: 'firmId',
  status: 'status',
  engagementType: 'engagementType',
  engagementId: 'engagementId',
  feeModel: 'feeModel',
  conflictCheckId: 'conflictCheckId',
  fee: 'fee',
  feeCurrency: 'feeCurrency',
  assignedAt: 'assignedAt',
  resolvedAt: 'resolvedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ServiceChargeScalarFieldEnum = {
  id: 'id',
  listingId: 'listingId',
  organizationId: 'organizationId',
  estateManagerId: 'estateManagerId',
  period: 'period',
  amount: 'amount',
  currency: 'currency',
  dueDate: 'dueDate',
  status: 'status',
  description: 'description',
  paidAt: 'paidAt',
  transactionId: 'transactionId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.UtilityAllocationScalarFieldEnum = {
  id: 'id',
  unitId: 'unitId',
  type: 'type',
  reading: 'reading',
  amount: 'amount',
  currency: 'currency',
  billingPeriod: 'billingPeriod',
  dueDate: 'dueDate',
  status: 'status',
  paidAt: 'paidAt',
  transactionId: 'transactionId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TurnoverTaskScalarFieldEnum = {
  id: 'id',
  bookingId: 'bookingId',
  propertyId: 'propertyId',
  listingId: 'listingId',
  assignedToUserId: 'assignedToUserId',
  status: 'status',
  priority: 'priority',
  scheduledStart: 'scheduledStart',
  scheduledEnd: 'scheduledEnd',
  actualStart: 'actualStart',
  actualEnd: 'actualEnd',
  notes: 'notes',
  checklist: 'checklist',
  photos: 'photos',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BusinessProfileScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  cacNumber: 'cacNumber',
  rcNumber: 'rcNumber',
  companyName: 'companyName',
  verified: 'verified',
  verifiedAt: 'verifiedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BusinessVerificationScalarFieldEnum = {
  id: 'id',
  entityType: 'entityType',
  entityId: 'entityId',
  status: 'status',
  cacNumber: 'cacNumber',
  companyName: 'companyName',
  contactEmail: 'contactEmail',
  contactPhone: 'contactPhone',
  address: 'address',
  documents: 'documents',
  submittedAt: 'submittedAt',
  reviewedBy: 'reviewedBy',
  reviewedAt: 'reviewedAt',
  adminNotes: 'adminNotes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.EvidencePackScalarFieldEnum = {
  id: 'id',
  disputeId: 'disputeId',
  lawFirmId: 'lawFirmId',
  status: 'status',
  fileUrls: 'fileUrls',
  payments: 'payments',
  messages: 'messages',
  auditLogs: 'auditLogs',
  metadata: 'metadata',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  exhibitPrefix: 'exhibitPrefix',
  exhibitCount: 'exhibitCount',
  sealHash: 'sealHash',
  sealedAt: 'sealedAt',
  sealedBy: 'sealedBy',
  chainHash: 'chainHash'
};

exports.Prisma.DocumentScalarFieldEnum = {
  id: 'id',
  listingId: 'listingId',
  uploadedById: 'uploadedById',
  type: 'type',
  version: 'version',
  url: 'url',
  name: 'name',
  mimeType: 'mimeType',
  sizeBytes: 'sizeBytes',
  accessControl: 'accessControl',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  currentVersion: 'currentVersion',
  legalHold: 'legalHold',
  chainHash: 'chainHash',
  lockedBy: 'lockedBy',
  lockedAt: 'lockedAt'
};

exports.Prisma.DocumentVersionScalarFieldEnum = {
  id: 'id',
  documentId: 'documentId',
  version: 'version',
  url: 'url',
  sizeBytes: 'sizeBytes',
  mimeType: 'mimeType',
  contentHash: 'contentHash',
  chainHash: 'chainHash',
  approvedBy: 'approvedBy',
  approvedAt: 'approvedAt',
  createdAt: 'createdAt'
};

exports.Prisma.DocumentAccessLogScalarFieldEnum = {
  id: 'id',
  documentId: 'documentId',
  userId: 'userId',
  action: 'action',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  createdAt: 'createdAt'
};

exports.Prisma.EvidenceExhibitScalarFieldEnum = {
  id: 'id',
  packId: 'packId',
  exhibitNumber: 'exhibitNumber',
  category: 'category',
  contentHash: 'contentHash',
  title: 'title',
  description: 'description',
  url: 'url',
  sourceRecordId: 'sourceRecordId',
  sourceTable: 'sourceTable',
  sortOrder: 'sortOrder',
  createdAt: 'createdAt',
  createdBy: 'createdBy'
};

exports.Prisma.EvidenceCustodyEntryScalarFieldEnum = {
  id: 'id',
  packId: 'packId',
  actorId: 'actorId',
  actorType: 'actorType',
  action: 'action',
  stateHash: 'stateHash',
  exhibitRef: 'exhibitRef',
  note: 'note',
  ipAddress: 'ipAddress',
  createdAt: 'createdAt'
};

exports.Prisma.EngagementScalarFieldEnum = {
  id: 'id',
  caseId: 'caseId',
  type: 'type',
  status: 'status',
  scopeOfWork: 'scopeOfWork',
  feeModel: 'feeModel',
  disbursements: 'disbursements',
  estimatedDuration: 'estimatedDuration',
  advancePaymentRequired: 'advancePaymentRequired',
  advancePaymentAmount: 'advancePaymentAmount',
  clientConsentText: 'clientConsentText',
  clientConsentedAt: 'clientConsentedAt',
  clientConsentIp: 'clientConsentIp',
  clientConsentUserAgent: 'clientConsentUserAgent',
  lawyerReviewStatus: 'lawyerReviewStatus',
  lawyerReviewNotes: 'lawyerReviewNotes',
  lawyerReviewedAt: 'lawyerReviewedAt',
  firmId: 'firmId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ConflictCheckScalarFieldEnum = {
  id: 'id',
  caseId: 'caseId',
  lawFirmId: 'lawFirmId',
  lawyerProfileId: 'lawyerProfileId',
  status: 'status',
  adversePartyType: 'adversePartyType',
  adversePartyId: 'adversePartyId',
  adversePartyName: 'adversePartyName',
  previousWork: 'previousWork',
  conflictRationale: 'conflictRationale',
  reviewedByAdminId: 'reviewedByAdminId',
  reviewedAt: 'reviewedAt',
  waiverApproved: 'waiverApproved',
  waiverApprovedBy: 'waiverApprovedBy',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.LawyerProfileScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  lawFirmId: 'lawFirmId',
  fullName: 'fullName',
  email: 'email',
  callToBarNumber: 'callToBarNumber',
  yearOfCall: 'yearOfCall',
  nbaNumber: 'nbaNumber',
  nbaYear: 'nbaYear',
  specializationAreas: 'specializationAreas',
  isPrincipalPartner: 'isPrincipalPartner',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.LawyerDocumentScalarFieldEnum = {
  id: 'id',
  engagementId: 'engagementId',
  documentId: 'documentId',
  reviewStatus: 'reviewStatus',
  lawyerNotes: 'lawyerNotes',
  redlinedUrl: 'redlinedUrl',
  approvedAt: 'approvedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SubscriptionPlanScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  priceMonthly: 'priceMonthly',
  priceYearly: 'priceYearly',
  currency: 'currency',
  features: 'features',
  maxListings: 'maxListings',
  maxUsers: 'maxUsers',
  maxProperties: 'maxProperties',
  supportLevel: 'supportLevel',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.UserSubscriptionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  planId: 'planId',
  status: 'status',
  currentPeriodStart: 'currentPeriodStart',
  currentPeriodEnd: 'currentPeriodEnd',
  cancelAtPeriodEnd: 'cancelAtPeriodEnd',
  cancelledAt: 'cancelledAt',
  endedAt: 'endedAt',
  paystackCustomerId: 'paystackCustomerId',
  paystackSubscriptionCode: 'paystackSubscriptionCode',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AgentInviteScalarFieldEnum = {
  id: 'id',
  landlordId: 'landlordId',
  agentId: 'agentId',
  email: 'email',
  token: 'token',
  status: 'status',
  acceptedAt: 'acceptedAt',
  revokedAt: 'revokedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.InvoiceScalarFieldEnum = {
  id: 'id',
  invoiceNumber: 'invoiceNumber',
  landlordId: 'landlordId',
  tenantId: 'tenantId',
  listingId: 'listingId',
  agreementId: 'agreementId',
  type: 'type',
  amount: 'amount',
  currency: 'currency',
  status: 'status',
  dueDate: 'dueDate',
  paidAt: 'paidAt',
  items: 'items',
  notes: 'notes',
  pdfUrl: 'pdfUrl',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};
exports.UserRole = exports.$Enums.UserRole = {
  landlord: 'landlord',
  tenant: 'tenant',
  agent: 'agent',
  realtor: 'realtor',
  admin: 'admin',
  estate_manager: 'estate_manager'
};

exports.IdType = exports.$Enums.IdType = {
  nin: 'nin',
  bvn: 'bvn',
  passport: 'passport',
  drivers_licence: 'drivers_licence',
  voters_card: 'voters_card'
};

exports.EmploymentStatus = exports.$Enums.EmploymentStatus = {
  employed: 'employed',
  self_employed: 'self_employed',
  business_owner: 'business_owner',
  student: 'student',
  retired: 'retired',
  unemployed: 'unemployed'
};

exports.EmploymentType = exports.$Enums.EmploymentType = {
  full_time: 'full_time',
  part_time: 'part_time',
  contract: 'contract',
  freelance: 'freelance',
  internship: 'internship'
};

exports.AgentTier = exports.$Enums.AgentTier = {
  standard: 'standard',
  senior: 'senior',
  probation: 'probation'
};

exports.ListingType = exports.$Enums.ListingType = {
  rent: 'rent',
  sale: 'sale',
  short_let: 'short_let',
  share: 'share',
  commercial: 'commercial'
};

exports.PropertyType = exports.$Enums.PropertyType = {
  apartment: 'apartment',
  house: 'house',
  duplex: 'duplex',
  land: 'land',
  office: 'office',
  shop: 'shop',
  warehouse: 'warehouse'
};

exports.ListingStatus = exports.$Enums.ListingStatus = {
  draft: 'draft',
  active: 'active',
  suspended: 'suspended',
  deleted: 'deleted'
};

exports.VerificationTier = exports.$Enums.VerificationTier = {
  basic: 'basic',
  verified: 'verified',
  inspected: 'inspected',
  certified: 'certified'
};

exports.FlagType = exports.$Enums.FlagType = {
  fraud: 'fraud',
  duplicate: 'duplicate',
  misleading: 'misleading',
  wrong_price: 'wrong_price',
  harassment: 'harassment',
  other: 'other'
};

exports.FlagStatus = exports.$Enums.FlagStatus = {
  open: 'open',
  reviewed: 'reviewed',
  dismissed: 'dismissed'
};

exports.VerificationLayerStatus = exports.$Enums.VerificationLayerStatus = {
  pending: 'pending',
  approved: 'approved',
  rejected: 'rejected'
};

exports.VerificationOverallStatus = exports.$Enums.VerificationOverallStatus = {
  not_started: 'not_started',
  in_progress: 'in_progress',
  certified: 'certified',
  rejected: 'rejected',
  frozen: 'frozen'
};

exports.TransactionType = exports.$Enums.TransactionType = {
  rent: 'rent',
  caution: 'caution',
  sale: 'sale',
  short_let: 'short_let',
  subscription: 'subscription'
};

exports.TransactionStatus = exports.$Enums.TransactionStatus = {
  pending: 'pending',
  in_escrow: 'in_escrow',
  released: 'released',
  failed: 'failed',
  refunded: 'refunded'
};

exports.AgreementType = exports.$Enums.AgreementType = {
  rental: 'rental',
  sale: 'sale',
  short_let: 'short_let',
  share: 'share'
};

exports.AgreementStatus = exports.$Enums.AgreementStatus = {
  draft: 'draft',
  pending_landlord: 'pending_landlord',
  pending_tenant: 'pending_tenant',
  tenant_signed: 'tenant_signed',
  landlord_signed: 'landlord_signed',
  fully_signed: 'fully_signed',
  terminated: 'terminated',
  expired: 'expired'
};

exports.AgreementLockStatus = exports.$Enums.AgreementLockStatus = {
  mutable: 'mutable',
  locked: 'locked',
  immutable: 'immutable'
};

exports.ConversationStatus = exports.$Enums.ConversationStatus = {
  active: 'active',
  archived: 'archived',
  blocked: 'blocked'
};

exports.MessageAttachmentType = exports.$Enums.MessageAttachmentType = {
  image: 'image',
  document: 'document',
  video: 'video'
};

exports.NotificationType = exports.$Enums.NotificationType = {
  rent_due: 'rent_due',
  payment: 'payment',
  message: 'message',
  verification: 'verification',
  agreement: 'agreement',
  maintenance: 'maintenance',
  screening: 'screening',
  system: 'system'
};

exports.OrgPlanTier = exports.$Enums.OrgPlanTier = {
  starter: 'starter',
  growth: 'growth',
  enterprise: 'enterprise'
};

exports.OrgMemberRole = exports.$Enums.OrgMemberRole = {
  manager: 'manager',
  accountant: 'accountant',
  maintenance: 'maintenance',
  owner_view: 'owner_view'
};

exports.OrgMemberStatus = exports.$Enums.OrgMemberStatus = {
  pending: 'pending',
  active: 'active',
  removed: 'removed'
};

exports.MaintenanceCategory = exports.$Enums.MaintenanceCategory = {
  plumbing: 'plumbing',
  electrical: 'electrical',
  structural: 'structural',
  security: 'security',
  cleaning: 'cleaning',
  other: 'other'
};

exports.MaintenancePriority = exports.$Enums.MaintenancePriority = {
  low: 'low',
  medium: 'medium',
  high: 'high',
  urgent: 'urgent'
};

exports.MaintenanceStatus = exports.$Enums.MaintenanceStatus = {
  open: 'open',
  assigned: 'assigned',
  in_progress: 'in_progress',
  resolved: 'resolved',
  closed: 'closed'
};

exports.SubscriptionStatus = exports.$Enums.SubscriptionStatus = {
  active: 'active',
  trialing: 'trialing',
  past_due: 'past_due',
  cancelled: 'cancelled',
  paused: 'paused'
};

exports.DisputeType = exports.$Enums.DisputeType = {
  tenancy_non_delivery: 'tenancy_non_delivery',
  tenancy_habitability: 'tenancy_habitability',
  tenancy_illegal_eviction: 'tenancy_illegal_eviction',
  tenancy_rent_dispute: 'tenancy_rent_dispute',
  tenancy_utility_dispute: 'tenancy_utility_dispute',
  tenancy_security_deposit: 'tenancy_security_deposit',
  tenancy_disturbance: 'tenancy_disturbance',
  sale_agreement_breach: 'sale_agreement_breach',
  sale_fraudulent_misrepresentation: 'sale_fraudulent_misrepresentation',
  sale_title_dispute: 'sale_title_dispute',
  sale_payment_dispute: 'sale_payment_dispute',
  paystack_chargeback: 'paystack_chargeback',
  other: 'other'
};

exports.DisputeStatus = exports.$Enums.DisputeStatus = {
  open: 'open',
  investigating: 'investigating',
  routed: 'routed',
  consent_required: 'consent_required',
  consent_granted: 'consent_granted',
  conflict_check: 'conflict_check',
  engaged: 'engaged',
  mediated: 'mediated',
  resolved: 'resolved',
  closed: 'closed'
};

exports.ScreeningCallStatus = exports.$Enums.ScreeningCallStatus = {
  scheduled: 'scheduled',
  completed: 'completed',
  cancelled: 'cancelled',
  no_show: 'no_show'
};

exports.EmailStatus = exports.$Enums.EmailStatus = {
  sent: 'sent',
  failed: 'failed',
  bounced: 'bounced'
};

exports.UnitStatus = exports.$Enums.UnitStatus = {
  AVAILABLE: 'AVAILABLE',
  RENTED: 'RENTED',
  MAINTENANCE: 'MAINTENANCE',
  UNAVAILABLE: 'UNAVAILABLE'
};

exports.UnitOccupancy = exports.$Enums.UnitOccupancy = {
  VACANT: 'VACANT',
  OCCUPIED: 'OCCUPIED',
  NOTICE_GIVEN: 'NOTICE_GIVEN'
};

exports.ApplicationStatus = exports.$Enums.ApplicationStatus = {
  pending: 'pending',
  under_review: 'under_review',
  accepted: 'accepted',
  rejected: 'rejected',
  withdrawn: 'withdrawn'
};

exports.StampDutyStatus = exports.$Enums.StampDutyStatus = {
  pending: 'pending',
  payment_pending: 'payment_pending',
  payment_failed: 'payment_failed',
  paid: 'paid',
  processing: 'processing',
  issued: 'issued',
  failed: 'failed'
};

exports.ShortletStatus = exports.$Enums.ShortletStatus = {
  pending: 'pending',
  approved: 'approved',
  rejected: 'rejected',
  revoked: 'revoked',
  withdrawn: 'withdrawn'
};

exports.LawyerVerificationStatus = exports.$Enums.LawyerVerificationStatus = {
  pending: 'pending',
  under_review: 'under_review',
  verified: 'verified',
  rejected: 'rejected',
  suspended: 'suspended'
};

exports.LawFirmCaseStatus = exports.$Enums.LawFirmCaseStatus = {
  assigned: 'assigned',
  in_progress: 'in_progress',
  resolved: 'resolved',
  cancelled: 'cancelled'
};

exports.EngagementType = exports.$Enums.EngagementType = {
  full_representation: 'full_representation',
  advisory_only: 'advisory_only',
  document_review: 'document_review',
  limited_scope: 'limited_scope'
};

exports.InvoiceStatus = exports.$Enums.InvoiceStatus = {
  draft: 'draft',
  sent: 'sent',
  paid: 'paid',
  overdue: 'overdue',
  cancelled: 'cancelled'
};

exports.UtilityType = exports.$Enums.UtilityType = {
  electricity: 'electricity',
  water: 'water',
  waste: 'waste',
  security: 'security',
  other: 'other'
};

exports.TurnoverTaskStatus = exports.$Enums.TurnoverTaskStatus = {
  pending: 'pending',
  assigned: 'assigned',
  in_progress: 'in_progress',
  completed: 'completed',
  cancelled: 'cancelled'
};

exports.TurnoverTaskPriority = exports.$Enums.TurnoverTaskPriority = {
  low: 'low',
  medium: 'medium',
  high: 'high',
  urgent: 'urgent'
};

exports.BusinessVerificationStatus = exports.$Enums.BusinessVerificationStatus = {
  pending: 'pending',
  approved: 'approved',
  rejected: 'rejected'
};

exports.DocumentAccessAction = exports.$Enums.DocumentAccessAction = {
  view: 'view',
  download: 'download',
  print: 'print',
  share: 'share'
};

exports.EngagementStatus = exports.$Enums.EngagementStatus = {
  draft: 'draft',
  sent_to_client: 'sent_to_client',
  consent_pending: 'consent_pending',
  consent_rejected: 'consent_rejected',
  consent_accepted: 'consent_accepted',
  active: 'active',
  completed: 'completed',
  withdrawn: 'withdrawn'
};

exports.ConflictCheckStatus = exports.$Enums.ConflictCheckStatus = {
  not_checked: 'not_checked',
  clear: 'clear',
  conflict: 'conflict',
  waived: 'waived'
};

exports.AgentInviteStatus = exports.$Enums.AgentInviteStatus = {
  pending: 'pending',
  accepted: 'accepted',
  revoked: 'revoked'
};

exports.InvoiceType = exports.$Enums.InvoiceType = {
  rent: 'rent',
  service: 'service',
  utility: 'utility',
  agreement: 'agreement',
  other: 'other'
};

exports.Prisma.ModelName = {
  User: 'User',
  RefreshToken: 'RefreshToken',
  PasswordReset: 'PasswordReset',
  PhoneOtp: 'PhoneOtp',
  Listing: 'Listing',
  ListingImage: 'ListingImage',
  SavedListing: 'SavedListing',
  ListingFlag: 'ListingFlag',
  Verification: 'Verification',
  VerificationDocument: 'VerificationDocument',
  Transaction: 'Transaction',
  Agreement: 'Agreement',
  AgreementSignature: 'AgreementSignature',
  RentSchedule: 'RentSchedule',
  Conversation: 'Conversation',
  Message: 'Message',
  Notification: 'Notification',
  Organisation: 'Organisation',
  OrgMember: 'OrgMember',
  OrgListing: 'OrgListing',
  MaintenanceTicket: 'MaintenanceTicket',
  OrgSubscription: 'OrgSubscription',
  Dispute: 'Dispute',
  ScreeningCall: 'ScreeningCall',
  EmailLog: 'EmailLog',
  AdminAuditLog: 'AdminAuditLog',
  Unit: 'Unit',
  Application: 'Application',
  StampDuty: 'StampDuty',
  CalendarSlot: 'CalendarSlot',
  PricingRule: 'PricingRule',
  Booking: 'Booking',
  TenantShortlet: 'TenantShortlet',
  LawFirm: 'LawFirm',
  LawFirmCase: 'LawFirmCase',
  ServiceCharge: 'ServiceCharge',
  UtilityAllocation: 'UtilityAllocation',
  TurnoverTask: 'TurnoverTask',
  BusinessProfile: 'BusinessProfile',
  BusinessVerification: 'BusinessVerification',
  EvidencePack: 'EvidencePack',
  Document: 'Document',
  DocumentVersion: 'DocumentVersion',
  DocumentAccessLog: 'DocumentAccessLog',
  EvidenceExhibit: 'EvidenceExhibit',
  EvidenceCustodyEntry: 'EvidenceCustodyEntry',
  Engagement: 'Engagement',
  ConflictCheck: 'ConflictCheck',
  LawyerProfile: 'LawyerProfile',
  LawyerDocument: 'LawyerDocument',
  SubscriptionPlan: 'SubscriptionPlan',
  UserSubscription: 'UserSubscription',
  AgentInvite: 'AgentInvite',
  Invoice: 'Invoice'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
