"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Apple,
  ArrowRight,
  BadgePercent,
  CalendarClock,
  Carrot,
  CheckCircle2,
  Cookie,
  Croissant,
  Flame,
  Heart,
  Home,
  Leaf,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Mic,
  Milk,
  Nut,
  Phone,
  Plus,
  Quote,
  RotateCcw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Timer,
  Truck,
  User,
  Wheat,
  X,
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

/* ───────────────────────── Brand constants ───────────────────────── */

const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.vadi.app";
const SUPPORT_PHONE = "+91 99090 49699";
const SUPPORT_EMAIL = "vadi.support@gmail.com";
const SUPPORT_ADDRESS = "VADI Fresh, Ahmedabad, Gujarat, India";
const WHATSAPP_URL = `https://wa.me/${SUPPORT_PHONE.replace(/\D/g, "")}`;

/* ───────────────────────── Content ───────────────────────── */

const NAV = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#categories", label: "Categories" },
  { href: "#reviews", label: "Reviews" },
  { href: "#faq", label: "FAQ" },
] as const;

const STATS = [
  { value: "50K+", label: "Happy customers" },
  { value: "200+", label: "Farm partners" },
  { value: "12L+", label: "Boxes delivered" },
  { value: "4.9★", label: "App rating" },
] as const;

const HERO_SLIDES = [
  {
    eyebrow: "Today's harvest",
    title: "Fresh picks, picked this morning",
    subtitle: "Seasonal vegetables and fruits straight from Gujarat farms.",
    badge: "Up to 30% off",
  },
  {
    eyebrow: "Live tracking",
    title: "Know exactly when it arrives",
    subtitle: "Real-time status from farm to doorstep, every single order.",
    badge: "Arriving in 25 min",
  },
  {
    eyebrow: "Daily essentials",
    title: "Dairy, grains and pantry staples",
    subtitle: "Everything your kitchen needs, delivered on your schedule.",
    badge: "Free delivery",
  },
] as const;

const PHONE_CATEGORIES = [
  { icon: Carrot, label: "Veggies" },
  { icon: Apple, label: "Fruits" },
  { icon: Milk, label: "Dairy" },
  { icon: Wheat, label: "Grains" },
] as const;

const PHONE_PRODUCTS = [
  { name: "Organic Tomatoes", unit: "500 g", price: "₹32", old: "₹45", tag: "Fresh" },
  { name: "Alphonso Mangoes", unit: "1 kg", price: "₹240", old: "₹299", tag: "Seasonal" },
] as const;

const STEPS = [
  {
    step: "01",
    icon: Search,
    title: "Browse & pick",
    body: "Search by name, category or voice. Filter by organic, price or what's in season today.",
  },
  {
    step: "02",
    icon: CalendarClock,
    title: "Choose a slot",
    body: "Pick a delivery window that suits you — same-day express or a scheduled morning drop.",
  },
  {
    step: "03",
    icon: Truck,
    title: "Farm-fresh at your door",
    body: "Track the rider live and receive produce harvested within 24 hours of your order.",
  },
] as const;

const CATEGORIES = [
  { icon: Carrot, label: "Vegetables", count: "120+ items" },
  { icon: Apple, label: "Fruits", count: "80+ items" },
  { icon: Milk, label: "Dairy & Eggs", count: "45+ items" },
  { icon: Wheat, label: "Grains & Pulses", count: "60+ items" },
  { icon: Flame, label: "Spices & Masala", count: "70+ items" },
  { icon: Nut, label: "Dry Fruits", count: "35+ items" },
  { icon: Croissant, label: "Bakery", count: "25+ items" },
  { icon: Cookie, label: "Snacks", count: "90+ items" },
] as const;

