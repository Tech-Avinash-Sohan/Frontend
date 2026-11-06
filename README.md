# School ERP – School panel + internal dashboard (React)

This is the React frontend for the **School ERP backend** (`school_erp_full`, Django + PostgreSQL). Every screen calls the real API. There is no mock data.

## Run it

```bash
# 1. backend (other terminal): cd school_erp_full && python manage.py runserver   -> http://localhost:8000
# 2. frontend
npm install
npm run dev                 # http://localhost:5173  (/api is forwarded to VITE_BACKEND_URL in .env)
npm run build               # production build in dist/
```

Sign in with mobile and password:

| Login type | Where it goes |
|---|---|
| **SUPER_ADMIN** | `/internal`: create schools, payments, message log |
| **SCHOOL** | `/dashboard`: the whole school panel |
| TEACHER / PARENT | Not allowed here. They use the mobile apps, and the backend has the APIs for those apps. |

On the first login, a school is asked to set its own password.

In development, every API call and its payload is printed in the browser console. Secret fields are hidden.

## Folder structure

```
src/
  lib/api_client.js       one fetch wrapper: Bearer token, single refresh on 401, DRF errors -> ApiError
  lib/crud.js             crud("/x/") -> list / get / save / remove / action / view
  lib/route_paths.js      every URL (W-codes)
  services/*.js           one file per backend app – the only place that knows API paths
  components/common/crud_screen.jsx   list + search + filters + create/edit modal + delete for one resource
  context/auth_context    user, signIn / signOut, change password
  context/school_context  school, years, classes, sections, subjects, staff (+ select options), toast
  app/<module>/page.jsx   tab bar of the module
  app/<module>/view/*.jsx one screen each
```

## Screens → API

| Module | Screens | Backend |
|---|---|---|
| Dashboard | W01 Today, W02 Alerts | `/school/dashboard/`, `/reports/dashboard/` |
| Students | W03–W07, W08–W09 CSV import (each row → `/students/admission/`) | `/students/…` |
| Admissions | W62 enquiries + funnel, W63 follow-up / admit | `/admissions/enquiries/…` |
| Attendance | W10 monitor, W11 mark, W12 corrections, W12b student leave, W13 report, W13b staff attendance, W13c staff leave | `/attendance/…` |
| Homework & diary | W45 homework + submissions, W46 diary, W47 lesson plans + syllabus coverage, W48 material | `/learning/…` |
| Timetable | W50 grid (click a cell), W51 bell periods, W52 substitutions | `/timetable/…` |
| Exams & results | W53 exams, W54 papers + status (publish), W55 marks entry, W56 result sheet + report card, W57 grades | `/exams/…` |
| Fees | W14 plans & heads, W15 plan form, W16 bill students, W17 collect, W18 receipt, W19 ledger, W20 discounts & cancellations, W21 day close | `/fees/…` |
| Staff | W22–W24, W25 logins & access | `/staff/…` |
| Academics | W26 years, W26b terms, W27 classes, W28 sections, W29 calendar, W30 subjects, W30b who teaches what | `/academics/…` |
| Notices & parents | W31–W33 notices, W33b chats, W33c PTM slots, W33d complaints, W33e consent forms | `/communication/…` |
| Certificates | W64 register / issue / print, W65 requests, W66 templates | `/certificates/…` |
| Discipline | W67 student notes, W68 incidents | `/discipline/…` |
| Reports | W34 overview, W35 fee dues + reminders, W36 collection, W37 export centre (CSV + UDISE+ / RTE) | `/reports/…`, `/government/…` |
| Approvals | W38 queue, W39 detail | `/approvals/…` |
| Settings | W40 school profile, W41 who can do what, W42 fee settings & receipt no., W43 leave policy, message log, W44 audit log | `/school/profile/`, `/fees/settings/`, `/attendance/leave-policies/`, `/reports/audit-log/` |
| Internal (SUPER_ADMIN) | dashboard, schools, school form / detail, Parent app payments, message log | `/internal/…`, `/payments/…`, `/notifications/…` |

To add a screen for a new API, add a `crud("/path/")` to a service, then add `<CrudScreen service columns fields />` and a route.
