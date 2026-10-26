import Image from "next/image";
import Link from "next/link";
import { House, ChevronRight, ArrowUpRight, Leaf, ShieldCheck, Truck } from "lucide-react";
import type { ReactNode } from "react";
import HubFooter from "./HubFooter";

export const loginInput = "w-full rounded-xl border border-input bg-background px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:opacity-60";
export const loginButton = "flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-medium text-primary-foreground transition hover:bg-primary-dark active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25 disabled:cursor-wait disabled:opacity-60";

export default function LoginShell({ driver = false, children }: { driver?: boolean; children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="mx-auto flex w-full max-w-6xl items-center px-6 py-5">
        <Link href="/" aria-label="VADI Fresh home"><Image src="/vadi-logo-full.png" alt="VADI Fresh" width={500} height={500} className="h-20 w-20 object-contain" priority /></Link>

      </header>
      <main className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 pb-12 pt-3 lg:grid-cols-2 lg:gap-20 lg:pt-8">
        <div>
          <nav aria-label="Breadcrumb" className="mb-5 text-sm">
            <ol className="flex items-center gap-2 sm:gap-3">
              <li><Link href="/" className="flex items-center gap-2 rounded-md py-2 text-muted-foreground transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><House size={16} aria-hidden /><span>Home</span></Link></li>
              <li aria-hidden className="text-muted-foreground/50"><ChevronRight size={14} /></li>
              <li aria-current="page" className="font-medium">{driver ? "Driver login" : "Admin login"}</li>
            </ol>
          </nav>
        <section className="relative overflow-hidden rounded-[2rem] border border-border bg-secondary/50 p-8 sm:p-12">
          <div aria-hidden className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/10" />
          <span className="relative inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium"><Leaf size={14} /> Fresh beginnings, every day</span>
          <h1 className="relative mt-8 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">{driver ? "Deliver freshness.\nMake someone’s day." : "Good things grow\nwith you."}</h1>
          <p className="relative mt-5 max-w-sm leading-relaxed text-muted-foreground">{driver ? "Your next delivery starts here. Sign in to see your deliveries and keep every order moving." : "Your space to manage the store, care for customers, and bring farm freshness a little closer."}</p>
          <div className="relative mt-12 flex items-center gap-4 rounded-2xl border border-border bg-card/80 p-5">
            <span className="rounded-xl bg-primary/10 p-3 text-primary">{driver ? <Truck /> : <ShieldCheck />}</span>
            <div><p className="text-sm font-semibold">{driver ? "On the road with VADI Fresh" : "Everything you need, in one place"}</p><p className="mt-1 text-xs text-muted-foreground">{driver ? "Your deliveries. Your daily progress." : "Orders, products, and your store."}</p></div>
          </div>
        </section>
        </div>
        <section className="mx-auto w-full max-w-md">
          {children}
          <Link href={driver ? "/admin/login" : "/driver/login"} className="mt-6 flex items-center justify-center gap-2 rounded-xl p-3 text-sm font-medium text-primary transition hover:bg-secondary">{driver ? "Go to Admin login" : "Joining us for deliveries? Driver login"}<ArrowUpRight size={16} /></Link>
        </section>
      </main>
      <HubFooter />
    </div>
  );
}
