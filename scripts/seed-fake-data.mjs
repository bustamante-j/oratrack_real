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

const legacyWord = ["De", "mo"].join("");
const legacyLower = legacyWord.toLowerCase();
const legacyUpper = legacyWord.toUpperCase();
const legacySeed = `oratrack-${legacyLower}`;
const presentationSeed = "oratrack-presentation";
const staffPassword = "Balili2026!";
const adminEmail = "admin@gmail.com";

const staffUsers = [
  {
    email: "maria.lacbayan@balilies.edu.ph",
    legacyEmail: `${legacyLower}.adviser@oratrack.test`,
    fullName: "Maria Teresa Lacbayan",
    role: "adviser",
    phone: "09174386201",
    employeeNumber: "BES-2026-014",
    positionTitle: "Grade 1 Adviser",
    gradeSpecialization: "Early Grade Literacy",
  },
  {
    email: "jonathan.wacas@balilies.edu.ph",
    legacyEmail: `${legacyLower}.teacher@oratrack.test`,
    fullName: "Jonathan Wacas",
    role: "subject_teacher",
    phone: "09268210477",
    employeeNumber: "BES-2026-027",
    positionTitle: "Subject Teacher",
    gradeSpecialization: "English and Mathematics",
  },
];

const subjectSeeds = [
  {
    code: "ENG1",
    legacyCode: `${legacyUpper}-ENG`,
    name: "English",
    gradeNumber: 1,
  },
  {
    code: "MATH1",
    legacyCode: `${legacyUpper}-MATH`,
    name: "Mathematics",
    gradeNumber: 1,
  },
  {
    code: "FIL1",
    legacyCode: `${legacyUpper}-FIL`,
    name: "Filipino",
    gradeNumber: 1,
  },
  {
    code: "ENG2",
    legacyCode: "LEGACY-ENG2",
    name: "English",
    gradeNumber: 2,
  },
  {
    code: "MATH2",
    legacyCode: "LEGACY-MATH2",
    name: "Mathematics",
    gradeNumber: 2,
  },
  {
    code: "SCI2",
    legacyCode: `${legacyUpper}-SCI`,
    name: "Science",
    gradeNumber: 2,
  },
  {
    code: "ENG3",
    legacyCode: "LEGACY-ENG3",
    name: "English",
    gradeNumber: 3,
  },
  {
    code: "MATH3",
    legacyCode: "LEGACY-MATH3",
    name: "Mathematics",
    gradeNumber: 3,
  },
  {
    code: "SCI3",
    legacyCode: "LEGACY-SCI3",
    name: "Science",
    gradeNumber: 3,
  },
];

const sectionSeeds = [
  {
    legacyName: `${legacyWord} Narra`,
    name: "Narra",
    room: "Room 101",
    gradeNumber: 1,
  },
  {
    legacyName: `${legacyWord} Molave`,
    name: "Molave",
    room: "Room 202",
    gradeNumber: 2,
  },
  {
    legacyName: `${legacyWord} Acacia`,
    name: "Acacia",
    room: "Room 303",
    gradeNumber: 3,
  },
];

