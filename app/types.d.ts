const CodeRepoStatus = {
  pending: "pending",
  active: "active",
  rejected: "rejected",
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

type Generated<T> =
  T extends ColumnType<infer S, infer I, infer U>
    ? ColumnType<S, I | undefined, U>
    : ColumnType<T, T | undefined, T>;
type Timestamp = ColumnType<Date, Date | string, Date | string>;

type CodeRepo = {
  id: string;
  userId: string;
  source: string;
  language: Language;
  price: Generated<number>;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  visibility: Generated<string>;
  status: Generated<CodeRepoStatus>;
  description: string | null;
  name: string;
};
type CodeRepoToTag = {
  A: string;
  B: string;
};
type emailVerificationCode = {
  id: string;
  code: string;
  userId: string;
  email: string;
  expiresAt: Timestamp;
};
type Media = {
  id: string;
  url: string;
  type: string;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
};
type PasswordResetToken = {
  id: Generated<number>;
  tokenHash: string;
  userId: string;
  expiresAt: Timestamp;
};
type Profile = {
  id: Generated<number>;
  bio: string | null;
  userId: string;
};
type Review = {
  id: string;
  content: string;
  repoId: string;
  rating: Generated<number>;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  deletedAt: Timestamp | null;
};
type Session = {
  id: string;
  userId: string;
  expiresAt: Timestamp;
};
type SupportTicket = {
  id: string;
  email: string;
  title: string;
  content: string;
  status: Generated<SupportTicketStatus>;
  type: Generated<SupportTicketType>;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  userId: string | null;
};
type Tag = {
  id: string;
  name: string;
};
type User = {
  id: string;
  email: string;
  passwordHash: string;
  name: string | null;
  emailVerified: Generated<boolean>;
};
type DB = {
  _CodeRepoToTag: CodeRepoToTag;
  CodeRepo: CodeRepo;
  emailVerificationCode: emailVerificationCode;
  Media: Media;
  PasswordResetToken: PasswordResetToken;
  Profile: Profile;
  Review: Review;
  Session: Session;
  SupportTicket: SupportTicket;
  Tag: Tag;
  User: User;
};
