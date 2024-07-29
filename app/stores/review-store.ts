import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "sonner";
import { showErrorToast } from "@/lib/handle-error";

interface User {
  id: string;
  name?: string;
  avatar?: string;
  profile: BackendProfile;
}

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

interface Review extends BackendReview {
  user?: User;
  commentCount?: number;
}

interface Comment extends BackendComment {
  user?: User;
}

interface Pagination {
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
}

interface ReviewsPagination {
  data: Review[];
  meta: Pagination;
}

interface CommentsPagination {
  data: Comment[];
  meta: Pagination;
}

const getApiBaseUrl = () => {
  if (typeof window !== "undefined") {
    return `${window?.ENV?.BACKEND_URL}/api/v1`;
  }
  // Provide a fallback or default URL for server-side rendering
  return `${process.env.BACKEND_URL}/api/v1`;
};

interface ReviewStore {
  reviews: ReviewsPagination;
  expandedReviews: string[];
  comments: { [key: string]: CommentsPagination };
  loadingReviews: boolean;
  loadingComments: { [key: string]: boolean };
  API_BASE_URL: string;

  setReviews: (reviews: ReviewsPagination) => void;
  toggleExpand: (reviewId: string) => void;
  setComments: (reviewId: string, comments: CommentsPagination) => void;
  setLoadingReviews: (loading: boolean) => void;
  setLoadingComments: (reviewId: string, loading: boolean) => void;

  fetchReviews: (repoId: string, page?: number) => Promise<void>;
  fetchComments: (
    repoId: string,
    reviewId: string,
    page?: number,
  ) => Promise<void>;
  loadMoreReviews: (repoId: string) => Promise<void>;
  loadMoreComments: (repoId: string, reviewId: string) => Promise<void>;
  handleVote: (
    reviewId: string,
    voteType: "upvote" | "downvote",
  ) => Promise<void>;
  handleCommentVote: (
    repoId: string,
    commentId: string,
    voteType: "upvote" | "downvote",
  ) => Promise<void>;
  addReview: (
    repoId: string,
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
  ) => Promise<void>;
  addComment: (
    repoId: string,
    reviewId: string,
    commentContent: string,
  ) => Promise<void>;
  reportReview: (
    repoId: string,
    reviewId: string,
    flag: UserCommentFlagType,
  ) => Promise<void>;
  reportComment: (
    repoId: string,
    reviewId: string,
    commentId: string,
    flag: UserCommentFlagType,
  ) => Promise<void>;
  updateReview: (
    repoId: string,
    reviewId: string,
    content: string,
    rating: number,
  ) => Promise<void>;
  updateComment: (
    repoId: string,
    reviewId: string,
    commentId: string,
    content: string,
  ) => Promise<void>;
}

