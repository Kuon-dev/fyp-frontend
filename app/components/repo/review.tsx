import React, { useEffect, useState, useRef, useCallback } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Star, ThumbsUp, ThumbsDown, MessageCircle } from "lucide-react";
import useReviewStore from "@/stores/review-store";

interface User {
  id: string;
  name?: string;
  avatar?: string;
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
  commentCount: number;
  repoId: string;
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
  } = useReviewStore();

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
      <AddReviewForm
        onSubmit={(newReviewData) => addReview(repoId, newReviewData)}
      />
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
                        onClick={() => handleExpandToggle(review.id)}
                        className="flex items-center gap-1"
                      >
                        <MessageCircle className="w-4 h-4" />
                        {review.commentCount || 0}{" "}
                        {review.commentCount === 1 ? "Comment" : "Comments"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleExpandToggle(review.id)}
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
                      {comments[review.id]?.data.map((comment) => (
                        <CommentComponent
                          key={comment.id}
                          comment={comment}
                          onVote={(commentId, voteType) =>
                            handleCommentVote(repoId, commentId, voteType)
                          }
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
                      <AddCommentForm
                        onSubmit={(content) =>
                          addComment(repoId, review.id, content)
                        }
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
      {loadingReviews && <p>Loading more reviews...</p>}
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
          .map((n: string) => n[0])
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
