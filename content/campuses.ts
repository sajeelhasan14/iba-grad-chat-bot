/**
 * The agent may only refer to campuses by these IDs. Tool parameters are built
 * from this list (z.enum), so the model cannot invent a campus.
 */
export const CAMPUS_IDS = [
  "north-nazimabad",
  "bahadurabad",
  "gulshan-e-iqbal",
  "gulistan-e-johar",
  "dha",
  "malir",
  "online",
] as const;

export type CampusId = (typeof CAMPUS_IDS)[number];

export type Campus = {
  id: CampusId;
  name: string;
  phones: string[];
  email: string;
  timings: string;
  mapUrl?: string;
};

// Street addresses aren't in the data, so students are asked to call for directions.
export const ADDRESS_NOTE = "For the exact address and directions, the student should call the campus.";

export const CAMPUSES: Campus[] = [
  {
    id: "north-nazimabad",
    name: "North Nazimabad",
    phones: ["+92-21-36645910", "+92-21-36646952", "+92 342-222 2252"],
    email: "ibagrads@gmail.com",
    timings: "9:00 AM - 5:00 PM, Friday off, Sunday open",
  },
  {
    id: "bahadurabad",
    name: "Bahadurabad",
    phones: ["+92-21-34918987-8", "+92 333-491 8987"],
    email: "ibagrads@gmail.com",
    timings: "9:00 AM - 5:00 PM, Friday off, Sunday open",
  },
  {
    id: "gulshan-e-iqbal",
    name: "Gulshan-e-Iqbal",
    phones: ["+92-21-34983664-5", "+92 331-422 2352"],
    email: "ibagrads@gmail.com",
    timings: "9:00 AM - 5:00 PM, Friday off, Sunday open",
  },
  {
    id: "gulistan-e-johar",
    name: "Gulistan-e-Johar",
    phones: ["+92 340 4501 549", "+92-21-33391413"],
    email: "ibagradsjohar@gmail.com",
    timings: "9:00 AM - 6:00 PM, Saturday to Thursday, Friday off",
  },
  {
    id: "dha",
    name: "DHA",
    phones: ["+92 333-534 9966"],
    email: "ibagrads@gmail.com",
    timings: "9:00 AM - 5:00 PM, Friday off, Sunday open",
  },
  {
    id: "malir",
    name: "Malir",
    phones: ["0344 5144040", "021-34514404"],
    email: "ibagrads@gmail.com",
    timings: "9:00 AM - 5:00 PM, Friday off, Sunday open",
  },
  {
    id: "online",
    name: "Online campus (Chaajao)",
    phones: ["+92-3451139153"],
    email: "chaajao.edu@gmail.com",
    timings: "9:00 AM - 7:00 PM, Sunday off",
    mapUrl: "https://maps.app.goo.gl/gwKn96aqZNjwGqC27",
  },
];

export function getCampus(id: CampusId): Campus | undefined {
  return CAMPUSES.find((campus) => campus.id === id);
}
