export {};

declare global {
  type ErrorResponse = {
    code: string;
    error: string;
    show: string;
  };

  type ErrorRedux = ErrorResponse | Error | string | null;

  type BaseResponse = {
    success: boolean;
    data?: unknown;
    error?: ErrorResponse;
  };

  type ApplicationStatus =
    | 'PROCESSING'
    | 'CONFIRMING'
    | 'CONFIRMED'
    | 'REJECTED'
    | 'DOCUMENT_NEEDED'
    | 'RE_APPROVAL'
    | 'DUPLICATE_PROFILE';

  type Scheme = 'TYPE_A' | 'TYPE_B' | 'TYPE_C' | 'NONE';

  interface Navigator {
    getUserMedia(
      options: { video?: boolean; audio?: boolean },
      success: (stream: any) => void,
      error?: (error: string) => void
    ): void;
  }
}

declare module 'axios' {
  export interface AxiosResponse<T> {
    success: boolean;
    data?: T;
    token?: string;
  }

  interface AxiosInstance {
    (config: AxiosRequestConfig): Promise<any>;
    get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
    delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
    head<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
    post<T = any>(
      url: string,
      data?: any,
      config?: AxiosRequestConfig
    ): Promise<T>;
    put<T = any>(
      url: string,
      data?: any,
      config?: AxiosRequestConfig
    ): Promise<T>;
    patch<T = any>(
      url: string,
      data?: any,
      config?: AxiosRequestConfig
    ): Promise<T>;
  }
}
