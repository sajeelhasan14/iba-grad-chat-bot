export const IBA_NOTE = "IBA's rules can change each year. Students should confirm on https://www.iba.edu.pk";

export const IBA_ADMISSION = {
  satRequirements: [
    { programs: "BBA & BSAF", math: "600/800", readingWriting: "600/800", total: "1270" },
    { programs: "BSSS & BS ECO", math: "600/800", readingWriting: "600/800", total: "not stated" },
    { programs: "BSCS & BSEM", math: "640/800", readingWriting: "600/800", total: "not stated" },
  ],
  satNote: "SAT essay score is not required.",
  graduateTestExemption: "GMAT 600, or GRE 160 Quant + 160 Verbal (320 total), gives test exemption.",
  directAdmission:
    "IBA gives direct admission to undergraduate applicants with high test scores (cut-off changes yearly). Others must clear an interview.",
  eligibility: {
    undergraduate: [
      "BBA: 2 B's and 1 C in three principal A-level subjects, or 65% in Intermediate",
      "BS-ACF / SS / ECO / ECO-MATH / CS: 1 B and 2 C's in A-levels, or 60% in Intermediate",
    ],
    graduate: [
      "MBA (Morning/Evening) and MS: 2.5 CGPA or 60%, 16 years of education, 4-year degree from an HEC-recognized university; no work experience required",
      "EMBA: 16 years of education and 3 years of work experience after education",
    ],
    phd: ["PhD (CS, Economics, Math, Statistics): MS/M.Phil or equivalent with 3.0 CGPA or 60%"],
  },
  programs: {
    undergraduate: ["BBA", "BS-ACF", "BS-SS", "BS-ECO", "BS-ECO-MATH", "BS-CS", "BS-MATH"],
    graduate: [
      "MBA (Morning/Evening)", "EMBA", "MS-CS", "MS Data Science", "MS Development Studies",
      "MS-ECO", "MS-MATH", "MS Islamic Banking and Finance", "MS Journalism",
    ],
    phd: ["PhD CS", "PhD Economics", "PhD Math"],
  },
};
