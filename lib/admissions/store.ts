import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { getCampus } from "@/content/campuses";
import { PAYMENT_LABEL, rs, type Admission, type AdmissionStatus, type PaymentMethod } from "./shared";

// Demo storage: one JSON file. Fine for a demo on one server; use a real database for production.
const FILE = path.join(process.cwd(), "data", "admissions.json");

type InboxMessage = { id: string; text: string };

type Db = {
  nextNumber: number;
  admissions: Admission[];
  // Messages waiting to be shown in a chat (payment received, admission confirmed...), by chat session.
  inbox: Record<string, InboxMessage[]>;
};

async function load(): Promise<Db> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as Db;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return { nextNumber: 1001, admissions: [], inbox: {} };
    throw error;
  }
}

// Every read-modify-write waits for the previous one, so two requests never overwrite each other.
let queue: Promise<unknown> = Promise.resolve();

function withDb<T>(change: (db: Db) => T): Promise<T> {
  const next = queue.then(async () => {
    const db = await load();
    const result = change(db);
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(db, null, 2));
    return result;
  });
  queue = next.catch(() => {});
  return next;
}

const now = () => new Date().toISOString();

function pushInbox(db: Db, sessionId: string, text: string) {
  (db.inbox[sessionId] ??= []).push({ id: crypto.randomUUID(), text });
}

// The WhatsApp message a student gets when the admin moves their admission to a new status.
function statusMessage(admission: Admission): string | null {
  const course = `${admission.courseName} at our ${admission.campusName} campus`;
  const phone = getCampus(admission.campus as Parameters<typeof getCampus>[0])?.phones[0];
  switch (admission.status) {
    case "paid":
      return `✅ We've received your payment of *${rs(admission.fee)}* for admission *${admission.id}*.\nOur team will confirm your admission shortly.`;
    case "confirmed":
      return `🎉 Your admission is confirmed!\n*${admission.id}* · ${course}\nClasses start on *${admission.batchStart}*. See you in class!`;
    case "enrolled":
      return `🎓 Welcome to IBAGRADS, ${admission.student.name.split(" ")[0]}! You're now enrolled in ${course}.`;
    case "cancelled":
      return `Your admission *${admission.id}* has been cancelled. If this is a mistake, please contact us${phone ? ` at ${phone}` : ""}.`;
    default:
      return null;
  }
}

export type NewAdmission = Pick<
  Admission,
  "sessionId" | "student" | "course" | "courseName" | "campus" | "campusName" | "batchLabel" | "batchStart" | "fee"
>;

export function createAdmission(input: NewAdmission): Promise<Admission> {
  return withDb((db) => {
    const createdAt = now();
    const admission: Admission = {
      ...input,
      id: `ADM-${db.nextNumber++}`,
      createdAt,
      status: "pending_payment",
      payment: null,
      notes: "",
      statusHistory: [{ status: "pending_payment", at: createdAt }],
    };
    db.admissions.unshift(admission); // newest first
    return admission;
  });
}

export async function listAdmissions(): Promise<Admission[]> {
  return (await load()).admissions;
}

export async function getAdmission(id: string): Promise<Admission | undefined> {
  return (await load()).admissions.find((admission) => admission.id === id);
}

export async function listSessionAdmissions(sessionId: string): Promise<Admission[]> {
  return (await load()).admissions.filter((admission) => admission.sessionId === sessionId);
}

// The demo checkout: marks the admission paid and tells the chat.
export function payAdmission(id: string, method: PaymentMethod): Promise<Admission | { error: string }> {
  return withDb((db) => {
    const admission = db.admissions.find((item) => item.id === id);
    if (!admission) return { error: "Admission not found" };
    if (admission.status !== "pending_payment") return { error: "This admission is already paid or closed" };

    const prefix = { jazzcash: "JC", easypaisa: "EP", card: "CD" }[method];
    admission.payment = { method, txnId: `${prefix}${Math.floor(100000 + Math.random() * 900000)}`, paidAt: now() };
    admission.status = "paid";
    admission.statusHistory.push({ status: "paid", at: admission.payment.paidAt });

    pushInbox(
      db,
      admission.sessionId,
      `✅ Payment received!\nAdmission: *${admission.id}*\nAmount: *${rs(admission.fee)}* via ${PAYMENT_LABEL[method]} (Txn ${admission.payment.txnId})\nOur team will confirm your admission shortly.`,
    );
    return admission;
  });
}

export type AdmissionUpdate = { status: AdmissionStatus; campus: string | null; notes: string; notify: boolean };

export function updateAdmission(id: string, update: AdmissionUpdate): Promise<{ admission: Admission; notified: boolean } | null> {
  return withDb((db) => {
    const admission = db.admissions.find((item) => item.id === id);
    if (!admission) return null;

    const campus = update.campus ? getCampus(update.campus as Parameters<typeof getCampus>[0]) : undefined;
    if (campus) {
      admission.campus = campus.id;
      admission.campusName = campus.name;
    }
    admission.notes = update.notes;

    let notified = false;
    if (update.status !== admission.status) {
      admission.status = update.status;
      admission.statusHistory.push({ status: update.status, at: now() });
      // Marking paid from the panel means the student paid at the campus.
      if (update.status === "paid" && !admission.payment) {
        admission.payment = { method: "campus", txnId: "-", paidAt: now() };
      }
      const message = update.notify ? statusMessage(admission) : null;
      if (message) {
        pushInbox(db, admission.sessionId, message);
        notified = true;
      }
    }
    return { admission, notified };
  });
}

// The chat calls this every few seconds; returns waiting messages and removes them.
export function takeInbox(sessionId: string): Promise<InboxMessage[]> {
  return withDb((db) => {
    const messages = db.inbox[sessionId] ?? [];
    delete db.inbox[sessionId];
    return messages;
  });
}
