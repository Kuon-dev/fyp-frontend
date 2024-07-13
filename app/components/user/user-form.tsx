import React, { useState, useEffect } from "react";
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
import { z } from "zod";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
  Form,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createAvatar } from "@dicebear/core";
import { notionists } from "@dicebear/collection";
import { Skeleton } from "@/components/ui/skeleton";
import { PhoneInput } from "@/components/custom/phone-input.client";
import { ClientOnly } from "remix-utils/client-only";
import { showErrorToast } from "@/lib/handle-error";
import { toast } from "sonner";
import { isValidPhoneNumber } from "react-phone-number-input";

const schema = z.object({
  name: z.string().optional(),
  phoneNumber: z
    .string()
    .refine(isValidPhoneNumber, { message: "Invalid phone number" })
    .or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

interface ProfileEditComponentProps {
  initialData?: {
    name: string;
    phoneNumber: string;
    profileImg: string;
  };
  onSubmit: (data: FormData, avatar: string | null) => Promise<void>;
  isAdmin?: boolean;
  userId?: string;
}

export default function ProfileEditComponent({
  initialData,
  onSubmit,
  isAdmin = false,
  userId,
}: ProfileEditComponentProps) {
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData?.name || "",
      phoneNumber: initialData?.phoneNumber || "",
    },
  });

  useEffect(() => {
    if (initialData) {
      setUserAvatar(initialData.profileImg || null);
      form.reset({
        name: initialData.name || "",
        phoneNumber: initialData.phoneNumber || "",
      });
    }
  }, [initialData, form]);

  const generateAvatar = () => {
    const size = 128;
    const avatar = createAvatar(notionists, {
      seed: Math.random().toString(16).substring(2, 18),
      radius: 20,
    }).toDataUriSync();
    if (typeof window === "undefined") return avatar;

    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;

    const context = canvas.getContext("2d");

    const img = document.createElement("img");
    img.width = size;
    img.height = size;

    img.setAttribute("src", avatar);

    img.onload = function () {
      context?.drawImage(img, 0, 0, size, size);
      const png = canvas.toDataURL("image/png");
      setUserAvatar(png);
    };
    return avatar;
  };

  const handleSubmit = async (data: FormData) => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      await onSubmit(data, userAvatar);
      toast.success("Profile updated successfully");
    } catch (error) {
      showErrorToast(error);
      console.error("Error updating profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!initialData) {
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

  return (
    <ClientOnly>
      {() => (
        <div className="py-5">
          <div className="px-4 md:px-6 py-3 space-y-6">
            <header className="space-y-1.5">
              <h1 className="text-2xl font-bold">
                {isAdmin ? `Edit User Account (Admin)` : "Edit Account"}
              </h1>
              {isAdmin && userId && (
                <p className="text-sm text-muted-foreground">
                  Editing user: {userId}
                </p>
              )}
            </header>
            <div className="flex items-center space-x-4">
              <Avatar className="w-24 h-24 border-2 border-white/[0.1]">
                <AvatarImage
                  src={userAvatar ?? "/placeholder.svg"}
                  alt="User avatar"
                />
              </Avatar>
              <div className="space-y-1.5">
                <h1 className="text-2xl font-bold">{initialData.name}</h1>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">Change Avatar</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] bg-background">
                    <DialogHeader>
                      <DialogTitle>Change avatar</DialogTitle>
                      <DialogDescription>
                        Change the avatar by generating a new one. Once you are
                        done, click on the close button.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col justify-center mx-auto w-full p-2 items-center gap-4">
                      <div className="flex flex-row items-center gap-4">
                        <Avatar className="w-24 h-24 border-2 border-white/[0.1]">
                          <AvatarImage
                            src={userAvatar ?? ""}
                            alt="User avatar"
                          />
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
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-8"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="User name" {...field} />
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
                        <PhoneInput {...field} placeholder="Phone number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update profile"}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      )}
    </ClientOnly>
  );
}

export { schema, type FormData };
