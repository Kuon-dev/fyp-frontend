// src/components/SearchAndFilter.tsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command.client";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { showErrorToast } from "@/lib/handle-error";

export const SearchFilterSchema = z.object({
  searchQuery: z.string().optional(),
  tags: z.array(z.string()).optional(),
  language: z.string().optional(),
});

export type SearchFilterSchemaType = z.infer<typeof SearchFilterSchema>;

interface ResultsListProps {
  results: {
    id: string;
    name: string;
    description: string;
    tags: string[];
    language: string;
    visibility: string;
  }[];
  renderItem: (item: any) => React.ReactNode;
}

interface ResultItemProps {
  item: {
    id: string;
    name: string;
    description: string;
    tags: string[];
    language: string;
    visibility: string;
  };
  onClick: () => void;
}

const ResultItem: React.FC<ResultItemProps> = ({ item, onClick }) => {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onClick();
        }
      }}
      className="p-4 border rounded mb-2 cursor-pointer"
    >
      <h2 className="text-lg font-semibold">{item.name}</h2>
      <p>{item.description}</p>
      <div className="flex flex-wrap mt-2">
        {item.tags.map((tag, index) => (
          <Badge key={index} variant="secondary" className="mr-2 mb-2">
            {tag}
          </Badge>
        ))}
      </div>
      <p>{item.language}</p>
      <p>{item.visibility}</p>
    </div>
  );
};

const ResultsList: React.FC<ResultsListProps> = ({ results, renderItem }) => {
  return <div>{results.map((result) => renderItem(result))}</div>;
};

export default function SearchAndFilter() {
  const [isLoading, setIsLoading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const form = useForm<SearchFilterSchemaType>({
    resolver: zodResolver(SearchFilterSchema),
    defaultValues: {
      searchQuery: "",
      tags: [],
      language: "",
    },
  });

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (tagInput.trim() && !tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSearch = async (data: SearchFilterSchemaType) => {
    setIsLoading(true);
    try {
      // Implement your search logic here
      const response = await fetch(
        `${window.ENV.BACKEND_URL}/api/v1/repos/search?query=${data.searchQuery}`,
        {
          method: "GET",
        },
      );

      const res = await response.json();
      if (!response.ok) {
        throw new Error(res.message);
      }
      // Handle the response and set the results
    } catch (error) {
      showErrorToast(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSearch)} className="space-y-4">
        <FormField
          control={form.control}
          name="searchQuery"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Search</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Search..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tags"
          render={() => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <Input
                  value={tagInput}
                  onChange={handleTagInputChange}
                  onKeyDown={handleTagInputKeyDown}
                  placeholder="Enter tags and press comma"
                />
              </FormControl>
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag, index) => (
                  <Badge key={index} className="flex items-center gap-1">
                    {tag}
                    <Check
                      size={16}
                      className="cursor-pointer"
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
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
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={form.formState.isValid}
                      className="w-full justify-between"
                    >
                      {field.value || "Select language"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search language..." />
                      <CommandList>
                        <CommandEmpty>No option found.</CommandEmpty>
                        <CommandGroup>
                          {[
                            { value: "javascript", label: "JavaScript" },
                            { value: "typescript", label: "TypeScript" },
                            // Add more options as needed
                          ].map((option) => (
                            <CommandItem
                              key={option.value}
                              value={option.value}
                              onSelect={(currentValue) => {
                                field.onChange(
                                  currentValue === field.value
                                    ? ""
                                    : currentValue,
                                );
                                form.setValue("language", currentValue);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value === option.value
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {option.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Searching..." : "Search"}
        </Button>
      </form>
    </Form>
  );
}
