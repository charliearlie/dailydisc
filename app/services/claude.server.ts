import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

export async function generateAlbumDescription(
  albumTitle: string,
  artistName: string,
): Promise<string> {
  try {
    const systemPrompt =
      "You are an expert music critic with extensive knowledge of albums and artists across various genres.";
    const humanPrompt = `Generate a brief, engaging description for the album "${albumTitle}" by ${artistName}. Include information about the album's style, notable tracks, and its significance in the artist's discography or music history. Keep it concise, around 2-3 sentences. Only include the description, this should not read as it is generated from an LLM like yourself`;

    const response = await anthropic.completions.create({
      model: "claude-v1",
      prompt: `${systemPrompt}\n\nHuman: ${humanPrompt}\n\nAssistant:`,
      max_tokens_to_sample: 150,
      temperature: 0.7,
    });

    return response.completion.trim() || "Description not available.";
  } catch (error) {
    console.error("Error generating album description:", error);
    return "Description not available.";
  }
}
