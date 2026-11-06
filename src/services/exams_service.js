// Exams, papers, marks, results. Backend: apps/exams.
import { api } from "../lib/api_client";
import { crud, opts } from "../lib/crud";

export const EXAM_TYPES = opts([["UNIT_TEST", "Unit test"], ["MID_TERM", "Mid term"], ["TERM_END", "Term end"], ["FINAL", "Final / annual"], ["PRACTICAL", "Practical"], ["OTHER", "Other"]]);
export const exams = crud("/exams/exams/");
export const papers = crud("/exams/papers/");
export const gradeBands = crud("/exams/grade-bands/");
export const remarks = crud("/exams/remarks/");

export const examsService = {
  exams, papers, gradeBands, remarks,
  /** status flow: schedule -> open_marks -> publish (WhatsApp to parents) / unpublish */
  setStatus: (id, action) => exams.action(id, action),
  resultSheet: (id, section) => api.get(`/exams/exams/${id}/result_sheet/`, { params: { section } }),
  reportCard: (id, student) => api.get(`/exams/exams/${id}/report_card/`, { params: { student } }),
  bulkPapers: (body) => api.post("/exams/papers/bulk_create/", body),
  marksSheet: (paper, section) => api.get("/exams/marks/sheet/", { params: { paper, section } }),
  saveMarks: (paper, entries) => api.post("/exams/marks/bulk/", { paper, entries }),
  loadDefaultGrades: () => api.post("/exams/grade-bands/load_default/", {}),
};
