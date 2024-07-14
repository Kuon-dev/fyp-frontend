import React, { useState, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Star, ThumbsUp, ThumbsDown, MessageCircle } from "lucide-react";

interface User {
  id: string;
  name?: string;
  avatar?: string;
}

interface Review extends BackendReview {
  user?: User;
  commentCount?: number;
}

interface Comment extends BackendComment {
  user?: User;
}

interface ApiIntegratedReviewComponentProps {
  repoId: string;
}

export default function ReviewComponent({
  repoId,
}: ApiIntegratedReviewComponentProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [expandedReviews, setExpandedReviews] = useState<string[]>([]);
  const [comments, setComments] = useState<{ [key: string]: Comment[] }>({});
  const [loadingComments, setLoadingComments] = useState<{
    [key: string]: boolean;
  }>({});
  const API_BASE_URL = `${window?.ENV?.BACKEND_URL}/api/v1`;

  useEffect(() => {
    if (!repoId) return;
    if (!window) return;
    fetchReviews();
  }, [repoId]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/reviews?repoId=${repoId}`);
      if (!response.ok) throw new Error("Failed to fetch reviews");
      const data: Review[] = await response.json();
      setReviews(data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const fetchComments = async (reviewId: string) => {
    setLoadingComments((prev) => ({ ...prev, [reviewId]: true }));
    try {
      const response = await fetch(
        `${API_BASE_URL}/comments?reviewId=${reviewId}`,
      );
      if (!response.ok) throw new Error("Failed to fetch comments");
      const data: Comment[] = await response.json();
      setComments((prev) => ({ ...prev, [reviewId]: data }));
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoadingComments((prev) => ({ ...prev, [reviewId]: false }));
    }
  };

  const toggleExpand = async (reviewId: string) => {
    if (expandedReviews.includes(reviewId)) {
      setExpandedReviews((prev) => prev.filter((id) => id !== reviewId));
    } else {
      setExpandedReviews((prev) => [...prev, reviewId]);
      if (!comments[reviewId]) {
        await fetchComments(reviewId);
      }
    }
  };

  const handleVote = async (
    reviewId: string,
    voteType: "upvote" | "downvote",
  ) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/reviews/${reviewId}/${voteType}`,
        {
          method: "POST",
        },
      );
      if (!response.ok) throw new Error(`Failed to ${voteType} review`);
      await fetchReviews();
    } catch (error) {
      console.error(`Error ${voteType}ing review:`, error);
    }
  };

  const handleCommentVote = async (
    commentId: string,
    voteType: "upvote" | "downvote",
  ) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/comments/${commentId}/${voteType}`,
        {
          method: "POST",
        },
      );
      if (!response.ok) throw new Error(`Failed to ${voteType} comment`);
      const reviewId = reviews.find((review) =>
        comments[review.id]?.some((comment) => comment.id === commentId),
      )?.id;
      if (reviewId) await fetchComments(reviewId);
    } catch (error) {
      console.error(`Error ${voteType}ing comment:`, error);
    }
  };

  const addReview = async (
    newReviewData: Omit<
      BackendReview,
      | "id"
      | "userId"
      | "repoId"
      | "createdAt"
      | "updatedAt"
      | "deletedAt"
      | "flag"
      | "upvotes"
      | "downvotes"
    >,
  ) => {
    try {
      const response = await fetch(`${API_BASE_URL}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...newReviewData, repoId }),
      });
      if (!response.ok) throw new Error("Failed to add review");
      await fetchReviews();
    } catch (error) {
      console.error("Error adding review:", error);
    }
  };

  const addComment = async (reviewId: string, commentContent: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: commentContent, reviewId }),
      });
      if (!response.ok) throw new Error("Failed to add comment");
      await fetchComments(reviewId);
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
      <AddReviewForm onSubmit={addReview} />
      <Separator className="my-8" />
      <div className="grid gap-8">
        {reviews.map((review) => (
          <React.Fragment key={review.id}>
            <div className="grid gap-4">
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
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">
                      {review.content.split(" ").slice(0, 5).join(" ")}...
                    </h3>
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${i < review.rating ? "fill-primary text-primary" : "fill-muted text-muted-foreground"}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>
                      {expandedReviews.includes(review.id)
                        ? review.content
                        : `${review.content.slice(0, 150)}...`}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div>- {review.user?.name || "Anonymous"}</div>
                    <div>·</div>
                    <time>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </time>
                    <div className="flex items-center gap-2">
                      <VoteButton
                        icon={ThumbsUp}
                        count={review.upvotes}
                        onClick={() => handleVote(review.id, "upvote")}
                      />
                      <VoteButton
                        icon={ThumbsDown}
                        count={review.downvotes}
                        onClick={() => handleVote(review.id, "downvote")}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpand(review.id)}
                        className="flex items-center gap-1"
                      >
                        <MessageCircle className="w-4 h-4" />
                        {review.commentCount || 0}{" "}
                        {review.commentCount === 1 ? "Comment" : "Comments"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpand(review.id)}
                      >
                        {expandedReviews.includes(review.id)
                          ? "Read Less"
                          : "Read More"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              {expandedReviews.includes(review.id) && (
                <div className="ml-14">
                  {loadingComments[review.id] ? (
                    <p>Loading comments...</p>
                  ) : (
                    <>
                      {comments[review.id]?.map((comment) => (
                        <CommentComponent
                          key={comment.id}
                          comment={comment}
                          onVote={handleCommentVote}
                        />
                      ))}
                      <AddCommentForm
                        onSubmit={(content) => addComment(review.id, content)}
                      />
                    </>
                  )}
                </div>
              )}
            </div>
            <Separator />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

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

interface CommentComponentProps {
  comment: Comment;
  onVote: (commentId: string, voteType: "upvote" | "downvote") => void;
}

const CommentComponent: React.FC<CommentComponentProps> = ({
  comment,
  onVote,
}) => (
  <div className="flex items-start gap-4 mt-4">
    <Avatar className="w-8 h-8 border">
      <AvatarImage
        src={comment.user?.avatar || "/placeholder-user.jpg"}
        alt={comment.user?.name}
      />
      <AvatarFallback>
        {comment.user?.name
          ?.split(" ")
          .map((n) => n[0])
          .join("") || "U"}
      </AvatarFallback>
    </Avatar>
    <div className="grid gap-2">
      <div className="flex items-center gap-2">
        <h4 className="text-sm font-medium">
          {comment.user?.name || "Anonymous"}
        </h4>
        <div className="flex items-center gap-2">
          <VoteButton
            icon={ThumbsUp}
            count={comment.upvotes}
            onClick={() => onVote(comment.id, "upvote")}
          />
          <VoteButton
            icon={ThumbsDown}
            count={comment.downvotes}
            onClick={() => onVote(comment.id, "downvote")}
          />
        </div>
      </div>
      <div className="text-sm text-muted-foreground">
        <p>{comment.content}</p>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <time>{new Date(comment.createdAt).toLocaleDateString()}</time>
      </div>
    </div>
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
      BackendReview,
      | "id"
      | "userId"
      | "repoId"
      | "createdAt"
      | "updatedAt"
      | "deletedAt"
      | "flag"
      | "upvotes"
      | "downvotes"
    >,
  ) => void;
}

const AddReviewForm: React.FC<AddReviewFormProps> = ({ onSubmit }) => {
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
        placeholder="Write your review..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="rounded-md border border-muted px-4 py-2 text-sm"
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
          >
            <Star className="w-5 h-5" />
          </Button>
        ))}
      </div>
      <div className="flex justify-end">
        <Button type="submit" size="sm">
          Post Review
        </Button>
      </div>
    </form>
  );
};
