import { CAMPUSES } from "@/content/campuses";
import { isAdmin, unauthorized } from "@/lib/admissions/auth";
import { listAdmissions } from "@/lib/admissions/store";

// GET /api/admin/admissions → every admission (newest first) + the campus list for the drawer's dropdown.
export async function GET() {
  if (!(await isAdmin())) return unauthorized();

  return Response.json({
    admissions: await listAdmissions(),
    campuses: CAMPUSES.map(({ id, name }) => ({ id, name })),
  });
}
