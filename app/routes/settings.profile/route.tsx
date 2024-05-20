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
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createAvatar } from "@dicebear/core";
import { notionists } from "@dicebear/collection";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  phoneNumber: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function ProfileEditComponent() {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  const generateAvatar = () => {
    const avatar = createAvatar(notionists, {
      seed: Math.random().toString(16).substring(2, 18),
      radius: 20,
    }).toDataUriSync();
    setUserAvatar(avatar);
    return avatar;
  };

  useEffect(() => {
    if (!userAvatar) {
      const avatar = generateAvatar();
      setUserAvatar(avatar);
    }
  }, [userAvatar]);

  const onSubmit = (data: FormData) => {
    console.log(data);
    // Handle form submission, e.g., API call to update profile
  };

  return (
    <div>
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
              <h1 className="text-2xl font-bold">User Name </h1>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Change Avatar</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-background">
                  <DialogHeader>
                    <DialogTitle>Change avatar</DialogTitle>
                    <DialogDescription>
                      Change your avatar by generating a new one. Once you are
                      done, click on the save changes button.
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
                    <Button type="submit">Save changes</Button>
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
                      <Input placeholder="Your phone number" {...field} />
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
    </div>
  );
}
