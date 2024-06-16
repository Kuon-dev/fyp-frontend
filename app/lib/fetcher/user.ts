// src/lib/fetchers/users.ts
import { toast } from "sonner";
import { showErrorToast } from "../handle-error";
import { z } from "zod";
import { Me } from "@/stores/dashboard-store";

export const getCurrentUserProfileData = async (
  cookieHeader: string,
): Promise<Me | null> => {
  try {
    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/me`, {
      headers: {
        Cookie: cookieHeader,
      },
    });
    const data = await response.json();
    console.log(data);
    if (response.ok) {
      return data as Me;
    } else {
      console.log(data.message);
      return null;
    }
  } catch (error) {
    return null;
  }
};

const backendURL =
  typeof window !== "undefined"
    ? window.ENV.BACKEND_URL
    : process.env.BACKEND_URL;

// Define Zod schemas based on Prisma model
const UserSchema = z.object({
  id: z.string().cuid(),
  email: z.string().email(),
  passwordHash: z.string(),
  emailVerified: z.boolean().default(false),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  deletedAt: z.string().datetime().nullable(),
  bannedUntil: z.string().datetime().nullable(),
  role: z.enum(["USER", "ADMIN", "MODERATOR"]).default("USER"),
  isSellerVerified: z.boolean().default(false),
});

const CreateUserSchema = UserSchema.omit({
  id: true,
  passwordHash: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  bannedUntil: true,
  isSellerVerified: true,
}).extend({
  password: z.string(),
});

const UpdateUserSchema = CreateUserSchema.partial();

const UserProfileSchema = z.object({
  fullname: z.string().optional(),
  businessName: z.string().optional(),
  businessAddress: z.string().optional(),
  businessPhone: z.string().optional(),
  businessEmail: z.string().optional(),
});

type UserData = z.infer<typeof CreateUserSchema>;
type UpdateUserData = z.infer<typeof UpdateUserSchema>;
type UserProfileData = z.infer<typeof UserProfileSchema>;
type UserResponse = z.infer<typeof UserSchema>;

/**
 * Create a new user.
 * @param data - The user data.
 * @returns The created user data or null if failed.
 */
export const createUser = async (
  data: UserData,
): Promise<UserResponse | null> => {
  try {
    const response = await fetch(`${backendURL}/users`, {
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
    toast.success("User created successfully.");
    return UserSchema.parse(res);
  } catch (error: unknown) {
    showErrorToast(error);
    return null;
  }
};

/**
 * Get a user by email.
 * @param email - The email of the user.
 * @returns The user data or null if not found.
 */
export const getUserByEmail = async (
  email: string,
): Promise<UserResponse | null> => {
  try {
    const response = await fetch(`${backendURL}/users/${email}`);
    const data = await response.json();
    if (response.ok) {
      return UserSchema.parse(data);
    } else {
      throw new Error(data.message);
    }
  } catch (error: unknown) {
    showErrorToast(error);
    return null;
  }
};

/**
 * Update a user.
 * @param email - The email of the user.
 * @param data - The updated user data.
 * @returns The updated user data or null if failed.
 */
export const updateUser = async (
  email: string,
  data: UpdateUserData,
): Promise<UserResponse | null> => {
  try {
    const response = await fetch(`${backendURL}/users/${email}`, {
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
    toast.success("User updated successfully.");
    return UserSchema.parse(res);
  } catch (error: unknown) {
    showErrorToast(error);
    return null;
  }
};

/**
 * Delete a user by email (soft delete).
 * @param email - The email of the user.
 * @returns The deleted user data or null if failed.
 */
export const deleteUser = async (
  email: string,
): Promise<UserResponse | null> => {
  try {
    const response = await fetch(`${backendURL}/users/${email}`, {
      method: "DELETE",
    });

    const res = await response.json();
    if (!response.ok) {
      throw new Error(res.message);
    }
    toast.success("User deleted successfully.");
    return UserSchema.parse(res);
  } catch (error: unknown) {
    showErrorToast(error);
    return null;
  }
};

/**
 * Get all users.
 * @returns A list of all users or null if failed.
 */
export const getAllUsers = async (): Promise<UserResponse[] | null> => {
  try {
    const response = await fetch(`${backendURL}/users`);
    const data = await response.json();
    if (response.ok) {
      return data.map((user: unknown) => UserSchema.parse(user));
    } else {
      throw new Error(data.message);
    }
  } catch (error: unknown) {
    showErrorToast(error);
    return null;
  }
};

/**
 * Get paginated users.
 * @param page - The page number for pagination.
 * @param limit - The number of items per page.
 * @returns The paginated user data or null if failed.
 */
export const getPaginatedUsers = async (
  page: number = 1,
  limit: number = 10,
): Promise<{ users: UserResponse[]; total: number } | null> => {
  try {
    const response = await fetch(
      `${backendURL}/users/paginated?page=${page}&limit=${limit}`,
    );
    const data = await response.json();
    if (response.ok) {
      return {
        users: data.users.map((user: unknown) => UserSchema.parse(user)),
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
 * Update a user's profile.
 * @param email - The email of the user.
 * @param data - The profile data to update.
 * @returns The updated profile data or null if failed.
 */
export const updateUserProfile = async (
  email: string,
  data: UserProfileData,
): Promise<UserResponse | null> => {
  try {
    const response = await fetch(`${backendURL}/users/${email}/profile`, {
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
    toast.success("User profile updated successfully.");
    return UserSchema.parse(res);
  } catch (error: unknown) {
    showErrorToast(error);
    return null;
  }
};
