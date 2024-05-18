import { Link } from "@remix-run/react";
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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

import { Label } from "@/components/ui/label";
import {
  FormField,
  // FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
  Form,
} from "@/components/ui/form";
// import { CircleUser, Menu, Package2, Search } from "lucide-react"
// import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button";
import {
  Card,
  // CardContent,
  // CardDescription,
  // CardFooter,
  // CardHeader,
  // CardTitle,
} from "@/components/ui/card";
// import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createAvatar } from "@dicebear/core";
import { notionists } from "@dicebear/collection";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
  confirmPassword: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function Dashboard() {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  const generateAvatar = () => {
    const avatar = createAvatar(notionists, {
      // random 16 char string
      seed: Math.random().toString(16).toString(),
      radius: 20,
    }).toDataUriSync();
    setUserAvatar(avatar);
    return avatar;
  };

  useEffect(() => {
    if (!userAvatar) {
      const avartar = generateAvatar();
      setUserAvatar(avartar);
    }
  }, [userAvatar]);

  const onSubmit = (data: z.infer<typeof schema>) => {
    console.log(data);
    // Handle form submission
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="mx-auto grid w-full max-w-6xl gap-2 py-2 my-3">
        <h1 className="text-3xl font-semibold">Settings</h1>
      </div>
      <div className="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
        <nav className="grid gap-4 text-sm text-muted-foreground">
          <Link to="#" className="font-semibold text-primary">
            General
          </Link>
          <Link to="#">Security</Link>
          <Link to="#">Integrations</Link>
          <Link to="#">Support</Link>
          <Link to="#">Organizations</Link>
          <Link to="#">Advanced</Link>
        </nav>
        <div className="grid gap-6">
          <Card className="py-5">
            <div className="px-4 md:px-6 py-3 space-y-6">
              <header className="space-y-1.5">
                <div className="flex items-center space-x-4">
                  <img
                    alt="Avatar"
                    className="border rounded-full"
                    height="96"
                    src="/placeholder.svg"
                    style={{ aspectRatio: "96/96", objectFit: "cover" }}
                    width="96"
                  />
                  <div className="space-y-1.5">
                    <h1 className="text-2xl font-bold">Catherine Grant</h1>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline">Change Avatar</Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px] bg-background">
                        <DialogHeader>
                          <DialogTitle>Change avatar</DialogTitle>
                          <DialogDescription>
                            Change your avatar by generating a new one. Once you
                            are done, click on the save changes button.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col justify-center mx-auto w-full p-2 items-center gap-4">
                          <div className="flex flex-row items center gap-4">
                            <Avatar className="w-24 h-24 border-2 border-white/[0.1]">
                              <AvatarImage
                                src={userAvatar ?? ""}
                                alt="@shadcn"
                                className=""
                              />
                            </Avatar>
                          </div>
                          <div className="flex flex-row items center gap-4">
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
                    </Dialog>{" "}
                  </div>
                </div>
              </header>
              <Form {...form}>
                <form
                  className="px-4 space-y-6 md:px-6"
                  onSubmit={form.handleSubmit(onSubmit)}
                >
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h2 className="text-lg font-semibold">
                        Personal Information
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter your name"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter your email"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter your phone"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-lg font-semibold">Change Password</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="currentPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current Password</FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="Enter your current password"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>New Password</FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="Enter your new password"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm Password</FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="Confirm your new password"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 flex">
                    <Button type="submit" size="lg">
                      Save
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
