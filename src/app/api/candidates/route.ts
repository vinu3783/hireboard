import { errorResponse, ok, parseBody } from "@/lib/api";
import { parseListParams } from "@/lib/candidates/query";
import { candidateInputSchema } from "@/lib/candidates/schema";
import { createCandidate, listCandidates } from "@/lib/candidates/service";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const params = parseListParams(Object.fromEntries(url.searchParams));
    return ok(await listCandidates(params));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const input = await parseBody(request, candidateInputSchema);
    return ok(await createCandidate(input), 201);
  } catch (error) {
    return errorResponse(error);
  }
}
