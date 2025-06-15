import type { Express } from "express";
import { createServer, type Server } from "http";
import OpenAI from "openai";
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

  // One-time purchase checkout
  app.post('/api/create-checkout-session', async (req, res) => {
    try {
      const { userId } = req.body;
      
      if (!process.env.STRIPE_SECRET_KEY) {
        return res.status(500).json({ error: 'Stripe not configured' });
      }

      const Stripe = (await import('stripe')).default;
      const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!);

      const session = await stripeClient.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Father\'s Day Arcade - Premium Access',
                description: 'Unlimited personalized cards and games',
              },
              unit_amount: 999, // $9.99
            },
            quantity: 1,
          },
        ],
        success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/`,
        metadata: {
          userId,
        },
      });

      res.json({ url: session.url });
    } catch (error) {
      console.error('Error creating checkout session:', error);
      res.status(500).json({ error: 'Failed to create checkout session' });
    }
  });

  // Get trivia question
  app.get('/api/trivia/:category?', async (req, res) => {
    try {
      const category = req.params.category || 'general';
      // This would connect to Supabase to get trivia questions
      // For now, return a sample question
      const sampleQuestion = {
        id: '1',
        category,
        question: 'What is traditionally considered the best gift for Father\'s Day?',
        correct_answer: 'Time spent together',
        incorrect_answers: ['Expensive watch', 'New car', 'Golf clubs'],
        difficulty: 'easy'
      };
      
      res.json(sampleQuestion);
    } catch (error) {
      console.error('Error fetching trivia:', error);
      res.status(500).json({ error: 'Failed to fetch trivia' });
    }
  });

  // Save game session
  app.post('/api/game-session', async (req, res) => {
    try {
      const { gameType, score, duration, completed } = req.body;
      // This would save to Supabase
      res.json({ success: true });
    } catch (error) {
      console.error('Error saving game session:', error);
      res.status(500).json({ error: 'Failed to save game session' });
    }
  });

  // Generate animated Father's Day card with avatar
  app.post("/api/generate-animated-card", async (req, res) => {
    try {
      const dadInfo = req.body;
      
      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: "OpenAI API key not configured" });
      }

      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const prompt = `Create a personalized Father's Day card for ${dadInfo.name} based on these details:
      - Personality: ${dadInfo.personality}
      - Favorite hobby: ${dadInfo.favoriteHobby}
      - Special trait: ${dadInfo.specialTrait}
      - Favorite memory: ${dadInfo.favoriteMemory}
      
      Generate a heartfelt, personal message that incorporates these details. Make it warm, specific, and meaningful.
      
      Return JSON with:
      - frontMessage: Short front cover message
      - insideMessage: Longer personal message inside
      - dadAvatar: SVG string for a cartoon avatar matching his personality and hobbies
      - cardTheme: object with primaryColor, secondaryColor, accentColor, pattern
      
      Make the avatar cartoon-style and fun, incorporating visual elements that match his personality and hobbies.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const cardContent = JSON.parse(response.choices[0].message.content || "{}");
      res.json(cardContent);
    } catch (error) {
      console.error("Error generating animated card:", error);
      res.status(500).json({ error: "Failed to generate card" });
    }
  });

  // Generate thank you card
  app.post("/api/generate-thank-you-card", async (req, res) => {
    try {
      const cardData = req.body;
      
      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: "OpenAI API key not configured" });
      }

      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const prompt = `Create a heartfelt thank you card from a child to their father based on:
      - Dad's name: ${cardData.dadName}
      - Card style: ${cardData.cardStyle}
      - Personal message: ${cardData.personalMessage}
      - Favorite memory: ${cardData.favoriteMemory}
      - Child's name: ${cardData.signatureName}
      
      Generate a warm, grateful message that feels authentic and personal.
      
      Return JSON with:
      - title: Thank you card title
      - message: Heartfelt thank you message
      - dadAvatar: Simple SVG for thank you theme
      - colors: object with primaryColor, secondaryColor, accentColor matching the ${cardData.cardStyle} style`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const cardContent = JSON.parse(response.choices[0].message.content || "{}");
      res.json(cardContent);
    } catch (error) {
      console.error("Error generating thank you card:", error);
      res.status(500).json({ error: "Failed to generate thank you card" });
    }
  });

  // Generate custom arcade intro
  app.post("/api/generate-arcade-intro", async (req, res) => {
    try {
      const introData = req.body;
      
      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: "OpenAI API key not configured" });
      }

      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const prompt = `Create a custom arcade intro based on:
      - Style: ${introData.introStyle}
      - Welcome message: ${introData.welcomeMessage}
      - Dad's nickname: ${introData.dadNickname}
      - Favorite color: ${introData.favoriteColor}
      - Music preference: ${introData.backgroundMusic}
      
      Generate personalized arcade intro elements.
      
      Return JSON with:
      - customWelcome: Enhanced welcome message
      - introAnimation: CSS animation class names
      - colorScheme: Personalized color palette
      - musicTheme: Background music selection`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const customIntro = JSON.parse(response.choices[0].message.content || "{}");
      res.json(customIntro);
    } catch (error) {
      console.error("Error generating arcade intro:", error);
      res.status(500).json({ error: "Failed to generate arcade intro" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
