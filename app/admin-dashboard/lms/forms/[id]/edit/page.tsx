"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FormBuilder } from "@/components/forms/FormBuilder";
import { getForm, type FormDetail } from "@/lib/actions/forms";

export default function EditFormPage() {
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<FormDetail | null | undefined>(undefined);

  useEffect(() => {
    let ignore = false;
    getForm(id)
      .then((f) => !ignore && setForm(f))
      .catch(() => !ignore && setForm(null));
    return () => {
      ignore = true;
    };
  }, [id]);

  if (form === undefined) return <p className="text-sm text-slate-400">Loading form…</p>;
  if (form === null)
    return (
      <p className="text-sm text-slate-400">
        Form not found. <Link href="/admin-dashboard/lms/forms" className="text-emerald-400">Back to forms</Link>
      </p>
    );
  return <FormBuilder key={form.id} initial={form} />;
}
