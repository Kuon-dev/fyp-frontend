import React, { useEffect, useRef, useCallback, useState } from "react";
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
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchStore } from "@/stores/search-store";
import { showErrorToast } from "@/lib/handle-error";
import { z } from "zod";
import { RepoCard } from "@/components/repo/card";
import { Shell } from "@/components/landing/shell";
import { Spinner } from "@/components/custom/spinner";

// Schema definition
const SearchFilterSchema = z
  .object({
    searchQuery: z.string().optional(),
    tags: z.array(z.string()).optional(),
    language: z.string().optional(),
  })
  .refine(
    (data) =>
      data.language || data.searchQuery || (data.tags && data.tags.length > 0),
    {
      message: "At least one field must be filled out",
    },
  );

type SearchFilterSchemaType = z.infer<typeof SearchFilterSchema>;

// SearchComponent
const SearchComponent: React.FC = () => {
  const { searchCriteria, setSearchCriteria, resetSearch, setIsLoading } =
    useSearchStore();
  const [tagInput, setTagInput] = useState("");

  const form = useForm<SearchFilterSchemaType>({
    resolver: zodResolver(SearchFilterSchema),
    defaultValues: {
      searchQuery: searchCriteria.query,
      tags: searchCriteria.tags,
      language: searchCriteria.language,
    },
  });

  const handleSearch = async (data: SearchFilterSchemaType) => {
    setIsLoading(true);
    resetSearch();
    setSearchCriteria({
      query: data.searchQuery || "",
      tags: data.tags || [],
      language: data.language || "",
    });

    try {
      const queryParams = new URLSearchParams();
      if (data.searchQuery) queryParams.append("query", data.searchQuery);
      data.tags?.forEach((tag) => queryParams.append("tags", tag));
      if (data.language) queryParams.append("language", data.language);

      const response = await fetch(
        `${window.ENV.BACKEND_URL}/api/v1/repos/search?${queryParams.toString()}`,
        { method: "GET" },
      );

      const res = await response.json();
      if (!response.ok) {
        throw new Error(res.message);
      }

      useSearchStore.getState().setResults(res.data);
      useSearchStore.getState().setTotalResults(res.meta.total);
      useSearchStore.getState().setCurrentPage(1);
      useSearchStore.getState().setHasMore(res.meta.total > res.data.length);
    } catch (error) {
      showErrorToast(error);
    } finally {
      setIsLoading(false);
    }
  };

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !form.getValues("tags")?.includes(trimmedTag)) {
      const updatedTags = [...(form.getValues("tags") || []), trimmedTag];
      form.setValue("tags", updatedTags);
      setSearchCriteria({ tags: updatedTags });
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    const newTags = form.getValues("tags")?.filter((t) => t !== tag) || [];
    form.setValue("tags", newTags);
    setSearchCriteria({ tags: newTags });
  };

  return (
    <Shell>
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
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags</FormLabel>
                <FormControl>
                  <div className="flex items-center">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === ",") {
                          e.preventDefault();
                          addTag(tagInput);
                        }
                      }}
                      placeholder="Enter a tag and press Enter"
                    />
                    <Button
                      type="button"
                      onClick={() => addTag(tagInput)}
                      className="ml-2"
                    >
                      Add Tag
                    </Button>
                  </div>
                </FormControl>
                <div className="flex flex-wrap gap-2 mt-2">
                  {field.value?.map((tag, index) => (
                    <Badge key={index} className="flex items-center gap-1">
                      {tag}
                      <X
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
                            ].map((option) => (
                              <CommandItem
                                key={option.value}
                                value={option.value}
                                onSelect={(currentValue) => {
                                  const value =
                                    currentValue === field.value
                                      ? ""
                                      : currentValue;
                                  field.onChange(value);
                                  setSearchCriteria({ language: value });
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
          <Button
            type="submit"
            className="w-full"
            disabled={useSearchStore.getState().isLoading}
          >
            {useSearchStore.getState().isLoading ? "Searching..." : "Search"}
          </Button>
        </form>
      </Form>
    </Shell>
  );
};

// ResultsComponent
const ResultsComponent: React.FC = () => {
  const {
    results,
    isLoading,
    hasMore,
    currentPage,
    setCurrentPage,
    appendResults,
    setHasMore,
    setIsLoading,
    searchCriteria,
  } = useSearchStore();

  const observer = useRef<IntersectionObserver | null>(null);
  const lastRepoElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setCurrentPage(currentPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore, setCurrentPage, currentPage],
  );

  const fetchMoreData = useCallback(async () => {
    if (!hasMore || isLoading) return;

    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
      });

      // Correctly format the search criteria
      if (searchCriteria.query)
        queryParams.append("query", searchCriteria.query);
      searchCriteria.tags.forEach((tag) => queryParams.append("tags", tag));
      if (searchCriteria.language)
        queryParams.append("language", searchCriteria.language);

      const response = await fetch(
        `${window.ENV.BACKEND_URL}/api/v1/repos/search?${queryParams.toString()}`,
        { method: "GET" },
      );

      const res = await response.json();
      if (!response.ok) {
        throw new Error(res.message);
      }

      if (res.data.length === 0) {
        setHasMore(false);
      } else {
        appendResults(res.data);
        setHasMore(res.meta.total > results.length + res.data.length);
      }
    } catch (error) {
      showErrorToast(error);
    } finally {
      setIsLoading(false);
    }
  }, [
    currentPage,
    searchCriteria,
    hasMore,
    isLoading,
    appendResults,
    setHasMore,
    setIsLoading,
    results.length,
  ]);

  useEffect(() => {
    fetchMoreData();
  }, [currentPage, fetchMoreData]);

  return (
    <Shell className="mt-4">
      {isLoading && results.length === 0 ? (
        <div className="flex items-center justify-center mt-4">
          <Spinner />
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((item, index) => (
            <RepoCard
              repo={item}
              key={item.id}
              ref={index === results.length - 1 ? lastRepoElementRef : null}
            />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center mt-4">
          <p>No results found. Try adjusting your search criteria.</p>
        </div>
      )}
      {isLoading && results.length > 0 && (
        <div className="flex items-center justify-center mt-4">
          <Spinner />
        </div>
      )}
    </Shell>
  );
};

// Main component
const SearchAndFilter: React.FC = () => {
  const { setIsLoading, setResults, setTotalResults, setHasMore } =
    useSearchStore();

  useEffect(() => {
    const fetchInitialResults = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${window.ENV.BACKEND_URL}/api/v1/repos/search?limit=10`,
          { method: "GET" },
        );

        const res = await response.json();
        if (!response.ok) {
          throw new Error(res.message);
        }

        setResults(res.data);
        setTotalResults(res.meta.total);
        setHasMore(res.meta.total > res.data.length);
      } catch (error) {
        showErrorToast(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialResults();
  }, [setIsLoading, setResults, setTotalResults, setHasMore]);

  return (
    <>
      <SearchComponent />
      <ResultsComponent />
    </>
  );
};

export default SearchAndFilter;
