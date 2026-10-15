export const TEST_CATEGORIES = ["ecat", "bcat", "mdcat", "sat"] as const;

export type TestCategory = (typeof TEST_CATEGORIES)[number];

export type TestDate = {
  category: TestCategory;
  test: string;
  date: string;
};

export const TEST_DATES_NOTE = "Universities can change their test dates. Students should confirm on the university's official website.";

// DEMO DATA: most dates on the real website had already passed, so the 2027 admission-test dates
// below are made up for the demo. The SAT dates for Nov 2026, Dec 2026 and Mar 2027 are the real ones.
export const TEST_DATES: TestDate[] = [
  // ECAT
  { category: "ecat", test: "NUST NET Series 1", date: "13 December 2026" },
  { category: "ecat", test: "PIEAS", date: "27 June 2027" },
  { category: "ecat", test: "GIKI", date: "4-6 July 2027" },
  { category: "ecat", test: "FAST", date: "10 July 2027" },
  { category: "ecat", test: "NED Round 1", date: "18-20 July 2027" },

  // BCAT
  { category: "bcat", test: "IBA Karachi Round 1 (BBA/BS)", date: "14 February 2027" },
  { category: "bcat", test: "IBA Karachi Round 2 (BBA/BS + MBA)", date: "20 June 2027" },
  { category: "bcat", test: "IOBM", date: "3 July 2027" },
  { category: "bcat", test: "SZABIST", date: "10 July 2027" },

  // MDCAT
  { category: "mdcat", test: "AKU", date: "4 July 2027" },
  { category: "mdcat", test: "PMC MDCAT", date: "25 July 2027" },
  { category: "mdcat", test: "NUMS", date: "15 August 2027" },

  // SAT
  { category: "sat", test: "SAT November attempt", date: "7 November 2026" },
  { category: "sat", test: "SAT December attempt", date: "5 December 2026" },
  { category: "sat", test: "SAT March attempt", date: "6 March 2027" },
  { category: "sat", test: "SAT May attempt", date: "1 May 2027" },
  { category: "sat", test: "SAT June attempt", date: "5 June 2027" },
];
