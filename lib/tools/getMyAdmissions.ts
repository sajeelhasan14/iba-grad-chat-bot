import { tool, type RunContext } from "@openai/agents";
import { z } from "zod";
import { formatFee } from "@/content/courses";
import { PAYMENT_LABEL, STATUS_LABEL } from "@/lib/admissions/shared";
import { listSessionAdmissions } from "@/lib/admissions/store";
import type { ChatContext } from "@/lib/chatContext";

export const getMyAdmissions = tool({
  name: "get_my_admissions",
  description:
    "Get the admissions this student created in this chat, with their status (awaiting payment, payment received, confirmed...). Use when they ask about their admission or payment, or want the Pay button again.",
  parameters: z.object({}),
  async execute(_input, runContext?: RunContext<ChatContext>) {
    console.log("[tool] get_my_admissions");

    const context = runContext?.context;
    if (!context?.sessionId) return { admissions: [] };

    const admissions = await listSessionAdmissions(context.sessionId);

    // If something is still unpaid, show the Pay button again under the reply.
    const unpaid = admissions.find((admission) => admission.status === "pending_payment");
    if (unpaid) context.payLink = { label: `💳 Pay ${formatFee(unpaid.fee)}`, url: `/pay?id=${unpaid.id}` };

    return {
      admissions: admissions.map((admission) => ({
        admissionId: admission.id,
        course: admission.courseName,
        campus: admission.campusName,
        batchStart: admission.batchStart,
        fee: formatFee(admission.fee),
        status: STATUS_LABEL[admission.status],
        payment: admission.payment ? `${PAYMENT_LABEL[admission.payment.method]} (${admission.payment.txnId})` : null,
      })),
    };
  },
});
