export interface ServiceResult<T> {
    success: boolean;
    data?: T;
    error?: string;
}
  
export function ServerError<T>(): ServiceResult<T> {
    return { success: false, error: 'Something went wrong' };
}
  
export function Ok<T>(data: T): ServiceResult<T> {
    return { success: true, data };
}