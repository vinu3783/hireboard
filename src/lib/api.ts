import { NextResponse } from "next/server";
import type { z } from "zod";
import { toFieldErrors } from "./candidates/schema";
import { AppError, toAppError } from "./errors";

// Every API response uses one of two shapes:
//   success: { data: T }
//   failure: { error: { code, message, fieldErrors? } }

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function errorResponse(error: unknown) {
  const appError = toAppError(error);
  if (appError.status >= 500) console.error(error);
  return NextResponse.json(
    {
      error: {
        code: appError.code,
        message: appError.message,
        ...(appError.fieldErrors ? { fieldErrors: appError.fieldErrors } : {}),
      },
    },
    { status: appError.status },
  );
}

/** Reads and validates a JSON body, throwing a 400/422 AppError on bad input. */
export async function parseBody<S extends z.ZodType>(request: Request, schema: S): Promise<z.output<S>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new AppError("BAD_REQUEST", "Request body must be valid JSON", 400);
  }
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new AppError("VALIDATION_ERROR", "Please fix the highlighted fields", 422, toFieldErrors(result.error));
  }
  return result.data;
}
