type BackendGenerated<T> =
  T extends ColumnType<infer S, infer I, infer U>
    ? ColumnType<S, I | undefined, U>
    : ColumnType<T, T | undefined, T>;
type BackendTimestamp = ColumnType<Date, Date | string, Date | string>;

type BackendBankAccount = {
  id: string;
  sellerProfileId: string;
  accountHolderName: string;
  accountNumber: string;
  bankName: string;
  swiftCode: string;
  iban: string | null;
  routingNumber: string | null;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
};
type BackendCodeCheck = {
  id: string;
  repoId: string;
  securityScore: number;
  maintainabilityScore: number;
  readabilityScore: number;
  securitySuggestion: string;
  maintainabilitySuggestion: string;
  readabilitySuggestion: string;
  overallDescription: string;
  eslintErrorCount: number;
  eslintFatalErrorCount: number;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
};
type BackendCodeRepo = {
  id: string;
  userId: string;
  sourceJs: string;
  sourceCss: string;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  deletedAt: Timestamp | null;
  visibility: Generated<Visibility>;
  status: Generated<CodeRepoStatus>;
  name: string;
  description: string | null;
  language: Language;
  price: Generated<number>;
};
type BackendComment = {
  id: string;
  content: string;
  userId: string;
  reviewId: string;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  deletedAt: Timestamp | null;
  flag: Generated<UserCommentFlag>;
  upvotes: Generated<number>;
  downvotes: Generated<number>;
};
type BackendemailVerificationCode = {
  id: string;
  code: string;
  userId: string;
  email: string;
  expiresAt: Timestamp;
};
type BackendMedia = {
  id: string;
  url: string;
  type: string;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
};
type BackendOrder = {
  id: string;
  userId: string;
  codeRepoId: string;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  deletedAt: Timestamp | null;
  status: Generated<OrderStatus>;
  totalAmount: number;
  stripePaymentIntentId: string | null;
  stripePaymentMethodId: string | null;
  payoutRequestId: string | null;
};
type BackendPasswordResetToken = {
  id: Generated<number>;
  tokenHash: string;
  userId: string;
  expiresAt: Timestamp;
};
type BackendPayout = {
  id: string;
  sellerProfileId: string;
  payoutRequestId: string;
  totalAmount: number;
  currency: string;
  status: Generated<PayoutStatus>;
  stripePayoutId: string | null;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
};
type BackendPayoutRequest = {
  id: string;
  sellerProfileId: string;
  totalAmount: number;
  status: Generated<PayoutRequestStatus>;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  processedAt: Timestamp | null;
  lastPayoutDate: Timestamp | null;
};
type BackendProfile = {
  id: string;
  profileImg: string | null;
  name: string | null;
  phoneNumber: string | null;
  userId: string;
};
type BackendReview = {
  id: string;
  content: string;
  userId: string;
  repoId: string;
  rating: Generated<number>;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  deletedAt: Timestamp | null;
  flag: Generated<UserCommentFlag>;
  upvotes: Generated<number>;
  downvotes: Generated<number>;
};
type BackendSalesAggregate = {
  id: string;
  sellerId: string;
  date: Timestamp;
  revenue: number;
  salesCount: number;
};
type BackendSearchHistory = {
  id: string;
  userId: string;
  tag: string;
  createdAt: Generated<Timestamp>;
};
type BackendSellerProfile = {
  id: string;
  userId: string;
  profileImg: string | null;
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  businessEmail: string;
  identityDoc: string | null;
  verificationDate: Timestamp | null;
  verificationStatus: Generated<SellerVerificationStatus>;
  balance: Generated<number>;
  lastPayoutDate: Timestamp | null;
  bankAccount: BackendBankAccount | null;
};
type BackendSession = {
  id: string;
  userId: string;
  expiresAt: Timestamp;
};
type BackendSupportTicket = {
  id: string;
  email: string;
  title: string;
  content: string;
  status: Generated<SupportTicketStatus>;
  type: Generated<SupportTicketType>;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
};
type BackendTag = {
  id: string;
  name: string;
  repoId: string;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  deletedAt: Timestamp | null;
};
type BackendUser = {
  id: string;
  email: string;
  passwordHash: string;
  emailVerified: Generated<boolean>;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  deletedAt: Timestamp | null;
  bannedUntil: Timestamp | null;
  role: Generated<Role>;
};
const Role = {
  USER: "USER",
  ADMIN: "ADMIN",
  MODERATOR: "MODERATOR",
  SELLER: "SELLER",
} as const;
type Role = (typeof Role)[keyof typeof Role];
const SellerVerificationStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;
type SellerVerificationStatus =
  (typeof SellerVerificationStatus)[keyof typeof SellerVerificationStatus];
const PayoutRequestStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  PROCESSED: "PROCESSED",
} as const;
type PayoutRequestStatus =
  (typeof PayoutRequestStatus)[keyof typeof PayoutRequestStatus];
const PayoutStatus = {
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
} as const;
type PayoutStatus = (typeof PayoutStatus)[keyof typeof PayoutStatus];
const CodeRepoStatus = {
  pending: "pending",
  active: "active",
  rejected: "rejected",
  bannedUser: "bannedUser",
} as const;
type CodeRepoStatus = (typeof CodeRepoStatus)[keyof typeof CodeRepoStatus];
const Visibility = {
  public: "public",
  private: "private",
} as const;
type Visibility = (typeof Visibility)[keyof typeof Visibility];
const Language = {
  JSX: "JSX",
  TSX: "TSX",
} as const;
type Language = (typeof Language)[keyof typeof Language];
const OrderStatus = {
  REQUIRESPAYMENTMETHOD: "REQUIRESPAYMENTMETHOD",
  REQUIRESCONFIRMATION: "REQUIRESCONFIRMATION",
  REQUIRESACTION: "REQUIRESACTION",
  PROCESSING: "PROCESSING",
  REQUIRESCAPTURE: "REQUIRESCAPTURE",
  CANCELLED: "CANCELLED",
  SUCCEEDED: "SUCCEEDED",
} as const;
type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];
const UserCommentFlag = {
  NONE: "NONE",
  SPAM: "SPAM",
  INAPPROPRIATE_LANGUAGE: "INAPPROPRIATE_LANGUAGE",
  HARASSMENT: "HARASSMENT",
  OFF_TOPIC: "OFF_TOPIC",
  FALSE_INFORMATION: "FALSE_INFORMATION",
  OTHER: "OTHER",
} as const;
type UserCommentFlag = (typeof UserCommentFlag)[keyof typeof UserCommentFlag];
const SupportTicketStatus = {
  inProgress: "inProgress",
  todo: "todo",
  backlog: "backlog",
  done: "done",
} as const;
type SupportTicketStatus =
  (typeof SupportTicketStatus)[keyof typeof SupportTicketStatus];
const SupportTicketType = {
  general: "general",
  technical: "technical",
  payment: "payment",
} as const;
type SupportTicketType =
  (typeof SupportTicketType)[keyof typeof SupportTicketType];
