// src/lib/fetchers/repos.ts

import { toast } from "sonner";
import { showErrorToast } from "../handle-error";
import { z } from "zod";

const backendURL =
  typeof window !== "undefined"
    ? window.ENV.BACKEND_URL
    : process.env.BACKEND_URL;

// Define Zod schemas based on Prisma model
const RepoSchema = z.object({
  id: z.string().cuid(),
  userId: z.string(),
  sourceJs: z.string(),
  sourceCss: z.string(),
  visibility: z.enum(["public", "private"]).default("public"),
  status: z.enum(["pending", "active", "rejected"]).default("pending"),
  name: z.string(),
  description: z.string().optional(),
  language: z.enum(["JSX", "TSX"]),
  price: z.number().default(0.0),
  tags: z.array(z.string()),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  deletedAt: z.string().datetime().nullable(),
});

const CreateRepoSchema = RepoSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
}).extend({
  userId: z.string().optional(), // userId might be set from context
});

const UpdateRepoSchema = RepoSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
}).partial();

type RepoData = z.infer<typeof CreateRepoSchema>;
type RepoResponse = z.infer<typeof RepoSchema>;
type UpdateRepoData = z.infer<typeof UpdateRepoSchema>;

const SearchParamsSchema = z.object({
  visibility: z.enum(["public", "private"]).optional(),
  tags: z.array(z.string()).optional(),
  language: z.enum(["JSX", "TSX"]).optional(),
  userId: z.string().optional(),
  query: z.string().optional(),
});

type SearchParams = z.infer<typeof SearchParamsSchema>;

/**
 * Create a new repository.
 * @param data - The repository data.
 * @returns The created repository data.
 */
export const createRepo = async (
  data: RepoData,
): Promise<RepoResponse | null> => {
  try {
    const response = await fetch(`${backendURL}/repos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const res = await response.json();
    if (!response.ok) {
      throw new Error(res.message);
    }
    toast.success("Repo created successfully.");
    return res;
  } catch (error: unknown) {
    showErrorToast(error);
    return null;
  }
};

/**
 * Get a repository by ID.
 * @param id - The ID of the repository.
 * @returns The repository data.
 */
export const getRepoById = async (id: string): Promise<RepoResponse | null> => {
  try {
    const response = await fetch(`${backendURL}/repos/${id}`);
    const data = await response.json();
    if (response.ok) {
      return RepoSchema.parse(data);
    } else {
      throw new Error(data.message);
    }
  } catch (error: unknown) {
    showErrorToast(error);
    return null;
  }
};

/**
 * Update a repository.
 * @param id - The ID of the repository.
 * @param data - The data to update the repository.
 * @returns The updated repository data.
 */
export const updateRepo = async (
  id: string,
  data: UpdateRepoData,
): Promise<RepoResponse | null> => {
  try {
    const response = await fetch(`${backendURL}/repos/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const res = await response.json();
    if (!response.ok) {
      throw new Error(res.message);
    }
    toast.success("Repo updated successfully.");
    return RepoSchema.parse(res);
  } catch (error: unknown) {
    showErrorToast(error);
    return null;
  }
};

/**
 * Delete a repository by ID.
 * @param id - The ID of the repository.
 */
export const deleteRepo = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${backendURL}/repos/${id}`, {
      method: "DELETE",
    });

    const res = await response.json();
    if (!response.ok) {
      throw new Error(res.message);
    }
    toast.success("Repo deleted successfully.");
  } catch (error: unknown) {
    showErrorToast(error);
  }
};

/**
 * Get paginated repositories.
 * @param page - The page number for pagination.
 * @param limit - The number of items per page.
 * @returns The paginated repositories data.
 */
export const getPaginatedRepos = async (
  page: number = 1,
  limit: number = 10,
): Promise<{ data: RepoResponse[]; total: number } | null> => {
  try {
    const response = await fetch(
      `${backendURL}/repos?page=${page}&limit=${limit}`,
    );
    const data = await response.json();
    if (response.ok) {
      return {
        data: data.data.map((repo: unknown) => RepoSchema.parse(repo)),
        total: data.total,
      };
    } else {
      throw new Error(data.message);
    }
  } catch (error: unknown) {
    showErrorToast(error);
    return null;
  }
};

/**
 * Search repositories based on parameters.
 * @param params - The search parameters.
 * @returns The repositories matching the search criteria.
 */
export const searchRepos = async (
  params: SearchParams,
): Promise<RepoResponse[] | null> => {
  const queryString = new URLSearchParams(
    SearchParamsSchema.parse(params) as Record<string, string>,
  ).toString();
  try {
    const response = await fetch(`${backendURL}/repos/search?${queryString}`);
    const data = await response.json();
    if (response.ok) {
      return data.map((repo: unknown) => RepoSchema.parse(repo));
    } else {
      throw new Error(data.message);
    }
  } catch (error: unknown) {
    showErrorToast(error);
    return null;
  }
};

/**
 * Get repositories by user ID.
 * @param userId - The ID of the user.
 * @returns The repositories of the user.
 */
export const getReposByUser = async (
  userId: string,
): Promise<RepoResponse[] | null> => {
  try {
    const response = await fetch(`${backendURL}/repos/user/${userId}`);
    const data = await response.json();
    if (response.ok) {
      return data.map((repo: unknown) => RepoSchema.parse(repo));
    } else {
      throw new Error(data.message);
    }
  } catch (error: unknown) {
    showErrorToast(error);
    return null;
  }
};

/**
 * Get all repositories.
 * @returns A list of all repositories.
 */
export const getAllRepos = async (): Promise<RepoResponse[] | null> => {
  try {
    const response = await fetch(`${backendURL}/repos/all`);
    const data = await response.json();
    if (response.ok) {
      return data.map((repo: unknown) => RepoSchema.parse(repo));
    } else {
      throw new Error(data.message);
    }
  } catch (error: unknown) {
    showErrorToast(error);
    return null;
  }
};