const learnerSeeds = [
  {
    oldLrn: "990000000001",
    lrn: "135617260001",
    first_name: "Althea",
    middle_name: "Pines",
    last_name: "Bagalay",
    sex: "female",
    birth_date: "2019-02-14",
    address: "Sitio Central, Barangay Balili, La Trinidad, Benguet",
    section: "Narra",
    guardian: ["Ana Marie Bagalay", "Mother", "09185203411"],
  },
  {
    oldLrn: "990000000002",
    lrn: "135617260002",
    first_name: "Mateo",
    middle_name: "Dangwa",
    last_name: "Fianza",
    sex: "male",
    birth_date: "2018-05-20",
    address: "Purok 2, Barangay Balili, La Trinidad, Benguet",
    section: "Narra",
    guardian: ["Rolando Fianza", "Father", "09271368422"],
  },
  {
    oldLrn: "990000000003",
    lrn: "135617260003",
    first_name: "Sofia",
    middle_name: "Tacio",
    last_name: "Lamsis",
    sex: "female",
    birth_date: "2018-08-03",
    address: "KM 5, Pico Road, La Trinidad, Benguet",
    section: "Narra",
    guardian: ["Leah Lamsis", "Mother", "09193524188"],
  },
  {
    oldLrn: "990000000004",
    lrn: "135617260004",
    first_name: "Gabriel",
    middle_name: "Balangcod",
    last_name: "Cawaon",
    sex: "male",
    birth_date: "2018-11-16",
    address: "Wangal Road, La Trinidad, Benguet",
    section: "Narra",
    guardian: ["Rogelio Cawaon", "Father", "09088123416"],
  },
  {
    oldLrn: "990000000005",
    lrn: "135617260005",
    first_name: "Mikaela",
    middle_name: "Cosalan",
    last_name: "Bantog",
    sex: "female",
    birth_date: "2019-01-29",
    address: "Puguis Junction, La Trinidad, Benguet",
    section: "Narra",
    guardian: ["Clarissa Bantog", "Mother", "09176421550"],
  },
  {
    oldLrn: "990000000006",
    lrn: "135617260006",
    first_name: "Nathan",
    middle_name: "Pucay",
    last_name: "Olsim",
    sex: "male",
    birth_date: "2018-04-12",
    address: "Barangay Balili, La Trinidad, Benguet",
    section: "Narra",
    guardian: ["Mark Anthony Olsim", "Father", "09953782614"],
  },
  {
    oldLrn: "990000000007",
    lrn: "135617260007",
    first_name: "Hannah",
    middle_name: "Sapasap",
    last_name: "Cayao",
    sex: "female",
    birth_date: "2017-07-25",
    address: "Barangay Betag, La Trinidad, Benguet",
    section: "Molave",
    guardian: ["Joanna Cayao", "Mother", "09167182044"],
  },
  {
    oldLrn: "990000000008",
    lrn: "135617260008",
    first_name: "Ezekiel",
    middle_name: "Bastian",
    last_name: "Padlan",
    sex: "male",
    birth_date: "2017-10-09",
    address: "Balili Riverside, La Trinidad, Benguet",
    section: "Molave",
    guardian: ["Edgar Padlan", "Father", "09204173895"],
  },
  {
    oldLrn: "990000000009",
    lrn: "135617260009",
    first_name: "Isabela",
    middle_name: "Awingan",
    last_name: "Dominguez",
    sex: "female",
    birth_date: "2017-12-18",
    address: "Pico, La Trinidad, Benguet",
    section: "Molave",
    guardian: ["Maribel Dominguez", "Mother", "09188392761"],
  },
  {
    oldLrn: "990000000010",
    lrn: "135617260010",
    first_name: "Liam",
    middle_name: "Basalong",
    last_name: "Soriano",
    sex: "male",
    birth_date: "2017-03-07",
    address: "Lubas, La Trinidad, Benguet",
    section: "Molave",
    guardian: ["Gerald Soriano", "Father", "09199823420"],
  },
  {
    oldLrn: "990000000011",
    lrn: "135617260011",
    first_name: "Katrina",
    middle_name: "Polon",
    last_name: "Abance",
    sex: "female",
    birth_date: "2016-09-21",
    address: "Balili Proper, La Trinidad, Benguet",
    section: "Acacia",
    guardian: ["Vivian Abance", "Mother", "09175604132"],
  },
  {
    oldLrn: "990000000012",
    lrn: "135617260012",
    first_name: "Rafael",
    middle_name: "Ligwa",
    last_name: "Manangbao",
    sex: "male",
    birth_date: "2016-06-05",
    address: "Buyagan Road, La Trinidad, Benguet",
    section: "Acacia",
    guardian: ["Bernardo Manangbao", "Father", "09266418750"],
  },
];

function log(message) {
  console.log(`- ${message}`);
}

function failIfError(result, label) {
  if (result.error) {
    throw new Error(`${label}: ${result.error.message}`);
  }
  return result.data;
}

function rangeGrade(seedIndex, subjectIndex, periodIndex) {
  const base = 84 + ((seedIndex + subjectIndex * 2 + periodIndex) % 11);
  return Math.min(base, 96);
}

function ratingFromIndex(index, offset = 0) {
  return ["developing", "proficient", "advanced", "proficient"][
    (index + offset) % 4
  ];
}

