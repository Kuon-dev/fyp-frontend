import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
  Form,
} from "@/components/ui/form";
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { createAvatar } from "@dicebear/core";
import { notionists } from "@dicebear/collection";
import { useUserStore } from "@/stores/user-store";
import { Skeleton } from "@/components/ui/skeleton";
import InputMask from "react-input-mask";

const malaysianPhoneRegex =
  /^(\+?6?01)[02-46-9]-*[0-9]{7}$|^(\+?6?01)[1]-*[0-9]{8}$/;

const schema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less"),
  phoneNumber: z
    .string()
    .regex(malaysianPhoneRegex, "Invalid Malaysian phone number")
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
});

type FormData = z.infer<typeof schema>;

export { schema, type FormData };

export default function ProfileEditComponent() {
  const { user, isLoading, fetchUser } = useUserStore();
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      phoneNumber: "",
    },
  });

  const generateAvatar = () => {
    const avatar = createAvatar(notionists, {
      seed: Math.random().toString(16).substring(2, 18),
      radius: 20,
    }).toDataUriSync();
    setUserAvatar(avatar);
    return avatar;
  };

  useEffect(() => {
    const initializeUser = async () => {
      await fetchUser();
      setInitialLoading(false);
    };
    initializeUser();
  }, [fetchUser]);

  useEffect(() => {
    if (user) {
      setUserAvatar(user.profile.profileImg ?? generateAvatar());
      form.reset({
        name: user.profile.name ?? "",
        phoneNumber: user.profile.phoneNumber ?? "",
      });
      setFormKey((prevKey) => prevKey + 1);
    }
  }, [user, form]);

  const onSubmit = async (data: FormData) => {
    if (!user) return;

    const formData = new FormData();

    if (data.name) formData.append("name", data.name);
    if (data.phoneNumber) formData.append("phoneNumber", data.phoneNumber);
    if (userAvatar) formData.append("profileImg", userAvatar);

    try {
      const response = await fetch(
        `${window.ENV.BACKEND_URL}/api/v1/update-profile`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      // Refetch user data to update the store
      await fetchUser();
    } catch (error) {
      console.error("Error updating profile:", error);
      // Handle error (e.g., show error message to user)
    }
  };

  if (initialLoading || isLoading) {
    return (
      <div className="py-5 px-4 md:px-6 space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <div className="flex items-center space-x-4">
          <Skeleton className="w-24 h-24 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <div>Error: Unable to load user data</div>;
  }

  return (
    <div className="py-5">
      <div className="px-4 md:px-6 py-3 space-y-6">
        <header className="space-y-1.5">
          <h1 className="text-2xl font-bold">Edit Account</h1>
        </header>
        <div className="flex items-center space-x-4">
          <Avatar className="w-24 h-24 border-2 border-white/[0.1]">
            <AvatarImage
              src={userAvatar ?? "/placeholder.svg"}
              alt="User avatar"
            />
          </Avatar>
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold">{user.profile.name}</h1>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Change Avatar</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-background">
                <DialogHeader>
                  <DialogTitle>Change avatar</DialogTitle>
                  <DialogDescription>
                    Change your avatar by generating a new one. Once you are
                    done, click on the close button.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col justify-center mx-auto w-full p-2 items-center gap-4">
                  <div className="flex flex-row items-center gap-4">
                    <Avatar className="w-24 h-24 border-2 border-white/[0.1]">
                      <AvatarImage src={userAvatar ?? ""} alt="User avatar" />
                    </Avatar>
                  </div>
                  <div className="flex flex-row items-center gap-4">
                    <Button onClick={generateAvatar} variant="outline">
                      Generate New Avatar
                    </Button>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="secondary">
                      Close
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <Form {...form} key={formKey}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Controller
                      name="phoneNumber"
                      control={form.control}
                      render={({ field }) => (
                        <InputMask
                          mask="+60 99-9999999"
                          maskChar={null}
                          {...field}
                        >
                          {(inputProps: any) => (
                            <Input
                              {...inputProps}
                              placeholder="e.g. +60 12-3456789"
                            />
                          )}
                        </InputMask>
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Update profile</Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
