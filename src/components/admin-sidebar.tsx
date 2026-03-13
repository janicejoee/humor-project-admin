"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const sections = [
  {
    label: "Core",
    items: [
      { href: "/admin", label: "Dashboard" },
      { href: "/admin/users", label: "Users" },
      { href: "/admin/images", label: "Images" },
      { href: "/admin/captions", label: "Captions" },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/caption-requests", label: "Caption Requests" },
      { href: "/admin/caption-examples", label: "Caption Examples" },
      { href: "/admin/terms", label: "Terms" },
    ],
  },
  {
    label: "LLM",
    items: [
      { href: "/admin/llm-providers", label: "Providers" },
      { href: "/admin/llm-models", label: "Models" },
      { href: "/admin/llm-prompt-chains", label: "Prompt Chains" },
      { href: "/admin/llm-responses", label: "Responses" },
    ],
  },
  {
    label: "Humor",
    items: [
      { href: "/admin/humor-flavors", label: "Humor Flavors" },
      { href: "/admin/humor-mix", label: "Humor Mix" },
    ],
  },
  {
    label: "Access",
    items: [
      { href: "/admin/allowed-signup-domains", label: "Signup Domains" },
      { href: "/admin/whitelist-emails", label: "Whitelist Emails" },
    ],
  },
];

type AdminSidebarProps = {
  user?: { email?: string | null } | null;
};

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 md:block">
      <div className="sticky top-0 h-[calc(100vh-3rem)] overflow-y-auto rounded-2xl border border-zinc-200 bg-white/80 p-4 text-sm shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70">
        <div className="mb-5 flex items-center justify-between gap-2">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-700">
              <Image
                src="/icon.svg"
                alt="CrackdTagram"
                width={22}
                height={22}
                className="h-5 w-5"
              />
            </span>
            <div className="hidden leading-tight sm:block">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
                CrackdTagram
              </p>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Admin
              </p>
            </div>
          </Link>
          <button
            type="button"
            onClick={async () => {
              const res = await fetch("/auth/logout", { method: "POST" });
              if (res.redirected) window.location.href = res.url;
              else window.location.href = "/";
            }}
            className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
          >
            Log out
          </button>
        </div>

        {user?.email && (
          <p className="mb-4 truncate rounded-lg bg-zinc-50 px-3 py-2 text-xs text-zinc-600 ring-1 ring-zinc-100 dark:bg-zinc-900 dark:text-zinc-300 dark:ring-zinc-800">
            {user.email}
          </p>
        )}

        <nav className="space-y-5" aria-label="Admin sections">
          {sections.map((section) => (
          <div key={section.label} className="space-y-2">
            <p className="px-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {section.label}
            </p>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/admin" && pathname.startsWith(item.href + "/"));
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`group relative flex items-center gap-2 rounded-lg px-2.5 py-2 transition-colors ${
                        isActive
                          ? "bg-zinc-900 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900"
                          : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                          isActive
                            ? "bg-white dark:bg-zinc-900"
                            : "bg-zinc-300 group-hover:bg-zinc-400 dark:bg-zinc-700 dark:group-hover:bg-zinc-500"
                        }`}
                        aria-hidden="true"
                      />
                      <span className="truncate">{item.label}</span>
                      {isActive && (
                        <span
                          className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r bg-white/70 dark:bg-zinc-900/60"
                          aria-hidden="true"
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
        </nav>
      </div>
    </aside>
  );
}

