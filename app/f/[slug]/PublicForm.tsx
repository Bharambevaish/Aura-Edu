"use client";

import { FormRenderer } from "@/components/forms/FormRenderer";
import { submitForm, type PublicForm as PublicFormData } from "@/lib/actions/forms";

/** Client wrapper: wires the shared renderer to the public submit action. */
export function PublicForm({ form }: { form: PublicFormData }) {
  return (
    <FormRenderer
      form={form}
      closed={!form.active}
      onSubmit={(answers, website) => submitForm(form.slug, { answers, website })}
    />
  );
}
