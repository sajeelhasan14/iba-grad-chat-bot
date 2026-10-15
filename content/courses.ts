/**
 * The agent may only refer to courses by these IDs (z.enum in the tools).
 */
export const COURSE_IDS = ["bcat", "ecat", "mdcat", "sat", "gmat", "gre", "school"] as const;

export type CourseId = (typeof COURSE_IDS)[number];

export type Course = {
  id: CourseId;
  name: string;
  preparesFor: string[];
  modes: ("classroom" | "online")[];
  highlights: string[];
  registerUrl: string;
  fee: number; // full-course fee in PKR (school classes: per month)
};

// DEMO DATA: the website has no fees, so the fees below are made up for the demo.
export const FEE_NOTE =
  "Fees are for the full course (school classes: per month). Students can confirm admission and pay online right here in the chat.";

export const formatFee = (fee: number) => `Rs. ${fee.toLocaleString("en-US")}`;

export const ONLINE_FEATURES = [
  "Daily live classes from experienced teachers, with focus on doubts and practice",
  "Instant answers to doubts",
  "Students can discuss directly with the teacher",
];

export const COURSES: Course[] = [
  {
    id: "bcat",
    name: "BCAT (Business schools, including IBA)",
    preparesFor: ["IBA", "LUMS", "IOBM", "SZABIST", "KSBL", "CBM", "NBS", "KU"],
    modes: ["classroom", "online"],
    highlights: [
      "Main course for the IBA Karachi admission test; the same material covers other business schools",
      "MBA + IBA Round 2 batches at several campuses",
      "IBA interview briefing, then 3-4 mock interviews by IBA graduates and students",
    ],
    registerUrl: "https://ibagrads.com/bcat/",
    fee: 45000,
  },
  {
    id: "ecat",
    name: "ECAT (Engineering)",
    preparesFor: ["NUST", "PIEAS", "FAST", "GIKI", "NED", "COMSATS", "UET", "KU-UBIT", "IIEE"],
    modes: ["classroom", "online"],
    highlights: ["Weekday and weekend batches at different campuses"],
    registerUrl: "https://ibagrads.com/ecat/",
    fee: 45000,
  },
  {
    id: "mdcat",
    name: "MDCAT (Medical)",
    preparesFor: ["PMC MDCAT", "NUMS", "DUHS", "JSMU", "KMDC", "AKU"],
    modes: ["classroom", "online"],
    highlights: ["Weekday and weekend batches; a full-length batch at North Nazimabad"],
    registerUrl: "https://ibagrads.com/mdcat/",
    fee: 50000,
  },
  {
    id: "sat",
    name: "SAT",
    preparesFor: ["SAT (for local and international universities, incl. IBA's SAT route)"],
    modes: ["classroom", "online"],
    highlights: ["Batches for specific SAT attempts (e.g. March 2027)"],
    registerUrl: "https://ibagrads.com/class-room-courses/sat/",
    fee: 60000,
  },
  {
    id: "gmat",
    name: "GMAT",
    preparesFor: ["GMAT (graduate business schools, e.g. MBA)"],
    modes: ["classroom"],
    highlights: [],
    registerUrl: "https://ibagrads.com/class-room-courses/g-mat-about/",
    fee: 55000,
  },
  {
    id: "gre",
    name: "GRE",
    preparesFor: ["GRE (graduate programs)"],
    modes: ["classroom"],
    highlights: [],
    registerUrl: "https://ibagrads.com/class-room-courses/gre-about/",
    fee: 55000,
  },
  {
    id: "school",
    name: "School classes (XI-XII and IX-X)",
    preparesFor: ["XI-XII: Pre-Engineering, Pre-Medical, Computer", "IX-X: Science group, General group"],
    modes: ["online"],
    highlights: [],
    registerUrl: "https://ibagrads.com/online-courses/",
    fee: 15000,
  },
];

export function getCourse(id: CourseId): Course | undefined {
  return COURSES.find((course) => course.id === id);
}
