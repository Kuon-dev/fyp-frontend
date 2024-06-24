// src/components/SearchAndFilter.tsx
import React, { useEffect, useState, useRef, useCallback } from "react";
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
import { RepoNoSource, useSearchStore } from "@/stores/search-store";
import { showErrorToast } from "@/lib/handle-error";
import { z } from "zod";
import { RepoCard } from "@/components/repo/card";
import { Shell } from "@/components/landing/shell";
import { LoaderFunction, json } from "@remix-run/node";
import { getPaginatedRepos } from "@/lib/fetcher/repo";
import { useLoaderData } from "@remix-run/react";
import { Spinner } from "@/components/custom/spinner";

export const SearchFilterSchema = z
  .object({
    searchQuery: z.string().optional(),
    tags: z.array(z.string()).optional(),
    language: z.string().optional(),
  })
  .refine((data) => data.language || data.searchQuery, {
    message: "At least one field must be filled out",
    path: ["searchQuery"],
  });

export type SearchFilterSchemaType = z.infer<typeof SearchFilterSchema>;

export const loader: LoaderFunction = async () => {
  const repos = await getPaginatedRepos();

  return json({
    repos: repos ?? [],
  });
};

export default function SearchAndFilter() {
  const { repos } = useLoaderData<typeof loader>() as {
    repos: {
      data: RepoNoSource[] | [];
      total: number;
    };
  };

  const [isLoading, setIsLoading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [results, setResults] = useSearchStore((state) => [
    state.results,
    state.setResults,
  ]);

  const form = useForm<SearchFilterSchemaType>({
    resolver: zodResolver(SearchFilterSchema),
    defaultValues: {
      searchQuery: "",
      tags: [],
      language: "",
    },
  });

  const observer = useRef<IntersectionObserver | null>(null);
  const lastRepoElementRef = useCallback(
    (node) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore],
  );

  useEffect(() => {
    if (!repos.data) return;
    setResults(repos?.data);
  }, [repos, setResults]);

  useEffect(() => {
    const fetchMoreData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${window.ENV.BACKEND_URL}/api/v1/repos?page=${page}&limit=10`,
          {
            method: "GET",
          },
        );

        const res = await response.json();
        if (!response.ok) {
          throw new Error(res.message);
        }

        if (res.data.length === 0) {
          setHasMore(false);
        } else {
          setResults([...results, ...res.data]);
        }
      } catch (error) {
        showErrorToast(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (page > 1) {
      fetchMoreData();
    }
  }, [page, setResults]);

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
      setResults(res); // Assuming the API returns a `results` array
    } catch (error) {
      showErrorToast(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Shell>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSearch)}
            className="space-y-4"
          >
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
                                { value: "JSX", label: "JavaScript" },
                                { value: "TSX", label: "TypeScript" },
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
      </Shell>
      <Shell className="mt-4">
        {results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((item, index) => {
              if (results.length === index + 1) {
                return (
                  <RepoCard
                    repo={item}
                    key={item.id}
                    ref={lastRepoElementRef}
                  />
                );
              } else {
                return <RepoCard repo={item} key={item.id} />;
              }
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center mt-4">
            <Spinner />
          </div>
        )}
      </Shell>
      <div
        ref={lastRepoElementRef}
        className="flex items-center justify-center mt-4"
      >
        {isLoading && <Spinner />}
      </div>
    </>
  );
}
