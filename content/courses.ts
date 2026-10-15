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
};

// Fees aren't in the data, so the agent refers students to a campus instead of guessing.
export const FEE_NOTE = "Fees, course duration and class timings: refer the student to the campus contact details.";

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
  },
  {
    id: "ecat",
    name: "ECAT (Engineering)",
    preparesFor: ["NUST", "PIEAS", "FAST", "GIKI", "NED", "COMSATS", "UET", "KU-UBIT", "IIEE"],
    modes: ["classroom", "online"],
    highlights: ["Weekday and weekend batches at different campuses"],
    registerUrl: "https://ibagrads.com/ecat/",
  },
  {
    id: "mdcat",
    name: "MDCAT (Medical)",
    preparesFor: ["PMC MDCAT", "NUMS", "DUHS", "JSMU", "KMDC", "AKU"],
    modes: ["classroom", "online"],
    highlights: ["Weekday and weekend batches; a full-length batch at North Nazimabad"],
    registerUrl: "https://ibagrads.com/mdcat/",
  },
  {
    id: "sat",
    name: "SAT",
    preparesFor: ["SAT (for local and international universities, incl. IBA's SAT route)"],
    modes: ["classroom", "online"],
    highlights: ["Batches for specific SAT attempts (e.g. May, August, October)"],
    registerUrl: "https://ibagrads.com/class-room-courses/sat/",
  },
  {
    id: "gmat",
    name: "GMAT",
    preparesFor: ["GMAT (graduate business schools, e.g. MBA)"],
    modes: ["classroom"],
    highlights: [],
    registerUrl: "https://ibagrads.com/class-room-courses/g-mat-about/",
  },
  {
    id: "gre",
    name: "GRE",
    preparesFor: ["GRE (graduate programs)"],
    modes: ["classroom"],
    highlights: [],
    registerUrl: "https://ibagrads.com/class-room-courses/gre-about/",
  },
  {
    id: "school",
    name: "School classes (XI-XII and IX-X)",
    preparesFor: ["XI-XII: Pre-Engineering, Pre-Medical, Computer", "IX-X: Science group, General group"],
    modes: ["online"],
    highlights: [],
    registerUrl: "https://ibagrads.com/online-courses/",
  },
];

export function getCourse(id: CourseId): Course | undefined {
  return COURSES.find((course) => course.id === id);
}