const FEATURES = [
  {
    icon: Leaf,
    title: "Harvested within 24 hours",
    body: "We work directly with 200+ local growers, so produce reaches you at peak freshness — no cold storage, no middlemen.",
    className: "md:col-span-2",
  },
  {
    icon: MapPin,
    title: "Live order tracking",
    body: "Follow your order from packing to doorstep with real-time rider location and ETAs.",
    className: "",
  },
  {
    icon: ShieldCheck,
    title: "Secure payments",
    body: "UPI, cards, net-banking and cash on delivery — every transaction encrypted end to end.",
    className: "",
  },
  {
    icon: Mic,
    title: "Voice & smart search",
    body: "Just say what you need. Smart filters surface organic, seasonal and best-value options instantly.",
    className: "md:col-span-2",
  },
  {
    icon: BadgePercent,
    title: "Daily deals & offers",
    body: "Flash deals with countdown timers, category coupons and loyalty rewards on every order.",
    className: "",
  },
  {
    icon: CalendarClock,
    title: "Scheduled delivery slots",
    body: "Pick morning, afternoon or evening windows — or set up a weekly subscription.",
    className: "",
  },
  {
    icon: RotateCcw,
    title: "Hassle-free returns",
    body: "Not happy with an item? Report it in the app and get an instant refund or replacement.",
    className: "",
  },
] as const;

const APP_TABS = [
  {
    value: "browse",
    label: "Browse",
    title: "A home screen that feels like a farmer's market",
    body: "Shop by category, discover trending produce, and catch today's deals — all from a clean, fast home feed.",
    points: [
      "Shop by Category with 8+ curated sections",
      "Deals of the Day with live countdown",
      "Trending Now and Featured Products",
      "Voice search in Gujarati, Hindi and English",
    ],
  },
  {
    value: "track",
    label: "Track",
    title: "Every order, every step, in real time",
    body: "From the moment a farmer packs your crate to the rider at your gate — you always know where your order is.",
    points: [
      "Live rider location on the map",
      "Accurate ETAs with push notifications",
      "Order history and easy re-order",
      "Delivery notes and handover photos",
    ],
  },
  {
    value: "save",
    label: "Save",
    title: "Smart savings on everyday groceries",
    body: "Stack coupons, earn rewards, and never miss a seasonal price drop on your favourites.",
    points: [
      "Personalised offers based on what you buy",
      "Wishlist alerts when prices fall",
      "Weekly subscriptions at locked-in prices",
      "Refer friends, earn VADI credits",
    ],
  },
] as const;

const TESTIMONIALS = [
  {
    name: "Priya Shah",
    city: "Ahmedabad",
    quote:
      "The vegetables actually taste like they did at my grandmother's farm. Ordering takes two minutes and the delivery is always on time.",
  },
  {
    name: "Rakesh Patel",
    city: "Rajkot",
    quote:
      "Live tracking is the best part. I know exactly when to be home, and the produce has never once been bruised or stale.",
  },
  {
    name: "Meera Desai",
    city: "Surat",
    quote:
      "We switched our whole weekly grocery to VADI. The subscription saves us money and the kids love the seasonal fruit boxes.",
  },
] as const;

const FAQ = [
  {
    q: "Where does VADI deliver?",
    a: "We currently deliver across Ahmedabad, Rajkot, Surat and Vadodara, with more Gujarat cities being added every month. Enter your pincode in the app to check availability.",
  },
  {
    q: "How fresh is the produce?",
    a: "Most fruits and vegetables are harvested within 24 hours of your order. We pick at peak ripeness and skip cold storage, so what reaches you is as fresh as a local farm stand.",
  },
  {
    q: "Is there a minimum order or delivery fee?",
    a: "Orders above ₹299 ship free. Below that, a small ₹29 delivery fee applies. Subscription members always get free delivery.",
  },
  {
    q: "Which payment methods are supported?",
    a: "UPI (Google Pay, PhonePe, Paytm), debit and credit cards, net banking, VADI wallet credits and cash on delivery.",
  },
  {
    q: "What if something arrives damaged or is missing?",
    a: "Tap the order in the app and report the item within 24 hours. We'll issue an instant refund to your original payment method or send a replacement with your next order.",
  },
  {
    q: "Can I schedule recurring deliveries?",
    a: "Yes. Set up a weekly or bi-weekly subscription for staples like milk, eggs, vegetables and fruit boxes, and pause or edit it any time.",
  },
] as const;

/* ───────────────────────── Small pieces ───────────────────────── */

function Logo({ className, text = true }: { className?: string; text?: boolean }) {
  return (
    <Link href="/vadi-app" className={cn("flex items-center gap-2.5", className)}>
      <Image
        src="/vadi-logo.png"
        alt="VADI Fresh"
        width={40}
        height={40}
        priority
        className="h-10 w-10 rounded-xl bg-card object-contain shadow-sm ring-1 ring-border"
      />
      {text && (
        <span className="leading-none">
          <span className="block text-base font-bold tracking-tight text-foreground">
            VADI <span className="text-primary">Fresh</span>
          </span>
          <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Fresh farm products
          </span>
        </span>
      )}
    </Link>
  );
}

