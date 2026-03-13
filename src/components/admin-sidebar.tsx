"use client";

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

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 md:block">
      <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto rounded-xl border border-zinc-200 bg-white/80 p-3 text-sm shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70">
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

