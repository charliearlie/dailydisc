import { ActionFunctionArgs, json } from "@remix-run/node";
import { openai } from "~/services/openai.server";
import { z } from "zod";
import { systemPrompt } from "./storytime-prompt";
import { writeFile, appendFile } from "node:fs/promises";
import path from "node:path";

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
  "magical",
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
  locale: z.string().optional(),
});

export const action = async ({ request }: ActionFunctionArgs) => {
  console.log("🚀 Story generation request received");

  const apiKey = request.headers.get("x-api-key");
  const serverApiKey = process.env.API_KEY;

  if (!apiKey || apiKey !== serverApiKey) {
    console.error("❌ Invalid API key");
    return json({ error: "Invalid API key" }, { status: 403 });
  }

  try {
    const body = await request.json();
    console.log("📝 Request body:", body);

    const validatedData = StoryRequestSchema.parse(body);
    console.log("✅ Data validation passed:", validatedData);

    const userPrompt = generateUserPrompt(validatedData);
    console.log("userPrompt:", userPrompt);

    const stream = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      model: "gpt-3.5-turbo",
      stream: true,
    });

    console.log("🎯 OpenAI stream created");
    // const trainingFile = path.join(
    //   process.cwd(),
    //   "training-data",
    //   "stories.jsonl",
    // );

    let fullCompletion = "";

    const responseStream = new ReadableStream({
      async start(controller) {
        let totalChunks = 0;
        let fullStory = "";

        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              totalChunks++;
              fullCompletion += content;
              console.log(
                `📨 Chunk ${totalChunks}:`,
                content.slice(0, 50) + "...",
              );
              controller.enqueue(content);
            }
          }
          console.log(`✨ Stream complete. Total chunks: ${totalChunks}`);
          console.log("📖 Full story length:", fullCompletion.length);

          // Write JSONL entry after completion
          const trainingEntry = {
            prompt: `${systemPrompt}\n\n${userPrompt}`,
            completion: fullCompletion,
          };

          //   await appendFile(trainingFile, JSON.stringify(trainingEntry) + "\n");
          controller.close();
        } catch (error) {
          console.error("Error during streaming:", error);
          controller.error(error);
        }
      },
    });

    return new Response(responseStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("❌ Error in story generation:", error);

    if (error instanceof z.ZodError) {
      console.error("Validation errors:", error.errors);
      return json(
        {
          error: "Validation failed",
          details: error.errors,
        },
        { status: 400 },
      );
    }

    return json(
      {
        error: "Story generation failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
};

const generateUserPrompt = (data: z.infer<typeof StoryRequestSchema>) => {
  return `Create a ${data.tone} story about ${data.personName} (age range is ${data.personAge}) 
    themed around ${data.theme}.
    Additional characters: ${data.additionalCharacters
      .map((c) => `${c.name} (${c.relationship})`)
      .join(", ")}.
    ${data.specialDetails ? `Special details: ${data.specialDetails}` : ""}
    ${data.locale ? `Use ${data.locale} regional spelling and expressions.` : ""}`;
};
