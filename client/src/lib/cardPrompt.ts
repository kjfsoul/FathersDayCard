// client/src/lib/cardPrompt.ts

export interface DadQuestionnaireAnswers {
  dadName: string;
  senderName: string;
  positiveTrait: string; // e.g., "your incredible sense of humor"
  sharedMemory: string; // e.g., "that time we went fishing at Blue Lake"
  impactfulLesson: string; // e.g., "the importance of perseverance"
  specialHobby: string; // e.g., "your love for gardening"
  wishForDad: string; // e.g., "a day filled with relaxation and joy"
}

/**
 * Builds a prompt for an LLM to generate a fun, heartfelt Father's Day message.
 *
 * @param data The answers from the Dad questionnaire.
 * @returns A string prompt designed for LLMs like Gemini and GPT-4o.
 */
export function buildPrompt(data: DadQuestionnaireAnswers): string {
  // Ensure all data fields are populated, providing defaults if necessary,
  // or handle this in the calling component. For this helper, we assume valid inputs.

  const prompt = `
Compose a fun and heartfelt message for a Father's Day card, approximately 90 words long.
The message is for {{dadName}} from {{senderName}}.

Incorporate the following details seamlessly and naturally:
- Highlight {{dadName}}'s {{positiveTrait}}.
- Recall the cherished memory of {{sharedMemory}}.
- Mention the impactful lesson about {{impactfulLesson}}.
- Acknowledge his interest in {{specialHobby}}.
- Express the wish for him: "{{wishForDad}}".

The tone should be warm, personal, and celebratory. Avoid clichés if possible.
Make sure the message flows well and feels genuine. End with a loving sign-off from {{senderName}}.
`;

  // Replace placeholders with actual data
  let populatedPrompt = prompt;
  populatedPrompt = populatedPrompt.replace(/\{\{dadName\}\}/g, data.dadName);
  populatedPrompt = populatedPrompt.replace(/\{\{senderName\}\}/g, data.senderName);
  populatedPrompt = populatedPrompt.replace(/\{\{positiveTrait\}\}/g, data.positiveTrait);
  populatedPrompt = populatedPrompt.replace(/\{\{sharedMemory\}\}/g, data.sharedMemory);
  populatedPrompt = populatedPrompt.replace(/\{\{impactfulLesson\}\}/g, data.impactfulLesson);
  populatedPrompt = populatedPrompt.replace(/\{\{specialHobby\}\}/g, data.specialHobby);
  populatedPrompt = populatedPrompt.replace(/\{\{wishForDad\}\}/g, data.wishForDad);

  return populatedPrompt;
}

// Example Usage (for testing purposes):
/*
const exampleData: DadQuestionnaireAnswers = {
  dadName: "Tom",
  senderName: "Alex",
  positiveTrait: "unwavering kindness",
  sharedMemory: "our camping trip last summer, especially when we saw the shooting stars",
  impactfulLesson: "to always try my best and never give up",
  specialHobby: "playing the guitar",
  wishForDad: "a fantastic Father's Day filled with all your favorite things"
};

const generatedPrompt = buildPrompt(exampleData);
console.log("Generated Prompt:\n", generatedPrompt);

// Expected output (a portion of it):
// Compose a fun and heartfelt message for a Father's Day card, approximately 90 words long.
// The message is for Tom from Alex.
//
// Incorporate the following details seamlessly and naturally:
// - Highlight Tom's unwavering kindness.
// - Recall the cherished memory of our camping trip last summer, especially when we saw the shooting stars.
// ...and so on.
*/
