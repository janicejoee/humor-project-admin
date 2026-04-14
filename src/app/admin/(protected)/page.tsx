import { getCachedClient } from "@/lib/supabase/server";
import { DailyBarChart, type DailyCount } from "./dashboard-charts";
import Link from "next/link";

type RowWithCreatedAt = { created_datetime_utc: string | null };

const dateLabelFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

function buildDailySeries(rows: RowWithCreatedAt[] | null | undefined, days = 7): DailyCount[] {
  const countsByDay = new Map<string, number>();
  const now = new Date();

  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    countsByDay.set(d.toISOString().slice(0, 10), 0);
  }

  for (const row of rows ?? []) {
    if (!row.created_datetime_utc) continue;
    const dayKey = new Date(row.created_datetime_utc).toISOString().slice(0, 10);
    if (countsByDay.has(dayKey)) {
      countsByDay.set(dayKey, (countsByDay.get(dayKey) ?? 0) + 1);
    }
  }

  return Array.from(countsByDay.entries()).map(([dayKey, count]) => ({
    date: dateLabelFormatter.format(new Date(`${dayKey}T00:00:00Z`)),
    count,
  }));
}

export default async function AdminDashboardPage() {
  const supabase = await getCachedClient();
  const oneDayAgoIso = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const sevenDaysAgoIso = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: profilesCount },
    { count: imagesCount },
    { count: captionsCount },
    { count: ratedCaptionsCount },
    { count: captionRequestsCount },
    { count: termsCount },
    { count: captionExamplesCount },
    { count: llmModelsCount },
    { count: humorFlavorsCount },
    { data: recentProfiles },
    { data: topCaptionRows },
    { count: profilesLast7dCount },
    { count: imagesLast7dCount },
    { count: captionsLast7dCount },
    { count: captionVotesCount },
    { count: requestLinkedCaptionsCount },
    { count: captionRequestsLast24hCount },
    { count: captionsLast24hCount },
    { data: profileTrendRows },
    { data: imageTrendRows },
    { data: captionTrendRows },
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("images").select("id", { count: "exact", head: true }),
    supabase.from("captions").select("id", { count: "exact", head: true }),
    supabase
      .from("captions")
      .select("id", { count: "exact", head: true })
      .gt("like_count", 0),
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
      .from("captions")
      .select("id, content, like_count, image_id, images!image_id(url)", {
        count: "exact",
      })
      .not("image_id", "is", null)
      .order("like_count", { ascending: false })
      .limit(1),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gte("created_datetime_utc", sevenDaysAgoIso),
    supabase
      .from("images")
      .select("id", { count: "exact", head: true })
      .gte("created_datetime_utc", sevenDaysAgoIso),
    supabase
      .from("captions")
      .select("id", { count: "exact", head: true })
      .gte("created_datetime_utc", sevenDaysAgoIso),
    supabase.from("caption_votes").select("id", { count: "exact", head: true }),
    supabase
      .from("captions")
      .select("id", { count: "exact", head: true })
      .not("caption_request_id", "is", null),
    supabase
      .from("caption_requests")
      .select("id", { count: "exact", head: true })
      .gte("created_datetime_utc", oneDayAgoIso),
    supabase
      .from("captions")
      .select("id", { count: "exact", head: true })
      .gte("created_datetime_utc", oneDayAgoIso),
    supabase
      .from("profiles")
      .select("created_datetime_utc")
      .gte("created_datetime_utc", sevenDaysAgoIso),
    supabase
      .from("images")
      .select("created_datetime_utc")
      .gte("created_datetime_utc", sevenDaysAgoIso),
    supabase
      .from("captions")
      .select("created_datetime_utc")
      .gte("created_datetime_utc", sevenDaysAgoIso),
  ]);
  const ratedCaptionShare = (captionsCount ?? 0) > 0
    ? Math.round(((ratedCaptionsCount ?? 0) / (captionsCount ?? 1)) * 100)
    : 0;
  const avgVotesPerCaption = (captionsCount ?? 0) > 0
    ? (captionVotesCount ?? 0) / (captionsCount ?? 1)
    : 0;
  const captionsPerRequest = (captionRequestsCount ?? 0) > 0
    ? (requestLinkedCaptionsCount ?? 0) / (captionRequestsCount ?? 1)
    : 0;
  const last24hCaptionYield = (captionRequestsLast24hCount ?? 0) > 0
    ? Math.round(((captionsLast24hCount ?? 0) / (captionRequestsLast24hCount ?? 1)) * 100)
    : 0;
  const profileTrendData = buildDailySeries(profileTrendRows);
  const imageTrendData = buildDailySeries(imageTrendRows);
  const captionTrendData = buildDailySeries(captionTrendRows);

  const topCaption = (topCaptionRows ?? [])[0] ?? null;
  const topCaptionImage =
    topCaption && "images" in topCaption
      ? (Array.isArray((topCaption as any).images)
          ? (topCaption as any).images[0]
          : (topCaption as any).images)
      : null;

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

      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Caption rating stats
          </h2>
          <Link
            href="/admin/captions?min_likes=1"
            className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            View rated captions
          </Link>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950/60">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Rated captions
            </p>
            <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
              {(ratedCaptionsCount ?? 0).toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950/60">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Unrated captions
            </p>
            <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
              {Math.max((captionsCount ?? 0) - (ratedCaptionsCount ?? 0), 0).toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950/60">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Rated share
            </p>
            <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
              {ratedCaptionShare}%
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Momentum and quality
          </h2>
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Last 7 days + lifetime
          </span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950/60">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              New users (7d)
            </p>
            <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
              {(profilesLast7dCount ?? 0).toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950/60">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              New images (7d)
            </p>
            <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
              {(imagesLast7dCount ?? 0).toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950/60">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              New captions (7d)
            </p>
            <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
              {(captionsLast7dCount ?? 0).toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950/60">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Avg votes per caption
            </p>
            <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
              {avgVotesPerCaption.toFixed(2)}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950/60">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Captions per request
            </p>
            <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
              {captionsPerRequest.toFixed(2)}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950/60">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Total caption votes
            </p>
            <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
              {(captionVotesCount ?? 0).toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950/60">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              New caption requests (24h)
            </p>
            <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
              {(captionRequestsLast24hCount ?? 0).toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950/60">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              24h caption yield
            </p>
            <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
              {last24hCaptionYield}%
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Activity trends
          </h2>
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Last 7 days
          </span>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950/60">
            <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              New users
            </p>
            <DailyBarChart
              data={profileTrendData}
              dataKey="count"
              name="Users"
              color="#2563eb"
            />
          </div>
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950/60">
            <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              New images
            </p>
            <DailyBarChart
              data={imageTrendData}
              dataKey="count"
              name="Images"
              color="#059669"
            />
          </div>
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950/60">
            <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              New captions
            </p>
            <DailyBarChart
              data={captionTrendData}
              dataKey="count"
              name="Captions"
              color="#7c3aed"
            />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Top liked caption
        </h2>
        {topCaption ? (
          <div className="mt-4 flex flex-col gap-4 md:flex-row">
            <div className="w-full max-w-sm shrink-0">
              {topCaptionImage?.url ? (
                <div className="overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={topCaptionImage.url}
                    alt=""
                    className="h-64 w-full max-w-sm object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-64 w-full max-w-sm items-center justify-center rounded-lg border border-dashed border-zinc-300 text-zinc-400 dark:border-zinc-700 dark:text-zinc-500">
                  No image
                </div>
              )}
            </div>
            <div className="flex-1 space-y-3">
              <p className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Caption
              </p>
              <p className="rounded-lg bg-zinc-50 p-3 text-base leading-relaxed text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-100">
                {topCaption.content ?? "—"}
              </p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {topCaption.like_count?.toLocaleString?.() ??
                    String(topCaption.like_count ?? 0)}
                </span>{" "}
                likes
              </p>
              {topCaption.image_id && (
                <Link
                  href={`/admin/images/${topCaption.image_id}/edit`}
                  className="inline-flex text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                >
                  View image details
                </Link>
              )}
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-zinc-500">
            No captions with images found yet.
          </p>
        )}
      </section>

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