const useReviewStore = create<ReviewStore>()(
  devtools((set, get) => ({
    reviews: {
      data: [],
      meta: { total: 0, page: 1, perPage: 10, lastPage: 1 },
    },
    expandedReviews: [],
    comments: {},
    loadingReviews: false,
    loadingComments: {},
    API_BASE_URL: getApiBaseUrl(),

    setReviews: (reviews) => set({ reviews }),
    toggleExpand: (reviewId) =>
      set((state) => ({
        expandedReviews: state.expandedReviews.includes(reviewId)
          ? state.expandedReviews.filter((id) => id !== reviewId)
          : [...state.expandedReviews, reviewId],
      })),
    setComments: (reviewId, comments) =>
      set((state) => ({
        comments: {
          ...state.comments,
          [reviewId]: {
            ...comments,
            data:
              comments.meta.page === 1
                ? comments.data
                : [...(state.comments[reviewId]?.data || []), ...comments.data],
          },
        },
      })),
    setLoadingReviews: (loading) => set({ loadingReviews: loading }),
    setLoadingComments: (reviewId, loading) =>
      set((state) => ({
        loadingComments: { ...state.loadingComments, [reviewId]: loading },
      })),

    fetchReviews: async (repoId, page = 1) => {
      get().setLoadingReviews(true);
      try {
        const response = await fetch(
          `${get().API_BASE_URL}/repo/${repoId}/reviews?page=${page}&perPage=10`,
          { credentials: "include" },
        );
        if (!response.ok) throw new Error("Failed to fetch reviews");
        const data: ReviewsPagination = await response.json();
        console.log(data);
        set((state) => ({
          reviews:
            page === 1
              ? data
              : {
                  ...data,
                  data: [...state.reviews.data, ...data.data],
                },
        }));
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        get().setLoadingReviews(false);
      }
    },

    fetchComments: async (repoId, reviewId, page = 1) => {
      get().setLoadingComments(reviewId, true);
      try {
        const response = await fetch(
          `${get().API_BASE_URL}/repo/${repoId}/reviews/${reviewId}?page=${page}&perPage=10`,
          { credentials: "include" },
        );
        if (!response.ok) throw new Error("Failed to fetch comments");
        const data: CommentsPagination = await response.json();
        get().setComments(reviewId, data);
      } catch (error) {
        console.error("Error fetching comments:", error);
      } finally {
        get().setLoadingComments(reviewId, false);
      }
    },

    loadMoreReviews: async (repoId) => {
      const currentPage = get().reviews.meta.page;
      const nextPage = currentPage + 1;
      if (nextPage <= get().reviews.meta.lastPage) {
        await get().fetchReviews(repoId, nextPage);
      }
    },

    loadMoreComments: async (repoId, reviewId) => {
      const currentPage = get().comments[reviewId]?.meta.page || 0;
      const nextPage = currentPage + 1;
      await get().fetchComments(repoId, reviewId, nextPage);
    },

    handleVote: async (reviewId, voteType) => {
      try {
        const response = await fetch(
          `${get().API_BASE_URL}/reviews/${reviewId}/${voteType}`,
          { method: "POST", credentials: "include" },
        );
        if (!response.ok) throw new Error(`Failed to ${voteType} review`);
        // Refresh reviews after voting
        await get().fetchReviews(get().reviews.data[0].repoId);
      } catch (error) {
        console.error(`Error ${voteType}ing review:`, error);
      }
    },

    handleCommentVote: async (repoId, commentId, voteType) => {
      try {
        const response = await fetch(
          `${get().API_BASE_URL}/comments/${commentId}/${voteType}`,
          { method: "POST", credentials: "include" },
        );
        if (!response.ok) throw new Error(`Failed to ${voteType} comment`);
        // Find the review that contains this comment and refresh its comments
        const reviewId = Object.keys(get().comments).find((reviewId) =>
          get().comments[reviewId].data.some(
            (comment) => comment.id === commentId,
          ),
        );
        if (reviewId) await get().fetchComments(repoId, reviewId);
      } catch (error) {
        console.error(`Error ${voteType}ing comment:`, error);
      }
    },

    addReview: async (repoId, newReviewData) => {
      try {
        const response = await fetch(`${get().API_BASE_URL}/reviews`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...newReviewData, repoId }),
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to add review");
        await get().fetchReviews(repoId);
      } catch (error) {
        showErrorToast(error);
        console.error("Error adding review:", error);
      }
    },

    addComment: async (repoId, reviewId, commentContent) => {
      try {
        const response = await fetch(`${get().API_BASE_URL}/comments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: commentContent, reviewId }),
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to add comment");
        // Fetch only the first page of comments after adding a new one
        await get().fetchComments(repoId, reviewId, 1);
      } catch (error) {
        showErrorToast(error);
        console.error("Error adding comment:", error);
      }
    },
    reportReview: async (repoId, reviewId, flag) => {
      try {
        const response = await fetch(
          `${get().API_BASE_URL}/reviews/${reviewId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ flag }),
            credentials: "include",
          },
        );
        if (!response.ok) throw new Error("Failed to report review");
        toast.success("Review reported successfully");
        await get().fetchReviews(repoId);
      } catch (error) {
        console.error("Error reporting review:", error);
        toast.error("Failed to report review");
      }
    },

    reportComment: async (repoId, reviewId, commentId, flag) => {
      try {
        const response = await fetch(
          `${get().API_BASE_URL}/comments/${commentId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ flag }),
            credentials: "include",
          },
        );
        if (!response.ok) throw new Error("Failed to report comment");
        toast.success("Comment reported successfully");
        await get().fetchComments(repoId, reviewId);
      } catch (error) {
        console.error("Error reporting comment:", error);
        toast.error("Failed to report comment");
      }
    },
    updateReview: async (repoId, reviewId, content, rating) => {
      try {
        const response = await fetch(
          `${get().API_BASE_URL}/reviews/${reviewId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content, rating }),
            credentials: "include",
          },
        );
        if (!response.ok) throw new Error("Failed to update review");
        toast.success("Review updated successfully");
        await get().fetchReviews(repoId);
      } catch (error) {
        showErrorToast(error);
        console.error("Error updating review:", error);
      }
    },

    updateComment: async (repoId, reviewId, commentId, content) => {
      try {
        const response = await fetch(
          `${get().API_BASE_URL}/comments/${commentId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content }),
            credentials: "include",
          },
        );
        if (!response.ok) throw new Error("Failed to update comment");
        toast.success("Comment updated successfully");
        await get().fetchComments(repoId, reviewId);
      } catch (error) {
        showErrorToast(error);
        console.error("Error updating comment:", error);
      }
    },
  })),
);

export default useReviewStore;
