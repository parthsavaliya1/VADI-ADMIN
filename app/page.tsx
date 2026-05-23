import Link from "next/link";
import {
  ArrowUpRight,
  LayoutGrid,
  Smartphone,
  Truck,
} from "lucide-react";

const destinations = [
  {
    href: "/admin/login",
    title: "Admin",
    description: "Orders, products, users, and store settings.",
    icon: LayoutGrid,
    iconBg: "bg-[hsl(var(--primary)/0.14)] text-[hsl(var(--primary))]",
    hoverBorder: "hover:border-[hsl(var(--primary)/0.4)]",
    wide: false,
  },
  {
    href: "/driver/login",
    title: "Driver",
    description: "Sign in with your mobile number to manage deliveries.",
    icon: Truck,
    iconBg: "bg-[hsl(210_40%_96%)] text-[hsl(215_25%_35%)] dark:bg-[hsl(215_25%_18%)] dark:text-[hsl(210_40%_85%)]",
    hoverBorder: "hover:border-[hsl(215_40%_45%/0.45)]",
    wide: false,
  },
  {
    href: "/vadi-app",
    title: "VADI App",
    description: "Public marketing preview for the consumer app story.",
    icon: Smartphone,
    iconBg: "bg-[hsl(var(--accent)/0.15)] text-[hsl(var(--accent))]",
    hoverBorder: "hover:border-[hsl(var(--accent)/0.45)]",
    wide: true,
  },
] as const;

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_85%_55%_at_50%_-15%,hsl(150_28%_88%/0.55),transparent_55%),radial-gradient(ellipse_50%_40%_at_100%_0%,hsl(20_55%_92%/0.35),transparent),radial-gradient(ellipse_45%_35%_at_0%_30%,hsl(150_20%_94%/0.5),transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.4] [background-image:linear-gradient(hsl(var(--border))_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border))_1px,transparent_1px)] [background-size:56px_56px] dark:opacity-[0.12]"
      />

      <header className="border-b border-[hsl(var(--border))] bg-[hsl(var(--card)/0.65)] backdrop-blur-md">
        <div className="section-container flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm"
              aria-hidden
            >
              <LayoutGrid className="h-5 w-5 opacity-90" />
            </span>
            <div>
              <p className="text-sm font-semibold leading-none tracking-tight">
                VADI
              </p>
              <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
                Admin &amp; driver hub
              </p>
            </div>
          </div>
          <nav className="hidden items-center gap-1 text-sm sm:flex">
            <Link
              href="/admin/login"
              className="rounded-lg px-3 py-2 text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
            >
              Admin
            </Link>
            <Link
              href="/driver/login"
              className="rounded-lg px-3 py-2 text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
            >
              Driver
            </Link>
            <Link
              href="/vadi-app"
              className="rounded-lg px-3 py-2 text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
            >
              App site
            </Link>
          </nav>
        </div>
      </header>

      <main className="section-container flex flex-1 flex-col py-14 sm:py-20 lg:py-24">
        <div className="mx-auto w-full max-w-3xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]">
            Welcome
          </p>
          <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Where do you need to go?
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-base leading-relaxed text-[hsl(var(--muted-foreground))] sm:text-lg">
            Open the admin console, the driver sign-in, or the public marketing
            page for the VADI app — all from this home screen.
          </p>
        </div>

        <ul className="mx-auto mt-14 grid w-full max-w-4xl gap-4 sm:grid-cols-2 sm:gap-5">
          {destinations.map(
            ({ href, title, description, icon: Icon, iconBg, hoverBorder, wide }) => (
              <li
                key={href}
                className={wide ? "sm:col-span-2" : undefined}
              >
                <Link
                  href={href}
                  className={`group flex h-full items-center justify-between gap-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${hoverBorder}`}
                >
                  <span className="flex min-w-0 items-start gap-4 text-left">
                    <span
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
                    >
                      <Icon className="h-6 w-6" aria-hidden />
                    </span>
                    <span className="min-w-0 pt-0.5">
                      <span className="block text-lg font-semibold tracking-tight">
                        {title}
                      </span>
                      <span className="mt-1 block text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                        {description}
                      </span>
                    </span>
                  </span>
                  <ArrowUpRight className="h-5 w-5 shrink-0 text-[hsl(var(--muted-foreground))] transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[hsl(var(--foreground))]" />
                </Link>
              </li>
            ),
          )}
        </ul>

        <p className="mx-auto mt-12 max-w-lg text-center text-xs text-[hsl(var(--muted-foreground))]">
          Driver login lives at{" "}
          <Link
            href="/driver/login"
            className="font-medium text-[hsl(var(--foreground))] underline-offset-2 hover:underline"
          >
            /driver/login
          </Link>
          . After sign-in, drivers with the driver role are taken to deliveries.
        </p>
      </main>

      <footer className="mt-auto border-t border-[hsl(var(--border))] py-6">
        <div className="section-container flex flex-col items-center justify-between gap-3 text-center text-xs text-[hsl(var(--muted-foreground))] sm:flex-row sm:text-left">
          <span>vadi-admin · internal tools &amp; marketing entry</span>
          <span className="sm:text-right">
            Built with Next.js ·{" "}
            <Link
              href="/driver/login"
              className="font-medium text-[hsl(var(--foreground))] underline-offset-2 hover:underline"
            >
              Driver portal
            </Link>
          </span>
        </div>
      </footer>
    </div>
  );
}
