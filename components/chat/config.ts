import type { ChatItem } from "./types";

export const BUSINESS = "IBAGRADS";

// Shown under the first reply. WhatsApp allows max 3 buttons of max 20 characters.
export const QUICK_REPLIES = ["Batch start dates 📅", "Campus contacts 📞", "Upcoming test dates 📝"];

export const INTRO: ChatItem[] = [
  { kind: "chip", id: "intro-date", variant: "date", text: "Today" },
  {
    kind: "chip",
    id: "intro-notice",
    variant: "notice",
    text: "🎓 Ask the IBAGRADS assistant about courses, batches, campuses and test dates.",
  },
];

// Decorative rows so the chat list looks like a real phone.
export const OTHER_CHATS: [name: string, preview: string, time: string][] = [
  ["Study Group 📚", "Bilal: Kal mock test hai, notes bhej do", "Yesterday"],
  ["Ammi", "Khana time pe kha lena", "Yesterday"],
  ["Coaching Friends", "Sara: Weekend batch better hai", "Monday"],
  ["Hamza", "Voice call", "Sunday"],
  ["Ayesha", "ECAT ka result aa gaya? 🤞", "12/10/2026"],
];

export const EMOJIS = "😀 😂 😍 🙏 👍 👌 🙌 ❤️ 🔥 🎓 📚 ✏️ 📝 📅 📞 🤔 😅 😢 🤞 💯 ✅ 🏫 ⏰ 🎉".split(" ");
