import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { rows } from "../lib/api_client";
import { academicsService } from "../services/academics_service";
import { settingsService } from "../services/settings_service";
import { staffService } from "../services/staff_service";
import { useAuth } from "../hooks/use_auth";

const SchoolContext = createContext(null);

/** For a SCHOOL login: school profile, years, classes and sections – loaded once after sign-in. */
export function SchoolProvider({ children }) {
  const { user, isSchool } = useAuth();
  const [school, setSchool] = useState(null);
  const [years, setYears] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [staff, setStaff] = useState([]);
  const [toast, setToast] = useState(null);

  const reload = useCallback(async () => {
    const [s, y, c, d, sub, st] = await Promise.all([settingsService.school(), academicsService.years(), academicsService.classes(),
      academicsService.sections(), academicsService.subjects(), staffService.list({ is_active: true, page_size: 200 })]);
    setSchool(s);
    setYears(rows(y));
    setClasses(rows(c));
    setSections(rows(d));
    setSubjects(rows(sub));
    setStaff(rows(st));
  }, []);

  useEffect(() => {
    if (user && isSchool) reload().catch((e) => console.error("Could not load school setup", e));
    if (!user) {
      setSchool(null);
      setYears([]);
      setClasses([]);
      setSections([]);
    }
  }, [user, isSchool, reload]);

  const notify = useCallback((message, kind = "success") => {
    setToast({ message, kind, at: Date.now() });
    setTimeout(() => setToast((t) => (t && Date.now() - t.at >= 3500 ? null : t)), 3600);
  }, []);

  const value = useMemo(() => {
    // `divisions` keeps the old name used by preview screens: a section with a label like "5th-A"
    const divisions = sections.map((s) => ({ ...s, label: `${s.class_name}-${s.name}` }));
    return {
      school,
      years,
      currentYear: years.find((y) => y.is_current) || null,
      classes,
      sections,
      divisions,
      subjects,
      staff,
      subjectOptions: subjects.map((x) => ({ value: x.id, label: x.name })),
      teacherOptions: staff.filter((x) => x.staff_type === "TEACHER").map((x) => ({ value: x.id, label: x.name })),
      staffOptions: staff.map((x) => ({ value: x.id, label: `${x.name} (${x.staff_type_display || x.staff_type})` })),
      reload,
      notify,
      yearOptions: years.map((y) => ({ value: y.id, label: y.name })),
      classOptions: classes.map((c) => ({ value: c.id, label: c.name })),
      divisionOptions: divisions.map((d) => ({ value: d.id, label: d.label })),
      sectionOptions: (classId) =>
        divisions.filter((d) => !classId || String(d.school_class) === String(classId)).map((d) => ({ value: d.id, label: `${d.label}${d.class_teacher_name ? ` · ${d.class_teacher_name}` : ""} (${d.student_count}/${d.capacity})` })),
    };
  }, [school, years, classes, sections, subjects, staff, reload, notify]);

  return (
    <SchoolContext.Provider value={value}>
      {children}
      {toast && (
        <div className={`toast toast-${toast.kind}`} role="status" onClick={() => setToast(null)}>
          {toast.message}
        </div>
      )}
    </SchoolContext.Provider>
  );
}

export function useSchool() {
  const ctx = useContext(SchoolContext);
  if (!ctx) throw new Error("useSchool must be used inside <SchoolProvider>");
  return ctx;
}
