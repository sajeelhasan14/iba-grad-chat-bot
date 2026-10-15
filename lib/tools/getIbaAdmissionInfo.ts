import { tool } from "@openai/agents";
import { z } from "zod";
import { IBA_ADMISSION, IBA_NOTE } from "@/content/ibaAdmission";

export const getIbaAdmissionInfo = tool({
  name: "get_iba_admission_info",
  description:
    "Get IBA Karachi (the university) admission rules: eligibility for BBA/BS/MBA/EMBA/MS/PhD, SAT score requirements, GMAT/GRE test exemption, direct admission, and the list of IBA programs.",
  parameters: z.object({}),
  async execute() {
    console.log("[tool] get_iba_admission_info");

    return { ...IBA_ADMISSION, note: IBA_NOTE };
  },
});
