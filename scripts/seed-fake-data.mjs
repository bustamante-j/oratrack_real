import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { createClient } from "@supabase/supabase-js";

const envPath = resolve(process.cwd(), ".env.local");

function loadEnvFile() {
  const contents = readFileSync(envPath, "utf8");

  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex === -1) continue;

    const key = trimmed.slice(0, equalsIndex).trim();
    const value = trimmed
      .slice(equalsIndex + 1)
      .trim()
      .replace(/^["']|["']$/g, "");

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local.",
  );
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const demoPassword = "DemoPass123!";
const demoTeachers = [
  {
    email: "demo.adviser@oratrack.test",
    fullName: "Demo Adviser Maria Santos",
    role: "adviser",
    employeeNumber: "DEMO-ADV-001",
    positionTitle: "Grade 1 Adviser",
    gradeSpecialization: "Primary",
  },
  {
    email: "demo.teacher@oratrack.test",
    fullName: "Demo Subject Teacher Juan Dela Cruz",
    role: "subject_teacher",
    employeeNumber: "DEMO-SUB-001",
    positionTitle: "Subject Teacher",
    gradeSpecialization: "English and Mathematics",
  },
];

const subjectSeeds = [
  { code: "DEMO-ENG", name: "Demo English", grade_number: 1 },
  { code: "DEMO-MATH", name: "Demo Mathematics", grade_number: 1 },
  { code: "DEMO-FIL", name: "Demo Filipino", grade_number: 1 },
  { code: "DEMO-SCI", name: "Demo Science", grade_number: 2 },
];

const learners = [
  ["990000000001", "Aira", "Lopez", "female", "2019-02-14"],
  ["990000000002", "Ben", "Reyes", "male", "2018-05-20"],
  ["990000000003", "Cara", "Mendoza", "female", "2018-08-03"],
  ["990000000004", "Dante", "Cruz", "male", "2018-11-16"],
  ["990000000005", "Elena", "Garcia", "female", "2019-01-29"],
  ["990000000006", "Felix", "Ramos", "male", "2018-04-12"],
  ["990000000007", "Gia", "Torres", "female", "2017-07-25"],
  ["990000000008", "Hugo", "Villanueva", "male", "2017-10-09"],
  ["990000000009", "Isla", "Aquino", "female", "2017-12-18"],
  ["990000000010", "Jonas", "Bautista", "male", "2017-03-07"],
  ["990000000011", "Kyla", "Navarro", "female", "2016-09-21"],
  ["990000000012", "Luis", "Morales", "male", "2016-06-05"],
].map(([lrn, firstName, lastName, sex, birthDate], index) => ({
  lrn,
  first_name: firstName,
  middle_name: index % 2 === 0 ? "Demo" : null,
  last_name: lastName,
  extension_name: null,
  sex,
  birth_date: birthDate,
  address: `Demo Barangay ${index + 1}, La Trinidad`,
  status: "active",
}));

function log(message) {
  console.log(`• ${message}`);
}

function failIfError(result, label) {
  if (result.error) {
    throw new Error(`${label}: ${result.error.message}`);
  }
  return result.data;
}

async function findUserByEmail(email) {
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 1000,
    });

    if (error) throw new Error(`List auth users: ${error.message}`);

    const found = data.users.find(
      (user) => user.email?.toLowerCase() === email.toLowerCase(),
    );

    if (found) return found;
    if (data.users.length < 1000) return null;
    page += 1;
  }
}

async function ensureDemoUser(seed) {
  const existing = await findUserByEmail(seed.email);
  const user =
    existing ??
    failIfError(
      await supabase.auth.admin.createUser({
        email: seed.email,
        password: demoPassword,
        email_confirm: true,
        user_metadata: {
          full_name: seed.fullName,
          seed: "oratrack-demo",
        },
      }),
      `Create ${seed.email}`,
    ).user;

  if (existing) {
    failIfError(
      await supabase.auth.admin.updateUserById(existing.id, {
        password: demoPassword,
        email_confirm: true,
        user_metadata: {
          ...(existing.user_metadata ?? {}),
          full_name: seed.fullName,
          seed: "oratrack-demo",
        },
      }),
      `Update ${seed.email}`,
    );
  }

  failIfError(
    await supabase.from("profiles").upsert(
      {
        user_id: user.id,
        email: seed.email,
        full_name: seed.fullName,
        role: seed.role,
        status: "active",
        phone: "09170000000",
      },
      { onConflict: "user_id" },
    ),
    `Upsert profile ${seed.email}`,
  );

  failIfError(
    await supabase.from("teacher_profiles").upsert(
      {
        profile_id: user.id,
        employee_number: seed.employeeNumber,
        position_title: seed.positionTitle,
        grade_specialization: seed.gradeSpecialization,
      },
      { onConflict: "profile_id" },
    ),
    `Upsert teacher profile ${seed.email}`,
  );

  return { ...seed, userId: user.id };
}

