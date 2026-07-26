"use client";

import { useState, useRef, type FormEvent } from "react";
import { BUDGET_RANGES, leadSchema } from "@/lib/validation";

type Status = "idle" | "submitting" | "success" | "error";

export function LeadForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const raw = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      budgetRange: String(formData.get("budgetRange") ?? ""),
      message: String(formData.get("message") ?? ""),
    };

    const parsed = leadSchema.safeParse(raw);

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !fieldErrors[key]) {
          fieldErrors[key] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setStatus("submitting");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Something went wrong");
      }

      if (formRef.current) {
        formRef.current.reset();
      }
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setServerError(
        err instanceof Error ? err.message : "Could not submit. Try again."
      );
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-lg border border-ink-100 bg-paper-raised p-8 text-center">
        <p className="font-display text-xl font-medium text-ink-900">
          You&apos;re on the desk.
        </p>
        <p className="mt-2 text-sm text-ink-400">
          We&apos;ve logged your details and will reach out shortly.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-6 text-sm font-medium text-signal-600 underline underline-offset-4"
        >
          Submit another
        </button>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      className="rounded-lg border border-ink-100 bg-paper-raised p-6 sm:p-8 shadow-sm"
    >
      <div className="mb-5">
        <label htmlFor="name" className="block text-sm font-medium text-ink-700">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          minLength={2}
          className="mt-1.5 w-full rounded-md border border-ink-100 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-500/30"
          placeholder="Ada Lovelace"
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-600">{errors.name}</p>
        )}
      </div>

      <div className="mb-5">
        <label htmlFor="email" className="block text-sm font-medium text-ink-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="mt-1.5 w-full rounded-md border border-ink-100 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-500/30"
          placeholder="ada@example.com"
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-600">{errors.email}</p>
        )}
      </div>

      <div className="mb-5">
        <label
          htmlFor="budgetRange"
          className="block text-sm font-medium text-ink-700"
        >
          Budget range
        </label>
        <select
          id="budgetRange"
          name="budgetRange"
          required
          defaultValue=""
          className="mt-1.5 w-full rounded-md border border-ink-100 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-500/30"
        >
          <option value="" disabled>
            Select a range
          </option>
          {BUDGET_RANGES.map((range) => (
            <option key={range} value={range}>
              {range}
            </option>
          ))}
        </select>
        {errors.budgetRange && (
          <p className="mt-1 text-xs text-red-600">{errors.budgetRange}</p>
        )}
      </div>

      <div className="mb-6">
        <label
          htmlFor="message"
          className="block text-sm font-medium text-ink-700"
        >
          What are you looking to build?
        </label>
        <textarea
          id="message"
          name="message"
          required
          minLength={10}
          rows={4}
          className="mt-1.5 w-full rounded-md border border-ink-100 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-500/30"
          placeholder="A few sentences on scope, timeline, or goals."
        />
        {errors.message && (
          <p className="mt-1 text-xs text-red-600">{errors.message}</p>
        )}
      </div>

      {serverError && (
        <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-md bg-ink-900 py-2.5 text-sm font-medium text-white transition hover:bg-ink-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "submitting" ? "Sending..." : "Send to the desk"}
      </button>
    </form>
  );
}
