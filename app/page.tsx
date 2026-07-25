import { Footer } from "@/components/footer";
import { LeadForm } from "./lead-form";

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-12 px-6 py-16 lg:flex-row lg:items-center lg:gap-20">
        <div className="flex-1">
          <p className="font-mono text-xs uppercase tracking-widest text-signal-600">
            Intake desk / 01
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-ink-900 sm:text-5xl">
            Every lead lands
            <br />
            on the desk first.
          </h1>
          <p className="mt-5 max-w-md text-ink-400">
            Tell us what you&apos;re building. Your details get logged the
            moment you submit, so nothing sits in an inbox waiting to be
            found.
          </p>
        </div>

        <div className="w-full max-w-md flex-1">
          <LeadForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}
