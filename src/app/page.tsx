import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-16 dark:bg-zinc-950">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl border border-zinc-200 bg-white/80 p-10 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/60">
          <div className="flex items-center justify-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </span>
          </div>

          <main className="mt-8 text-center">
            <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl">
              CrackdTagram Admin
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
              Manage users, images, captions, humor settings, LLM configuration,
              and access controls.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/admin"
                className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Go to Admin
              </Link>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                You’ll be prompted to sign in if needed.
              </span>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
