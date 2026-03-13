import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-16 dark:bg-zinc-950">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl border border-zinc-200 bg-white/80 p-10 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/60">
          <div className="flex items-center justify-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-700">
              <Image
                src="/icon.svg"
                alt="CrackdTagram"
                width={28}
                height={28}
                className="h-7 w-7"
                priority
              />
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
