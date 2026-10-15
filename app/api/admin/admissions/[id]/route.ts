import { z } from "zod";
import { isAdmin, unauthorized } from "@/lib/admissions/auth";
import { STATUSES } from "@/lib/admissions/shared";
import { updateAdmission } from "@/lib/admissions/store";

const bodySchema = z.object({
  status: z.enum(STATUSES),
  campus: z.string().max(40).nullable(),
  notes: z.string().max(2000),
  notify: z.boolean(), // also send the student a WhatsApp (chat) message about the new status
});

// PATCH /api/admin/admissions/ADM-1001 → save the drawer's changes.
export async function PATCH(request: Request, ctx: RouteContext<"/api/admin/admissions/[id]">) {
  if (!(await isAdmin())) return unauthorized();

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid request" }, { status: 400 });

  const { id } = await ctx.params;
  const result = await updateAdmission(id, parsed.data);
  if (!result) return Response.json({ error: "Admission not found" }, { status: 404 });
  return Response.json(result);
}
