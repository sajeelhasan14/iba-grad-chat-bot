import { tool, type RunContext } from "@openai/agents";
import { z } from "zod";
import { BATCHES } from "@/content/batches";
import { CAMPUS_IDS, getCampus } from "@/content/campuses";
import { COURSE_IDS, formatFee, getCourse } from "@/content/courses";
import { createAdmission as saveAdmission } from "@/lib/admissions/store";
import type { ChatContext } from "@/lib/chatContext";

// Accepts 0300 1234567, 03001234567, +92 300 1234567, 92-300-1234567 → "0300 1234567". Anything else → null.
function normalizePhone(input: string): string | null {
  const match = input.replace(/[\s\-()]/g, "").match(/^(?:\+?92|0)?(3\d{9})$/);
  return match ? `0${match[1].slice(0, 3)} ${match[1].slice(3)}` : null;
}

export const createAdmission = tool({
  name: "create_admission",
  description:
    "Create a student's admission. Call ONLY after the student has seen the summary (name, phone, course, campus, batch, fee) and clearly confirmed it. Returns the admission number; a Pay button is then shown under your reply automatically.",
  parameters: z.object({
    studentName: z.string().describe("Student's full name"),
    phone: z.string().describe("Pakistani mobile number, e.g. 0300 1234567"),
    email: z.string().nullable().describe("Email address, or null if the student didn't give one"),
    course: z.enum(COURSE_IDS).describe("Course id"),
    campus: z.enum(CAMPUS_IDS).describe("Campus id"),
  }),
  async execute(input, runContext?: RunContext<ChatContext>) {
    console.log(`[tool] create_admission(${input.course}, ${input.campus})`);

    const context = runContext?.context;
    if (!context?.sessionId) return { error: "No chat session. Ask the student to refresh the page." };

    // Checks the model can't be trusted to do: these return a message so the agent asks again.
    const phone = normalizePhone(input.phone);
    if (!phone) return { error: "Invalid phone number. Ask for a Pakistani mobile number like 0300 1234567." };
    const name = input.studentName.trim();
    if (name.length < 3) return { error: "Ask for the student's full name." };
    const email = input.email?.trim() || null;
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Invalid email. Ask again, or continue without email." };

    const course = getCourse(input.course);
    const campus = getCampus(input.campus);
    const batch = BATCHES.find((item) => item.course === input.course && item.campus === input.campus);
    if (!course || !campus || !batch) {
      return { error: "This course has no batch at this campus. Use get_batches to suggest another campus." };
    }

    const admission = await saveAdmission({
      sessionId: context.sessionId,
      student: { name, phone, email },
      course: course.id,
      courseName: course.name,
      campus: campus.id,
      campusName: campus.name,
      batchLabel: batch.label,
      batchStart: batch.startDate,
      fee: course.fee,
    });

    context.payLink = { label: `💳 Pay ${formatFee(admission.fee)}`, url: `/pay?id=${admission.id}` };

    return {
      admissionId: admission.id,
      status: "Awaiting payment",
      fee: formatFee(admission.fee),
      batchStart: admission.batchStart,
      instruction: "Give the student their admission number and ask them to tap the Pay button below your message. Never write a payment link yourself.",
    };
  },
});
