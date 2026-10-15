import { tool } from "@openai/agents";
import { z } from "zod";
import { BATCHES, BATCH_NOTE } from "@/content/batches";
import { CAMPUS_IDS, getCampus } from "@/content/campuses";
import { COURSE_IDS } from "@/content/courses";

export const getBatches = tool({
  name: "get_batches",
  description:
    "Get IBAGRADS batches: which course batch runs at which campus, its start date and whether it is a weekend batch. Filter by course, campus, or both; null means no filter. Use for questions like 'when does ECAT start at DHA' or 'which batches are at Malir'.",
  parameters: z.object({
    course: z.enum(COURSE_IDS).nullable().describe("Course id, e.g. 'ecat'. null = all courses"),
    campus: z.enum(CAMPUS_IDS).nullable().describe("Campus id, e.g. 'dha'. null = all campuses"),
  }),
  async execute({ course, campus }) {
    console.log(`[tool] get_batches(${course}, ${campus})`);

    const batches = BATCHES.filter(
      (batch) => (!course || batch.course === course) && (!campus || batch.campus === campus),
    ).map((batch) => ({ ...batch, campusName: getCampus(batch.campus)?.name }));

    // An empty list gets an explicit result so the agent refers the student to IBAGRADS instead of guessing.
    if (batches.length === 0) {
      return { found: false, message: "No batch found for this course and campus. Refer the student to the campus contact." };
    }

    return { found: true, batches, note: BATCH_NOTE };
  },
});
