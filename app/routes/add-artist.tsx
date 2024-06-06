import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { z } from "zod";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/common/ui/accordion";
import { Button } from "~/components/common/ui/button";
import { FormField } from "~/components/form/form-field";
import { FormFieldTextArea } from "~/components/form/form-field-text-area";
import { db } from "~/drizzle/db.server";
import { artists } from "~/drizzle/schema.server";

const AddArtistSchema = z.object({
  name: z.string().min(1),
  bio: z.string().optional(),
});

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: AddArtistSchema });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply(), status: submission.status } as const,
      {
        status: submission.status === "error" ? 400 : 200,
      },
    );
  }

  const { name, bio } = submission.value;

  await db.insert(artists).values({ name, bio });

  return json({
    result: submission.reply({ resetForm: true }),
    status: "success" as const,
  });
};

export const loader = async () => {
  const allArtists = await db.select().from(artists);

  return json(allArtists.sort((a, b) => a.name.localeCompare(b.name)));
};

export default function AddArtistRoute() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useLoaderData<typeof action>();

  const [form, fields] = useForm({
    id: "artist-form",
    lastResult: actionData?.result,
    shouldValidate: "onBlur",
    constraint: getZodConstraint(AddArtistSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: AddArtistSchema });
    },
  });
  return (
    <div>
      <h1>Add artist</h1>
      <Form method="post" {...getFormProps(form)}>
        <FormField
          label="Name"
          {...getInputProps(fields.name, { type: "text" })}
        />
        <FormFieldTextArea
          label="Bio"
          {...getInputProps(fields.bio, { type: "text" })}
        />
        <Button type="submit">Add artist</Button>
      </Form>

      <p>Number of artists DB: {loaderData.length}</p>

      <Accordion type="single">
        <AccordionItem value="Artists">
          <AccordionTrigger>Artists</AccordionTrigger>
          <AccordionContent>
            <ul>
              {loaderData.map((artist) => (
                <li>{artist.name}</li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
