// Teacher notes and discipline incidents. Backend: apps/discipline.
import { crud, opts } from "../lib/crud";

export const NOTE_CATEGORIES = opts([["APPRECIATION", "Appreciation"], ["CONCERN", "Concern"], ["ACADEMIC", "Academic"], ["HEALTH", "Health / wellbeing"], ["GENERAL", "General"]]);
export const SEVERITY = opts([["LOW", "Low"], ["MEDIUM", "Medium"], ["HIGH", "High"]]);
export const INCIDENT_STATUS = opts([["OPEN", "Open"], ["ACTION_TAKEN", "Action taken"], ["CLOSED", "Closed"]]);
export const notes = crud("/discipline/notes/");
export const incidents = crud("/discipline/incidents/");
export const disciplineService = { notes, incidents, informParents: (id) => incidents.action(id, "inform_parents") };
