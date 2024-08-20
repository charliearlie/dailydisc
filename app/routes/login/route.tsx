import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "~/components/common/ui/alert";
import { Button } from "~/components/common/ui/button";
import { FormField } from "~/components/form/form-field";
import { LoginFormSchema } from "~/services/schemas";
import { createUserSession } from "~/services/session";
import { login } from "~/services/user.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: LoginFormSchema });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply(), status: submission.status } as const,
      {
        status: submission.status === "error" ? 400 : 200,
      },
    );
  }

  const user = await login(submission.value);

  if (!user) {
    return json({
      result: submission.reply({
        formErrors: ["Incorrect username or password"],
      }),
      status: "error",
    } as const);
  }

  return createUserSession(user?.id, "/");
};

export default function LoginPage() {
  const actionData = useActionData<typeof action>();
  const [form, fields] = useForm({
    id: "login-form",
    lastResult: actionData?.result,
    shouldValidate: "onBlur",
    constraint: getZodConstraint(LoginFormSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: LoginFormSchema });
    },
  });
  return (
    <main className="mx-auto flex h-[calc(100vh-60px)] max-w-lg flex-col space-y-6 px-8 md:mt-32">
      <img
        className="h-32 w-32 self-center"
        src="/DailyDisc.png"
        alt="Daily Disc"
      />
      <h1 className="my-8 self-center text-2xl font-bold md:text-4xl">
        Log in to Daily Disc
      </h1>
      {actionData?.status === "error" && (
        <Alert variant="destructive">
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>{form.errors}</AlertDescription>
        </Alert>
      )}
      <Form method="post" {...getFormProps(form)}>
        <FormField
          label="Username"
          {...getInputProps(fields.username, { type: "text" })}
        />
        <FormField
          label="Password"
          {...getInputProps(fields.password, { type: "password" })}
        />
        <Button className="w-full" type="submit">
          Log in
        </Button>
      </Form>
    </main>
  );
}
