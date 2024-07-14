import { create } from "zustand";
import { devtools } from "zustand/middleware";

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

interface CommentsPagination {
  data: Comment[];
  meta: {
    total: number;
    page: number;
    perPage: number;
    lastPage: number;
  };
}

const getApiBaseUrl = () => {
  if (typeof window !== "undefined") {
    return `${window?.ENV?.BACKEND_URL}/api/v1`;
  }
  // Provide a fallback or default URL for server-side rendering
  return `${process.env.BACKEND_URL}/api/v1`;
};

interface ReviewStore {
  reviews: Review[];
  expandedReviews: string[];
  comments: { [key: string]: CommentsPagination };
  loadingComments: { [key: string]: boolean };
  API_BASE_URL: string;

  setReviews: (reviews: Review[]) => void;
  toggleExpand: (reviewId: string) => void;
  setComments: (reviewId: string, comments: CommentsPagination) => void;
  setLoadingComments: (reviewId: string, loading: boolean) => void;

  fetchReviews: (repoId: string) => Promise<void>;
  fetchComments: (
    repoId: string,
    reviewId: string,
    page?: number,
  ) => Promise<void>;
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
}

const useReviewStore = create<ReviewStore>()(
  devtools((set, get) => ({
    reviews: [],
    expandedReviews: [],
    comments: {},
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
          [reviewId]: state.comments[reviewId]
            ? {
                ...comments,
                data: [
                  ...(state.comments[reviewId].data || []),
                  ...comments.data,
                ],
              }
            : comments,
        },
      })),
    setLoadingComments: (reviewId, loading) =>
      set((state) => ({
        loadingComments: { ...state.loadingComments, [reviewId]: loading },
      })),

    fetchReviews: async (repoId) => {
      try {
        const response = await fetch(
          `${get().API_BASE_URL}/reviews?repoId=${repoId}`,
        );
        if (!response.ok) throw new Error("Failed to fetch reviews");
        const data: Review[] = await response.json();
        set({ reviews: data });
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    },

    fetchComments: async (repoId, reviewId, page = 1) => {
      get().setLoadingComments(reviewId, true);
      try {
        const response = await fetch(
          `${get().API_BASE_URL}/repo/${repoId}/reviews/${reviewId}?page=${page}&perPage=10`,
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

    loadMoreComments: async (repoId, reviewId) => {
      const currentPage = get().comments[reviewId]?.meta.page || 0;
      const nextPage = currentPage + 1;
      await get().fetchComments(repoId, reviewId, nextPage);
    },

    handleVote: async (reviewId, voteType) => {
      try {
        const response = await fetch(
          `${get().API_BASE_URL}/reviews/${reviewId}/${voteType}`,
          { method: "POST" },
        );
        if (!response.ok) throw new Error(`Failed to ${voteType} review`);
        // Refresh reviews after voting
        await get().fetchReviews(get().reviews[0].repoId);
      } catch (error) {
        console.error(`Error ${voteType}ing review:`, error);
      }
    },

    handleCommentVote: async (repoId, commentId, voteType) => {
      try {
        const response = await fetch(
          `${get().API_BASE_URL}/comments/${commentId}/${voteType}`,
          { method: "POST" },
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
        });
        if (!response.ok) throw new Error("Failed to add review");
        await get().fetchReviews(repoId);
      } catch (error) {
        console.error("Error adding review:", error);
      }
    },

    addComment: async (repoId, reviewId, commentContent) => {
      try {
        const response = await fetch(`${get().API_BASE_URL}/comments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: commentContent, reviewId }),
        });
        if (!response.ok) throw new Error("Failed to add comment");
        await get().fetchComments(repoId, reviewId);
      } catch (error) {
        console.error("Error adding comment:", error);
      }
    },
  })),
);

export default useReviewStore;
