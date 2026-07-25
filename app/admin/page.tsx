import { createClient } from "@/lib/supabase/server";
import { LeadsTable } from "./leads-table";
import { SignOutButton } from "./sign-out-button";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: leads, error } = await supabase
    .from("leads")
    .select("id, name, email, budget_range, message, status, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-ink-100 bg-paper-raised">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-signal-600">
              Admin ledger
            </p>
            <h1 className="font-display text-xl font-bold text-ink-900">
              LeadDesk Mini
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-ink-400">{user?.email}</span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        {error ? (
          <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
            Could not load leads: {error.message}
          </p>
        ) : (
          <LeadsTable initialLeads={leads ?? []} />
        )}
      </main>
    </div>
  );
}
