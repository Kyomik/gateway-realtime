export class ApiResponse<T> {
  data: T;
  headers: Record<string, string | string[] | undefined>; // aman untuk semua Axios versi
}