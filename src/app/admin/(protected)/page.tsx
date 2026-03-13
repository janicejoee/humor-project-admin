import { getCachedClient } from "@/lib/supabase/server";
import Link from "next/link";
import { DailyBarChart } from "./dashboard-charts";

const CHART_DAYS = 14;

function toDateKey(iso: string): string {
  return iso.slice(0, 10);
}

function buildDailyCountSeries(
  dates: string[]
): { date: string; count: number }[] {
  const start = new Date();
  start.setDate(start.getDate() - CHART_DAYS);
  start.setHours(0, 0, 0, 0);

  const byDay: Record<string, number> = {};
  for (let i = 0; i < CHART_DAYS; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    byDay[toDateKey(d.toISOString())] = 0;
  }
  for (const iso of dates) {
    const key = toDateKey(iso);
    if (key in byDay) byDay[key]++;
  }

  return Object.keys(byDay)
    .sort()
    .map((date) => ({
      date: new Date(date + "Z").toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
      count: byDay[date],
    }));
}

export default async function AdminDashboardPage() {
  const supabase = await getCachedClient();

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - CHART_DAYS);
  const cutoffIso = cutoff.toISOString();

  const [
    { count: profilesCount },
    { count: imagesCount },
    { count: captionsCount },
    { count: captionRequestsCount },
    { count: termsCount },
    { count: captionExamplesCount },
    { count: llmModelsCount },
    { count: humorFlavorsCount },
    { data: recentProfiles },
    { data: recentSignups },
    { data: recentImages },
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("images").select("id", { count: "exact", head: true }),
    supabase.from("captions").select("id", { count: "exact", head: true }),
    supabase.from("caption_requests").select("id", { count: "exact", head: true }),
    supabase.from("terms").select("id", { count: "exact", head: true }),
    supabase.from("caption_examples").select("id", { count: "exact", head: true }),
    supabase.from("llm_models").select("id", { count: "exact", head: true }),
    supabase.from("humor_flavors").select("id", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("id, email, created_datetime_utc")
      .order("created_datetime_utc", { ascending: false })
      .limit(8),
    supabase
      .from("profiles")
      .select("created_datetime_utc")
      .gte("created_datetime_utc", cutoffIso),
    supabase
      .from("images")
      .select("created_datetime_utc")
      .gte("created_datetime_utc", cutoffIso),
  ]);

  const signupDates = (recentSignups ?? [])
    .map((r) => r.created_datetime_utc)
    .filter(Boolean) as string[];
  const imageDates = (recentImages ?? [])
    .map((r) => r.created_datetime_utc)
    .filter(Boolean) as string[];

  const signupsChartData = buildDailyCountSeries(signupDates);
  const imagesChartData = buildDailyCountSeries(imageDates);

  const statCards = [
    { href: "/admin/users", label: "Users", value: profilesCount ?? 0 },
    { href: "/admin/images", label: "Images", value: imagesCount ?? 0 },
    { href: "/admin/captions", label: "Captions", value: captionsCount ?? 0 },
    { href: "/admin/caption-requests", label: "Caption requests", value: captionRequestsCount ?? 0 },
    { href: "/admin/terms", label: "Terms", value: termsCount ?? 0 },
    { href: "/admin/caption-examples", label: "Caption examples", value: captionExamplesCount ?? 0 },
    { href: "/admin/llm-models", label: "LLM models", value: llmModelsCount ?? 0 },
    { href: "/admin/humor-flavors", label: "Humor flavors", value: humorFlavorsCount ?? 0 },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Dashboard
      </h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(({ href, label, value }) => (
          <Link
            key={href}
            href={href}
            className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-shadow hover:shadow dark:border-zinc-800 dark:bg-zinc-900"
          >
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              {label}
            </p>
            <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
              {value.toLocaleString()}
            </p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Signups (last {CHART_DAYS} days)
          </h2>
          <div className="mt-4">
            <DailyBarChart
              data={signupsChartData}
              dataKey="count"
              name="Signups"
              color="hsl(220 70% 50%)"
            />
          </div>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Images uploaded (last {CHART_DAYS} days)
          </h2>
          <div className="mt-4">
            <DailyBarChart
              data={imagesChartData}
              dataKey="count"
              name="Images"
              color="hsl(160 60% 45%)"
            />
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Recent sign-ups
        </h2>
        <ul className="mt-4 divide-y divide-zinc-100 dark:divide-zinc-800">
          {(recentProfiles ?? []).map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
            >
              <span className="truncate text-sm text-zinc-900 dark:text-zinc-100">
                {p.email ?? p.id}
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {p.created_datetime_utc
                  ? new Date(p.created_datetime_utc).toLocaleDateString()
                  : "—"}
              </span>
            </li>
          ))}
          {(recentProfiles?.length ?? 0) === 0 && (
            <li className="py-6 text-center text-sm text-zinc-500">
              No profiles yet
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}
