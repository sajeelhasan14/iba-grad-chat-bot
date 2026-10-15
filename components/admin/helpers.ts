import { STATUS_LABEL, type Admission, type AdmissionStatus } from "@/lib/admissions/shared";

export const isToday = (iso: string) => new Date(iso).toDateString() === new Date().toDateString();

// "just now", "5 min ago", "2 h ago", or "14 Oct, 5:50 pm".
export function ago(iso: string): string {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (minutes < 24 * 60 && isToday(iso)) return `${Math.floor(minutes / 60)} h ago`;
  const date = new Date(iso);
  return `${date.toLocaleDateString([], { day: "numeric", month: "short" })}, ${date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
}

export const fullDate = (iso: string) =>
  new Date(iso).toLocaleString([], { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

export const statusLabel = (status: AdmissionStatus) => STATUS_LABEL[status];

// "0300 1234567" → "923001234567" for wa.me links and tel: links.
export const waNumber = (phone: string) => phone.replace(/\D/g, "").replace(/^0/, "92");

// Search across the columns an admin would type: id, name, phone, email, course, campus.
export function matches(admission: Admission, query: string): boolean {
  if (!query) return true;
  const haystack = [admission.id, admission.student.name, admission.student.phone, admission.student.email, admission.courseName, admission.campusName]
    .join(" ")
    .toLowerCase();
  const digits = query.replace(/\D/g, "");
  return haystack.includes(query) || (digits.length >= 4 && admission.student.phone.replace(/\D/g, "").includes(digits));
}

// Two short beeps when a new admission or payment arrives (no sound file needed).
let audio: AudioContext | undefined;
export function unlockAudio() {
  audio ??= new AudioContext();
}
export function chime() {
  try {
    audio ??= new AudioContext();
    void audio.resume();
    [880, 1320].forEach((frequency, i) => {
      const oscillator = audio!.createOscillator();
      const gain = audio!.createGain();
      oscillator.frequency.value = frequency;
      oscillator.connect(gain).connect(audio!.destination);
      const start = audio!.currentTime + i * 0.18;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.25, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.35);
      oscillator.start(start);
      oscillator.stop(start + 0.4);
    });
  } catch {
    // Audio blocked by the browser: stay silent.
  }
}
