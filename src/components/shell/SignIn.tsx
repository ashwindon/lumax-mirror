"use client";

import { useRouter } from "next/navigation";
import { scopeFor } from "@/domain/access";
import { people } from "@/domain/catalog/people";
import type { Person } from "@/domain/types";
import { tenant } from "@/lib/tenant";
import { useSession } from "@/store/session";
import { Avatar } from "@/components/ui/primitives";
import { BrandMark } from "./TopBar";

// A curated set of engineers keeps the picker short; everyone else signs in the same way.
const featuredEngineers = ["priya-kulkarni", "karan-shah", "neha-gokhale", "rohit-pawar", "sneha-joshi", "ganesh-thorat"];

const groups: { title: string; note: string; people: Person[] }[] = [
  {
    title: "Executives",
    note: "Every plant and order, at a glance.",
    people: people.filter((p) => p.role === "executive"),
  },
  {
    title: "Plant managers",
    note: "Their own plant in full, and the orders that pass through it.",
    people: people.filter((p) => p.role === "plant-manager"),
  },
  {
    title: "Engineers",
    note: "The orders they lead and the machines they own.",
    people: featuredEngineers.map((id) => people.find((p) => p.id === id)!),
  },
];

export function SignIn() {
  const signIn = useSession((s) => s.signIn);
  const router = useRouter();

  const choose = (id: string) => {
    signIn(id);
    router.push("/");
  };

  return (
    <main className="min-h-dvh bg-page px-4 py-10 text-ink sm:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-10">
        <header className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <BrandMark className="size-9" />
            <span className="font-stretch-semi-expanded text-[17px] font-bold tracking-tight">{tenant.name}</span>
          </div>
          <div className="max-w-2xl">
            <h1 className="font-stretch-expanded text-[34px] leading-[1.1] font-semibold tracking-tight">See the plants the way your team does</h1>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">
              This demo runs on simulated plant data and has no passwords. Pick a person to sign in as them; what they can open depends on their
              role.
            </p>
          </div>
        </header>

        {groups.map((g) => (
          <section key={g.title} className="flex flex-col gap-3">
            <div>
              <h2 className="text-[15px] font-semibold">{g.title}</h2>
              <p className="text-[13px] text-muted">{g.note}</p>
            </div>
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {g.people.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => choose(p.id)}
                    className="flex w-full items-start gap-3 rounded-2xl border border-line bg-panel px-4 py-3 text-left shadow-panel transition-colors hover:bg-panel-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                  >
                    <Avatar initials={p.initials} />
                    <span className="min-w-0">
                      <span className="block text-[14px] font-semibold">{p.name}</span>
                      <span className="block truncate text-[12px] text-muted">{p.title}</span>
                      <span className="mt-1 block text-[12px] text-faint">Sees {scopeFor(p).summary}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
