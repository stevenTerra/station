import {
  UseExpandedOptions,
  UseFiltersOptions,
  UsePaginationOptions,
  UseRowSelectOptions,
  UseSortByOptions,
} from "react-table"

export interface TableOptions<D extends Record<string, unknown>>
  extends UseExpandedOptions<D>,
    UseFiltersOptions<D>,
    UsePaginationOptions<D>,
    UseRowSelectOptions<D>,
    UseSortByOptions<D>,
    UseFiltersOptions<D>,
    Record<string, any> {}
