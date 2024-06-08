type Me = {
  user: Omit<User, "passwordHash">;
  profile: Profile;
};

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
