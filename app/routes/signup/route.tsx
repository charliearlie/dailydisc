import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "~/components/common/ui/alert";
import { Button } from "~/components/common/ui/button";
import { FormField } from "~/components/form/form-field";
import { SignUpFormSchema } from "~/services/schemas";
import { areUserDetailsAvailable, createUser } from "~/services/user.server";
import { createUserSession } from "~/services/session";
import { HoneypotInputs, HoneypotProvider } from "remix-utils/honeypot/react";

import { checkForHoneypot, honeypot } from "~/services/honeypot.server";

export const loader = async () => {
  return json({ honeypotProps: honeypot.getInputProps() });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  checkForHoneypot(formData);
  const submission = parseWithZod(formData, { schema: SignUpFormSchema });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply(), status: submission.status } as const,
      {
        status: submission.status === "error" ? 400 : 200,
      },
    );
  }

  if (
    !(await areUserDetailsAvailable(
      submission.value.email,
      submission.value.username,
    ))
  ) {
    return json({
      result: submission.reply({
        formErrors: ["Username or email are taken. Please try again."],
      }),
      status: "error",
    } as const);
  }

  const userId = await createUser(submission.value);

  return createUserSession(userId, "/");
};

export default function SignUpPage() {
  const { honeypotProps } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [form, fields] = useForm({
    id: "signup-form",
    lastResult: actionData?.result,
    shouldValidate: "onBlur",
    constraint: getZodConstraint(SignUpFormSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: SignUpFormSchema });
    },
  });
  return (
    <main className="mx-auto flex h-[calc(100vh-60px)] max-w-lg flex-col justify-center space-y-6 px-8">
      <img
        className="h-32 w-32 self-center"
        src="/DailyDisc.png"
        alt="Daily Disc"
      />
      <h1 className="my-8 self-center text-2xl font-bold md:text-4xl">
        Sign up to get involved
      </h1>
      {actionData?.status === "error" && (
        <Alert variant="destructive">
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>{form.errors}</AlertDescription>
        </Alert>
      )}
      <HoneypotProvider {...honeypotProps}>
        <Form method="post" {...getFormProps(form)}>
          <FormField
            label="Email"
            {...getInputProps(fields.email, { type: "text" })}
          />
          <FormField label="Username" name="username" type="text" />
          <FormField label="Password" name="password" type="password" />
          <HoneypotInputs />
          <Button className="w-full" type="submit">
            Sign Up
          </Button>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link className="underline" to="/login">
              Login
            </Link>
          </div>
        </Form>
      </HoneypotProvider>
    </main>
  );
}
