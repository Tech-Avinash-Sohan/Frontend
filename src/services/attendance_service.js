// Attendance & leave. Backend: apps/attendance.
import { api } from "../lib/api_client";
import { crud, opts } from "../lib/crud";

export const ATT_STATUS = opts([["P", "Present"], ["A", "Absent"], ["LT", "Late"], ["HD", "Half day"], ["L", "On leave"]]);
export const LEAVE_TYPES = opts([["CL", "Casual leave"], ["SL", "Sick leave"], ["EL", "Earned leave"], ["ML", "Maternity leave"], ["LWP", "Leave without pay"], ["OTHER", "Other"]]);

const students = crud("/attendance/students/");
export const corrections = crud("/attendance/corrections/");
export const studentLeaves = crud("/attendance/student-leaves/");
export const staffAttendance = crud("/attendance/staff/");
export const staffLeaves = crud("/attendance/staff-leaves/");

export const attendanceService = {
  /** GET /attendance/students/submissions/?date= – per section marked or not */
  submissions: (date) => api.get("/attendance/students/submissions/", { params: { date } }),
  /** GET /attendance/students/register/?section=&date= */
  register: (section, date) => api.get("/attendance/students/register/", { params: { section, date } }),
  /** POST /attendance/students/mark/ {section, date, entries:[{student,status,remark}], default_status, notify_absent} */
  mark: (body) => api.post("/attendance/students/mark/", body),
  /** GET /attendance/students/report/?section=|school_class=&month=YYYY-MM */
  report: (params) => api.get("/attendance/students/report/", { params }),
  rows: students.list,
  corrections, studentLeaves, staffAttendance, staffLeaves,
  /** POST /attendance/staff/mark/ {date, entries:[{staff,status,check_in,check_out}]} */
  markStaff: (body) => api.post("/attendance/staff/mark/", body),
  staffReport: (month) => api.get("/attendance/staff/report/", { params: { month } }),
  leaveBalance: (staff) => api.get("/attendance/staff-leaves/balance/", { params: { staff } }),
};