function PlayStoreBadge({ className }: { className?: string }) {
  return (
    <a
      href={PLAY_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-3 rounded-2xl bg-foreground px-5 py-3 text-primary-foreground shadow-lg shadow-foreground/15 transition-transform hover:scale-[1.02]",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="h-7 w-7 shrink-0" aria-hidden>
        <path
          fill="currentColor"
          d="M3.6 1.8c-.3.2-.5.6-.5 1v18.2c0 .4.2.8.5 1l10.2-10.2L3.6 1.8zm11.4 8.5 2.5-2.5-8.9-5.2 6.4 7.7zm3.1 2.6 2.8-1.6c.8-.5.8-1.7 0-2.2l-2.8-1.6-2.6 2.6 2.6 2.8zm-3.1 2.7-6.4 7.7 8.9-5.2-2.5-2.5z"
        />
      </svg>
      <span className="text-left leading-tight">
        <span className="block text-[10px] uppercase tracking-wide opacity-80">
          Get it on
        </span>
        <span className="block text-sm font-bold">Google Play</span>
      </span>
    </a>
  );
}

function SectionHeading({
  eyebrow,
  title,
  body,
  align = "center",
}: {
  eyebrow: string;
  title: React.ReactNode;
  body?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
      <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-accent-foreground">
        <Leaf className="h-3 w-3 text-primary" aria-hidden />
        {eyebrow}
      </span>
      <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h2>
      {body && <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">{body}</p>}
    </div>
  );
}

/* ───────────────────────── Phone mock-up ───────────────────────── */

function PhoneMock({ slide, onSlide }: { slide: number; onSlide: (i: number) => void }) {
  const s = HERO_SLIDES[slide];
  return (
    <div className="relative mx-auto w-full max-w-[340px]">
      <div
        aria-hidden
        className="absolute -inset-6 rounded-[3rem] bg-gradient-to-br from-primary/25 via-accent/40 to-transparent blur-2xl"
      />
      <div className="relative overflow-hidden rounded-[2.5rem] border-[6px] border-foreground/90 bg-background shadow-2xl shadow-primary/20">
        {/* notch */}
        <div className="absolute left-1/2 top-0 z-10 h-5 w-28 -translate-x-1/2 rounded-b-2xl bg-foreground/90" />

        <div className="px-4 pb-4 pt-8">
          {/* app header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image
                src="/vadi-logo.png"
                alt=""
                width={30}
                height={30}
                className="h-[30px] w-[30px] rounded-lg bg-card object-contain ring-1 ring-border"
              />
              <div className="leading-none">
                <div className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground">
                  <MapPin className="h-3 w-3 text-primary" /> Deliver to
                </div>
                <div className="mt-0.5 text-xs font-bold text-foreground">Ahmedabad · 380015</div>
              </div>
            </div>
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-card ring-1 ring-border">
              <ShoppingBag className="h-4 w-4 text-foreground" />
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                3
              </span>
            </div>
          </div>

          {/* search */}
          <div className="mt-3 flex h-9 items-center gap-2 rounded-xl border border-border bg-card px-3 text-[11px] text-muted-foreground shadow-sm">
            <Search className="h-3.5 w-3.5" />
            <span className="flex-1">Search &quot;mangoes&quot;</span>
            <Mic className="h-3.5 w-3.5 text-primary" />
          </div>

          {/* hero banner */}
          <div className="mt-3 overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary-dark p-4 text-primary-foreground shadow-md transition-all duration-500">
            <div className="flex items-start justify-between gap-2">
              <span className="rounded-full bg-primary-foreground/15 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider">
                {s.eyebrow}
              </span>
              <span className="rounded-md bg-accent px-2 py-0.5 text-[9px] font-bold text-accent-foreground">
                {s.badge}
              </span>
            </div>
            <h3 className="mt-3 text-sm font-bold leading-snug">{s.title}</h3>
            <p className="mt-1 text-[10px] leading-relaxed text-primary-foreground/80">{s.subtitle}</p>
            <div className="mt-3 flex gap-1.5">
              {HERO_SLIDES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onSlide(i)}
                  className={cn(
                    "h-1 rounded-full transition-all",
                    slide === i ? "w-6 bg-primary-foreground" : "w-2 bg-primary-foreground/40",
                  )}
                  aria-label={`Show banner ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* categories */}
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[11px] font-bold text-foreground">Shop by Category</span>
            <span className="text-[10px] font-semibold text-primary">See all</span>
          </div>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {PHONE_CATEGORIES.map(({ icon: Icon, label }, i) => (
              <div
                key={label}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl border bg-card py-2 shadow-sm",
                  i === slide % PHONE_CATEGORIES.length ? "border-primary" : "border-transparent",
                )}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                  <Icon className="h-4 w-4 text-primary" />
                </span>
                <span className="text-[9px] font-semibold text-foreground">{label}</span>
              </div>
            ))}
          </div>

          {/* products */}
          <div className="mt-3 flex items-center justify-between">
            <span className="flex items-center gap-1 text-[11px] font-bold text-foreground">
              <Timer className="h-3 w-3 text-destructive" /> Deals of the Day
            </span>
            <span className="rounded bg-destructive/10 px-1.5 py-0.5 text-[9px] font-bold text-destructive">
              02:14:36
            </span>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {PHONE_PRODUCTS.map((p) => (
              <div key={p.name} className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                <div className="relative flex h-16 items-center justify-center bg-secondary">
                  <Leaf className="h-6 w-6 text-primary/60" />
                  <span className="absolute left-1.5 top-1.5 rounded bg-accent px-1.5 py-0.5 text-[8px] font-bold text-accent-foreground">
                    {p.tag}
                  </span>
                </div>
                <div className="p-2">
                  <div className="truncate text-[10px] font-bold text-foreground">{p.name}</div>
                  <div className="text-[9px] text-muted-foreground">{p.unit}</div>
                  <div className="mt-1 flex items-center justify-between">
                    <div className="flex items-baseline gap-1">
                      <span className="text-[11px] font-extrabold text-primary">{p.price}</span>
                      <span className="text-[8px] text-muted-foreground line-through">{p.old}</span>
                    </div>
                    <span className="flex h-5 w-5 items-center justify-center rounded-md bg-primary text-primary-foreground">
                      <Plus className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* bottom tabs */}
        <div className="flex items-center justify-around border-t border-border bg-card px-2 py-2">
          {[
            { icon: Home, label: "Home", active: true },
            { icon: Search, label: "Search" },
            { icon: Heart, label: "Saved" },
            { icon: ShoppingBag, label: "Cart" },
            { icon: User, label: "Profile" },
          ].map(({ icon: Icon, label, active }) => (
            <div
              key={label}
              className={cn(
                "flex flex-col items-center gap-0.5 text-[8px] font-semibold",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* floating card */}
      <div className="absolute -left-20 bottom-28 hidden rounded-2xl border border-border bg-card p-3 shadow-xl shadow-primary/10 lg:block">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-success/15">
            <CheckCircle2 className="h-4 w-4 text-success" />
          </span>
          <div className="leading-tight">
            <div className="text-[11px] font-bold text-foreground">Order delivered</div>
            <div className="text-[10px] text-muted-foreground">Harvested 18 hrs ago</div>
          </div>
        </div>
      </div>
      <div className="absolute -right-16 top-24 hidden rounded-2xl border border-border bg-card p-3 shadow-xl shadow-primary/10 lg:block">
        <div className="flex items-center gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} className="h-3 w-3 fill-accent text-accent" />
          ))}
        </div>
        <div className="mt-1 text-[11px] font-bold text-foreground">4.9 rating</div>
        <div className="text-[10px] text-muted-foreground">12,000+ reviews</div>
      </div>
    </div>
  );
}

/* ───────────────────────── Page ───────────────────────── */

export function VadiAppMarketingClient() {
  const [slide, setSlide] = React.useState(0);
  const [scrolled, setScrolled] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    const id = window.setInterval(
      () => setSlide((s) => (s + 1) % HERO_SLIDES.length),
      5000,
    );
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      {/* soft background accents */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_70%_45%_at_50%_-10%,hsl(var(--accent)/0.55),transparent),radial-gradient(ellipse_50%_35%_at_100%_10%,hsl(var(--primary)/0.10),transparent),radial-gradient(ellipse_40%_30%_at_0%_30%,hsl(var(--secondary)/0.8),transparent)]"
      />

      {/* ── Header ───────────────────────────────────────────────── */}
      <header
        className={cn(
          "sticky top-0 z-50 border-b border-transparent transition-all duration-300",
          scrolled && "border-border bg-background/85 shadow-sm shadow-primary/5 backdrop-blur-xl",
        )}
      >
        <div className="section-container flex h-[72px] items-center justify-between gap-4">
          <Logo />
          <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground lg:flex">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} className="transition-colors hover:text-primary">
                {n.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" className="hidden rounded-full sm:inline-flex">
              <Link href="/admin/login">Admin</Link>
            </Button>
            <Button asChild className="hidden rounded-full bg-primary px-5 text-primary-foreground hover:bg-primary-dark sm:inline-flex">
              <a href="#download">Download app</a>
            </Button>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card lg:hidden"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="border-t border-border bg-background/95 px-4 py-4 backdrop-blur-xl lg:hidden">
            <nav className="flex flex-col gap-3">
              {NAV.map((n) => (
                <a
                  key={n.href}
                  href={n.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-2 py-2 text-sm font-medium text-foreground hover:bg-accent"
                >
                  {n.label}
                </a>
              ))}
              <a
                href="#download"
                onClick={() => setMenuOpen(false)}
                className="mt-1 rounded-full bg-primary px-5 py-2.5 text-center text-sm font-semibold text-primary-foreground"
              >
                Download app
              </a>
            </nav>
          </div>
        )}
      </header>

      <main>
        {/* ── Hero ─────────────────────────────────────────────────── */}
        <section className="section-container pb-16 pt-10 md:pb-24 md:pt-16">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-foreground shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
                Trusted by 50,000+ healthy households across Gujarat
              </div>
              <h1 className="mt-6 text-balance text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-[3.5rem] lg:leading-[1.08]">
                Fresh from the farm,{" "}
                <span className="bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                  to your home
                </span>{" "}
                in hours.
              </h1>
              <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
                VADI Fresh connects your kitchen directly to 200+ local growers. Hand-picked
                vegetables, fruits, dairy and pantry staples — harvested within 24 hours and
                delivered through one beautifully simple app.
              </p>

              <div id="download" className="mt-9 flex flex-wrap items-center gap-3">
                <PlayStoreBadge />
                <Button
                  size="lg"
                  variant="outline"
                  className="h-[58px] rounded-2xl border-border bg-card px-5 text-foreground hover:bg-accent"
                  asChild
                >
                  <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="gap-2">
                    <MessageCircle className="h-5 w-5 text-primary" />
                    Get link on WhatsApp
                  </a>
                </Button>
              </div>

              <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                {["Free delivery over ₹299", "Harvested within 24 hrs", "Easy refunds"].map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden />
                    {t}
                  </li>
                ))}
              </ul>

              <div className="mt-10 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">
                {STATS.map((s) => (
                  <div key={s.label} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                    <div className="text-2xl font-extrabold tracking-tight text-primary">{s.value}</div>
                    <div className="mt-1 text-xs font-medium text-muted-foreground">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <PhoneMock slide={slide} onSlide={setSlide} />
          </div>
        </section>

        {/* ── Trust strip ──────────────────────────────────────────── */}
        <section className="border-y border-border bg-card/70">
          <div className="section-container grid grid-cols-2 gap-6 py-8 text-center sm:grid-cols-4">
            {[
              { icon: Leaf, label: "100% farm-sourced" },
              { icon: Truck, label: "Same-day delivery" },
              { icon: ShieldCheck, label: "Secure payments" },
              { icon: RotateCcw, label: "Instant refunds" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center justify-center gap-3 text-sm font-semibold text-foreground">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                  <Icon className="h-5 w-5 text-primary" aria-hidden />
                </span>
                {label}
              </div>
            ))}
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────────── */}
        <section id="how-it-works" className="section-container section-padding">
          <SectionHeading
            eyebrow="How it works"
            title="From farm to your table in three simple steps"
            body="No queues, no haggling, no week-old produce. Just open the app, pick what you love, and we handle the rest."
          />
          <div className="relative mt-14 grid gap-6 md:grid-cols-3">
            <div
              aria-hidden
              className="absolute left-[16%] right-[16%] top-14 hidden border-t-2 border-dashed border-primary/30 md:block"
            />
            {STEPS.map(({ step, icon: Icon, title, body }) => (
              <div key={step} className="relative rounded-3xl border border-border bg-card p-7 shadow-sm transition-shadow hover:shadow-lg hover:shadow-primary/10">
                <div className="flex items-center justify-between">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/30">
                    <Icon className="h-6 w-6" aria-hidden />
                  </span>
                  <span className="text-4xl font-extrabold text-primary/15">{step}</span>
                </div>
                <h3 className="mt-6 text-xl font-bold text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Categories ───────────────────────────────────────────── */}
        <section id="categories" className="border-y border-border bg-secondary/50">
          <div className="section-container section-padding">
            <SectionHeading
              eyebrow="Shop by category"
              title="Everything your kitchen needs, in one place"
              body="500+ products across eight categories — all sourced from trusted local farms and producers."
            />
            <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {CATEGORIES.map(({ icon: Icon, label, count }) => (
                <a
                  key={label}
                  href={PLAY_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent transition-colors group-hover:bg-primary">
                    <Icon className="h-6 w-6 text-primary transition-colors group-hover:text-primary-foreground" aria-hidden />
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-foreground">{label}</span>
                    <span className="block text-xs text-muted-foreground">{count}</span>
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features bento ───────────────────────────────────────── */}
        <section id="features" className="section-container section-padding">
          <SectionHeading
            eyebrow="Why VADI Fresh"
            title="Built for busy families who refuse to compromise on freshness"
            body="Every feature in the app exists to get better food to your table, faster — and to make sure you always know exactly what you're getting."
          />
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, body, className }) => (
              <div
                key={title}
                className={cn(
                  "group relative overflow-hidden rounded-3xl border border-border bg-card p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10",
                  className,
                )}
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent/60 blur-2xl transition-opacity group-hover:opacity-100"
                />
                <div className="relative">
                  <div className="mb-5 inline-flex rounded-2xl bg-secondary p-3 text-primary ring-1 ring-border transition-transform group-hover:scale-105">
                    <Icon className="h-6 w-6" aria-hidden />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
                </div>
              </div>
            ))}
            {/* CTA tile */}
            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex flex-col justify-between gap-6 overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-dark p-7 text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:-translate-y-1 md:col-span-3 md:flex-row md:items-center md:p-9"
            >
              <Image
                src="/vadi-logo.png"
                alt=""
                width={200}
                height={200}
                className="pointer-events-none absolute -bottom-8 -right-8 h-48 w-48 rotate-12 opacity-15"
              />
              <div className="relative max-w-2xl">
                <span className="rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                  Free to download
                </span>
                <h3 className="mt-4 text-2xl font-bold sm:text-3xl">Ready to taste the difference?</h3>
                <p className="mt-2 text-sm text-primary-foreground/85 sm:text-base">
                  Download VADI Fresh on Google Play and get ₹100 off your first order with code{" "}
                  <span className="rounded bg-primary-foreground/20 px-1.5 py-0.5 font-mono font-bold">FRESH100</span>.
                </p>
              </div>
              <span className="relative inline-flex shrink-0 items-center gap-2 rounded-full bg-primary-foreground px-6 py-3 text-sm font-bold text-primary shadow-lg">
                Get the app <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </a>
          </div>
        </section>

        {/* ── App tour (tabs) ──────────────────────────────────────── */}
        <section className="border-y border-border bg-card/70">
          <div className="section-container section-padding">
            <SectionHeading
              eyebrow="Inside the app"
              title="Designed to be the calmest part of your day"
              body="Switch between the three things the app does best."
            />
            <Tabs defaultValue="browse" className="mx-auto mt-12 max-w-4xl">
              <TabsList className="mx-auto grid w-full max-w-md grid-cols-3 rounded-full border border-border bg-secondary p-1">
                {APP_TABS.map((t) => (
                  <TabsTrigger
                    key={t.value}
                    value={t.value}
                    className="rounded-full text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
                  >
                    {t.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              {APP_TABS.map((t) => (
                <TabsContent
                  key={t.value}
                  value={t.value}
                  className="mt-8 grid gap-8 rounded-3xl border border-border bg-background p-8 shadow-sm md:grid-cols-[1.1fr_0.9fr] md:p-10"
                >
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight text-foreground">{t.title}</h3>
                    <p className="mt-3 leading-relaxed text-muted-foreground">{t.body}</p>
                    <PlayStoreBadge className="mt-6 px-4 py-2.5" />
                  </div>
                  <ul className="grid gap-3 self-center">
                    {t.points.map((p) => (
                      <li key={p} className="flex items-start gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground shadow-sm">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                        {p}
                      </li>
                    ))}
                  </ul>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </section>

        {/* ── Our story ────────────────────────────────────────────── */}
        <section className="section-container section-padding">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="relative order-2 lg:order-1">
              <div aria-hidden className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-primary/15 to-accent/40 blur-2xl" />
              <div className="relative flex aspect-[4/3] items-center justify-center rounded-[2rem] border border-border bg-card p-10 shadow-xl shadow-primary/10">
                <Image
                  src="/vadi-logo-full.png"
                  alt="VADI Fresh — Fresh farm products"
                  width={420}
                  height={420}
                  className="h-auto w-full max-w-[320px] object-contain"
                />
              </div>
              <div className="absolute -bottom-5 -right-3 rounded-2xl border border-border bg-card px-5 py-4 shadow-xl shadow-primary/10 sm:-right-6">
                <div className="text-xs text-muted-foreground">Since 2019</div>
                <div className="text-xl font-bold text-foreground">Farm-to-door</div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <SectionHeading
                align="left"
                eyebrow="Our story"
                title={
                  <>
                    Real food, grown with <span className="text-primary">honest hands</span>.
                  </>
                }
              />
              <p className="mt-6 leading-relaxed text-muted-foreground">
                VADI started with one mission — connect families directly with the farmers who feed
                them. No middlemen, no week-old produce, no compromises. Just clean, seasonal harvests
                picked at peak ripeness.
              </p>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Every crate you receive supports a local farmer, sustains organic practices, and lands
                at your door within 24 hours of harvest. That&apos;s the VADI promise.
              </p>
              <div className="mt-8 grid grid-cols-3 gap-4">
                {[
                  { v: "200+", l: "Partner farms" },
                  { v: "4", l: "Cities served" },
                  { v: "24h", l: "Harvest to door" },
                ].map((c) => (
                  <div key={c.l} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                    <div className="text-2xl font-extrabold text-primary">{c.v}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{c.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Testimonials ─────────────────────────────────────────── */}
        <section id="reviews" className="border-y border-border bg-secondary/50">
          <div className="section-container section-padding">
            <SectionHeading
              eyebrow="Customer love"
              title="Rated 4.9 by over 12,000 families"
              body="Here's what people across Gujarat are saying about their VADI Fresh experience."
            />
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {TESTIMONIALS.map((t) => (
                <figure key={t.name} className="relative flex flex-col rounded-3xl border border-border bg-card p-7 shadow-sm">
                  <Quote className="absolute right-6 top-6 h-8 w-8 text-primary/15" aria-hidden />
                  <div className="flex gap-0.5">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" aria-hidden />
                    ))}
                  </div>
                  <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-foreground">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      {t.name.split(" ").map((n) => n[0]).join("")}
                    </span>
                    <span>
                      <span className="block text-sm font-bold text-foreground">{t.name}</span>
                      <span className="block text-xs text-muted-foreground">{t.city}</span>
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* ── Download CTA ─────────────────────────────────────────── */}
        <section className="section-container section-padding">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary via-primary to-primary-dark p-8 text-primary-foreground shadow-2xl shadow-primary/30 sm:p-12 lg:p-16">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:28px_28px]"
            />
            <div className="relative grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <div className="inline-flex items-center gap-3 rounded-2xl bg-primary-foreground p-2 pr-4 shadow-lg">
                  <Image
                    src="/vadi-logo.png"
                    alt="VADI Fresh"
                    width={44}
                    height={44}
                    className="h-11 w-11 rounded-xl object-contain"
                  />
                  <span className="text-sm font-bold text-foreground">
                    VADI <span className="text-primary">Fresh</span>
                  </span>
                </div>
                <h2 className="mt-6 text-balance text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                  Get farm-fresh groceries delivered today.
                </h2>
                <p className="mt-4 max-w-xl text-pretty text-base text-primary-foreground/85 sm:text-lg">
                  Join 50,000+ households who&apos;ve switched to fresher, fairer food. Download the
                  app and use code <span className="font-mono font-bold">FRESH100</span> for ₹100 off
                  your first order.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <PlayStoreBadge className="bg-primary-foreground text-foreground shadow-foreground/10" />
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-[58px] items-center gap-2 rounded-2xl border border-primary-foreground/30 px-5 text-sm font-semibold transition-colors hover:bg-primary-foreground/10"
                  >
                    <MessageCircle className="h-5 w-5" /> Chat on WhatsApp
                  </a>
                </div>
              </div>
              <ul className="grid gap-3 text-sm">
                {[
                  "Free delivery on orders over ₹299",
                  "Produce harvested within 24 hours",
                  "Live tracking on every order",
                  "Instant refunds if anything's not right",
                  "Weekly subscriptions at locked-in prices",
                ].map((t) => (
                  <li key={t} className="flex items-center gap-3 rounded-2xl bg-primary-foreground/10 px-4 py-3 font-medium backdrop-blur-sm">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-accent" aria-hidden />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────── */}
        <section id="faq" className="border-t border-border bg-card/70">
          <div className="section-container section-padding">
            <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <SectionHeading
                  align="left"
                  eyebrow="FAQ"
                  title="Questions? We've got answers."
                  body="Can't find what you're looking for? Our support team replies on WhatsApp within minutes."
                />
                <div className="mt-8 flex flex-col gap-3">
                  <a href={`tel:${SUPPORT_PHONE.replace(/\s/g, "")}`} className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground shadow-sm transition-colors hover:border-primary/40">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary"><Phone className="h-4 w-4 text-primary" /></span>
                    {SUPPORT_PHONE}
                  </a>
                  <a href={`mailto:${SUPPORT_EMAIL}`} className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground shadow-sm transition-colors hover:border-primary/40">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary"><Mail className="h-4 w-4 text-primary" /></span>
                    {SUPPORT_EMAIL}
                  </a>
                </div>
              </div>
              <Accordion type="single" collapsible className="w-full rounded-3xl border border-border bg-background px-6 shadow-sm">
                {FAQ.map((item, i) => (
                  <AccordionItem key={item.q} value={`item-${i}`} className="border-border last:border-b-0">
                    <AccordionTrigger className="py-5 text-left text-base font-semibold text-foreground hover:text-primary hover:no-underline">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-background">
        <div className="section-container grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Image
              src="/vadi-logo-full.png"
              alt="VADI Fresh — Fresh farm products"
              width={180}
              height={180}
              className="h-auto w-40 object-contain"
            />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Hand-picked farm produce from local Gujarat growers, delivered to your door within 24
              hours of harvest.
            </p>
            <PlayStoreBadge className="mt-6 px-4 py-2.5" />
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">Explore</h4>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm text-muted-foreground">
              {NAV.map((n) => (
                <li key={n.href}>
                  <a href={n.href} className="transition-colors hover:text-primary">{n.label}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">Company</h4>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm text-muted-foreground">
              <li><Link href="/admin/login" className="transition-colors hover:text-primary">Admin sign in</Link></li>
              <li><Link href="/admin/login" className="transition-colors hover:text-primary">Seller portal</Link></li>
              <li><a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-primary">Partner with us</a></li>
              <li><a href={`mailto:${SUPPORT_EMAIL}`} className="transition-colors hover:text-primary">Careers</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">Contact</h4>
            <ul className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <a href={`tel:${SUPPORT_PHONE.replace(/\s/g, "")}`} className="hover:text-primary">{SUPPORT_PHONE}</a>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-primary">{SUPPORT_EMAIL}</a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{SUPPORT_ADDRESS}</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border">
          <div className="section-container flex flex-col items-center justify-between gap-3 py-6 text-center text-xs text-muted-foreground sm:flex-row sm:text-left">
            <p>© {new Date().getFullYear()} VADI Fresh. All rights reserved.</p>
            <p className="flex items-center gap-1.5">
              Made with <Heart className="h-3.5 w-3.5 fill-primary text-primary" aria-hidden /> in Gujarat
            </p>
          </div>
        </div>
      </footer>

      {/* floating WhatsApp */}
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with VADI support on WhatsApp"
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/40 transition-transform hover:scale-105"
      >
        <MessageCircle className="h-6 w-6" />
      </a>
    </div>
  );
}
