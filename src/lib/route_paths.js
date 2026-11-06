// Every screen's URL in one place. W-codes match the screen list.
export const PATHS = {
  login: "/login",
  verify: "/login/verify",
  resetPassword: "/login/reset-password",
  activate: "/login/activate", // first login: set your own password

  // Our internal dashboard (SUPER_ADMIN)
  internal: "/internal",
  internalSchools: "/internal/schools",
  internalSchoolForm: (id = "new") => `/internal/schools/form/${id}`,
  internalSchool: (id = ":id") => `/internal/schools/${id}`,
  internalPayments: "/internal/parent-payments",
  internalMessages: "/internal/messages",

  dashboard: "/dashboard", // W01
  alerts: "/dashboard/alerts", // W02 – needs attention (unpaid parents, failed messages)

  students: "/students", // W03
  newAdmission: "/students/new-admission", // W04
  studentProfile: (id = ":id") => `/students/profile/${id}`, // W05
  guardianAccess: "/students/guardian-access", // W06 – parents & Parent app status
  enrollment: "/students/enrollment", // W07
  importUpload: "/students/import", // W08
  importReview: "/students/import/review", // W09

  attendance: "/attendance", // W10
  attendanceRegister: "/attendance/register", // W11
  attendanceCorrections: "/attendance/corrections", // W12
  attendanceReport: "/attendance/report", // W13
  studentLeaves: "/attendance/student-leaves", // W12b
  staffAttendance: "/attendance/staff", // W13b
  staffLeaves: "/attendance/staff-leaves", // W13c

  feePlans: "/fees", // W14
  feePlanForm: (id = "new") => `/fees/plans/${id}`, // W15
  feeAssessment: "/fees/assessment", // W16
  collectionDesk: "/fees/collect", // W17
  receipt: (id = ":id") => `/fees/receipt/${id}`, // W18
  ledger: "/fees/ledger", // W19
  corrections: "/fees/corrections", // W20
  dayClose: "/fees/day-close", // W21

  staff: "/staff", // W22
  staffForm: (id = "new") => `/staff/form/${id}`, // W23
  staffProfile: (id = ":id") => `/staff/profile/${id}`, // W24
  roleAssignments: "/staff/roles", // W25 – logins & access

  academicYears: "/academics", // W26
  grades: "/academics/grades", // W27
  sections: "/academics/sections", // W28
  calendar: "/academics/calendar", // W29
  teacherAssignments: "/academics/teacher-assignments", // W30 – subjects
  teachingAssignments: "/academics/who-teaches", // W30b – teacher × subject × section
  terms: "/academics/terms", // W26b

  notices: "/notices", // W31
  noticeForm: (id = "new") => `/notices/form/${id}`, // W32
  noticeDetail: (id = ":id") => `/notices/detail/${id}`, // W33
  chats: "/notices/chats", // W33b
  meetings: "/notices/meetings", // W33c
  complaints: "/notices/complaints", // W33d
  consentForms: "/notices/consent", // W33e

  homework: "/learning", // W45
  diary: "/learning/diary", // W46
  lessonPlans: "/learning/lesson-plans", // W47
  materials: "/learning/materials", // W48

  timetable: "/timetable", // W50
  periods: "/timetable/periods", // W51
  substitutions: "/timetable/substitutions", // W52

  exams: "/exams", // W53
  examDetail: (id = ":id") => `/exams/detail/${id}`, // W54
  marksEntry: "/exams/marks", // W55
  resultSheet: "/exams/results", // W56
  gradeBands: "/exams/grades", // W57

  enquiries: "/admissions", // W62
  enquiryDetail: (id = ":id") => `/admissions/${id}`, // W63

  certificates: "/certificates", // W64
  certificateRequests: "/certificates/requests", // W65
  certificateTemplates: "/certificates/templates", // W66

  studentNotes: "/discipline", // W67
  incidents: "/discipline/incidents", // W68

  reports: "/reports", // W34
  feeDuesReport: "/reports/fee-dues", // W35
  collectionReport: "/reports/collection", // W36
  exportCenter: "/reports/export", // W37

  approvals: "/approvals", // W38
  approvalDetail: (type = ":type", id = ":id") => `/approvals/${type}/${id}`, // W39

  schoolProfile: "/settings", // W40
  rolePermissions: "/settings/roles", // W41
  receiptNumbering: "/settings/numbering", // W42
  dataRetention: "/settings/retention", // W43
  auditLog: "/settings/audit-log", // W44
  messages: "/settings/messages", // WhatsApp / e-mail log
};

