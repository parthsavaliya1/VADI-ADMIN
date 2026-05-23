"use client";

import * as React from "react";
import Link from "next/link";
import {
  Apple,
  ArrowRight,
  Bell,
  Leaf,
  MapPin,
  Package,
  ShieldCheck,
  Sparkles,
  Truck,
  Zap,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { cn } from "@/lib/utils";

const SLIDES = [
  {
    title: "Fresh picks",
    subtitle: "Curated produce and pantry staples in one calm flow.",
    accent: "from-emerald-500/30 to-teal-400/10",
  },
  {
    title: "Track every drop-off",
    subtitle: "Live status, ETAs, and handover notes you can trust.",
    accent: "from-amber-500/25 to-orange-500/10",
  },
  {
    title: "Built for your city",
    subtitle: "Neighbourhood routes tuned for speed and fewer surprises.",
    accent: "from-cyan-500/25 to-blue-600/10",
  },
] as const;

const BENTO = [
  {
    icon: Leaf,
    title: "Quality-first sourcing",
    body: "Seasonal highlights and transparent labels — marketing story only.",
    className: "md:col-span-2",
  },
  {
    icon: Truck,
    title: "Same-day rhythm",
    body: "Illustrative delivery windows for demo purposes.",
    className: "",
  },
  {
    icon: ShieldCheck,
    title: "Secure checkout",
    body: "Placeholder trust signals for presentation.",
    className: "",
  },
  {
    icon: Zap,
    title: "Snappy search",
    body: "Fast filters and voice-friendly browsing — conceptual UI.",
    className: "md:col-span-2",
  },
] as const;

const FAQ = [
  {
    q: "Is this the real consumer app?",
    a: "No. This route is a marketing and design preview only. Product behaviour lives in the VADI mobile app codebase.",
  },
  {
    q: "Can I place an order here?",
    a: "You cannot complete purchases on this page. Use the official app channels when they are available.",
  },
  {
    q: "Will my email be stored?",
    a: "The waitlist field below is interactive for demos only and does not connect to a backend from this page.",
  },
] as const;

export function VadiAppMarketingClient() {
  const [slide, setSlide] = React.useState(0);
  const [scrolled, setScrolled] = React.useState(false);
  const [waitlist, setWaitlist] = React.useState("");
  const [waitlistSent, setWaitlistSent] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    const id = window.setInterval(
      () => setSlide((s) => (s + 1) % SLIDES.length),
      5200,
    );
    return () => window.clearInterval(id);
  }, []);

  const onWaitlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlist.trim()) return;
    setWaitlistSent(true);
    window.setTimeout(() => setWaitlistSent(false), 3200);
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#050806] text-zinc-100">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.22),transparent),radial-gradient(ellipse_60%_40%_at_100%_0%,rgba(245,158,11,0.12),transparent),radial-gradient(ellipse_50%_30%_at_0%_20%,rgba(6,182,212,0.1),transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:48px_48px]"
      />

      <header
        className={cn(
          "sticky top-0 z-50 border-b border-transparent transition-all duration-300",
          scrolled && "border-white/10 bg-[#050806]/75 backdrop-blur-xl",
        )}
      >
        <div className="section-container flex h-16 items-center justify-between gap-4">
          <Link
            href="/vadi-app"
            className="flex items-center gap-2 text-sm font-semibold tracking-tight text-white"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-[#050806] shadow-lg shadow-emerald-500/20">
              <Package className="h-4 w-4" aria-hidden />
            </span>
            VADI App
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-zinc-400 md:flex">
            <a href="#experience" className="transition-colors hover:text-white">
              Experience
            </a>
            <a href="#bento" className="transition-colors hover:text-white">
              Highlights
            </a>
            <a href="#faq" className="transition-colors hover:text-white">
              FAQ
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="ghost"
              className="hidden text-zinc-300 hover:bg-white/10 hover:text-white sm:inline-flex"
            >
              <Link href="/">Admin home</Link>
            </Button>
            <Button
              asChild
              className="rounded-full bg-white px-5 text-[#050806] hover:bg-zinc-200"
            >
              <a href="#download">Get the app</a>
            </Button>
          </div>
        </div>
      </header>

      <p className="border-b border-amber-500/20 bg-amber-500/10 px-4 py-2 text-center text-xs text-amber-100/90">
        <span className="font-medium">Marketing preview only</span> — no orders,
        payments, or account actions are processed on this page.
      </p>

      <main>
        <section className="section-container section-padding pb-16 pt-10 md:pt-16">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" aria-hidden />
                Crafted for storytelling &amp; stakeholder demos
              </div>
              <h1 className="text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-[3.25rem] lg:leading-[1.08]">
                Groceries that feel{" "}
                <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 bg-clip-text text-transparent">
                  effortless
                </span>
                , not rushed.
              </h1>
              <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-zinc-400">
                A polished surface for how VADI could greet new users — calm
                typography, tactile cards, and motion that respects focus.
              </p>
              <div id="download" className="mt-10 flex flex-wrap items-center gap-3">
                <Button
                  size="lg"
                  className="group h-12 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 px-6 text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-teal-500"
                  asChild
                >
                  <a href="#" className="gap-2" aria-label="App Store (placeholder)">
                    <Apple className="h-5 w-5" />
                    App Store
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </a>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10"
                  asChild
                >
                  <a href="#" aria-label="Google Play (placeholder)">
                    Google Play
                  </a>
                </Button>
              </div>
              <p className="mt-4 text-xs text-zinc-500">
                Store buttons are placeholders for marketing layouts.
              </p>
            </div>

            <div className="relative mx-auto w-full max-w-[380px]">
              <div
                aria-hidden
                className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-emerald-500/20 via-transparent to-amber-500/15 blur-2xl"
              />
              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900/60 p-1 shadow-2xl shadow-black/50 backdrop-blur-sm">
                <div className="rounded-[1.75rem] bg-gradient-to-b from-zinc-800/80 to-[#0a0f0c] p-6 pb-8">
                  <div className="mb-6 flex items-center justify-between text-xs text-zinc-500">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                      Rajkot · demo
                    </span>
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wider text-zinc-400">
                      Live preview
                    </span>
                  </div>
                  <div
                    className={cn(
                      "min-h-[200px] rounded-2xl border border-white/5 bg-gradient-to-br p-5 transition-all duration-700",
                      SLIDES[slide].accent,
                    )}
                  >
                    <h2 className="text-xl font-semibold text-white">
                      {SLIDES[slide].title}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                      {SLIDES[slide].subtitle}
                    </p>
                    <div className="mt-6 flex gap-2">
                      {[0, 1, 2].map((i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setSlide(i)}
                          className={cn(
                            "h-1.5 flex-1 rounded-full transition-all",
                            slide === i
                              ? "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.5)]"
                              : "bg-white/15 hover:bg-white/25",
                          )}
                          aria-label={`Show slide ${i + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="mt-5 grid grid-cols-3 gap-2">
                    {["Produce", "Dairy", "Snacks"].map((label, i) => (
                      <button
                        key={label}
                        type="button"
                        className={cn(
                          "rounded-xl border py-3 text-center text-xs font-medium transition-all hover:border-emerald-400/40 hover:bg-emerald-500/10",
                          i === slide % 3
                            ? "border-emerald-400/50 bg-emerald-500/15 text-emerald-100"
                            : "border-white/10 text-zinc-400",
                        )}
                        onClick={() => setSlide(i)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="experience" className="border-y border-white/5 bg-white/[0.02]">
          <div className="section-container section-padding">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Interaction that sells the vibe
              </h2>
              <p className="mt-3 text-zinc-400">
                Tabs switch narrative beats — useful for pitch decks and landing
                experiments.
              </p>
            </div>
            <Tabs defaultValue="flow" className="mx-auto mt-12 max-w-3xl">
              <TabsList className="mx-auto grid w-full max-w-md grid-cols-3 rounded-full border border-white/10 bg-zinc-900/80 p-1">
                <TabsTrigger
                  value="flow"
                  className="rounded-full data-[state=active]:bg-white data-[state=active]:text-[#050806]"
                >
                  Flow
                </TabsTrigger>
                <TabsTrigger
                  value="trust"
                  className="rounded-full data-[state=active]:bg-white data-[state=active]:text-[#050806]"
                >
                  Trust
                </TabsTrigger>
                <TabsTrigger
                  value="delight"
                  className="rounded-full data-[state=active]:bg-white data-[state=active]:text-[#050806]"
                >
                  Delight
                </TabsTrigger>
              </TabsList>
              <TabsContent value="flow" className="mt-8 rounded-2xl border border-white/10 bg-zinc-900/40 p-8 text-center backdrop-blur-sm">
                <p className="text-lg text-zinc-200">
                  Linear paths from search → basket → schedule, with generous
                  whitespace so nothing feels cramped.
                </p>
              </TabsContent>
              <TabsContent value="trust" className="mt-8 rounded-2xl border border-white/10 bg-zinc-900/40 p-8 text-center backdrop-blur-sm">
                <p className="text-lg text-zinc-200">
                  Receipt clarity, refund copy, and support entry points surfaced
                  early — all illustrative for this marketing page.
                </p>
              </TabsContent>
              <TabsContent value="delight" className="mt-8 rounded-2xl border border-white/10 bg-zinc-900/40 p-8 text-center backdrop-blur-sm">
                <p className="text-lg text-zinc-200">
                  Micro-motion on cards, celebratory checkmarks, and seasonal
                  themes you can swap per campaign.
                </p>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        <section id="bento" className="section-container section-padding">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Bento storytelling
            </h2>
            <p className="mt-3 text-zinc-400">
              Hover tiles lift slightly — a Lovable-adjacent pattern for modern
              marketing sites.
            </p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {BENTO.map(({ icon: Icon, title, body, className }) => (
              <div
                key={title}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900/80 to-zinc-950/80 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/10",
                  className,
                )}
              >
                <div className="mb-4 inline-flex rounded-xl bg-emerald-500/15 p-2.5 text-emerald-300 ring-1 ring-emerald-400/20 transition-transform group-hover:scale-105">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="section-container pb-20">
          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-emerald-900/20 via-zinc-900/50 to-amber-900/15 p-8 sm:p-12 lg:flex lg:items-center lg:justify-between lg:gap-12">
            <div className="max-w-lg">
              <div className="mb-4 inline-flex items-center gap-2 text-emerald-300/90">
                <Bell className="h-5 w-5" aria-hidden />
                <span className="text-sm font-medium">Demo waitlist</span>
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Want a ping when this layout ships for real?
              </h2>
              <p className="mt-3 text-sm text-zinc-400">
                Submitting only updates this screen — no API call. Safe for
                screenshots and stakeholder walkthroughs.
              </p>
            </div>
            <form
              onSubmit={onWaitlist}
              className="mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row lg:mt-0 lg:max-w-sm"
            >
              <label htmlFor="waitlist-email" className="sr-only">
                Email
              </label>
              <input
                id="waitlist-email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={waitlist}
                onChange={(e) => setWaitlist(e.target.value)}
                className="h-12 flex-1 rounded-full border border-white/15 bg-black/30 px-5 text-sm text-white placeholder:text-zinc-500 outline-none ring-emerald-500/0 transition-[box-shadow] focus:ring-2 focus:ring-emerald-500/50"
              />
              <Button
                type="submit"
                className="h-12 shrink-0 rounded-full bg-white px-6 text-[#050806] hover:bg-zinc-200"
              >
                {waitlistSent ? "Noted!" : "Notify me"}
              </Button>
            </form>
          </div>
        </section>

        <section id="faq" className="section-container section-padding border-t border-white/5">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-center text-3xl font-semibold tracking-tight text-white">
              Questions
            </h2>
            <Accordion type="single" collapsible className="mt-8 w-full">
              {FAQ.map((item, i) => (
                <AccordionItem
                  key={item.q}
                  value={`item-${i}`}
                  className="border-white/10"
                >
                  <AccordionTrigger className="text-left text-zinc-200 hover:no-underline">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-zinc-400">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-10">
        <div className="section-container flex flex-col items-center justify-between gap-6 text-center text-sm text-zinc-500 sm:flex-row sm:text-left">
          <p>© {new Date().getFullYear()} VADI — marketing surface only.</p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="/admin/login" className="hover:text-zinc-300">
              Admin sign in
            </Link>
            <Link href="/" className="hover:text-zinc-300">
              Site root
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
