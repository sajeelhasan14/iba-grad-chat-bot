import type { CampusId } from "./campuses";
import type { CourseId } from "./courses";

export type Batch = {
  course: CourseId;
  campus: CampusId;
  label: string;
  startDate: string;
  weekend: boolean;
};

export const BATCH_NOTE = "Seats are limited. Students should call the campus to confirm class timings and reserve a seat.";

// DEMO DATA: the real website only had old February dates without a year,
// so these upcoming dates are made up for the demo. Replace them with real dates from IBAGRADS.
// (Weekend batches start on a Saturday/Sunday; weekday batches avoid Friday, when campuses are closed.)
export const BATCHES: Batch[] = [
  // BCAT / IBA
  { course: "bcat", campus: "north-nazimabad", label: "IBA (BBA/BS + MBA)", startDate: "2 November 2026", weekend: false },
  { course: "bcat", campus: "bahadurabad", label: "IBA (BBA/BS + MBA)", startDate: "9 November 2026", weekend: false },
  { course: "bcat", campus: "gulshan-e-iqbal", label: "IBA (BBA/BS + MBA)", startDate: "2 November 2026", weekend: false },
  { course: "bcat", campus: "gulistan-e-johar", label: "IBA (BBA/BS + MBA)", startDate: "16 November 2026", weekend: false },
  { course: "bcat", campus: "dha", label: "IBA (BBA/BS + MBA)", startDate: "9 November 2026", weekend: false },
  { course: "bcat", campus: "malir", label: "IBA Weekend batch", startDate: "7 November 2026", weekend: true },
  { course: "bcat", campus: "online", label: "BCAT online (IBA, LUMS, CBM, SZABIST, NBS)", startDate: "4 November 2026", weekend: false },

  // ECAT
  { course: "ecat", campus: "north-nazimabad", label: "ECAT", startDate: "3 November 2026", weekend: false },
  { course: "ecat", campus: "bahadurabad", label: "ECAT Weekend batch", startDate: "8 November 2026", weekend: true },
  { course: "ecat", campus: "gulshan-e-iqbal", label: "ECAT Weekend batch", startDate: "7 November 2026", weekend: true },
  { course: "ecat", campus: "gulistan-e-johar", label: "ECAT", startDate: "10 November 2026", weekend: false },
  { course: "ecat", campus: "dha", label: "ECAT", startDate: "17 November 2026", weekend: false },
  { course: "ecat", campus: "malir", label: "ECAT Weekend batch", startDate: "14 November 2026", weekend: true },
  { course: "ecat", campus: "online", label: "ECAT online (NUST, FAST, NED, PIEAS, IIEE)", startDate: "5 November 2026", weekend: false },

  // MDCAT
  { course: "mdcat", campus: "north-nazimabad", label: "MDCAT full-length batch", startDate: "2 November 2026", weekend: false },
  { course: "mdcat", campus: "bahadurabad", label: "MDCAT Weekend batch", startDate: "8 November 2026", weekend: true },
  { course: "mdcat", campus: "gulshan-e-iqbal", label: "MDCAT Weekend batch", startDate: "14 November 2026", weekend: true },
  { course: "mdcat", campus: "gulistan-e-johar", label: "MDCAT Weekend batch", startDate: "7 November 2026", weekend: true },
  { course: "mdcat", campus: "dha", label: "MDCAT", startDate: "16 November 2026", weekend: false },
  { course: "mdcat", campus: "malir", label: "MDCAT Weekend batch", startDate: "15 November 2026", weekend: true },
  { course: "mdcat", campus: "online", label: "MDCAT online (MDCAT, NUMS, AKU)", startDate: "9 November 2026", weekend: false },

  // SAT (preparing for the March 2027 attempt)
  { course: "sat", campus: "dha", label: "SAT Weekend batch (March 2027 attempt)", startDate: "28 November 2026", weekend: true },
  { course: "sat", campus: "bahadurabad", label: "SAT Weekend batch (March 2027 attempt)", startDate: "29 November 2026", weekend: true },
  { course: "sat", campus: "north-nazimabad", label: "SAT (March 2027 attempt)", startDate: "1 December 2026", weekend: false },
  { course: "sat", campus: "gulshan-e-iqbal", label: "SAT (March 2027 attempt)", startDate: "2 December 2026", weekend: false },
  { course: "sat", campus: "gulistan-e-johar", label: "SAT (March 2027 attempt)", startDate: "3 December 2026", weekend: false },
  { course: "sat", campus: "malir", label: "SAT Weekend batch (March 2027 attempt)", startDate: "5 December 2026", weekend: true },
  { course: "sat", campus: "online", label: "SAT online (March 2027 attempt)", startDate: "7 December 2026", weekend: false },
];
