"use client";

import { useActionState } from "react";
import { Bot, ClipboardCheck, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { submitAiPromptAction, type AiAssistantState } from "@/lib/ai/actions";

type Option = {
  id: string;
  label: string;
};

type AiLog = {
  id: string;
  intent: string;
  prompt_excerpt: string | null;
  output_excerpt: string | null;
  created_at: string;
};

const intents = [
  ["learner_summary", "Learner summary"],
  ["attendance_risk", "Attendance risk"],
  ["academic_performance", "Academic performance"],
  ["intervention_note", "Intervention note"],
  ["parent_message", "Parent message"],
  ["report_narrative", "Report narrative"],
  ["class_insight", "Class insight"],
] as const;

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function AiAssistantPanel({
  title,
  learners,
  sections,
  schoolYears,
  logs,
}: {
  title: string;
  description: string;
  learners: Option[];
  sections: Option[];
  schoolYears: Option[];
  logs: AiLog[];
}) {
  const [state, action, pending] = useActionState<AiAssistantState, FormData>(
    submitAiPromptAction,
    {},
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-navy-950">
          {title}
        </h1>
      </div>

      <div className="grid gap-4">
        <form
          action={action}
          className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-soft"
        >
          <div className="flex items-start gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-skybrand-50 text-skybrand-600">
              <Bot size={24} />
            </span>
            <div>
              <h2 className="font-display text-xl font-extrabold text-navy-950">
                Draft assistant
              </h2>
            </div>
          </div>

          <div className="mt-4 grid gap-4">
            <label>
              <span className="label">Intent</span>
              <select className="input" name="intent" required>
                {intents.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="label">Scope kind</span>
              <select className="input" name="scopeKind" required>
                <option value="school">School/visible records</option>
                <option value="section">Section</option>
                <option value="learner">Learner</option>
              </select>
            </label>
            <div className="grid gap-4 sm:grid-cols-3">
              <label>
                <span className="label">School year</span>
                <select className="input" name="schoolYearId">
                  <option value="">All visible</option>
                  {schoolYears.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="label">Section</span>
                <select className="input" name="sectionId">
                  <option value="">All visible</option>
                  {sections.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="label">Learner</span>
                <select className="input" name="learnerId">
                  <option value="">All visible</option>
                  {learners.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              <span className="label">Prompt</span>
              <textarea
                className="input min-h-40"
                name="prompt"
                placeholder="Ask for a parent message, learner summary, risk explanation, or report narrative."
                required
              />
            </label>
            {state.message ? (
              <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                {state.message}
              </p>
            ) : null}
            <Button disabled={pending} type="submit">
              {pending ? (
                <>
                  <LoaderCircle className="animate-spin" size={17} />
                  Drafting...
                </>
              ) : (
                "Generate draft"
              )}
            </Button>
          </div>
        </form>

        <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-soft">
          <div className="flex items-start gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-skybrand-50 text-skybrand-600">
              <ClipboardCheck size={24} />
            </span>
            <div>
              <h2 className="font-display text-xl font-extrabold text-navy-950">
                Draft output
              </h2>
            </div>
          </div>

          <pre className="mt-4 min-h-72 whitespace-pre-wrap rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-700">
            {state.draft ?? ""}
          </pre>
          {state.notice ? (
            <p className="mt-3 text-xs font-bold uppercase text-slate-500">
              {state.notice}
            </p>
          ) : null}
          {state.mode ? (
            <p className="mt-3 text-xs font-bold uppercase text-slate-500">
              Mode: {state.mode}
            </p>
          ) : null}
        </section>
      </div>

      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-soft">
        <h2 className="font-display text-xl font-extrabold text-navy-950">
          Recent AI activity
        </h2>
        {logs.length ? (
          <div className="mt-5 grid gap-3">
            {logs.map((log) => (
              <article
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                key={log.id}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-navy-950">
                    {log.intent.replaceAll("_", " ")}
                  </p>
                  <span className="text-xs font-bold uppercase text-slate-500">
                    {formatDateTime(log.created_at)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  {log.prompt_excerpt}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            No AI prompts have been logged yet.
          </p>
        )}
      </section>
    </div>
  );
}
