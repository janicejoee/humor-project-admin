import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <main className="w-full max-w-xl text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
          CrackdTagram Admin
        </h1>
        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
          Manage users, images, and captions for the humor project.
        </p>
        <div className="mt-10">
          <Link
            href="/admin"
            className="inline-flex rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:opacity-90 dark:bg-zinc-100 dark:text-zinc-900"
          >
            Sign in to Admin
          </Link>
        </div>
      </main>
    </div>
  );
}
