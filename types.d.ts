const Role = {
  USER: "USER",
  ADMIN: "ADMIN",
  MODERATOR: "MODERATOR",
  SELLER: "SELLER",
} as const;
type BackendRole = (typeof Role)[keyof typeof Role];
const CodeRepoStatus = {
  pending: "pending",
  active: "active",
  rejected: "rejected",
} as const;
type BackendCodeRepoStatus =
  (typeof CodeRepoStatus)[keyof typeof CodeRepoStatus];
const Visibility = {
  public: "public",
  private: "private",
} as const;
type BackendVisibility = (typeof Visibility)[keyof typeof Visibility];
const Language = {
  JSX: "JSX",
  TSX: "TSX",
} as const;
type BackendLanguage = (typeof Language)[keyof typeof Language];
const OrderStatus = {
  pending: "pending",
  completed: "completed",
  cancelled: "cancelled",
} as const;
type BackendOrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];
const SupportTicketStatus = {
  inProgress: "inProgress",
  todo: "todo",
  backlog: "backlog",
  done: "done",
} as const;
type BackendSupportTicketStatus =
  (typeof SupportTicketStatus)[keyof typeof SupportTicketStatus];
const SupportTicketType = {
  general: "general",
  technical: "technical",
  payment: "payment",
} as const;
type BackendSupportTicketType =
  (typeof SupportTicketType)[keyof typeof SupportTicketType];

type BackendGenerated<T> =
  T extends ColumnType<infer S, infer I, infer U>
    ? ColumnType<S, I | undefined, U>
    : ColumnType<T, T | undefined, T>;
type BackendTimestamp = ColumnType<Date, Date | string, Date | string>;

type BackendCodeRepo = {
  id: string;
  userId: string;
  sourceJs: string;
  sourceCss: string;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  visibility: Generated<string>;
  status: Generated<CodeRepoStatus>;
  name: string;
  description: string | null;
  language: Language;
  price: Generated<number>;
};
type BackendCodeRepoToTag = {
  A: string;
  B: string;
};
type BackendComment = {
  id: string;
  content: string;
  userId: string;
  reviewId: string;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  deletedAt: Timestamp | null;
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
  status: Generated<OrderStatus>;
  totalAmount: number;
};
type BackendPasswordResetToken = {
  id: Generated<number>;
  tokenHash: string;
  userId: string;
  expiresAt: Timestamp;
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
};
type BackendUser = {
  id: string;
  email: string;
  // passwordHash: string;
  emailVerified: Generated<boolean>;
  role: Generated<Role>;

  bannedUntil: Timestamp | null;
  isSellerVerified: Generated<boolean>;
};
type BackendDB = {
  _CodeRepoToTag: CodeRepoToTag;
  CodeRepo: CodeRepo;
  Comment: Comment;
  emailVerificationCode: emailVerificationCode;
  Media: Media;
  Order: Order;
  PasswordResetToken: PasswordResetToken;
  Profile: Profile;
  Review: Review;
  SellerProfile: SellerProfile;
  Session: Session;
  SupportTicket: SupportTicket;
  Tag: Tag;
  User: User;
};
