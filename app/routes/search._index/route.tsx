import React, { useEffect, useRef, useCallback } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const MAX_TAGS = 5;

const TAGS = [
  "react",
  "typescript",
  "javascript",
  "node.js",
  "express",
  "nextjs",
  "vue",
  "angular",
  "svelte",
  "graphql",
  "rest-api",
  "database",
  "aws",
  "docker",
  "kubernetes",
  "machine-learning",
  "artificial-intelligence",
  "data-science",
  "web-development",
  "mobile-development",
];

const SearchFilterSchema = z.object({
  searchQuery: z.string().optional(),
  tags: z.array(z.string()).optional(),
  language: z.string().optional(),
});

type SearchFilterSchemaType = z.infer<typeof SearchFilterSchema>;

const SearchComponent: React.FC<{
  onSearch: (data: SearchFilterSchemaType) => void;
}> = ({ onSearch }) => {
  const { searchCriteria, setSearchCriteria } = useSearchStore();
  const [tagInput, setTagInput] = React.useState("");
  const [openTags, setOpenTags] = React.useState(false);

  const form = useForm<SearchFilterSchemaType>({
    resolver: zodResolver(SearchFilterSchema),
    defaultValues: searchCriteria,
  });

  const handleSearch = (data: SearchFilterSchemaType) => {
    setSearchCriteria(data);
    onSearch(data);
  };

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !form.getValues("tags")?.includes(trimmedTag)) {
      const currentTags = form.getValues("tags") || [];
      if (currentTags.length < MAX_TAGS) {
        const updatedTags = [...currentTags, trimmedTag];
        form.setValue("tags", updatedTags, { shouldValidate: true });
        setSearchCriteria({ ...searchCriteria, tags: updatedTags });
      } else {
        toast(`You can only add up to ${MAX_TAGS} tags`);
      }
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    const newTags = form.getValues("tags")?.filter((t) => t !== tag) || [];
    form.setValue("tags", newTags, { shouldValidate: true });
    setSearchCriteria({ ...searchCriteria, tags: newTags });
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
                <FormLabel>Categories</FormLabel>
                <FormControl>
                  <Popover open={openTags} onOpenChange={setOpenTags}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openTags}
                        className="w-full justify-between"
                      >
                        {field.value && field.value.length > 0
                          ? `${field.value.length} tag${field.value.length > 1 ? "s" : ""} selected`
                          : "Select category"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput
                          placeholder="Search category..."
                          value={tagInput}
                          onValueChange={setTagInput}
                        />
                        <CommandList>
                          <CommandEmpty>No tags found.</CommandEmpty>
                          <CommandGroup>
                            {TAGS.filter((tag) =>
                              tag
                                .toLowerCase()
                                .includes(tagInput.toLowerCase()),
                            ).map((tag) => (
                              <CommandItem
                                key={tag}
                                onSelect={() => {
                                  addTag(tag);
                                }}
                              >
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    checked={(field.value || []).includes(tag)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        addTag(tag);
                                      } else {
                                        removeTag(tag);
                                      }
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
                                  setSearchCriteria({
                                    ...searchCriteria,
                                    language: value,
                                  });
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

const SearchAndFilter: React.FC = () => {
  const {
    setIsLoading,
    setResults,
    setTotalResults,
    setHasMore,
    setCurrentPage,
    currentPage,
    searchCriteria,
    results,
    appendResults,
    isLoading,
    hasMore,
    totalResults,
  } = useSearchStore();

  const loadingRef = useRef(false);
  const itemsPerPage = 10; // Define items per page constant

  const performSearch = useCallback(
    async (data: SearchFilterSchemaType, page: number = 1) => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      setIsLoading(true);

      try {
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: itemsPerPage.toString(),
        });
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

        if (page === 1) {
          setResults(res.data);
          setCurrentPage(1);
        } else {
          appendResults(res.data);
        }
        setTotalResults(res.meta.total);
        setHasMore(res.meta.total > page * itemsPerPage);
        setCurrentPage(page);
      } catch (error) {
        showErrorToast(error);
      } finally {
        setIsLoading(false);
        loadingRef.current = false;
      }
    },
    [
      setIsLoading,
      setResults,
      setTotalResults,
      setHasMore,
      setCurrentPage,
      appendResults,
      itemsPerPage,
    ],
  );

  useEffect(() => {
    if (results.length === 0) {
      performSearch(searchCriteria);
    }
  }, []);

  const loadMoreData = useCallback(() => {
    if (
      !isLoading &&
      hasMore &&
      !loadingRef.current &&
      results.length < totalResults
    ) {
      performSearch(searchCriteria, currentPage + 1);
    }
  }, [
    isLoading,
    hasMore,
    searchCriteria,
    currentPage,
    performSearch,
    results.length,
    totalResults,
  ]);

  const ResultsComponentWithInfiniteScroll: React.FC = () => {
    const observer = useRef<IntersectionObserver | null>(null);
    const lastRepoElementRef = useCallback(
      (node: HTMLElement | null) => {
        if (isLoading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver((entries) => {
          if (
            entries[0].isIntersecting &&
            hasMore &&
            results.length < totalResults
          ) {
            loadMoreData();
          }
        });
        if (node) observer.current.observe(node);
      },
      [isLoading, hasMore, results.length, totalResults],
    );

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
                ref={
                  index === results.length - 1 && results.length < totalResults
                    ? lastRepoElementRef
                    : null
                }
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

  return (
    <>
      <SearchComponent onSearch={(data) => performSearch(data)} />
      <ResultsComponentWithInfiniteScroll />
    </>
  );
};

export default SearchAndFilter;
