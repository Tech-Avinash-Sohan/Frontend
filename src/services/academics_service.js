// School setup. Backend: apps/academics (+ /academics/calendar/, terms, teaching assignments).
import { crud, opts } from "../lib/crud";

export const SUBJECT_TYPES = opts([["CORE", "Core"], ["OPTIONAL", "Optional"], ["LANGUAGE", "Language"], ["ACTIVITY", "Activity"]]);
export const EVENT_TYPES = opts([["HOLIDAY", "Holiday"], ["VACATION", "Vacation"], ["EVENT", "School event"], ["EXAM", "Exam"], ["PTM", "Parent-teacher meeting"], ["OTHER", "Other"]]);

const years = crud("/academics/years/");
const classes = crud("/academics/classes/");
const sections = crud("/academics/sections/");
const subjects = crud("/academics/subjects/");
export const terms = crud("/academics/terms/");
export const assignments = crud("/academics/teaching-assignments/");
export const calendar = crud("/academics/calendar/");

export const academicsService = {
  years: (p) => years.list({ page_size: 200, ...p }), saveYear: years.save, deleteYear: years.remove,
  /** POST /academics/years/{id}/promote/ {from_class, to_class?, to_section?, student_ids?} */
  promote: (yearId, body) => years.action(yearId, "promote", body),
  classes: (p) => classes.list({ page_size: 200, ...p }), saveClass: classes.save, deleteClass: classes.remove,
  sections: (p) => sections.list({ page_size: 200, ...p }), saveSection: sections.save, deleteSection: sections.remove,
  subjects: (p) => subjects.list({ page_size: 200, ...p }), saveSubject: subjects.save, deleteSubject: subjects.remove,
  terms, assignments, calendar,
};
