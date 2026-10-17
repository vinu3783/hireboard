import { errorResponse, ok, parseBody } from "@/lib/api";
import { candidateInputSchema } from "@/lib/candidates/schema";
import { deleteCandidate, getCandidate, updateCandidate } from "@/lib/candidates/service";
import { notFound } from "@/lib/errors";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  try {
    const { id } = await params;
    const candidate = await getCandidate(id);
    if (!candidate) throw notFound();
    return ok(candidate);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: Request, { params }: Context) {
  try {
    const { id } = await params;
    const input = await parseBody(request, candidateInputSchema);
    return ok(await updateCandidate(id, input));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  try {
    const { id } = await params;
    await deleteCandidate(id);
    return ok({ id });
  } catch (error) {
    return errorResponse(error);
  }
}
