// Main API client and endpoints
export { api, apiEndpoints } from '@/lib/api';
export type { 
  ApiError, 
  ApiResponse, 
  PaginatedResponse, 
  PaginationParams,
  ListingsFilters,
  MessageFilters,
  Listing,
  ListingImage,
  Verification,
  Agreement,
  AgreementSignature,
  Conversation,
  Message,
  Transaction,
  Wallet,
  User,
  UserSummary,
  UserOrganization,
  Organization,
  OrgMember,
  OrgInvite,
  MaintenanceTicket,
  ScreeningCall,
  Dispute,
  UpdateOrganisationInput,
} from '@/lib/api';

// Re-export validator types
export type {
  CreateUserInput,
  UpdateUserInput,
  CreateListingInput,
  UpdateListingInput,
  ListingFilters as ValidatorListingFilters,
  InitiatePaymentInput,
  CreateAgreementInput,
  SignAgreementInput,
  CreateConversationInput,
  SendMessageInput,
  CreateOrganisationInput,
  InviteOrgMemberInput,
  CreateMaintenanceTicketInput,
  UpdateMaintenanceTicketInput,
  ScheduleScreeningInput,
  CreateDisputeInput,
  OnboardingFormData,
} from '@/lib/validators';

// Listings hooks
export {
  listingsKeys,
  useListings,
  useListing,
  useMyListings,
  useSavedListings,
  useCreateListing,
  useUpdateListing,
  useDeleteListing,
  useToggleSaveListing,
  useFlagListing,
  usePrefetchListing,
} from './useListings';

// Verifications hooks
export {
  verificationsKeys,
  useVerificationStatus,
  useAdminVerificationQueue,
  useSubmitLayer1,
  useSubmitLayer2,
  useConfirmLayer2,
  useUploadVideo,
  useRequestInspection,
  useAdminReviewVerification,
  useVerificationProgress,
} from './useVerifications';

// Agreements hooks
export {
  agreementsKeys,
  useAgreements,
  useAgreement,
  useAgreementsByListing,
  useCreateAgreement,
  useUpdateAgreement,
  useSignAgreement,
  useTerminateAgreement,
  useAgreementStatus,
} from './useAgreements';

// Messages hooks (Phase E: Messaging System)
export {
  messagesKeys,
  useConversations,
  useConversation,
  useMessages,
  useCreateConversation,
  useSendMessage,
  useMarkAsRead,
  useArchiveConversation,
  useBlockConversation,
  useReceiveMessage,
  useMessageReadReceipt,
} from './useMessages';

// Conversations hooks (Phase E: New API)
export {
  conversationsKeys,
  useConversations as useConversationsList,
  useConversation as useConversationDetail,
  useMessages as useConversationMessages,
  useCreateConversation as useCreateConversationV2,
  useSendMessage as useSendMessageV2,
  useMarkConversationRead,
  useTypingIndicator,
} from './useConversations';
export type { Conversation, Message, CreateConversationInput, SendMessageInput } from './useConversations';

// Payments hooks
export {
  paymentsKeys,
  useTransactions,
  useTransaction,
  useWallet,
  useInitiatePayment,
  useVerifyPayment,
  useRequestRefund,
  useWithdraw,
  usePaymentStatus,
  usePaymentBreakdown,
} from './usePayments';

// Users hooks
export {
  usersKeys,
  useCurrentUser,
  useUser,
  useUsers,
  useUpdateProfile,
  useCompleteOnboarding,
  useUploadAvatar,
  useVerifyPhone,
  useRequestPhoneOTP,
  useVerifyNIN,
  useVerifyBVN,
  useUserPermissions,
  useUserDisplayName,
  useUserAvatar,
} from './useUsers';

// Organizations hooks
export {
  organizationsKeys,
  useOrganizations,
  useOrganization,
  useOrganizationMembers,
  useOrganizationListings,
  useCreateOrganization,
  useUpdateOrganization,
  useDeleteOrganization,
  useInviteMember,
  useAcceptInvite,
  useRemoveMember,
  useUpdateMemberRole,
  useAddOrganizationListing,
  useRemoveOrganizationListing,
  useOrganizationPermissions,
} from './useOrganizations';

// Organization Tickets hooks
export {
  orgTicketsKeys,
  useOrganizationTickets,
  useOrganizationTicket,
  useCreateOrganizationTicket,
  useUpdateOrganizationTicket,
  useDeleteOrganizationTicket,
  useTicketStatusConfig,
  useTicketPriorityConfig,
} from './useOrganizationTickets';
export type { TicketFilters } from './useOrganizationTickets';

// Maintenance, Screenings, Disputes hooks
export {
  maintenanceKeys,
  useMaintenanceTickets,
  useMaintenanceTicket,
  useCreateMaintenanceTicket,
  useUpdateMaintenanceTicket,
  useAssignMaintenanceTicket,
  useMaintenanceStatus,
  useMaintenancePriority,
  screeningsKeys,
  useScreenings,
  useScreening,
  useScheduleScreening,
  useUpdateScreening,
  useScreeningStatus,
  disputesKeys,
  useDisputes,
  useDispute,
  useCreateDispute,
  useAdminDisputeAction,
  useDisputeStatus,
  useDisputeType,
} from './useMaintenanceScreeningsDisputes';

// Notifications hooks
export {
  useNotifications,
  useUnreadCount,
  useMarkNotificationRead,
  useMarkAllRead,
  useMarkAsRead,
} from './useNotifications';
export type { Notification, NotificationsResponse } from './useNotifications';