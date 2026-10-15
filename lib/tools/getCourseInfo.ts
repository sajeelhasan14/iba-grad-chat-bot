import { tool } from "@openai/agents";
import { z } from "zod";
import { COURSES, COURSE_IDS, FEE_NOTE, ONLINE_FEATURES, getCourse } from "@/content/courses";

export const getCourseInfo = tool({
  name: "get_course_info",
  description:
    "Get IBAGRADS test-prep course details: which universities a course prepares for, classroom or online, highlights and registration link. Pass a course id for one course, or null for the list of all courses. Use for questions like 'what courses do you offer' or 'what does the ECAT course cover'.",
  parameters: z.object({
    course: z.enum(COURSE_IDS).nullable().describe("Course id, e.g. 'bcat' (IBA and business schools) or 'ecat'. null = all courses"),
  }),
  async execute({ course }) {
    console.log(`[tool] get_course_info(${course})`);

    // The full list only needs names and modes; details come from asking about one course.
    if (!course) {
      return {
        courses: COURSES.map(({ id, name, modes }) => ({ id, name, modes })),
        feeNote: FEE_NOTE,
      };
    }

    const found = getCourse(course);
    return {
      course: found,
      onlineFeatures: found?.modes.includes("online") ? ONLINE_FEATURES : undefined,
      feeNote: FEE_NOTE,
    };
  },
});
