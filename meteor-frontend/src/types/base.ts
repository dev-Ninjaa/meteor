// Base types
export type UUID = string & { readonly __brand: unique symbol };
export type Address = `0x${string}` & { readonly __brand: unique symbol };
export type Hex = `0x${string}` & { readonly __brand: unique symbol };
export type Timestamp = string & { readonly __brand: unique symbol };

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ApiResponse<T> = {
  statusCode: number;
  message: string;
  data: T;
  timestamp: Timestamp;
  path: string;
};

export type ApiError = {
  statusCode: number;
  message: string;
  error: string;
  timestamp: Timestamp;
  path: string;
};

export type QueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};