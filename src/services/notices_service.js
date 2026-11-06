// Notices + chat, PTM, complaints, consent forms. Backend: apps/communication.
import { crud, opts } from "../lib/crud";

export const AUDIENCES = opts([["EVERYONE", "Everyone (parents + staff)"], ["PARENTS", "All parents"], ["STAFF", "All teachers & staff"], ["CLASSES", "Parents of selected classes"], ["SECTIONS", "Parents of selected sections"]]);
export const CATEGORIES = opts([["GENERAL", "General"], ["HOLIDAY", "Holiday"], ["EVENT", "Event"], ["EXAM", "Exam"], ["FEE", "Fee"], ["URGENT", "Urgent"]]);
export const COMPLAINT_STATUS = opts([["OPEN", "Open"], ["IN_PROGRESS", "In progress"], ["RESOLVED", "Resolved"], ["CLOSED", "Closed"]]);

export const notices = crud("/communication/notices/");
export const chats = crud("/communication/chats/");
export const meetings = crud("/communication/meeting-slots/");
export const complaints = crud("/communication/complaints/");
export const consentForms = crud("/communication/consent-forms/");

export const noticesService = {
  list: notices.list, get: notices.get, save: notices.save, remove: notices.remove,
  publish: (id) => notices.action(id, "publish"),
  archive: (id) => notices.action(id, "archive"),
  reads: (id) => notices.view(id, "reads"),
};
