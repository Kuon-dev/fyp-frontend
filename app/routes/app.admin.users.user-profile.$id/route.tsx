import React, { useState } from "react";
import { useLoaderData, useParams, Link } from "@remix-run/react";
import { LoaderFunction, json } from "@remix-run/node";
import ProfileEditComponent from "@/components/user/user-form";
import type { FormData } from "@/components/user/user-form";
import { useUserStore } from "@/stores/user-store";
import { showErrorToast } from "@/lib/handle-error";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type LoaderData = {
  profileData: {
    name: string;
    phoneNumber: string;
    profileImg: string;
  } | null;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const { id } = params;
  let profileData = null;

  if (id) {
    // Admin is editing a user's profile
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/v1/users/${id}`,
      {
        headers: {
          Cookie: request.headers.get("Cookie") || "",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch user profile");
    }

    const userData = await response.json();
    profileData = {
      name: userData.profile.name,
      phoneNumber: userData.profile.phoneNumber,
      profileImg: userData.profile.profileImg,
    };
  } else {
    // User is editing their own profile
    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/profile`, {
      headers: {
        Cookie: request.headers.get("Cookie") || "",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user profile");
    }

    profileData = await response.json();
  }

  return json({ profileData });
};

const ProfileEditPage: React.FC = () => {
  const { profileData } = useLoaderData<LoaderData>();
  const { id } = useParams();
  const { checkLoginStatus } = useUserStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: FormData, avatar: string | null) => {
    setIsSubmitting(true);
    try {
      const endpoint = id
        ? `${window.ENV.BACKEND_URL}/api/v1/admin/profile/${id}`
        : `${window.ENV.BACKEND_URL}/api/v1/profile`;

      let body;
      const fetchOptions: RequestInit = {
        method: "PUT",
        credentials: "include",
      };

      if (avatar && avatar !== profileData?.profileImg) {
        const formData = new FormData();
        if (data.name) formData.append("name", data.name);
        if (data.phoneNumber) formData.append("phoneNumber", data.phoneNumber);

        const response = await fetch(avatar);
        const blob = await response.blob();
        formData.append("profileImg", blob, "avatar.png");

        body = formData;
      } else {
        body = JSON.stringify({
          name: data.name,
          phoneNumber: data.phoneNumber,
        });
        fetchOptions.headers = {
          "Content-Type": "application/json",
        };
      }

      fetchOptions.body = body;

      const response = await fetch(endpoint, fetchOptions);

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      await checkLoginStatus();
      toast.success("Profile updated successfully");
    } catch (error) {
      showErrorToast(error);
      console.error("Error updating profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!profileData) {
    return <div>Error: Unable to load profile data</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/app/admin/users">
        <Button className="mb-4">Back</Button>
      </Link>
      <h1 className="text-3xl font-bold mb-6">
        {id ? `Edit User Profile (Admin)` : "Edit Your Profile"}
      </h1>
      {id && <p className="mb-4">Editing profile for user ID: {id}</p>}
      <ProfileEditComponent
        initialData={profileData}
        onSubmit={handleSubmit}
        isAdmin={!!id}
        userId={id}
      />
    </div>
  );
};

export default ProfileEditPage;
