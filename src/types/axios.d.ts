declare module 'axios' {
  interface AxiosRequestConfig {
    retry?: number;
    retryDelay?: number;
    __retryCount?: number;
  }
}