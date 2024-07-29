import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/custom/spinner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { NewRepoSchema, NewRepoSchemaType, REPO_TAGS } from "./constants";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command.client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronsUpDown } from "lucide-react";

interface RepoEditFormProps {
  repoId: string;
}

export function EditRepoForm({ repoId }: RepoEditFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const form = useForm<NewRepoSchemaType>({
    resolver: zodResolver(NewRepoSchema),
    defaultValues: {
      name: "",
      description: "",
      language: "",
      tags: [],
      price: 0,
      visibility: "public",
    },
  });

  useEffect(() => {
    const fetchRepoData = async () => {
      try {
        const response = await fetch(
          `${window.ENV.BACKEND_URL}/api/v1/repo/${repoId}`,
          {
            credentials: "include",
          },
        );
        if (!response.ok) {
          throw new Error("Failed to fetch repo data");
        }
        const repoData = await response.json();
        console.log(repoData);
        form.reset(repoData.repo);
      } catch (error) {
        console.error("Error fetching repo data:", error);
        toast("Failed to load repository data");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchRepoData();
  }, [repoId, form]);

  const onSubmit = async (data: NewRepoSchemaType) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${window.ENV.BACKEND_URL}/api/v1/repo/${repoId}`,
        {
          credentials: "include",
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        },
      );
      const res = await response.json();
      if (!response.ok) {
        throw new Error(res.message);
      }
      toast("Project updated successfully.");
    } catch (error) {
      console.error(error);
      toast(`An error occurred. ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (initialLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter project name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Enter project description" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="language"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Language</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JSX">JSX</SelectItem>
                    <SelectItem value="TSX">TSX</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Tags</FormLabel>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className={cn(
                        "w-full justify-between",
                        !field.value?.length && "text-muted-foreground",
                      )}
                    >
                      {field.value && field.value.length > 0
                        ? `${field.value.length} tag${field.value.length > 1 ? "s" : ""} selected`
                        : "Select tags"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0">
                  <Command>
                    <CommandInput placeholder="Search tags..." />
                    <CommandList>
                      <CommandEmpty>No tags found.</CommandEmpty>
                      <CommandGroup>
                        {REPO_TAGS.map((tag) => (
                          <CommandItem
                            key={tag}
                            onSelect={() => {
                              const currentTags = field.value || [];
                              let updatedTags;
                              if (currentTags.includes(tag)) {
                                updatedTags = currentTags.filter(
                                  (t) => t !== tag,
                                );
                              } else {
                                updatedTags = [...currentTags, tag];
                              }
                              form.setValue("tags", updatedTags, {
                                shouldValidate: true,
                              });
                            }}
                          >
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                checked={(field.value || []).includes(tag)}
                                onCheckedChange={(checked) => {
                                  const currentTags = field.value || [];
                                  let updatedTags;
                                  if (checked) {
                                    updatedTags = [...currentTags, tag];
                                  } else {
                                    updatedTags = currentTags.filter(
                                      (t) => t !== tag,
                                    );
                                  }
                                  form.setValue("tags", updatedTags, {
                                    shouldValidate: true,
                                  });
                                }}
                              />
                              <span>{tag}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormDescription>
                Select the tags that best describe your project.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price (MYR)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="text"
                  inputMode="decimal"
                  onChange={(e) => {
                    let value = e.target.value.replace(/[^0-9.]/g, "");

                    // Ensure only one decimal point
                    const decimalPoints = value.match(/\./g) || [];
                    if (decimalPoints.length > 1) {
                      value = value.slice(0, value.lastIndexOf("."));
                    }

                    // Limit to two decimal places
                    const parts = value.split(".");
                    if (parts.length > 1) {
                      parts[1] = parts[1].slice(0, 2);
                      value = parts.join(".");
                    }

                    // Update the input value
                    e.target.value = value;

                    // Convert to cents for internal storage
                    const numericValue = Math.round(parseFloat(value) * 100);
                    field.onChange(isNaN(numericValue) ? 0 : numericValue);
                  }}
                  value={
                    field.value !== undefined
                      ? (field.value / 100).toFixed(2)
                      : ""
                  }
                  placeholder="0.00"
                />
              </FormControl>
              <FormDescription>
                Enter the price in MYR. Use 0.00 for free repositories.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="visibility"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Visibility</FormLabel>
              <FormControl>
                <RadioGroup onValueChange={field.onChange} value={field.value}>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="public" id="visibility-public" />
                    <Label htmlFor="visibility-public" className="font-normal">
                      Public
                    </Label>
                    <RadioGroupItem value="private" id="visibility-private" />
                    <Label htmlFor="visibility-private" className="font-normal">
                      Private
                    </Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <Spinner /> : "Update Project"}
        </Button>
      </form>
    </Form>
  );
}
