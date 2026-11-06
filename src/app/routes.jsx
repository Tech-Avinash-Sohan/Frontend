import { Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "./admin_layout";

import LoginPage from "./login/page";
import SignIn from "./login/view/sign_in";
import VerifyCode from "./login/view/verify_code";
import ResetPassword from "./login/view/reset_password";
import ActivateInvitation from "./login/view/activate_invitation";

import InternalPage from "./internal/page";
import InternalDashboard from "./internal/view/internal_dashboard";
import SchoolList from "./internal/view/school_list";
import SchoolForm from "./internal/view/school_form";
import SchoolDetail from "./internal/view/school_detail";
import ParentPayments from "./internal/view/parent_payments";
import MessageLog from "./internal/view/message_log";

import DashboardPage from "./dashboard/page";
import TodayDashboard from "./dashboard/view/today_dashboard";
import OperationalAlerts from "./dashboard/view/operational_alerts";

import StudentsPage from "./student_management/page";
import StudentDirectory from "./student_management/view/student_directory";
import NewAdmission from "./student_management/view/new_admission";
import StudentProfile from "./student_management/view/student_profile";
import GuardianAppAccess from "./student_management/view/guardian_app_access";
import EnrollmentTransfer from "./student_management/view/enrollment_transfer";
import ImportUpload from "./student_management/view/import_upload";
import ImportReview from "./student_management/view/import_review";

import AttendancePage from "./attendance/page";
import SubmissionMonitor from "./attendance/view/submission_monitor";
import RegisterDetail from "./attendance/view/register_detail";
import CorrectionRequests from "./attendance/view/correction_requests";
import AttendanceReport from "./attendance/view/attendance_report";
import StudentLeaves from "./attendance/view/student_leaves";
import StaffAttendance from "./attendance/view/staff_attendance";
import StaffLeaves from "./attendance/view/staff_leaves";

import FeesPage from "./fee_management/page";
import FeePlanList from "./fee_management/view/fee_plan_list";
import FeePlanForm from "./fee_management/view/fee_plan_form";
import AssessmentPreview from "./fee_management/view/assessment_preview";
import CollectionDesk from "./fee_management/view/collection_desk";
import PaymentReceipt from "./fee_management/view/payment_receipt";
import StudentLedger from "./fee_management/view/student_ledger";
import FinancialCorrections from "./fee_management/view/financial_corrections";
import DayClose from "./fee_management/view/day_close";

import StaffPage from "./staff_management/page";
import StaffDirectory from "./staff_management/view/staff_directory";
import StaffForm from "./staff_management/view/staff_form";
import StaffProfile from "./staff_management/view/staff_profile";
import RoleAssignments from "./staff_management/view/role_assignments";

import AcademicsPage from "./academic_management/page";
import AcademicYears from "./academic_management/view/academic_years";
import Grades from "./academic_management/view/grades";
import Sections from "./academic_management/view/sections";
import CalendarHolidays from "./academic_management/view/calendar_holidays";
import TeacherAssignments from "./academic_management/view/teacher_assignments";
import TeachingAssignments from "./academic_management/view/teaching_assignments";
import Terms from "./academic_management/view/terms";

import NoticesPage from "./notice_management/page";
import NoticeList from "./notice_management/view/notice_list";
import NoticeForm from "./notice_management/view/notice_form";
import NoticeDetail from "./notice_management/view/notice_detail";
import ParentChats from "./notice_management/view/parent_chats";
import MeetingSlots from "./notice_management/view/meeting_slots";
import Complaints from "./notice_management/view/complaints";
import ConsentForms from "./notice_management/view/consent_forms";

import LearningPage from "./learning/page";
import HomeworkList from "./learning/view/homework_list";
import ClassDiary from "./learning/view/class_diary";
import LessonPlans from "./learning/view/lesson_plans";
import StudyMaterial from "./learning/view/study_material";

import TimetablePage from "./timetable/page";
import TimetableGrid from "./timetable/view/timetable_grid";
import Periods from "./timetable/view/periods";
import Substitutions from "./timetable/view/substitutions";

import ExamsPage from "./exams/page";
import ExamList from "./exams/view/exam_list";
import ExamDetail from "./exams/view/exam_detail";
import MarksEntry from "./exams/view/marks_entry";
import ResultSheet from "./exams/view/result_sheet";
import GradeBands from "./exams/view/grade_bands";

import AdmissionsPage from "./admissions/page";
import EnquiryList from "./admissions/view/enquiry_list";
import EnquiryDetail from "./admissions/view/enquiry_detail";

import CertificatesPage from "./certificates/page";
import CertificateRegister from "./certificates/view/certificate_register";
import CertificateRequests from "./certificates/view/certificate_requests";
import CertificateTemplates from "./certificates/view/certificate_templates";

import DisciplinePage from "./discipline/page";
import StudentNotes from "./discipline/view/student_notes";
import Incidents from "./discipline/view/incidents";

import ReportsPage from "./reports/page";
import ReportsOverview from "./reports/view/reports_overview";
import FeeDuesReport from "./reports/view/fee_dues_report";
import CollectionReport from "./reports/view/collection_report";
import ExportCenter from "./reports/view/export_center";

import ApprovalsPage from "./approvals/page";
import ApprovalQueue from "./approvals/view/approval_queue";
import ApprovalDetail from "./approvals/view/approval_detail";

import SettingsPage from "./settings/page";
import SchoolProfile from "./settings/view/school_profile";
import RolePermissions from "./settings/view/role_permissions";
import ReceiptNumbering from "./settings/view/receipt_numbering";
import DataRetention from "./settings/view/data_retention";
import AuditLog from "./settings/view/audit_log";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />}>
        <Route index element={<SignIn />} />
        <Route path="verify" element={<VerifyCode />} />
        <Route path="reset-password" element={<ResetPassword />} />
        <Route path="activate" element={<ActivateInvitation />} />
      </Route>

      <Route element={<AdminLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Our internal dashboard – SUPER_ADMIN only (AdminLayout keeps each login type in its own area) */}
        <Route path="/internal" element={<InternalPage />}>
          <Route index element={<InternalDashboard />} />
          <Route path="schools" element={<SchoolList />} />
          <Route path="schools/form/:id" element={<SchoolForm />} />
          <Route path="schools/:id" element={<SchoolDetail />} />
          <Route path="parent-payments" element={<ParentPayments />} />
          <Route path="messages" element={<MessageLog />} />
        </Route>

        <Route path="/dashboard" element={<DashboardPage />}>
          <Route index element={<TodayDashboard />} />
          <Route path="alerts" element={<OperationalAlerts />} />
        </Route>

        <Route path="/students" element={<StudentsPage />}>
          <Route index element={<StudentDirectory />} />
          <Route path="new-admission" element={<NewAdmission />} />
          <Route path="profile/:id" element={<StudentProfile />} />
          <Route path="guardian-access" element={<GuardianAppAccess />} />
          <Route path="enrollment" element={<EnrollmentTransfer />} />
          <Route path="import" element={<ImportUpload />} />
          <Route path="import/review" element={<ImportReview />} />
        </Route>

        <Route path="/attendance" element={<AttendancePage />}>
          <Route index element={<SubmissionMonitor />} />
          <Route path="register" element={<RegisterDetail />} />
          <Route path="corrections" element={<CorrectionRequests />} />
          <Route path="report" element={<AttendanceReport />} />
          <Route path="student-leaves" element={<StudentLeaves />} />
          <Route path="staff" element={<StaffAttendance />} />
          <Route path="staff-leaves" element={<StaffLeaves />} />
        </Route>

        <Route path="/fees" element={<FeesPage />}>
          <Route index element={<FeePlanList />} />
          <Route path="plans/:id" element={<FeePlanForm />} />
          <Route path="assessment" element={<AssessmentPreview />} />
          <Route path="collect" element={<CollectionDesk />} />
          <Route path="receipt/:id" element={<PaymentReceipt />} />
          <Route path="ledger" element={<StudentLedger />} />
          <Route path="corrections" element={<FinancialCorrections />} />
          <Route path="day-close" element={<DayClose />} />
        </Route>

        <Route path="/staff" element={<StaffPage />}>
          <Route index element={<StaffDirectory />} />
          <Route path="form/:id" element={<StaffForm />} />
          <Route path="profile/:id" element={<StaffProfile />} />
          <Route path="roles" element={<RoleAssignments />} />
        </Route>

        <Route path="/academics" element={<AcademicsPage />}>
          <Route index element={<AcademicYears />} />
          <Route path="grades" element={<Grades />} />
          <Route path="sections" element={<Sections />} />
          <Route path="calendar" element={<CalendarHolidays />} />
          <Route path="teacher-assignments" element={<TeacherAssignments />} />
          <Route path="who-teaches" element={<TeachingAssignments />} />
          <Route path="terms" element={<Terms />} />
        </Route>

        <Route path="/notices" element={<NoticesPage />}>
          <Route index element={<NoticeList />} />
          <Route path="form/:id" element={<NoticeForm />} />
          <Route path="detail/:id" element={<NoticeDetail />} />
          <Route path="chats" element={<ParentChats />} />
          <Route path="meetings" element={<MeetingSlots />} />
          <Route path="complaints" element={<Complaints />} />
          <Route path="consent" element={<ConsentForms />} />
        </Route>

        <Route path="/learning" element={<LearningPage />}>
          <Route index element={<HomeworkList />} />
          <Route path="diary" element={<ClassDiary />} />
          <Route path="lesson-plans" element={<LessonPlans />} />
          <Route path="materials" element={<StudyMaterial />} />
        </Route>

        <Route path="/timetable" element={<TimetablePage />}>
          <Route index element={<TimetableGrid />} />
          <Route path="periods" element={<Periods />} />
          <Route path="substitutions" element={<Substitutions />} />
        </Route>

        <Route path="/exams" element={<ExamsPage />}>
          <Route index element={<ExamList />} />
          <Route path="detail/:id" element={<ExamDetail />} />
          <Route path="marks" element={<MarksEntry />} />
          <Route path="results" element={<ResultSheet />} />
          <Route path="grades" element={<GradeBands />} />
        </Route>

        <Route path="/admissions" element={<AdmissionsPage />}>
          <Route index element={<EnquiryList />} />
          <Route path=":id" element={<EnquiryDetail />} />
        </Route>

        <Route path="/certificates" element={<CertificatesPage />}>
          <Route index element={<CertificateRegister />} />
          <Route path="requests" element={<CertificateRequests />} />
          <Route path="templates" element={<CertificateTemplates />} />
        </Route>

        <Route path="/discipline" element={<DisciplinePage />}>
          <Route index element={<StudentNotes />} />
          <Route path="incidents" element={<Incidents />} />
        </Route>

        <Route path="/reports" element={<ReportsPage />}>
          <Route index element={<ReportsOverview />} />
          <Route path="fee-dues" element={<FeeDuesReport />} />
          <Route path="collection" element={<CollectionReport />} />
          <Route path="export" element={<ExportCenter />} />
        </Route>

        <Route path="/approvals" element={<ApprovalsPage />}>
          <Route index element={<ApprovalQueue />} />
          <Route path=":type/:id" element={<ApprovalDetail />} />
        </Route>

        <Route path="/settings" element={<SettingsPage />}>
          <Route index element={<SchoolProfile />} />
          <Route path="roles" element={<RolePermissions />} />
          <Route path="numbering" element={<ReceiptNumbering />} />
          <Route path="retention" element={<DataRetention />} />
          <Route path="messages" element={<MessageLog />} />
          <Route path="audit-log" element={<AuditLog />} />
        </Route>

        <Route path="*" element={<div className="state"><h2>Page not found</h2></div>} />
      </Route>
    </Routes>
  );
}
