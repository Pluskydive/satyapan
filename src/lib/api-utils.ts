import { NextResponse } from "next/server";
import { AuthenticationServiceError, AuthorizationError } from "@/lib/authz";
import { getRuntimeMode, isRuntimeDisabledError } from "@/lib/runtime-mode";

export class RequestInputError extends Error {
  constructor(message: string, public readonly status: 400 | 413 = 400) {
    super(message);
  }
}

export function demoApiUnavailable() {
  if (getRuntimeMode() !== "disabled") return null;

  return NextResponse.json(
    { error: "This prototype is not configured to process data in this environment." },
    { status: 503, headers: { "Cache-Control": "no-store" } }
  );
}

export function sameOriginFailure(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) {
    return NextResponse.json(
      { error: "This request could not be verified. Reload the page and try again." },
      { status: 403, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    if (new URL(origin).origin === new URL(request.url).origin) return null;
  } catch {
    // Treat malformed Origin values as cross-origin.
  }

  return NextResponse.json(
    { error: "This request could not be verified. Reload the page and try again." },
    { status: 403, headers: { "Cache-Control": "no-store" } }
  );
}

export async function readJsonBody<T = unknown>(request: Request, maxBytes = 1_000_000): Promise<T> {
  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    throw new RequestInputError("The submitted file is too large.", 413);
  }

  const reader = request.body?.getReader();
  if (!reader) throw new RequestInputError("A JSON request body is required.");

  const chunks: Uint8Array[] = [];
  let size = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        throw new RequestInputError("The submitted file is too large.", 413);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return JSON.parse(new TextDecoder().decode(bytes)) as T;
  } catch {
    throw new RequestInputError("The submitted information is not valid JSON.");
  }
}

export function apiFailure(error: unknown, fallback: string) {
  if (error instanceof AuthenticationServiceError) {
    return NextResponse.json(
      { error: "We couldn't verify your sign-in right now. Please try again shortly." },
      { status: 503, headers: { "Cache-Control": "private, no-store" } }
    );
  }
  if (error instanceof AuthorizationError) {
    return NextResponse.json(
      { error: error.status === 401 ? "Please sign in to continue." : "You don't have access to this record or action." },
      { status: error.status, headers: { "Cache-Control": "private, no-store" } }
    );
  }
  if (error instanceof RequestInputError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  if (isRuntimeDisabledError(error)) {
    return NextResponse.json(
      { error: "This prototype is not configured to process data in this environment." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
  if (error instanceof Error && error.message === "SATYAPAN_INVALID_INSTITUTION") {
    return NextResponse.json({ error: "Choose an institution from the list and try again." }, { status: 400 });
  }
  if (error instanceof Error && error.message === "SATYAPAN_LIVE_OPERATION_DISABLED") {
    return NextResponse.json({ error: "This operation is not available in live mode." }, { status: 501 });
  }
  if (error instanceof Error && error.message === "SATYAPAN_DUPLICATE_UPLOAD") {
    return NextResponse.json(
      { error: "Some roll IDs already exist. Ask an institution administrator to update existing records." },
      { status: 409 }
    );
  }

  // Keep internal exceptions, database details, and submitted data out of responses.
  return NextResponse.json({ error: fallback }, { status: 500 });
}
