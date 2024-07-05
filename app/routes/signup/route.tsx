import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { Form, Link, useActionData } from "@remix-run/react";
import { MessageCircleWarning } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "~/components/common/ui/alert";
import { Button } from "~/components/common/ui/button";
import { FormField } from "~/components/form/form-field";
import { SignUpFormSchema } from "~/services/schemas";
import { areUserDetailsAvailable } from "~/services/user";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
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

  // const userId = await createUser(submission.value);

  // return createUserSession(userId, "/");

  return json({
    result: submission.reply({
      formErrors: [
        "Registration is disabled at the moment. Please try again later.",
      ],
    }),
    status: "error",
  } as const);
};

export default function SignUpPage() {
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
      <Alert variant="destructive">
        <AlertTitle>
          <MessageCircleWarning />
        </AlertTitle>
        <AlertDescription>
          Registration is disabled at the moment. Please try again later.
        </AlertDescription>
      </Alert>
      <Form method="post" {...getFormProps(form)}>
        <FormField
          label="Email"
          {...getInputProps(fields.email, { type: "text" })}
        />
        <FormField label="Username" name="username" type="text" />
        <FormField label="Password" name="password" type="password" />
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
    </main>
  );
}
