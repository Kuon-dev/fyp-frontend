import React, { useState, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
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
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { showErrorToast } from "@/lib/handle-error";

const MAX_TAGS = 5;

export const SearchFilterSchema = z.object({
  searchQuery: z.string().optional(),
  tags: z
    .array(z.string())
    .max(MAX_TAGS, `You can only add up to ${MAX_TAGS} tags`),
  language: z.string().optional(),
});

export type SearchFilterSchemaType = z.infer<typeof SearchFilterSchema>;

interface SearchResult {
  id: string;
  name: string;
  description: string;
  tags: string[];
  language: string;
  visibility: string;
}

interface SearchAndFilterProps {
  onSearch: (results: SearchResult[]) => void;
}

const LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "csharp", label: "C#" },
];

export default function SearchAndFilter({ onSearch }: SearchAndFilterProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  const form = useForm<SearchFilterSchemaType>({
    resolver: zodResolver(SearchFilterSchema),
    defaultValues: {
      searchQuery: "",
      tags: [],
      language: "",
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = form;
  const watchedTags = watch("tags");

  const addTag = useCallback(
    (tag: string) => {
      if (
        tag.trim() &&
        !watchedTags.includes(tag.trim()) &&
        watchedTags.length < MAX_TAGS
      ) {
        setValue("tags", [...watchedTags, tag.trim()]);
      }
    },
    [watchedTags, setValue],
  );

  const removeTag = useCallback(
    (tagToRemove: string) => {
      setValue(
        "tags",
        watchedTags.filter((tag) => tag !== tagToRemove),
      );
    },
    [watchedTags, setValue],
  );

  const handleSearch = async (data: SearchFilterSchemaType) => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        ...(data.searchQuery && { q: data.searchQuery }),
        ...(data.tags.length && { tags: data.tags.join(",") }),
        ...(data.language && { language: data.language }),
      }).toString();

      const response = await fetch(
        `${window.ENV.BACKEND_URL}/api/v1/repos/search?${queryParams}`,
        { method: "GET" },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch search results");
      }

      const results: SearchResult[] = await response.json();
      setSearchResults(results);
      onSearch(results);
    } catch (error) {
      showErrorToast(error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearForm = () => {
    reset();
    setSearchResults([]);
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(handleSearch)} className="space-y-4">
        <FormField
          control={control}
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

        <Controller
          name="tags"
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <div>
                  <Input
                    placeholder="Enter tags and press Enter"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        addTag((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = "";
                      }
                    }}
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {field.value.map((tag, index) => (
                      <Badge key={index} className="flex items-center gap-1">
                        {tag}
                        <X
                          size={14}
                          className="cursor-pointer"
                          onClick={() => removeTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </FormControl>
              <FormMessage>{errors.tags?.message}</FormMessage>
            </FormItem>
          )}
        />

        <FormField
          control={control}
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
                      aria-expanded={open}
                      className="w-full justify-between"
                    >
                      {field.value
                        ? LANGUAGES.find(
                            (language) => language.value === field.value,
                          )?.label
                        : "Select language"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search language..." />
                      <CommandList>
                        <CommandEmpty>No language found.</CommandEmpty>
                        <CommandGroup>
                          {LANGUAGES.map((language) => (
                            <CommandItem
                              key={language.value}
                              onSelect={() => {
                                setValue("language", language.value);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value === language.value
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {language.label}
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

        <div className="flex gap-2">
          <Button type="submit" className="flex-1" disabled={isLoading}>
            {isLoading ? "Searching..." : "Search"}
          </Button>
          <Button type="button" variant="outline" onClick={clearForm}>
            Clear
          </Button>
        </div>
      </form>

      {searchResults.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Search Results</h2>
          {searchResults.map((result) => (
            <div key={result.id} className="border p-4 rounded-md mb-4">
              <h3 className="text-lg font-semibold">{result.name}</h3>
              <p className="text-sm text-gray-600">{result.description}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {result.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
              <p className="text-sm mt-2">Language: {result.language}</p>
              <p className="text-sm">Visibility: {result.visibility}</p>
            </div>
          ))}
        </div>
      )}
    </Form>
  );
}
