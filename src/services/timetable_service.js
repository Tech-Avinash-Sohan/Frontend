// Bell periods, weekly timetable, substitutions. Backend: apps/timetable.
import { api } from "../lib/api_client";
import { crud } from "../lib/crud";

export const DAYS = [
  { value: 1, label: "Monday" }, { value: 2, label: "Tuesday" }, { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" }, { value: 5, label: "Friday" }, { value: 6, label: "Saturday" },
];
export const periods = crud("/timetable/periods/");
export const slots = crud("/timetable/slots/");
export const substitutions = crud("/timetable/substitutions/");

export const timetableService = {
  periods, slots, substitutions,
  sectionGrid: (section) => api.get("/timetable/slots/section_grid/", { params: { section } }),
  teacherGrid: (teacher) => api.get("/timetable/slots/teacher_grid/", { params: { teacher } }),
  day: (params) => api.get("/timetable/slots/day/", { params }),
  freeTeachers: (day, period) => api.get("/timetable/slots/free_teachers/", { params: { day, period } }),
};
