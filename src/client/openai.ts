import OpenAI from "openai";

export async function generateCatPicture(apiKey: string) {
  const client = new OpenAI({
    apiKey,
  });
  const response = await client.images.generate({
    model: "dall-e-3",
    prompt:
      "A sappy and wholesome picture of a cartoon cat hard at work at an office. The picture should include motivational and inspiring text to give energy to power through a work day.",
    n: 1,
    quality: "standard",
    size: "1024x1024",
  });

  const picture = response.data[0];
  if (!picture.url || !picture.revised_prompt) {
    throw new Error(
      "DALL-E API response does not contain picture URL or prompt"
    );
  }

  return {
    url: picture.url,
    prompt: picture.revised_prompt,
  };
}