async function seed() {
  log("Creating demo staff auth users and profiles");
  const [adviser, subjectTeacher] = await Promise.all(
    demoTeachers.map(ensureDemoUser),
  );

  log("Creating demo school year");
  const activeYear = failIfError(
    await supabase
      .from("school_years")
      .select("id,name,status")
      .eq("status", "active")
      .maybeSingle(),
    "Fetch active school year",
  );
  const demoYearName = "Demo SY 2026-2027";
  const existingDemoYear = failIfError(
    await supabase
      .from("school_years")
      .select("id,name,status")
      .eq("name", demoYearName)
      .maybeSingle(),
    "Fetch demo school year",
  );
  const demoYear =
    existingDemoYear ??
    failIfError(
      await supabase
        .from("school_years")
        .insert({
          name: demoYearName,
          starts_on: "2026-06-01",
          ends_on: "2027-03-31",
          status: activeYear ? "draft" : "active",
          created_by: adviser.userId,
        })
        .select("id,name,status")
        .single(),
      "Insert demo school year",
    );

  const gradeLevels = failIfError(
    await supabase
      .from("grade_levels")
      .select("id,grade_number,label")
      .in("grade_number", [1, 2, 3]),
    "Fetch grade levels",
  );
  const gradeByNumber = new Map(
    gradeLevels.map((grade) => [grade.grade_number, grade]),
  );

  log("Creating grade periods");
  failIfError(
    await supabase.from("grade_periods").upsert(
      [
        {
          school_year_id: demoYear.id,
          code: "Q1",
          name: "First Quarter",
          sort_order: 1,
          starts_on: "2026-06-01",
          ends_on: "2026-08-31",
        },
        {
          school_year_id: demoYear.id,
          code: "Q2",
          name: "Second Quarter",
          sort_order: 2,
          starts_on: "2026-09-01",
          ends_on: "2026-11-30",
        },
      ],
      { onConflict: "school_year_id,code" },
    ),
    "Upsert grade periods",
  );
  const gradePeriods = failIfError(
    await supabase
      .from("grade_periods")
      .select("id,code")
      .eq("school_year_id", demoYear.id)
      .in("code", ["Q1", "Q2"]),
    "Fetch demo grade periods",
  );

  log("Creating demo subjects");
  failIfError(
    await supabase.from("subjects").upsert(
      subjectSeeds.map((subject) => ({
        code: subject.code,
        name: subject.name,
        grade_level_id: gradeByNumber.get(subject.grade_number)?.id ?? null,
        is_active: true,
      })),
      { onConflict: "code" },
    ),
    "Upsert subjects",
  );
  const subjects = failIfError(
    await supabase
      .from("subjects")
      .select("id,code,name")
      .in(
        "code",
        subjectSeeds.map((subject) => subject.code),
      ),
    "Fetch subjects",
  );
  const subjectByCode = new Map(
    subjects.map((subject) => [subject.code, subject]),
  );

  log("Creating demo sections");
  const sectionSeeds = [
    {
      grade: 1,
      name: "Demo Narra",
      room: "Demo Room 101",
      adviser_id: adviser.userId,
    },
    {
      grade: 2,
      name: "Demo Molave",
      room: "Demo Room 202",
      adviser_id: adviser.userId,
    },
    {
      grade: 3,
      name: "Demo Acacia",
      room: "Demo Room 303",
      adviser_id: adviser.userId,
    },
  ];
  failIfError(
    await supabase.from("sections").upsert(
      sectionSeeds.map((section) => ({
        school_year_id: demoYear.id,
        grade_level_id: gradeByNumber.get(section.grade).id,
        name: section.name,
        adviser_id: section.adviser_id,
        room: section.room,
      })),
      { onConflict: "school_year_id,grade_level_id,name" },
    ),
    "Upsert sections",
  );
  const sections = failIfError(
    await supabase
      .from("sections")
      .select("id,name,grade_level_id")
      .eq("school_year_id", demoYear.id)
      .in(
        "name",
        sectionSeeds.map((section) => section.name),
      ),
    "Fetch sections",
  );
  const sectionByName = new Map(
    sections.map((section) => [section.name, section]),
  );

  log("Assigning demo section subjects");
  const sectionSubjectRows = [];
  for (const section of sections) {
    for (const subject of subjects) {
      sectionSubjectRows.push({
        section_id: section.id,
        subject_id: subject.id,
        teacher_id:
          subject.code === "DEMO-MATH" || subject.code === "DEMO-ENG"
            ? subjectTeacher.userId
            : adviser.userId,
      });
    }
  }
  failIfError(
    await supabase
      .from("section_subjects")
      .upsert(sectionSubjectRows, { onConflict: "section_id,subject_id" }),
    "Upsert section subjects",
  );

  log("Creating fake learners and guardians");
  failIfError(
    await supabase.from("learners").upsert(
      learners.map((learner) => ({
        ...learner,
        created_by: adviser.userId,
      })),
      { onConflict: "lrn" },
    ),
    "Upsert learners",
  );
  const savedLearners = failIfError(
    await supabase
      .from("learners")
      .select("id,lrn,first_name,last_name")
      .in(
        "lrn",
        learners.map((learner) => learner.lrn),
      ),
    "Fetch learners",
  );
  const learnerByLrn = new Map(
    savedLearners.map((learner) => [learner.lrn, learner]),
  );
  const learnerIds = savedLearners.map((learner) => learner.id);
  failIfError(
    await supabase
      .from("learner_guardians")
      .delete()
      .in("learner_id", learnerIds),
    "Clear demo guardians",
  );
  failIfError(
    await supabase.from("learner_guardians").insert(
      savedLearners.map((learner, index) => ({
        learner_id: learner.id,
        full_name: `Demo Guardian ${learner.last_name}`,
        relationship: index % 2 === 0 ? "Mother" : "Father",
        phone: `09170000${String(index + 1).padStart(3, "0")}`,
        email: `guardian${index + 1}@example.test`,
        address: `Demo Barangay ${index + 1}, La Trinidad`,
        is_primary: true,
      })),
    ),
    "Insert guardians",
  );

  log("Creating enrollments");
  const enrollmentRows = learners.map((learner, index) => {
    const section =
      index < 4
        ? sectionByName.get("Demo Narra")
        : index < 8
          ? sectionByName.get("Demo Molave")
          : sectionByName.get("Demo Acacia");
    const gradeLevel = gradeLevels.find(
      (grade) => grade.id === section.grade_level_id,
    );

    return {
      learner_id: learnerByLrn.get(learner.lrn).id,
      school_year_id: demoYear.id,
      grade_level_id: gradeLevel.id,
      section_id: section.id,
      enrollment_status: "enrolled",
      enrolled_on: "2026-06-03",
      created_by: adviser.userId,
    };
  });
  failIfError(
    await supabase
      .from("learner_enrollments")
      .upsert(enrollmentRows, { onConflict: "learner_id,school_year_id" }),
    "Upsert enrollments",
  );
  const enrollments = failIfError(
    await supabase
      .from("learner_enrollments")
      .select("id,learner_id,section_id,school_year_id,grade_level_id")
      .eq("school_year_id", demoYear.id)
      .in("learner_id", learnerIds),
    "Fetch enrollments",
  );
  const enrollmentByLearnerId = new Map(
    enrollments.map((enrollment) => [enrollment.learner_id, enrollment]),
  );

  log("Creating attendance dates and records");
  const attendanceDays = [
    "2026-06-08",
    "2026-06-09",
    "2026-06-10",
    "2026-06-11",
  ];
  const attendanceDateRows = sections.flatMap((section) =>
    attendanceDays.map((attendance_on) => ({
      school_year_id: demoYear.id,
      section_id: section.id,
      attendance_on,
      created_by: adviser.userId,
    })),
  );
  failIfError(
    await supabase
      .from("attendance_dates")
      .upsert(attendanceDateRows, { onConflict: "section_id,attendance_on" }),
    "Upsert attendance dates",
  );
  const attendanceDates = failIfError(
    await supabase
      .from("attendance_dates")
      .select("id,section_id,attendance_on")
      .eq("school_year_id", demoYear.id)
      .in("attendance_on", attendanceDays),
    "Fetch attendance dates",
  );
  const statuses = [
    "present",
    "present",
    "present",
    "late",
    "absent",
    "excused",
  ];
  const attendanceRecordRows = attendanceDates.flatMap((date, dateIndex) =>
    enrollments
      .filter((enrollment) => enrollment.section_id === date.section_id)
      .map((enrollment, learnerIndex) => ({
        attendance_date_id: date.id,
        enrollment_id: enrollment.id,
        am_status: statuses[(dateIndex + learnerIndex) % statuses.length],
        pm_status:
          statuses[(dateIndex + learnerIndex + 2) % statuses.length] ===
          "absent"
            ? "half_day"
            : statuses[(dateIndex + learnerIndex + 2) % statuses.length],
        remarks:
          (dateIndex + learnerIndex) % 5 === 0 ? "Demo attendance note" : null,
        recorded_by: adviser.userId,
      })),
  );
  failIfError(
    await supabase.from("attendance_records").upsert(attendanceRecordRows, {
      onConflict: "attendance_date_id,enrollment_id",
    }),
    "Upsert attendance records",
  );

  log("Creating grades and literacy/numeracy records");
  const gradeRows = [];
  for (const enrollment of enrollments) {
    const learnerIndex = savedLearners.findIndex(
      (learner) => learner.id === enrollment.learner_id,
    );
    for (const subject of subjects) {
      for (const period of gradePeriods) {
        gradeRows.push({
          enrollment_id: enrollment.id,
          subject_id: subject.id,
          grade_period_id: period.id,
          numeric_grade:
            72 +
            ((learnerIndex * 3 + subject.code.length + period.code.length) %
              25),
          remarks:
            learnerIndex % 4 === 0 ? "Demo learner needs monitoring" : null,
          encoded_by: subjectTeacher.userId,
        });
      }
    }
  }
  failIfError(
    await supabase.from("grades").upsert(gradeRows, {
      onConflict: "enrollment_id,subject_id,grade_period_id",
    }),
    "Upsert grades",
  );

  const ratingCycle = ["beginning", "developing", "proficient", "advanced"];
  failIfError(
    await supabase.from("literacy_numeracy_records").upsert(
      enrollments.map((enrollment, index) => ({
        enrollment_id: enrollment.id,
        school_year_id: demoYear.id,
        literacy_rating: ratingCycle[index % ratingCycle.length],
        numeracy_rating: ratingCycle[(index + 1) % ratingCycle.length],
        remarks:
          index % 3 === 0
            ? "Demo support recommended for foundational skills."
            : "Demo progress is on track.",
        encoded_by: adviser.userId,
      })),
      { onConflict: "enrollment_id,school_year_id" },
    ),
    "Upsert literacy/numeracy records",
  );

  log("Creating interventions");
  failIfError(
    await supabase.from("interventions").delete().in("learner_id", learnerIds),
    "Clear demo interventions",
  );
  const interventionRows = savedLearners.slice(0, 6).map((learner, index) => {
    const enrollment = enrollmentByLearnerId.get(learner.id);
    return {
      learner_id: learner.id,
      enrollment_id: enrollment.id,
      teacher_id: index % 2 === 0 ? adviser.userId : subjectTeacher.userId,
      category:
        index % 2 === 0 ? "Demo Reading Support" : "Demo Numeracy Support",
      status: index < 2 ? "ongoing" : index < 5 ? "planned" : "completed",
      started_on: `2026-06-${String(10 + index).padStart(2, "0")}`,
      follow_up_on:
        index < 5 ? `2026-07-${String(5 + index).padStart(2, "0")}` : null,
      notes:
        "Demo intervention plan with weekly monitoring and parent coordination.",
    };
  });
  const insertedInterventions = failIfError(
    await supabase
      .from("interventions")
      .insert(interventionRows)
      .select("id,status"),
    "Insert interventions",
  );
  failIfError(
    await supabase.from("intervention_updates").insert(
      insertedInterventions.map((intervention) => ({
        intervention_id: intervention.id,
        status: intervention.status,
        notes: "Demo initial intervention update.",
        follow_up_on: null,
        created_by: adviser.userId,
      })),
    ),
    "Insert intervention updates",
  );

  log("Creating certificate templates and generated certificates");
  const templateName = "Demo Recognition Template";
  const template =
    failIfError(
      await supabase
        .from("certificate_templates")
        .select("id")
        .eq("name", templateName)
        .maybeSingle(),
      "Fetch certificate template",
    ) ??
    failIfError(
      await supabase
        .from("certificate_templates")
        .insert({
          name: templateName,
          certificate_type: "recognition",
          template_payload: {
            seed: "oratrack-demo",
            accentColor: "#0b2447",
          },
          is_active: true,
          created_by: adviser.userId,
        })
        .select("id")
        .single(),
      "Insert certificate template",
    );

  failIfError(
    await supabase
      .from("generated_certificates")
      .delete()
      .in(
        "enrollment_id",
        enrollments.map((enrollment) => enrollment.id),
      ),
    "Clear demo generated certificates",
  );
  failIfError(
    await supabase.from("generated_certificates").insert(
      enrollments.slice(0, 4).map((enrollment, index) => ({
        certificate_template_id: template.id,
        enrollment_id: enrollment.id,
        certificate_type: index % 2 === 0 ? "recognition" : "completion",
        generated_by: adviser.userId,
      })),
    ),
    "Insert generated certificates",
  );

  log("Creating lesson-plan metadata");
  failIfError(
    await supabase
      .from("lesson_plans")
      .delete()
      .eq("teacher_id", adviser.userId)
      .like("title", "Demo%"),
    "Clear demo lesson plans",
  );
  failIfError(
    await supabase.from("lesson_plans").insert([
      {
        school_year_id: demoYear.id,
        grade_level_id: gradeByNumber.get(1).id,
        subject_id: subjectByCode.get("DEMO-ENG").id,
        teacher_id: adviser.userId,
        title: "Demo Reading Fluency Lesson Plan",
        file_id: null,
        status: "reviewed",
        reviewed_by: adviser.userId,
        reviewed_at: new Date().toISOString(),
      },
      {
        school_year_id: demoYear.id,
        grade_level_id: gradeByNumber.get(2).id,
        subject_id: subjectByCode.get("DEMO-SCI").id,
        teacher_id: adviser.userId,
        title: "Demo Science Observation Lesson Plan",
        file_id: null,
        status: "uploaded",
      },
    ]),
    "Insert lesson plans",
  );

  log("Creating report and AI history");
  failIfError(
    await supabase.from("report_exports").insert({
      report_type: "school_summary",
      scope: {
        schoolYearId: demoYear.id,
        seed: "oratrack-demo",
      },
      file_path: null,
      exported_by: adviser.userId,
    }),
    "Insert report export",
  );
  failIfError(
    await supabase.from("ai_activity_logs").insert({
      actor_id: adviser.userId,
      intent: "learner_summary",
      scope: {
        schoolYearId: demoYear.id,
        seed: "oratrack-demo",
      },
      prompt_excerpt: "Create a demo learner support summary.",
      output_excerpt:
        "Demo draft summary: several learners show attendance and foundational skill support needs.",
      proposed_action: {
        mode: "demo-seed",
        writePolicy: "confirmation_required",
      },
    }),
    "Insert AI activity log",
  );

  log("Seed complete");
  console.log("");
  console.log("Demo sign-ins:");
  console.log(`  ${adviser.email} / ${demoPassword}`);
  console.log(`  ${subjectTeacher.email} / ${demoPassword}`);
  console.log("");
  console.log(`Demo school year: ${demoYear.name} (${demoYear.status})`);
  console.log(`Learners seeded: ${savedLearners.length}`);
  console.log(`Enrollments seeded: ${enrollments.length}`);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
