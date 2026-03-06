import Link from "next/link";

export default function AdminForbiddenPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
        Access denied
      </h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        You must be a superadmin to view this area.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90"
      >
        Back to home
      </Link>
    </div>
  );
}