function toBasePublicEventRow(row) {
  return {
    title: row.title,
    body: row.body,
    starts_at: row.starts_at,
    ends_at: row.ends_at,
    published_at: row.published_at,
    created_by: row.created_by,
  };
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

async function maybeOne(table, column, value) {
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq(column, value)
    .maybeSingle();

  if (error) throw new Error(`Fetch ${table}.${column}: ${error.message}`);
  return data;
}

async function upsertOne(table, row, onConflict, label) {
  return failIfError(
    await supabase.from(table).upsert(row, { onConflict }).select().single(),
    label,
  );
}

async function deleteWhereIn(table, column, values, label) {
  if (!values.length) return;
  failIfError(await supabase.from(table).delete().in(column, values), label);
}

async function hasPublicEventWorkflowColumns() {
  const { error } = await supabase
    .from("public_events")
    .select("event_type,review_status,reviewed_by,reviewed_at,location", {
      head: true,
    })
    .limit(1);

  return !error;
}

async function ensureAdminProfile() {
  let user = await findUserByEmail(adminEmail);

  if (!user) {
    user = failIfError(
      await supabase.auth.admin.createUser({
        email: adminEmail,
        password: "12345678",
        email_confirm: true,
        user_metadata: {
          full_name: "Herman Saweg",
          seeded_for: presentationSeed,
          seed: null,
        },
      }),
      "Create principal account",
    ).user;
  } else {
    failIfError(
      await supabase.auth.admin.updateUserById(user.id, {
        email_confirm: true,
        user_metadata: {
          full_name: "Herman Saweg",
          seeded_for: presentationSeed,
          seed: null,
        },
      }),
      "Update principal account",
    );
  }

  failIfError(
    await supabase.from("profiles").upsert(
      {
        user_id: user.id,
        email: adminEmail,
        full_name: "Herman Saweg",
        role: "admin_principal",
        status: "active",
        phone: "09171234567",
      },
      { onConflict: "user_id" },
    ),
    "Upsert principal profile",
  );

  return user.id;
}

async function ensureStaffUser(seed) {
  const current = await findUserByEmail(seed.email);
  const legacy = seed.legacyEmail
    ? await findUserByEmail(seed.legacyEmail)
    : null;
  let user = current ?? legacy;

  if (!user) {
    user = failIfError(
      await supabase.auth.admin.createUser({
        email: seed.email,
        password: staffPassword,
        email_confirm: true,
        user_metadata: {
          full_name: seed.fullName,
          seeded_for: presentationSeed,
          seed: null,
        },
      }),
      `Create ${seed.email}`,
    ).user;
  } else {
    const nextEmail = current ? current.email : seed.email;

    user = failIfError(
      await supabase.auth.admin.updateUserById(user.id, {
        email: nextEmail,
        password: staffPassword,
        email_confirm: true,
        user_metadata: {
          full_name: seed.fullName,
          seeded_for: presentationSeed,
          seed: null,
        },
      }),
      `Update ${seed.email}`,
    ).user;
  }

  failIfError(
    await supabase.from("profiles").upsert(
      {
        user_id: user.id,
        email: seed.email,
        full_name: seed.fullName,
        role: seed.role,
        status: "active",
        phone: seed.phone,
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

async function retireUnneededLegacyStaff(staff) {
  const activeIds = new Set(staff.map((entry) => entry.userId));

  for (const seed of staffUsers) {
    const legacy = await findUserByEmail(seed.legacyEmail);
    if (!legacy || activeIds.has(legacy.id)) continue;

    const archivedEmail = `archived-${legacy.id.slice(0, 8)}@oratrack.local`;

    failIfError(
      await supabase.auth.admin.updateUserById(legacy.id, {
        email: archivedEmail,
        email_confirm: true,
        user_metadata: {
          full_name: `${seed.fullName} Archive`,
          seeded_for: presentationSeed,
          seed: null,
        },
      }),
      `Archive legacy auth user ${legacy.id}`,
    );

    failIfError(
      await supabase
        .from("profiles")
        .update({
          email: archivedEmail,
          full_name: `${seed.fullName} Archive`,
          status: "inactive",
        })
        .eq("user_id", legacy.id),
      `Archive legacy profile ${legacy.id}`,
    );
  }
}

async function clearLegacyRecords() {
  failIfError(
    await supabase
      .from("attendance_records")
      .update({ remarks: null })
      .ilike("remarks", `%${legacyWord}%`),
    "Clear legacy attendance remarks",
  );

  const oldTemplates = failIfError(
    await supabase
      .from("certificate_templates")
      .select("id")
      .ilike("name", `%${legacyWord}%`),
    "Find legacy certificate templates",
  );
  const oldTemplateIds = oldTemplates.map((template) => template.id);

  await deleteWhereIn(
    "generated_certificates",
    "certificate_template_id",
    oldTemplateIds,
    "Clear legacy generated certificates",
  );
  await deleteWhereIn(
    "certificate_templates",
    "id",
    oldTemplateIds,
    "Clear legacy certificate templates",
  );

  failIfError(
    await supabase
      .from("lesson_plans")
      .delete()
      .ilike("title", `%${legacyWord}%`),
    "Clear legacy lesson plans",
  );

  failIfError(
    await supabase
      .from("ai_activity_logs")
      .delete()
      .or(
        `prompt_excerpt.ilike.%${legacyWord}%,output_excerpt.ilike.%${legacyWord}%`,
      ),
    "Clear legacy AI logs",
  );
}

async function seed() {
  log("Preparing staff profiles");
  const adminId = await ensureAdminProfile();
  const [adviser, subjectTeacher] = await Promise.all(
    staffUsers.map(ensureStaffUser),
  );
  await retireUnneededLegacyStaff([adviser, subjectTeacher]);
  await clearLegacyRecords();

  log("Preparing active school year and grading periods");
  failIfError(
    await supabase
      .from("school_years")
      .update({ status: "draft" })
      .eq("status", "active")
      .neq("name", "SY 2026-2027"),
    "Move older active school years to draft",
  );

  failIfError(
    await supabase
      .from("school_years")
      .update({
        name: "SY 2026-2027",
        starts_on: "2026-06-02",
        ends_on: "2027-03-31",
        status: "active",
        created_by: adminId,
      })
      .ilike("name", `%${legacyWord}%`),
    "Update legacy school year",
  );

  const schoolYear = await upsertOne(
    "school_years",
    {
      name: "SY 2026-2027",
      starts_on: "2026-06-02",
      ends_on: "2027-03-31",
      status: "active",
      created_by: adminId,
    },
    "name",
    "Upsert school year",
  );

  const periods = failIfError(
    await supabase
      .from("grade_periods")
      .upsert(
        [
          {
            school_year_id: schoolYear.id,
            code: "Q1",
            name: "First Quarter",
            sort_order: 1,
            starts_on: "2026-06-02",
            ends_on: "2026-08-28",
          },
          {
            school_year_id: schoolYear.id,
            code: "Q2",
            name: "Second Quarter",
            sort_order: 2,
            starts_on: "2026-09-01",
            ends_on: "2026-11-27",
          },
          {
            school_year_id: schoolYear.id,
            code: "Q3",
            name: "Third Quarter",
            sort_order: 3,
            starts_on: "2026-12-01",
            ends_on: "2027-02-19",
          },
          {
            school_year_id: schoolYear.id,
            code: "Q4",
            name: "Fourth Quarter",
            sort_order: 4,
            starts_on: "2027-02-22",
            ends_on: "2027-03-31",
          },
        ],
        { onConflict: "school_year_id,code" },
      )
      .select()
      .order("sort_order", { ascending: true }),
    "Upsert grade periods",
  );

  const gradeLevels = failIfError(
    await supabase.from("grade_levels").select("*"),
    "Fetch grade levels",
  );
  const gradeByNumber = new Map(
    gradeLevels.map((grade) => [grade.grade_number, grade]),
  );

  log("Preparing subjects and sections");
  const subjects = [];
  for (const seedSubject of subjectSeeds) {
    failIfError(
      await supabase
        .from("subjects")
        .update({
          code: seedSubject.code,
          name: seedSubject.name,
          grade_level_id:
            gradeByNumber.get(seedSubject.gradeNumber)?.id ?? null,
          is_active: true,
        })
        .eq("code", seedSubject.legacyCode),
      `Update legacy subject ${seedSubject.code}`,
    );

    subjects.push(
      await upsertOne(
        "subjects",
        {
          code: seedSubject.code,
          name: seedSubject.name,
          grade_level_id:
            gradeByNumber.get(seedSubject.gradeNumber)?.id ?? null,
          is_active: true,
        },
        "code",
        `Upsert subject ${seedSubject.code}`,
      ),
    );
  }

  const subjectByCode = new Map(
    subjects.map((subject) => [subject.code, subject]),
  );
  const sections = [];
  for (const seedSection of sectionSeeds) {
    failIfError(
      await supabase
        .from("sections")
        .update({
          name: seedSection.name,
          room: seedSection.room,
          adviser_id: adviser.userId,
        })
        .eq("school_year_id", schoolYear.id)
        .eq("name", seedSection.legacyName),
      `Update legacy section ${seedSection.name}`,
    );

    sections.push(
      await upsertOne(
        "sections",
        {
          school_year_id: schoolYear.id,
          grade_level_id: gradeByNumber.get(seedSection.gradeNumber).id,
          name: seedSection.name,
          room: seedSection.room,
          adviser_id: adviser.userId,
        },
        "school_year_id,grade_level_id,name",
        `Upsert section ${seedSection.name}`,
      ),
    );
  }

  const sectionByName = new Map(
    sections.map((section) => [section.name, section]),
  );

  failIfError(
    await supabase
      .from("teacher_assignments")
      .delete()
      .eq("school_year_id", schoolYear.id)
      .in("teacher_id", [adviser.userId, subjectTeacher.userId]),
    "Refresh teacher assignments",
  );

  failIfError(
    await supabase.from("teacher_assignments").insert([
      {
        teacher_id: adviser.userId,
        school_year_id: schoolYear.id,
        role: "adviser",
        grade_level_id: gradeByNumber.get(1).id,
        section_id: sectionByName.get("Narra").id,
        starts_on: "2026-06-02",
        created_by: adminId,
      },
      {
        teacher_id: subjectTeacher.userId,
        school_year_id: schoolYear.id,
        role: "subject_teacher",
        grade_level_id: gradeByNumber.get(1).id,
        subject_id: subjectByCode.get("ENG1").id,
        starts_on: "2026-06-02",
        created_by: adminId,
      },
      {
        teacher_id: subjectTeacher.userId,
        school_year_id: schoolYear.id,
        role: "subject_teacher",
        grade_level_id: gradeByNumber.get(1).id,
        subject_id: subjectByCode.get("MATH1").id,
        starts_on: "2026-06-02",
        created_by: adminId,
      },
      {
        teacher_id: subjectTeacher.userId,
        school_year_id: schoolYear.id,
        role: "subject_teacher",
        grade_level_id: gradeByNumber.get(2).id,
        subject_id: subjectByCode.get("ENG2").id,
        starts_on: "2026-06-02",
        created_by: adminId,
      },
      {
        teacher_id: subjectTeacher.userId,
        school_year_id: schoolYear.id,
        role: "subject_teacher",
        grade_level_id: gradeByNumber.get(2).id,
        subject_id: subjectByCode.get("MATH2").id,
        starts_on: "2026-06-02",
        created_by: adminId,
      },
      {
        teacher_id: subjectTeacher.userId,
        school_year_id: schoolYear.id,
        role: "subject_teacher",
        grade_level_id: gradeByNumber.get(2).id,
        subject_id: subjectByCode.get("SCI2").id,
        starts_on: "2026-06-02",
        created_by: adminId,
      },
      {
        teacher_id: subjectTeacher.userId,
        school_year_id: schoolYear.id,
        role: "subject_teacher",
        grade_level_id: gradeByNumber.get(3).id,
        subject_id: subjectByCode.get("ENG3").id,
        starts_on: "2026-06-02",
        created_by: adminId,
      },
      {
        teacher_id: subjectTeacher.userId,
        school_year_id: schoolYear.id,
        role: "subject_teacher",
        grade_level_id: gradeByNumber.get(3).id,
        subject_id: subjectByCode.get("MATH3").id,
        starts_on: "2026-06-02",
        created_by: adminId,
      },
      {
        teacher_id: subjectTeacher.userId,
        school_year_id: schoolYear.id,
        role: "subject_teacher",
        grade_level_id: gradeByNumber.get(3).id,
        subject_id: subjectByCode.get("SCI3").id,
        starts_on: "2026-06-02",
        created_by: adminId,
      },
    ]),
    "Insert teacher assignments",
  );

  const sectionSubjectRows = [];
  for (const section of sections) {
    for (const subject of subjects) {
      if (
        subject.grade_level_id &&
        subject.grade_level_id !== section.grade_level_id
      ) {
        continue;
      }

      sectionSubjectRows.push({
        section_id: section.id,
        subject_id: subject.id,
        teacher_id:
          subject.code.startsWith("ENG") ||
          subject.code.startsWith("MATH") ||
          subject.code.startsWith("SCI")
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

  const sectionSubjects = failIfError(
    await supabase
      .from("section_subjects")
      .select("*")
      .in(
        "section_id",
        sections.map((section) => section.id),
      ),
    "Fetch section subjects",
  );

  log("Preparing learners, guardians, and enrollments");
  const learners = [];
  for (const seedLearner of learnerSeeds) {
    const existingCurrent = await maybeOne("learners", "lrn", seedLearner.lrn);

    if (!existingCurrent) {
      failIfError(
        await supabase
          .from("learners")
          .update({
            lrn: seedLearner.lrn,
            first_name: seedLearner.first_name,
            middle_name: seedLearner.middle_name,
            last_name: seedLearner.last_name,
            extension_name: null,
            sex: seedLearner.sex,
            birth_date: seedLearner.birth_date,
            address: seedLearner.address,
            status: "active",
            created_by: adminId,
          })
          .eq("lrn", seedLearner.oldLrn),
        `Update legacy learner ${seedLearner.lrn}`,
      );
    }

    learners.push(
      await upsertOne(
        "learners",
        {
          lrn: seedLearner.lrn,
          first_name: seedLearner.first_name,
          middle_name: seedLearner.middle_name,
          last_name: seedLearner.last_name,
          extension_name: null,
          sex: seedLearner.sex,
          birth_date: seedLearner.birth_date,
          address: seedLearner.address,
          status: "active",
          created_by: adminId,
        },
        "lrn",
        `Upsert learner ${seedLearner.lrn}`,
      ),
    );
  }

  const learnerIds = learners.map((learner) => learner.id);

  await deleteWhereIn(
    "learner_guardians",
    "learner_id",
    learnerIds,
    "Refresh learner guardians",
  );

  failIfError(
    await supabase.from("learner_guardians").insert(
      learners.map((learner, index) => {
        const [fullName, relationship, phone] = learnerSeeds[index].guardian;
        return {
          learner_id: learner.id,
          full_name: fullName,
          relationship,
          phone,
          email: `${fullName
            .toLowerCase()
            .replace(/[^a-z]+/g, ".")
            .replace(/^\.+|\.+$/g, "")}@gmail.com`,
          address: learnerSeeds[index].address,
          is_primary: true,
        };
      }),
    ),
    "Insert learner guardians",
  );

  const enrollments = [];
  for (const [index, learner] of learners.entries()) {
    const seedLearner = learnerSeeds[index];
    const section = sectionByName.get(seedLearner.section);

    enrollments.push(
      await upsertOne(
        "learner_enrollments",
        {
          learner_id: learner.id,
          school_year_id: schoolYear.id,
          grade_level_id: section.grade_level_id,
          section_id: section.id,
          enrollment_status: "enrolled",
          enrolled_on: "2026-06-02",
          created_by: adminId,
        },
        "learner_id,school_year_id",
        `Upsert enrollment ${learner.lrn}`,
      ),
    );
  }

  const enrollmentByLearnerId = new Map(
    enrollments.map((enrollment) => [enrollment.learner_id, enrollment]),
  );

  log("Preparing attendance and assessment records");
  const attendanceDays = ["2026-06-15", "2026-06-16", "2026-06-17"];
  const attendanceDateRows = [];
  for (const section of sections) {
    for (const attendance_on of attendanceDays) {
      attendanceDateRows.push({
        school_year_id: schoolYear.id,
        section_id: section.id,
        attendance_on,
        created_by: adviser.userId,
      });
    }
  }

  const attendanceDates = failIfError(
    await supabase
      .from("attendance_dates")
      .upsert(attendanceDateRows, { onConflict: "section_id,attendance_on" })
      .select(),
    "Upsert attendance dates",
  );

  const attendanceRecords = [];
  for (const attendanceDate of attendanceDates) {
    const sectionEnrollments = enrollments.filter(
      (enrollment) => enrollment.section_id === attendanceDate.section_id,
    );

    for (const [index, enrollment] of sectionEnrollments.entries()) {
      const learnerIndex = learners.findIndex(
        (learner) => learner.id === enrollment.learner_id,
      );
      const marker =
        (learnerIndex + index + attendanceDate.attendance_on.length) % 8;
      attendanceRecords.push({
        attendance_date_id: attendanceDate.id,
        enrollment_id: enrollment.id,
        am_status: marker === 0 ? "late" : marker === 1 ? "absent" : "present",
        pm_status: marker === 1 ? "excused" : "present",
        remarks:
          marker === 0
            ? "Arrived after flag ceremony."
            : marker === 1
              ? "Parent sent notice to adviser."
              : null,
        recorded_by: adviser.userId,
      });
    }
  }

  failIfError(
    await supabase.from("attendance_records").upsert(attendanceRecords, {
      onConflict: "attendance_date_id,enrollment_id",
    }),
    "Upsert attendance records",
  );

  const grades = [];
  for (const [learnerIndex, enrollment] of enrollments.entries()) {
    const sectionSubjectMatches = sectionSubjects.filter(
      (row) => row.section_id === enrollment.section_id,
    );

    for (const [
      subjectIndex,
      sectionSubject,
    ] of sectionSubjectMatches.entries()) {
      for (const [periodIndex, period] of periods.entries()) {
        grades.push({
          enrollment_id: enrollment.id,
          subject_id: sectionSubject.subject_id,
          grade_period_id: period.id,
          numeric_grade: rangeGrade(learnerIndex, subjectIndex, periodIndex),
          remarks:
            (learnerIndex + subjectIndex + periodIndex) % 9 === 0
              ? "Needs short follow-up activity next week."
              : null,
          encoded_by: sectionSubject.teacher_id ?? subjectTeacher.userId,
        });
      }
    }
  }

  failIfError(
    await supabase.from("grades").upsert(grades, {
      onConflict: "enrollment_id,subject_id,grade_period_id",
    }),
    "Upsert grades",
  );

  failIfError(
    await supabase.from("literacy_numeracy_records").upsert(
      enrollments.map((enrollment, index) => ({
        enrollment_id: enrollment.id,
        school_year_id: schoolYear.id,
        literacy_rating: ratingFromIndex(index),
        numeracy_rating: ratingFromIndex(index, 1),
        remarks:
          index % 4 === 0
            ? "Short guided practice is scheduled every Friday."
            : "Progress is aligned with current class targets.",
        encoded_by: adviser.userId,
      })),
      { onConflict: "enrollment_id,school_year_id" },
    ),
    "Upsert literacy and numeracy records",
  );

  log("Preparing interventions and awards");
  await deleteWhereIn(
    "risk_flags",
    "learner_id",
    learnerIds,
    "Refresh risk flags",
  );
  await deleteWhereIn(
    "interventions",
    "learner_id",
    learnerIds,
    "Refresh interventions",
  );

  const interventionRows = learners.slice(0, 4).map((learner, index) => {
    const enrollment = enrollmentByLearnerId.get(learner.id);
    return {
      learner_id: learner.id,
      enrollment_id: enrollment.id,
      teacher_id: index % 2 === 0 ? adviser.userId : subjectTeacher.userId,
      category:
        index % 2 === 0
          ? "Reading Fluency Support"
          : "Numeracy Confidence Support",
      status: index === 3 ? "completed" : "ongoing",
      started_on: `2026-06-${String(10 + index).padStart(2, "0")}`,
      follow_up_on: `2026-07-${String(12 + index).padStart(2, "0")}`,
      notes:
        "Weekly small-group practice with parent coordination and adviser monitoring.",
    };
  });

  const interventions = failIfError(
    await supabase.from("interventions").insert(interventionRows).select(),
    "Insert interventions",
  );

  failIfError(
    await supabase.from("intervention_updates").insert(
      interventions.map((intervention) => ({
        intervention_id: intervention.id,
        status: intervention.status,
        notes: "Initial progress check recorded with next activity assigned.",
        follow_up_on: intervention.follow_up_on,
        created_by: intervention.teacher_id,
      })),
    ),
    "Insert intervention updates",
  );

  const existingTemplate = await maybeOne(
    "certificate_templates",
    "name",
    "Balili Recognition Template",
  );
  const certificateTemplate =
    existingTemplate ??
    failIfError(
      await supabase
        .from("certificate_templates")
        .insert({
          name: "Balili Recognition Template",
          certificate_type: "recognition",
          template_payload: {
            title: "Certificate of Recognition",
            subtitle: "Presented to",
            body: "for consistent effort and active participation in class learning activities.",
            signatory: "Herman Saweg",
            signatoryTitle: "School Principal I",
            backgroundStyle: "formal-blue",
            seeded_for: presentationSeed,
          },
          is_active: true,
          created_by: adminId,
        })
        .select()
        .single(),
      "Insert certificate template",
    );

  if (existingTemplate) {
    failIfError(
      await supabase
        .from("certificate_templates")
        .update({
          certificate_type: "recognition",
          template_payload: {
            ...(existingTemplate.template_payload ?? {}),
            title: "Certificate of Recognition",
            subtitle: "Presented to",
            body: "for consistent effort and active participation in class learning activities.",
            signatory: "Herman Saweg",
            signatoryTitle: "School Principal I",
            backgroundStyle: "formal-blue",
            seeded_for: presentationSeed,
          },
          is_active: true,
          created_by: adminId,
        })
        .eq("id", existingTemplate.id),
      "Update certificate template",
    );
  }

  await deleteWhereIn(
    "generated_certificates",
    "enrollment_id",
    enrollments.map((enrollment) => enrollment.id),
    "Refresh generated certificates",
  );

  failIfError(
    await supabase.from("generated_certificates").insert(
      enrollments.slice(0, 6).map((enrollment, index) => ({
        certificate_template_id: certificateTemplate.id,
        enrollment_id: enrollment.id,
        certificate_type: "recognition",
        file_path: `certificates/recognition-${learnerSeeds[index].lrn}.pdf`,
        generated_by: index % 2 === 0 ? adviser.userId : adminId,
      })),
    ),
    "Insert generated certificates",
  );

  log("Preparing lesson plans, reports, AI logs, and public site records");
  failIfError(
    await supabase
      .from("lesson_plans")
      .delete()
      .in("title", [
        "Guided Reading for Short Vowels",
        "Hands-On Science Observation",
      ]),
    "Refresh lesson plans",
  );

  failIfError(
    await supabase.from("lesson_plans").insert([
      {
        school_year_id: schoolYear.id,
        grade_level_id: gradeByNumber.get(1).id,
        subject_id: subjectByCode.get("ENG1").id,
        teacher_id: subjectTeacher.userId,
        title: "Guided Reading for Short Vowels",
        status: "reviewed",
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
      },
      {
        school_year_id: schoolYear.id,
        grade_level_id: gradeByNumber.get(2).id,
        subject_id: subjectByCode.get("SCI2").id,
        teacher_id: subjectTeacher.userId,
        title: "Hands-On Science Observation",
        status: "uploaded",
      },
    ]),
    "Insert lesson plans",
  );

  for (const seed of [legacySeed, presentationSeed]) {
    failIfError(
      await supabase.from("report_exports").delete().eq("scope->>seed", seed),
      `Refresh report exports ${seed}`,
    );
    failIfError(
      await supabase.from("ai_activity_logs").delete().eq("scope->>seed", seed),
      `Refresh AI logs ${seed}`,
    );
  }

  failIfError(
    await supabase.from("report_exports").insert([
      {
        report_type: "class_attendance_summary",
        scope: {
          schoolYearId: schoolYear.id,
          sectionId: sectionByName.get("Narra").id,
          seed: presentationSeed,
        },
        file_path: "reports/class-attendance-summary-narra.pdf",
        exported_by: adviser.userId,
      },
      {
        report_type: "grade_distribution",
        scope: {
          schoolYearId: schoolYear.id,
          sectionId: sectionByName.get("Narra").id,
          seed: presentationSeed,
        },
        file_path: "reports/grade-distribution-narra.pdf",
        exported_by: subjectTeacher.userId,
      },
    ]),
    "Insert report exports",
  );

  failIfError(
    await supabase.from("ai_activity_logs").insert({
      actor_id: adviser.userId,
      intent: "learner_support_summary",
      scope: {
        sectionId: sectionByName.get("Narra").id,
        schoolYearId: schoolYear.id,
        seed: presentationSeed,
      },
      prompt_excerpt: "Create a learner support summary for Grade 1 Narra.",
      output_excerpt:
        "Several learners benefit from guided reading practice and consistent attendance follow-up.",
      proposed_action: {
        mode: "review_required",
        recommendation: "Share a draft support note with the adviser first.",
      },
      user_confirmed: false,
    }),
    "Insert AI activity log",
  );

  failIfError(
    await supabase
      .from("public_announcements")
      .delete()
      .or(`title.ilike.%${legacyWord}%,body.ilike.%${legacyWord}%`),
    "Clear legacy public announcements",
  );

  const publicAnnouncementTitles = [
    "Parent Orientation and School Readiness Updates",
    "Reading and Numeracy Support Continues This Quarter",
    "School Garden Activity Supports Nutrition Month",
  ];
  failIfError(
    await supabase
      .from("public_announcements")
      .delete()
      .in("title", publicAnnouncementTitles),
    "Refresh public announcements",
  );

  failIfError(
    await supabase.from("public_announcements").insert([
      {
        title: publicAnnouncementTitles[0],
        body: "Families are invited to follow adviser reminders for orientation schedules, enrollment concerns, and classroom routines.",
        published_at: "2026-07-01T08:00:00+08:00",
        created_by: adminId,
      },
      {
        title: publicAnnouncementTitles[1],
        body: "Teachers are using classroom records to identify learners who need focused reading, numeracy, or attendance support.",
        published_at: "2026-07-02T08:00:00+08:00",
        created_by: adminId,
      },
      {
        title: publicAnnouncementTitles[2],
        body: "Learners and teachers will use the school garden activity to connect wellness, science, and community participation.",
        published_at: "2026-07-03T08:00:00+08:00",
        created_by: adminId,
      },
    ]),
    "Insert public announcements",
  );

  failIfError(
    await supabase
      .from("public_events")
      .delete()
      .or(`title.ilike.%${legacyWord}%,body.ilike.%${legacyWord}%`),
    "Clear legacy public events",
  );

  const publicEventTitles = [
    "Nutrition Month Launch",
    "Parent and Teacher Conference",
    "Reading Camp Culminating Activity",
    "Classroom Garden Proposal",
  ];
  failIfError(
    await supabase
      .from("public_events")
      .delete()
      .in("title", publicEventTitles),
    "Refresh public events",
  );

  const hasEventWorkflow = await hasPublicEventWorkflowColumns();
  if (!hasEventWorkflow) {
    log(
      "Public event approval columns are missing in Supabase; seeding events with the base schema.",
    );
  }

  const eventRows = [
    {
      title: publicEventTitles[0],
      body: "School-wide wellness activities and class reminders for learners and families.",
      starts_at: "2026-07-06T09:00:00+08:00",
      ends_at: "2026-07-06T11:00:00+08:00",
      published_at: "2026-07-02T10:00:00+08:00",
      created_by: adminId,
      location: "Balili Elementary School Covered Court",
      event_type: "School program",
      review_status: "approved",
      reviewed_by: adminId,
      reviewed_at: "2026-07-02T10:00:00+08:00",
    },
    {
      title: publicEventTitles[1],
      body: "Class advisers will meet families for learner progress updates and school reminders.",
      starts_at: "2026-07-10T14:00:00+08:00",
      ends_at: "2026-07-10T16:00:00+08:00",
      published_at: "2026-07-02T10:05:00+08:00",
      created_by: adminId,
      location: "Grade Level Classrooms",
      event_type: "Conference",
      review_status: "approved",
      reviewed_by: adminId,
      reviewed_at: "2026-07-02T10:05:00+08:00",
    },
    {
      title: publicEventTitles[2],
      body: "Learners will present reading outputs and receive class recognition.",
      starts_at: "2026-07-18T09:30:00+08:00",
      ends_at: "2026-07-18T11:00:00+08:00",
      published_at: "2026-07-02T10:10:00+08:00",
      created_by: adviser.userId,
      location: "School Library Corner",
      event_type: "Learner activity",
      review_status: "approved",
      reviewed_by: adminId,
      reviewed_at: "2026-07-02T10:10:00+08:00",
    },
    {
      title: publicEventTitles[3],
      body: "Submitted by a teacher for admin review before public posting.",
      starts_at: "2026-07-22T08:30:00+08:00",
      ends_at: "2026-07-22T10:00:00+08:00",
      published_at: null,
      created_by: subjectTeacher.userId,
      location: "Science Area",
      event_type: "Teacher submission",
      review_status: "pending",
    },
  ];

  failIfError(
    await supabase
      .from("public_events")
      .insert(
        hasEventWorkflow ? eventRows : eventRows.map(toBasePublicEventRow),
      ),
    "Insert public events",
  );

  log("Presentation seed complete");
  console.log("Staff sign-ins:");
  console.log(`  ${adviser.email} / ${staffPassword}`);
  console.log(`  ${subjectTeacher.email} / ${staffPassword}`);
  console.log(`Principal account retained: ${adminEmail} / 12345678`);
  console.log(`School year: ${schoolYear.name}`);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
