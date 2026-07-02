"use client";

import { useActionState } from "react";
import {
  Bot,
  Clock3,
  LoaderCircle,
  MessageSquareText,
  Send,
  SlidersHorizontal,
  Sparkles,
  UserRound,
} from "lucide-react";

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

const starters = [
  "Summarize a learner's attendance and grade risks.",
  "Draft a parent message using visible records.",
  "Create a short class insight for this week.",
];

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function intentLabel(value: string) {
  return value.replaceAll("_", " ");
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
    <div className="grid min-h-[calc(100vh-8rem)] gap-4 xl:grid-cols-[18rem_1fr]">
      <aside className="rounded-lg border border-slate-200 bg-white p-3 shadow-soft">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <span className="grid size-9 place-items-center rounded-lg bg-navy-900 text-white">
            <Sparkles size={18} />
          </span>
          <div>
            <p className="text-sm font-extrabold text-navy-950">{title}</p>
            <p className="text-xs font-semibold text-slate-500">
              {logs.length} recent
            </p>
          </div>
        </div>

        <div className="scroll-soft mt-3 max-h-[32rem] space-y-2 overflow-y-auto pr-1">
          {logs.length ? (
            logs.map((log) => (
              <article
                className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                key={log.id}
              >
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase text-slate-500">
                  <Clock3 size={13} />
                  {formatDateTime(log.created_at)}
                </div>
                <p className="mt-2 text-sm font-bold capitalize text-navy-950">
                  {intentLabel(log.intent)}
                </p>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                  {log.prompt_excerpt}
                </p>
              </article>
            ))
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">
              No recent chats.
            </div>
          )}
        </div>
      </aside>

      <section className="flex min-h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft">
        <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-full bg-navy-900 text-white">
              <Bot size={18} />
            </span>
            <div>
              <h1 className="font-display text-lg font-extrabold text-navy-950">
                ORATRACK assistant
              </h1>
              <p className="text-xs font-semibold text-slate-500">
                Permission-scoped drafting
              </p>
            </div>
          </div>
          {state.mode ? (
            <span className="rounded-full bg-skybrand-50 px-3 py-1 text-xs font-bold text-skybrand-700">
              {state.mode}
            </span>
          ) : null}
        </header>

        <div className="scroll-soft flex-1 overflow-y-auto bg-slate-50/60 px-4 py-5">
          <div className="mx-auto flex max-w-3xl flex-col gap-4">
            {!state.draft ? (
              <div className="mx-auto max-w-2xl py-10 text-center">
                <span className="mx-auto grid size-12 place-items-center rounded-full bg-navy-900 text-white">
                  <MessageSquareText size={23} />
                </span>
                <h2 className="mt-5 font-display text-3xl font-extrabold text-navy-950">
                  How can I help today?
                </h2>
                <div className="mt-5 grid gap-2 sm:grid-cols-3">
                  {starters.map((starter) => (
                    <div
                      className="rounded-lg border border-slate-200 bg-white p-3 text-left text-xs font-semibold leading-5 text-slate-600"
                      key={starter}
                    >
                      {starter}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <article className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-navy-900 px-4 py-3 text-sm leading-7 text-white shadow-soft">
                  <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase text-skybrand-200">
                    <UserRound size={14} />
                    You
                  </div>
                  {state.prompt}
                </article>

                <article className="max-w-[92%] rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-700 shadow-soft">
                  <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase text-skybrand-600">
                    <Bot size={14} />
                    Assistant
                  </div>
                  <pre className="whitespace-pre-wrap font-sans">
                    {state.draft}
                  </pre>
                  {state.notice ? (
                    <p className="mt-3 border-t border-slate-100 pt-3 text-xs font-semibold text-slate-500">
                      {state.notice}
                    </p>
                  ) : null}
                </article>
              </>
            )}
          </div>
        </div>

        <form
          action={action}
          className="border-t border-slate-100 bg-white p-3 sm:p-4"
        >
          <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-3 shadow-soft transition focus-within:border-skybrand-300 focus-within:shadow-glow">
            <details className="mb-3 rounded-lg bg-slate-50 px-3 py-2">
              <summary className="flex cursor-pointer items-center gap-2 text-xs font-bold uppercase text-slate-600">
                <SlidersHorizontal size={14} />
                Options
              </summary>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <label>
                  <span className="label">Intent</span>
                  <select className="input bg-white" name="intent" required>
                    {intents.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="label">Scope</span>
                  <select className="input bg-white" name="scopeKind" required>
                    <option value="school">School</option>
                    <option value="section">Section</option>
                    <option value="learner">Learner</option>
                  </select>
                </label>
                <label>
                  <span className="label">School year</span>
                  <select className="input bg-white" name="schoolYearId">
                    <option value="">All visible</option>
                    {schoolYears.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="sm:col-span-2">
                  <span className="label">Section</span>
                  <select className="input bg-white" name="sectionId">
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
                  <select className="input bg-white" name="learnerId">
                    <option value="">All visible</option>
                    {learners.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </details>

            <label className="sr-only" htmlFor="ai-prompt">
              Prompt
            </label>
            <textarea
              className="input min-h-24 border-0 px-1 shadow-none focus:shadow-none"
              id="ai-prompt"
              name="prompt"
              placeholder="Message ORATRACK..."
              required
            />
            <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
              {state.message ? (
                <p className="text-sm font-semibold text-rose-700">
                  {state.message}
                </p>
              ) : state.errors ? (
                <p className="text-sm font-semibold text-rose-700">
                  Check the prompt and selected scope.
                </p>
              ) : (
                <span className="text-xs font-semibold text-slate-400">
                  Review drafts before using them.
                </span>
              )}
              <Button disabled={pending} type="submit">
                {pending ? (
                  <>
                    <LoaderCircle className="animate-spin" size={17} />
                    Drafting
                  </>
                ) : (
                  <>
                    <Send size={17} />
                    Send
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}
