import Link from "next/link";

const navItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/campaigns", label: "Campaigns" },
  { href: "/dashboard/channels", label: "Channels" },
  { href: "/dashboard/settings", label: "Settings" }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="zoda-grid-bg min-h-screen">
      <header className="sticky top-0 z-20 border-b border-zoda-line bg-zoda-black/86 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1480px] items-center justify-between px-5 py-4 lg:px-8">
          <Link href="/dashboard" className="flex items-center gap-3" aria-label="ZODA dashboard home">
            <span className="flex h-8 w-8 items-center justify-center bg-zoda-mint text-lg font-black text-zoda-black">
              Z
            </span>
            <span className="font-display text-xl font-black uppercase tracking-normal text-zoda-mint">
              ZODA
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="border border-transparent px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-zoda-muted transition hover:border-zoda-line hover:text-zoda-mint"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/login"
            className="border border-zoda-line px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-zoda-text transition hover:bg-zoda-mint hover:text-zoda-black"
          >
            Login
          </Link>
        </div>
      </header>
      <div className="mx-auto max-w-[1480px] px-5 py-6 lg:px-8 lg:py-8">{children}</div>
    </main>
  );
}
