import { errorResponse, ok, parseBody } from "@/lib/api";
import { stageChangeSchema } from "@/lib/candidates/schema";
import { changeCandidateStage } from "@/lib/candidates/service";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  try {
    const { id } = await params;
    const { stage } = await parseBody(request, stageChangeSchema);
    return ok(await changeCandidateStage(id, stage));
  } catch (error) {
    return errorResponse(error);
  }
}
