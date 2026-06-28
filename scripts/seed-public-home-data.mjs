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

function failIfError(result, label) {
  if (result.error) {
    throw new Error(`${label}: ${result.error.message}`);
  }
  return result.data;
}

async function seed() {
  const now = new Date().toISOString();
  const { count: existingAnnouncementCount, error: announcementCountError } =
    await supabase
      .from("public_announcements")
      .select("id", { count: "exact", head: true })
      .not("published_at", "is", null);

  if (announcementCountError) {
    throw new Error(
      `Count published announcements: ${announcementCountError.message}`,
    );
  }

  if (!existingAnnouncementCount) {
    failIfError(
      await supabase.from("public_announcements").insert([
        {
          title: "Parent Orientation and School Readiness Updates",
          body: "Families are invited to follow official school reminders for orientation schedules, enrollment concerns, and adviser announcements.",
          published_at: now,
        },
        {
          title: "Learner Support Programs Continue This Quarter",
          body: "Balili Elementary School continues classroom-based reading, numeracy, wellness, and family support activities for enrolled learners.",
          published_at: now,
        },
      ]),
      "Insert public announcements",
    );
    console.log("Seeded public announcements.");
  } else {
    console.log("Published announcements already exist.");
  }

  const { count: existingEventCount, error: eventCountError } = await supabase
    .from("public_events")
    .select("id", { count: "exact", head: true })
    .not("published_at", "is", null);

  if (eventCountError) {
    throw new Error(`Count published events: ${eventCountError.message}`);
  }

  if (!existingEventCount) {
    failIfError(
      await supabase.from("public_events").insert([
        {
          title: "Nutrition Month Launch",
          body: "School-wide wellness activities and class reminders for learners and families.",
          starts_at: "2026-07-03T09:00:00+08:00",
          ends_at: "2026-07-03T11:00:00+08:00",
          published_at: now,
        },
        {
          title: "Parent and Teacher Conference",
          body: "Class advisers will meet families for learner progress updates and school reminders.",
          starts_at: "2026-07-10T14:00:00+08:00",
          ends_at: "2026-07-10T16:00:00+08:00",
          published_at: now,
        },
      ]),
      "Insert public events",
    );
    console.log("Seeded public events.");
  } else {
    console.log("Published events already exist.");
  }
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
