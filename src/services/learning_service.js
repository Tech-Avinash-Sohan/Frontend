// Homework, diary, chapters, lesson plans, study material. Backend: apps/learning.
import { api } from "../lib/api_client";
import { crud, opts } from "../lib/crud";

export const MATERIAL_TYPES = opts([["PDF", "PDF / document"], ["VIDEO", "Video"], ["LINK", "Web link"], ["IMAGE", "Image"], ["WORKSHEET", "Worksheet"]]);
export const SUBMISSION_STATUS = opts([["PENDING", "Not submitted"], ["SUBMITTED", "Submitted"], ["LATE", "Submitted late"], ["CHECKED", "Checked"], ["INCOMPLETE", "Incomplete"]]);

export const homework = crud("/learning/homework/");
export const diary = crud("/learning/diary/");
export const chapters = crud("/learning/chapters/");
export const lessonPlans = crud("/learning/lesson-plans/");
export const materials = crud("/learning/materials/");

export const learningService = {
  homework, diary, chapters, lessonPlans, materials,
  submissions: (hwId) => api.get(`/learning/homework/${hwId}/submissions/`),
  check: (hwId, entries) => api.post(`/learning/homework/${hwId}/check/`, { entries }),
  coverage: (section) => api.get("/learning/chapters/coverage/", { params: { section } }),
};
