import { Prisma } from "@prisma/client";
import type { FieldErrors } from "./candidates/schema";

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "CONFLICT"
  | "BAD_REQUEST"
  | "DATABASE_UNAVAILABLE"
  | "INTERNAL_ERROR";

/** An error that is safe to show to the user and maps to an HTTP status. */
export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly status: number,
    public readonly fieldErrors?: FieldErrors,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const notFound = (what = "Candidate") => new AppError("NOT_FOUND", `${what} not found`, 404);

export const duplicateEmail = () =>
  new AppError("CONFLICT", "A candidate with this email already exists", 409, {
    email: "A candidate with this email already exists",
  });

/** Converts known Prisma failures into AppErrors; anything else becomes a 500. */
export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") return duplicateEmail();
    if (error.code === "P2025") return notFound();
    // P1xxx codes are connection/availability problems.
    if (error.code.startsWith("P1")) return databaseUnavailable();
  }
  if (
    error instanceof Prisma.PrismaClientInitializationError ||
    error instanceof Prisma.PrismaClientRustPanicError
  ) {
    return databaseUnavailable();
  }
  return new AppError("INTERNAL_ERROR", "Something went wrong. Please try again.", 500);
}

function databaseUnavailable() {
  return new AppError(
    "DATABASE_UNAVAILABLE",
    "The database is unavailable right now. Please try again shortly.",
    503,
  );
}
