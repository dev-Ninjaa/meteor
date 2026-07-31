// Base types
export type UUID = string;
export type Address = `0x${string}`;
export type Hex = `0x${string}`;
export type Timestamp = string;

export type Chain = {
  id: number;
  name: string;
  nativeCurrency: { name: string; symbol: string; decimals: number };
  rpcUrls: { default: { http: string[] } };
};

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