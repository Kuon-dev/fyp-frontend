import React, { useEffect, useState, useRef, useCallback } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Flag,
  Edit,
} from "lucide-react";
import useReviewStore from "@/stores/review-store";
import { useUserStore } from "@/stores/user-store";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface User {
  id: string;
  name?: string;
  avatar?: string;
  profile: BackendProfile;
}

interface Review {
  id: string;
  content: string;
  userId: string;
  user?: User;
  rating: number;
  createdAt: string;
  updatedAt: string;
  upvotes: number;
  downvotes: number;
  commentCount?: number | undefined;
  repoId: string;
}

interface ReviewItemProps {
  review: Review;
  repoId: string;
  onVote: (reviewId: string, voteType: "upvote" | "downvote") => void;
  onReport: (
    repoId: string,
    reviewId: string,
    flag: UserCommentFlagType,
  ) => void;
  onUpdate: (
    repoId: string,
    reviewId: string,
    content: string,
    rating: number,
  ) => void;
  onExpand: (reviewId: string) => void;
  currentUserId?: string;
  isExpanded: boolean;
}

interface CommentComponentProps {
  comment: Comment;
  repoId: string;
  reviewId: string;
  onVote: (
    repoId: string,
    commentId: string,
    voteType: "upvote" | "downvote",
  ) => void;
  onReport: (
    repoId: string,
    reviewId: string,
    commentId: string,
    flag: UserCommentFlagType,
  ) => void;
  onUpdate: (
    repoId: string,
    reviewId: string,
    commentId: string,
    content: string,
  ) => void;
  currentUserId?: string;
}

interface Comment {
  id: string;
  content: string;
  userId: string;
  user?: User;
  createdAt: string;
  updatedAt: string;
  upvotes: number;
  downvotes: number;
}

interface ApiIntegratedReviewComponentProps {
  repoId: string;
}

