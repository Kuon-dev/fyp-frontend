import { useState, useEffect } from "react";
import { Cross2Icon } from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";

import { Button } from "@/components/custom/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./data-table-view-options";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";

export type FilterOption = {
  columnId: string;
  title: string;
  options: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
};

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  filters: FilterOption[];
  search?: string; // for search column filtering
}

export function DataTableToolbar<TData>({
  table,
  filters,
  search,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2">
        <Input
          placeholder="Filter..."
          value={
            (table.getColumn(search ?? "title")?.getFilterValue() as string) ??
            ""
          }
          onChange={(event) =>
            table
              .getColumn(search ?? "title")
              ?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        <div className="flex gap-x-2">
          {filters.map(
            (filter) =>
              table.getColumn(filter.columnId) && (
                <DataTableFacetedFilter
                  key={filter.columnId}
                  column={table.getColumn(filter.columnId)}
                  title={filter.title}
                  options={filter.options}
                />
              ),
          )}
        </div>
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
