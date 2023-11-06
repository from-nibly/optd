export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export interface PouchDBError {
  /**
   * HTTP Status Code during HTTP or HTTP-like operations
   */
  status?: number | undefined;
  name?: string | undefined;
  message?: string | undefined;
  reason?: string | undefined;
  error?: string | boolean | undefined;
  id?: string | undefined;
  rev?: string | undefined;
  docId?: string | undefined;
}

export const isPouchDBError = (e: any): e is PouchDBError => {
  return (
    e.status !== undefined ||
    e.name !== undefined ||
    e.message !== undefined ||
    e.reason !== undefined ||
    e.error !== undefined ||
    e.id !== undefined ||
    e.rev !== undefined
  );
};
