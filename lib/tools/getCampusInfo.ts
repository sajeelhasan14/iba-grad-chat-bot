import { tool } from "@openai/agents";
import { z } from "zod";
import { ADDRESS_NOTE, CAMPUSES, CAMPUS_IDS, getCampus } from "@/content/campuses";

export const getCampusInfo = tool({
  name: "get_campus_info",
  description:
    "Get IBAGRADS campus contact details: phone numbers, email and office timings. Pass a campus id for one campus, or null for all campuses. Use for questions about phone numbers, contact, timings or locations.",
  parameters: z.object({
    // Strict tool schemas need every field, so "no filter" is null instead of a missing field.
    campus: z.enum(CAMPUS_IDS).nullable().describe("Campus id, e.g. 'dha' or 'malir'. null = all campuses"),
  }),
  async execute({ campus }) {
    console.log(`[tool] get_campus_info(${campus})`);

    return {
      campuses: campus ? [getCampus(campus)] : CAMPUSES,
      note: ADDRESS_NOTE,
    };
  },
});