export default function ReviewComponent({
  repoId,
}: ApiIntegratedReviewComponentProps) {
  const {
    reviews,
    expandedReviews,
    comments,
    loadingReviews,
    loadingComments,
    fetchReviews,
    toggleExpand,
    fetchComments,
    loadMoreReviews,
    loadMoreComments,
    handleVote,
    handleCommentVote,
    addReview,
    addComment,
    reportReview,
    reportComment,
    updateReview,
    updateComment,
  } = useReviewStore();

  const { isLoggedIn, user } = useUserStore();

  const [lastReviewRef, setLastReviewRef] = useState<HTMLDivElement | null>(
    null,
  );

  useEffect(() => {
    if (repoId) {
      fetchReviews(repoId);
    }
  }, [repoId, fetchReviews]);

  const handleExpandToggle = async (reviewId: string) => {
    toggleExpand(reviewId);
    if (!expandedReviews.includes(reviewId) && !comments[reviewId]) {
      await fetchComments(repoId, reviewId);
    }
  };

  const handleAddComment = async (reviewId: string, content: string) => {
    await addComment(repoId, reviewId, content);
  };

  const observer = useRef<IntersectionObserver | null>(null);
  const lastReviewCallback = useCallback(
    (node: HTMLDivElement) => {
      if (loadingReviews) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (
          entries[0].isIntersecting &&
          reviews.meta.page < reviews.meta.lastPage
        ) {
          loadMoreReviews(repoId);
        }
      });
      if (node) observer.current.observe(node);
      setLastReviewRef(node);
    },
    [
      loadingReviews,
      reviews.meta.page,
      reviews.meta.lastPage,
      loadMoreReviews,
      repoId,
    ],
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
      {isLoggedIn ? (
        <AddReviewForm
          onSubmit={(newReviewData) => addReview(repoId, newReviewData)}
          isLoggedIn={isLoggedIn}
        />
      ) : (
        <div className="text-center py-4">
          <p>Please log in to add a review.</p>
          <Button
            onClick={() =>
              toast("Please log in to add a review", {
                action: {
                  label: "Login",
                  onClick: () => {
                    window.location.href = "/login";
                  },
                },
              })
            }
          >
            Log In
          </Button>
        </div>
      )}
      <Separator className="my-8" />
      <div className="grid gap-8">
        {reviews.data.map((review, index) => (
          <React.Fragment key={review.id}>
            <div
              className="grid gap-4"
              ref={
                index === reviews.data.length - 1 ? lastReviewCallback : null
              }
            >
              <ReviewItem
                review={review}
                repoId={repoId}
                onVote={handleVote}
                onReport={reportReview}
                onUpdate={updateReview}
                onExpand={handleExpandToggle}
                currentUserId={user?.user.id}
                isExpanded={expandedReviews.includes(review.id)}
              />
              {expandedReviews.includes(review.id) && (
                <div className="ml-14">
                  {loadingComments[review.id] ? (
                    <p>Loading comments...</p>
                  ) : (
                    <>
                      {comments[review.id]?.data.map((comment) => (
                        <CommentComponent
                          key={comment.id}
                          comment={comment}
                          repoId={repoId}
                          reviewId={review.id}
                          onVote={handleCommentVote}
                          onReport={reportComment}
                          onUpdate={updateComment}
                          currentUserId={user?.user.id}
                        />
                      ))}
                      {comments[review.id] &&
                        comments[review.id].meta.page <
                          comments[review.id].meta.lastPage && (
                          <Button
                            onClick={() => loadMoreComments(repoId, review.id)}
                            disabled={loadingComments[review.id]}
                          >
                            {loadingComments[review.id]
                              ? "Loading..."
                              : "Load More Comments"}
                          </Button>
                        )}
                      {isLoggedIn ? (
                        <AddCommentForm
                          onSubmit={(content) =>
                            handleAddComment(review.id, content)
                          }
                        />
                      ) : (
                        <div className="text-center py-4">
                          <p>Please log in to add a comment.</p>
                          <Button
                            onClick={() =>
                              toast("Please log in to add a comment", {
                                action: {
                                  label: "Login",
                                  onClick: () => {
                                    window.location.href = "/login";
                                  },
                                },
                              })
                            }
                          >
                            Log In
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
            <Separator />
          </React.Fragment>
        ))}
      </div>
      {loadingReviews && <p>Loading more reviews...</p>}
    </div>
  );
}

const ReviewItem: React.FC<ReviewItemProps> = ({
  review,
  repoId,
  onVote,
  onReport,
  onUpdate,
  onExpand,
  currentUserId,
  isExpanded,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(review.content);
  const [editedRating, setEditedRating] = useState(review.rating);

  const handleUpdate = () => {
    onUpdate(repoId, review.id, editedContent, editedRating);
    setIsEditing(false);
  };

  return (
    <div className="flex items-start gap-4">
      <Avatar className="w-10 h-10 border">
        <AvatarImage
          src={review.user?.avatar || "/placeholder-user.jpg"}
          alt={review.user?.name}
        />
        <AvatarFallback>
          {review.user?.name
            ?.split(" ")
            .map((n) => n[0])
            .join("") || "U"}
        </AvatarFallback>
      </Avatar>
      <div className="grid gap-2 flex-1">
        {isEditing ? (
          <>
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Rating:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <Button
                  key={star}
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditedRating(star)}
                  className={
                    star <= editedRating ? "text-yellow-400" : "text-gray-300"
                  }
                >
                  <Star className="w-5 h-5" />
                </Button>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button onClick={handleUpdate}>Save</Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">
                {review.content.split(" ").slice(0, 5).join(" ")}...
              </h3>
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < review.rating
                        ? "fill-primary text-primary"
                        : "fill-muted text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <ReportDialog
                onReport={(flag) => onReport(repoId, review.id, flag)}
              />
              {currentUserId === review.userId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              <p>
                {isExpanded
                  ? review.content
                  : `${review.content.slice(0, 150)}...`}
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div>- {review.user?.profile?.name || "Anonymous"}</div>
              <div>·</div>
              <time>{new Date(review.createdAt).toLocaleDateString()}</time>
              <div className="flex items-center gap-2">
                <VoteButton
                  icon={ThumbsUp}
                  count={review.upvotes}
                  onClick={() => onVote(review.id, "upvote")}
                />
                <VoteButton
                  icon={ThumbsDown}
                  count={review.downvotes}
                  onClick={() => onVote(review.id, "downvote")}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onExpand(review.id)}
                  className="flex items-center gap-1"
                >
                  <MessageCircle className="w-4 h-4" />
                  {review.commentCount || 0}{" "}
                  {review.commentCount === 1 ? "Comment" : "Comments"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onExpand(review.id)}
                >
                  {isExpanded ? "Read Less" : "Read More"}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const CommentComponent: React.FC<CommentComponentProps> = ({
  comment,
  repoId,
  reviewId,
  onVote,
  onReport,
  onUpdate,
  currentUserId,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);

  const handleUpdate = () => {
    onUpdate(repoId, reviewId, comment.id, editedContent);
    setIsEditing(false);
  };

  return (
    <div className="flex items-start gap-4 mt-4">
      <Avatar className="w-8 h-8 border">
        <AvatarImage
          src={comment.user?.avatar || "/placeholder-user.jpg"}
          alt={comment.user?.name}
        />
        <AvatarFallback>
          {comment.user?.name
            ?.split(" ")
            .map((n: string) => n[0])
            .join("") || "U"}
        </AvatarFallback>
      </Avatar>
      <div className="grid gap-2 flex-1">
        {isEditing ? (
          <>
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <div className="flex justify-end gap-2">
              <Button onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button onClick={handleUpdate}>Save</Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium">
                {comment.user?.profile?.name || "Anonymous"}
              </h4>
              <div className="flex items-center gap-2">
                <VoteButton
                  icon={ThumbsUp}
                  count={comment.upvotes}
                  onClick={() => onVote(repoId, comment.id, "upvote")}
                />
                <VoteButton
                  icon={ThumbsDown}
                  count={comment.downvotes}
                  onClick={() => onVote(repoId, comment.id, "downvote")}
                />
                <ReportDialog
                  onReport={(flag) =>
                    onReport(repoId, reviewId, comment.id, flag)
                  }
                />
                {currentUserId === comment.userId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>{comment.content}</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <time>{new Date(comment.createdAt).toLocaleDateString()}</time>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

interface VoteButtonProps {
  icon: React.FC<React.ComponentProps<"svg">>;
  count: number;
  onClick: () => void;
}

const VoteButton: React.FC<VoteButtonProps> = ({
  icon: Icon,
  count,
  onClick,
}) => (
  <div className="flex items-center gap-2">
    <Button
      variant="ghost"
      size="icon"
      className="w-4 h-4 hover:bg-transparent text-stone-400 hover:text-stone-900"
      onClick={onClick}
    >
      <Icon className="w-4 h-4" />
      <span className="sr-only">Vote</span>
    </Button>
    <div className="text-sm text-muted-foreground">{count}</div>
  </div>
);

interface AddCommentFormProps {
  onSubmit: (content: string) => void;
}

const AddCommentForm: React.FC<AddCommentFormProps> = ({ onSubmit }) => {
  const [comment, setComment] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(comment);
    setComment("");
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-2 mt-4">
      <Textarea
        placeholder="Add a comment..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="rounded-md border border-muted px-4 py-2 text-sm"
      />
      <div className="flex justify-end">
        <Button type="submit" size="sm">
          Post Comment
        </Button>
      </div>
    </form>
  );
};

interface AddReviewFormProps {
  onSubmit: (
    review: Omit<
      Review,
      | "id"
      | "userId"
      | "createdAt"
      | "updatedAt"
      | "upvotes"
      | "downvotes"
      | "commentCount"
      | "repoId"
    >,
  ) => void;
}

interface AddReviewFormProps {
  onSubmit: (
    review: Omit<
      Review,
      | "id"
      | "userId"
      | "createdAt"
      | "updatedAt"
      | "upvotes"
      | "downvotes"
      | "commentCount"
      | "repoId"
    >,
  ) => void;
  isLoggedIn: boolean;
}

const AddReviewForm: React.FC<AddReviewFormProps> = ({
  onSubmit,
  isLoggedIn,
}) => {
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ content, rating });
    setContent("");
    setRating(0);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <h2 className="text-xl font-semibold">Add Your Review</h2>
      <Textarea
        placeholder={
          isLoggedIn
            ? "Write your review..."
            : "Please log in to write a review"
        }
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="rounded-md border border-muted px-4 py-2 text-sm"
        disabled={!isLoggedIn}
      />
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Rating:</span>
        {[1, 2, 3, 4, 5].map((star) => (
          <Button
            key={star}
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setRating(star)}
            className={star <= rating ? "text-yellow-400" : "text-gray-300"}
            disabled={!isLoggedIn}
          >
            <Star className="w-5 h-5" />
          </Button>
        ))}
      </div>
      <div className="flex justify-end">
        <Button
          type="submit"
          size="sm"
          disabled={!isLoggedIn || content.trim() === "" || rating === 0}
        >
          {isLoggedIn ? "Post Review" : "Log in to Review"}
        </Button>
      </div>
    </form>
  );
};
const UserCommentFlag = {
  NONE: "NONE",
  SPAM: "SPAM",
  INAPPROPRIATE_LANGUAGE: "INAPPROPRIATE_LANGUAGE",
  HARASSMENT: "HARASSMENT",
  OFF_TOPIC: "OFF_TOPIC",
  FALSE_INFORMATION: "FALSE_INFORMATION",
  OTHER: "OTHER",
} as const;

type UserCommentFlagType =
  (typeof UserCommentFlag)[keyof typeof UserCommentFlag];

interface ReportDialogProps {
  onReport: (flag: UserCommentFlagType) => void;
}

const ReportDialog: React.FC<ReportDialogProps> = ({ onReport }) => {
  const [selectedFlag, setSelectedFlag] = useState<UserCommentFlagType>(
    UserCommentFlag.INAPPROPRIATE_LANGUAGE,
  );
  const [isOpen, setIsOpen] = useState(false);

  const handleReport = () => {
    if (selectedFlag !== UserCommentFlag.NONE) {
      onReport(selectedFlag);
      setIsOpen(false);
      setSelectedFlag(UserCommentFlag.NONE);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Flag className="w-4 h-4 mr-2" />
          Report
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report Content</DialogTitle>
          <DialogDescription>
            Please select a reason for reporting this content.
          </DialogDescription>
        </DialogHeader>
        <Select
          onValueChange={(value) =>
            setSelectedFlag(value as UserCommentFlagType)
          }
          value={selectedFlag}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a reason" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(UserCommentFlag).map(
              ([key, value]) =>
                value !== "NONE" && (
                  <SelectItem key={key} value={value}>
                    {value.replace(/_/g, " ").toLowerCase()}
                  </SelectItem>
                ),
            )}
          </SelectContent>
        </Select>
        <DialogFooter>
          <Button
            onClick={handleReport}
            disabled={selectedFlag === UserCommentFlag.NONE}
          >
            Submit Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
