"use client";

import { useMemo, useState } from "react";
import { LEAD_STATUSES, type LeadStatus } from "@/lib/validation";

type Lead = {
  id: string;
  name: string;
  email: string;
  budget_range: string;
  message: string;
  status: string;
  created_at: string;
};

const STATUS_STYLES: Record<LeadStatus, string> = {
  New: "bg-status-new/15 text-status-new border-status-new/40",
  Contacted: "bg-status-contacted/15 text-status-contacted border-status-contacted/40",
  Closed: "bg-status-closed/15 text-status-closed border-status-closed/40",
};

export function LeadsTable({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [query, setQuery] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter(
      (lead) =>
        lead.name.toLowerCase().includes(q) ||
        lead.email.toLowerCase().includes(q) ||
        lead.message.toLowerCase().includes(q)
    );
  }, [leads, query]);

  async function updateStatus(id: string, status: LeadStatus) {
    setPendingId(id);
    const previous = leads;
    setLeads((current) =>
      current.map((lead) => (lead.id === id ? { ...lead, status } : lead))
    );

    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Update failed");
    } catch {
      setLeads(previous);
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <input
          type="search"
          placeholder="Search by name, email, or message..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full max-w-sm rounded-md border border-ink-100 bg-white px-3 py-2 font-mono text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-500/30"
        />
        <span className="ml-3 font-mono text-xs text-ink-400">
          {filtered.length} of {leads.length} leads
        </span>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-md border border-dashed border-ink-100 py-12 text-center text-sm text-ink-400">
          No leads match that search.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-ink-100 bg-paper-raised">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-400">
                <th className="px-4 py-3 font-medium">Logged</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Budget</th>
                <th className="px-4 py-3 font-medium">Message</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead) => (
                <tr
                  key={lead.id}
                  className="border-b border-ink-100 last:border-0 align-top"
                >
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-ink-400">
                    {new Date(lead.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-medium text-ink-900">
                    {lead.name}
                  </td>
                  <td className="px-4 py-3 text-ink-700">{lead.email}</td>
                  <td className="px-4 py-3 text-ink-700">
                    {lead.budget_range}
                  </td>
                  <td className="max-w-xs px-4 py-3 text-ink-700">
                    {lead.message}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {LEAD_STATUSES.map((s) => (
                        <button
                          key={s}
                          disabled={pendingId === lead.id}
                          onClick={() => updateStatus(lead.id, s)}
                          className={`stamp rounded border px-2 py-0.5 font-mono text-[11px] font-medium transition disabled:opacity-50 ${
                            lead.status === s
                              ? STATUS_STYLES[s as LeadStatus]
                              : "border-ink-100 text-ink-400 hover:border-ink-400"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
