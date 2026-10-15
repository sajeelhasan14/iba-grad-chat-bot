import { tool } from "@openai/agents";
import { z } from "zod";
import { TEST_CATEGORIES, TEST_DATES, TEST_DATES_NOTE } from "@/content/testDates";

export const getTestDates = tool({
  name: "get_test_dates",
  description:
    "Get upcoming university admission test dates: ECAT (engineering, e.g. NED, NUST, GIKI), BCAT (business schools, e.g. IBA, SZABIST), MDCAT (medical, e.g. PMC, NUMS, AKU) and SAT. Pass a category, or null for all.",
  parameters: z.object({
    category: z.enum(TEST_CATEGORIES).nullable().describe("Test category, e.g. 'mdcat'. null = all categories"),
  }),
  async execute({ category }) {
    console.log(`[tool] get_test_dates(${category})`);

    return {
      testDates: TEST_DATES.filter((testDate) => !category || testDate.category === category),
      note: TEST_DATES_NOTE,
    };
  },
});
