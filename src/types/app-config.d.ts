declare global {
    interface Window {
      __APP_CONFIG__?: {
        BASE_API: string;
      };
    }
  }
  
export {};