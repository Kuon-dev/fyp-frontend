import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/custom/spinner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProjectFormSchema, ProjectFormData } from "./schemas";
import {
  Form,
  FormControl,
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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";
import { toast } from "sonner";

export function ProjectForm() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(ProjectFormSchema),
    defaultValues: {
      name: "",
      description: "",
      language: "",
      tags: [],
      price: undefined,
      visibility: "public",
    },
  });

  const onSubmit = async (data: ProjectFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/v1/repos", {
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
      toast("Project created successfully.");
    } catch (error) {
      console.error(error);
      toast(`An error occurred. ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

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
                    <SelectItem value="jsx">JSX</SelectItem>
                    <SelectItem value="tsx">TSX</SelectItem>
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
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <div className="flex items-center gap-2">
                <Checkbox
                  onCheckedChange={(checked) =>
                    field.onChange(
                      checked
                        ? [...(field.value ?? []), "Tag 1"]
                        : (field.value ?? []).filter((tag) => tag !== "Tag 1"),
                    )
                  }
                  checked={field.value?.includes("Tag 1") ?? false}
                />
                <Label htmlFor="tag-1" className="font-normal">
                  Tag 1
                </Label>
                <Checkbox
                  onCheckedChange={(checked) =>
                    field.onChange(
                      checked
                        ? [...(field.value ?? []), "Tag 2"]
                        : (field.value ?? []).filter((tag) => tag !== "Tag 2"),
                    )
                  }
                  checked={field.value?.includes("Tag 2") ?? false}
                />
                <Label htmlFor="tag-2" className="font-normal">
                  Tag 2
                </Label>
                <Checkbox
                  onCheckedChange={(checked) =>
                    field.onChange(
                      checked
                        ? [...(field.value ?? []), "Tag 3"]
                        : (field.value ?? []).filter((tag) => tag !== "Tag 3"),
                    )
                  }
                  checked={field.value?.includes("Tag 3") ?? false}
                />
                <Label htmlFor="tag-3" className="font-normal">
                  Tag 3
                </Label>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  placeholder="Enter project price"
                />
              </FormControl>
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
          {isLoading ? <Spinner /> : "Create Project"}
        </Button>
      </form>
    </Form>
  );
}
