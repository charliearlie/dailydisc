import { ActionFunctionArgs, json } from "@remix-run/node";
import { openai } from "~/services/openai.server";
import { z } from "zod";
import { systemPrompt } from "./storytime-prompt";

const tones = [
  "funny",
  "heartwarming",
  "educational",
  "magical",
  "clever",
  "uplifting",
] as const;

const themes = [
  "space",
  "pirates",
  "magic",
  "superheroes",
  "underwater",
  "time-travel",
  "fairy-tale",
  "dinosaurs",
  "jungle",
  "haunted",
  "robots",
  "knights",
  "galaxy",
  "wild-west",
  "arctic",
  "secret-agent",
] as const;

const StoryRequestSchema = z.object({
  additionalCharacters: z.array(
    z.object({
      name: z.string(),
      relationship: z.string(),
    }),
  ),
  personAge: z.number().min(1).max(100),
  personName: z.string().min(1),
  specialDetails: z.string(),
  theme: z.enum(themes),
  tone: z.enum(tones),
});

export const action = async ({ request }: ActionFunctionArgs) => {
  const apiKey = request.headers.get("x-api-key");
  const serverApiKey = process.env.API_KEY;

  if (!apiKey || apiKey !== serverApiKey) {
    return json({ error: "Invalid API key" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const validatedData = StoryRequestSchema.parse(body);

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Create a ${validatedData.tone} story about ${validatedData.personName} (age ${validatedData.personAge}) 
            themed around ${validatedData.theme}.
            Additional characters: ${validatedData.additionalCharacters.map((c) => `${c.name} (${c.relationship})`).join(", ")}.
            ${validatedData.specialDetails ? `Special details: ${validatedData.specialDetails}` : ""}`,
        },
      ],
      model: "gpt-4",
    });

    return json({ story: completion.choices[0].message.content });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return json(
        {
          error: "Validation failed",
          details: error.errors,
        },
        { status: 400 },
      );
    }
    console.error("OpenAI API error:", error);
    return json({ error: "Story generation failed" }, { status: 500 });
  }
};
