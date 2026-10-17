import type { FieldErrors } from "./candidates/schema";

/** Error thrown by `apiRequest` with the server's message and field errors. */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly fieldErrors: FieldErrors = {},
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Browser-side fetch wrapper for the JSON API in src/app/api. */
export async function apiRequest<T>(url: string, init: { method: string; body?: unknown }): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      method: init.method,
      headers: init.body === undefined ? undefined : { "Content-Type": "application/json" },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    });
  } catch {
    throw new ApiError("Network error — check your connection and try again.", 0);
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(
      payload?.error?.message ?? `Request failed (${response.status})`,
      response.status,
      payload?.error?.fieldErrors ?? {},
    );
  }
  return payload.data as T;
}
