import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Admin
      </h1>
      <ul className="space-y-2">
        <li>
          <Link href="/admin/users" className="text-blue-600 dark:text-blue-400 hover:underline">
            Users
          </Link>
        </li>
        <li>
          <Link href="/admin/images" className="text-blue-600 dark:text-blue-400 hover:underline">
            Images
          </Link>
        </li>
        <li>
          <Link href="/admin/captions" className="text-blue-600 dark:text-blue-400 hover:underline">
            Captions
          </Link>
        </li>
      </ul>
    </div>
  );
}
