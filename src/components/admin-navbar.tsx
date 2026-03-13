"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const primaryLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/images", label: "Images" },
  { href: "/admin/captions", label: "Captions" },
];

type AdminNavbarProps = {
  user?: { email?: string | null } | null;
};

export function AdminNavbar({ user }: AdminNavbarProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/admin"
            className="flex items-center gap-2 shrink-0"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-700">
              <Image
                src="/icon.svg"
                alt="CrackdTagram"
                width={20}
                height={20}
                className="h-5 w-5"
                priority
              />
            </span>
            <span className="hidden font-semibold text-zinc-900 dark:text-zinc-100 sm:inline">
              Admin
            </span>
          </Link>

          <nav
            className="hidden items-center gap-1 text-sm text-zinc-500 sm:flex"
            aria-label="Main"
          >
            {primaryLinks.map(({ href, label }) => {
              const isActive =
                pathname === href ||
                (href !== "/admin" && pathname.startsWith(href + "/"));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
                    isActive
                      ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                      : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {user?.email && (
            <p
              className="hidden max-w-[200px] truncate rounded-md bg-zinc-100 px-3 py-1.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 md:block"
              title={user.email}
            >
              {user.email}
            </p>
          )}
          <button
            type="button"
            onClick={async () => {
              const res = await fetch("/auth/logout", { method: "POST" });
              if (res.redirected) window.location.href = res.url;
              else window.location.href = "/";
            }}
            className="rounded-lg bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
