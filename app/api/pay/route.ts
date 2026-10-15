import { z } from "zod";
import { PAYMENT_METHODS, type Admission, type CheckoutInfo } from "@/lib/admissions/shared";
import { getAdmission, payAdmission } from "@/lib/admissions/store";

// Only what the checkout page needs: no phone, email or notes (anyone with the link can open it).
const toCheckout = (admission: Admission): CheckoutInfo => ({
  id: admission.id,
  studentName: admission.student.name,
  courseName: admission.courseName,
  campusName: admission.campusName,
  batchStart: admission.batchStart,
  fee: admission.fee,
  status: admission.status,
  payment: admission.payment,
});

// GET /api/pay?id=ADM-1001 → the admission shown on the checkout page.
export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id") ?? "";
  const admission = await getAdmission(id);
  if (!admission) return Response.json({ error: "Admission not found" }, { status: 404 });
  return Response.json(toCheckout(admission));
}

const bodySchema = z.object({ id: z.string().max(20), method: z.enum(PAYMENT_METHODS) });

// POST /api/pay → demo payment: no real money moves, the admission is just marked paid.
export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid request" }, { status: 400 });

  const result = await payAdmission(parsed.data.id, parsed.data.method);
  if ("error" in result) return Response.json({ error: result.error }, { status: 409 });
  return Response.json(toCheckout(result));
}
