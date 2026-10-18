"use client";

import { FormRenderer } from "@/components/forms/FormRenderer";
import { submitForm, type PublicForm as PublicFormData } from "@/lib/actions/forms";

/** Client wrapper: wires the shared renderer to the public submit action. */
export function PublicForm({ form, instituteName }: { form: PublicFormData; instituteName: string }) {
  return (
    <FormRenderer
      form={form}
      closed={!form.active}
      instituteName={instituteName}
      onSubmit={(answers, website, consent) => submitForm(form.slug, { answers, website, ...consent })}
    />
  );
}
