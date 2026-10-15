// Admission types and labels. No server-only code here: the admin panel and checkout page import it too.

export const STATUSES = ["pending_payment", "paid", "confirmed", "enrolled", "cancelled"] as const;
export type AdmissionStatus = (typeof STATUSES)[number];

export const STATUS_LABEL: Record<AdmissionStatus, string> = {
  pending_payment: "Awaiting payment",
  paid: "Payment received",
  confirmed: "Confirmed",
  enrolled: "Enrolled",
  cancelled: "Cancelled",
};

// The one-click "next step" button in the admin drawer for each status.
export const NEXT_STEP: Partial<Record<AdmissionStatus, [AdmissionStatus, string]>> = {
  pending_payment: ["paid", "💵 Mark as paid"],
  paid: ["confirmed", "✅ Confirm admission"],
  confirmed: ["enrolled", "🎓 Mark enrolled"],
};

export const PAYMENT_METHODS = ["jazzcash", "easypaisa", "card"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_LABEL: Record<PaymentMethod | "campus", string> = {
  jazzcash: "JazzCash",
  easypaisa: "Easypaisa",
  card: "Debit/Credit card",
  campus: "Paid at campus",
};

export type Admission = {
  id: string; // e.g. "ADM-1001"
  sessionId: string; // the chat it came from, so status updates can be sent back to that chat
  createdAt: string;
  student: { name: string; phone: string; email: string | null };
  course: string; // course id
  courseName: string;
  campus: string; // campus id
  campusName: string;
  batchLabel: string;
  batchStart: string;
  fee: number;
  status: AdmissionStatus;
  payment: { method: PaymentMethod | "campus"; txnId: string; paidAt: string } | null;
  notes: string;
  statusHistory: { status: AdmissionStatus; at: string }[];
};

// What the public checkout page may see (no phone, email or notes).
export type CheckoutInfo = Pick<Admission, "id" | "courseName" | "campusName" | "batchStart" | "fee" | "status"> & {
  studentName: string;
  payment: Admission["payment"];
};

export const rs = (amount: number) => `Rs. ${Math.round(amount).toLocaleString("en-US")}`;
