export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: any;
  timestamp?: string;
  statusCode?: number;
}
