// src/types/axios-retry.d.ts
declare module 'axios-retry' {
    // Instead of importing from axios, define the minimal interfaces we need
    interface AxiosRequestConfig {
      [key: string]: any;
    }
    
    interface AxiosInstance {
      request<T = any>(config: AxiosRequestConfig): Promise<T>;
      [key: string]: any;
    }
    
    export interface IAxiosRetryConfig {
      retries?: number;
      retryCondition?: (error: any) => boolean | Promise<boolean>;
      retryDelay?: (retryCount: number, error: any) => number;
      onRetry?: (retryCount: number, error: any, requestConfig: AxiosRequestConfig) => void;
    }
    
    // Declare the function without any reference to axios imports
    function axiosRetry(
      axiosInstance: AxiosInstance | any,
      config?: IAxiosRetryConfig
    ): void;
    
    export default axiosRetry;
  }