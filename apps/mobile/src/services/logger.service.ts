export const logger = {
    error: (context: string, message: string, error?: unknown) => {
      if (__DEV__) {
        console.error(`[${context}]`, message, error ?? '');
      }
    },
    info: (context: string, message: string) => {
      if (__DEV__) {
        console.log(`[${context}]`, message);
      }
    },
  };