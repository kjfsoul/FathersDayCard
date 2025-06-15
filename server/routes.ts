import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Generate personalized Father's Day card
  app.post('/api/generate-card', async (req, res) => {
    try {
      const dadInfo = req.body;
      
      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: 'OpenAI API key not configured' });
      }

      const OpenAI = (await import('openai')).default;
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const prompt = `Create a personalized Father's Day card message based on this information about dad:
- Name: ${dadInfo.name}
- Favorite hobby: ${dadInfo.favoriteHobby}
- Personality: ${dadInfo.personality}
- Favorite memory: ${dadInfo.favoriteMemory}
- Special trait: ${dadInfo.specialTrait}

Create a heartfelt, personal message that incorporates these details. The tone should match the personality type. Keep it warm, genuine, and about 3-4 sentences. Also suggest an appropriate emoji for the card theme.

Respond with JSON in this format:
{
  "title": "Happy Father's Day, [Name]!",
  "message": "Personal heartfelt message here...",
  "animation": "😊",
  "colors": {
    "primary": "#FF6B35",
    "secondary": "#F7931E", 
    "accent": "#FFD23F"
  }
}`;

      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that creates personalized Father's Day card messages. Always respond with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 500
      });

      const messageContent = response.choices[0].message.content;
      if (!messageContent) {
        throw new Error('No content received from OpenAI');
      }
      const cardContent = JSON.parse(messageContent);
      res.json(cardContent);
    } catch (error) {
      console.error('Error generating card:', error);
      res.status(500).json({ error: 'Failed to generate card' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
