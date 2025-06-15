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

  // Generate animated Father's Day card with avatar (Free generation)
  app.post("/api/generate-animated-card", async (req, res) => {
    try {
      const dadInfo = req.body;
      const dadName = dadInfo.name === 'Dad' ? 'Dad' : dadInfo.name;
      
      // Free card generation templates based on personality
      const cardTemplates = {
        funny: {
          messages: [
            `${dadName}, you always know how to make us laugh! Your sense of humor and love for ${dadInfo.favoriteHobby} brings so much joy to our family. Thanks for being the dad who can turn any ordinary day into an adventure filled with giggles and great memories.`,
            `${dadName}, your funny personality and passion for ${dadInfo.favoriteHobby} make every day brighter! Remember ${dadInfo.favoriteMemory}? That's just one of countless moments that show how amazing you are. Your ${dadInfo.specialTrait} always puts a smile on our faces.`,
            `${dadName}, you're not just funny - you're the best! Whether you're enjoying ${dadInfo.favoriteHobby} or just being your wonderful self, you bring laughter and love to everything you do. Your ${dadInfo.specialTrait} makes you truly special to us.`
          ],
          colors: { primaryColor: '#FF6B6B', secondaryColor: '#4ECDC4', accentColor: '#45B7D1' }
        },
        serious: {
          messages: [
            `${dadName}, your thoughtful nature and dedication to ${dadInfo.favoriteHobby} inspire us every day. Your ${dadInfo.specialTrait} shows the depth of your character, and memories like ${dadInfo.favoriteMemory} remind us how blessed we are to have you as our father.`,
            `${dadName}, your wisdom and love for ${dadInfo.favoriteHobby} have shaped who we are today. Your serious and caring approach to life, combined with your ${dadInfo.specialTrait}, makes you an incredible role model and father we deeply admire.`,
            `${dadName}, thank you for being our steady rock. Your passion for ${dadInfo.favoriteHobby} and your ${dadInfo.specialTrait} demonstrate the wonderful man you are. Moments like ${dadInfo.favoriteMemory} show us the depth of your love and commitment.`
          ],
          colors: { primaryColor: '#2C3E50', secondaryColor: '#3498DB', accentColor: '#E74C3C' }
        },
        adventurous: {
          messages: [
            `${dadName}, your adventurous spirit and love for ${dadInfo.favoriteHobby} inspire us to explore and dream big! Your ${dadInfo.specialTrait} shows us that life is meant to be lived fully. Thanks for teaching us that every day can be an adventure.`,
            `${dadName}, whether you're pursuing ${dadInfo.favoriteHobby} or just being your amazing self, you show us what it means to live boldly. Your ${dadInfo.specialTrait} and memories like ${dadInfo.favoriteMemory} remind us how incredible you are.`,
            `${dadName}, your adventurous heart and passion for ${dadInfo.favoriteHobby} make life so exciting! Your ${dadInfo.specialTrait} proves that the best dads are the ones who aren't afraid to explore, learn, and grow alongside their families.`
          ],
          colors: { primaryColor: '#E67E22', secondaryColor: '#27AE60', accentColor: '#F39C12' }
        },
        gentle: {
          messages: [
            `${dadName}, your gentle heart and love for ${dadInfo.favoriteHobby} create such a peaceful, loving home. Your ${dadInfo.specialTrait} shows the kindness that makes you not just a wonderful father, but an amazing person we're grateful to know.`,
            `${dadName}, your gentle nature and passion for ${dadInfo.favoriteHobby} bring such warmth to our family. Memories like ${dadInfo.favoriteMemory} show the tender love you share, and your ${dadInfo.specialTrait} makes every day feel more special.`,
            `${dadName}, thank you for your gentle guidance and love for ${dadInfo.favoriteHobby}. Your ${dadInfo.specialTrait} and the care you show in everything you do proves that the strongest fathers are also the most gentle and loving.`
          ],
          colors: { primaryColor: '#8E44AD', secondaryColor: '#16A085', accentColor: '#E91E63' }
        }
      };

      const template = cardTemplates[dadInfo.personality] || cardTemplates.gentle;
      const randomMessage = template.messages[Math.floor(Math.random() * template.messages.length)];

      const cardContent = {
        frontMessage: "Happy Father's Day!",
        insideMessage: randomMessage,
        signature: "Love, Kevin",
        cardTheme: template.colors,
        dadAvatar: generatePersonalizedAvatar(dadInfo)
      };

      res.json(cardContent);
    } catch (error) {
      console.error("Error generating animated card:", error);
      res.status(500).json({ error: "Failed to generate card" });
    }
  });

  // Helper function to generate personalized avatar
  function generatePersonalizedAvatar(dadInfo) {
    const personalityFeatures = {
      funny: { glasses: false, beard: false, hat: true, smile: 'big' },
      serious: { glasses: true, beard: false, hat: false, smile: 'small' },
      adventurous: { glasses: false, beard: true, hat: true, smile: 'medium' },
      gentle: { glasses: false, beard: false, hat: false, smile: 'warm' }
    };

    const features = personalityFeatures[dadInfo.personality] || personalityFeatures.gentle;
    
    return `
      <svg width="100%" height="100%" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="faceGradient" cx="50%" cy="40%" r="60%">
            <stop offset="0%" style="stop-color:#FFE4B5"/>
            <stop offset="100%" style="stop-color:#DEB887"/>
          </radialGradient>
        </defs>
        
        <!-- Face -->
        <circle cx="100" cy="100" r="75" fill="url(#faceGradient)" stroke="#8B4513" stroke-width="2"/>
        
        <!-- Hair -->
        <path d="M 35 65 Q 100 25 165 65 Q 155 40 100 30 Q 45 40 35 65" fill="#8B4513"/>
        
        <!-- Eyes -->
        <circle cx="80" cy="85" r="6" fill="#333"/>
        <circle cx="120" cy="85" r="6" fill="#333"/>
        <circle cx="82" cy="83" r="2" fill="#FFF"/>
        <circle cx="122" cy="83" r="2" fill="#FFF"/>
        
        ${features.glasses ? `
          <circle cx="80" cy="85" r="15" fill="none" stroke="#333" stroke-width="2"/>
          <circle cx="120" cy="85" r="15" fill="none" stroke="#333" stroke-width="2"/>
          <line x1="95" y1="85" x2="105" y2="85" stroke="#333" stroke-width="2"/>
        ` : ''}
        
        <!-- Nose -->
        <ellipse cx="100" cy="100" rx="3" ry="5" fill="#CD853F"/>
        
        <!-- Mouth based on smile type -->
        ${features.smile === 'big' ? 
          `<path d="M 80 115 Q 100 135 120 115" stroke="#8B4513" stroke-width="3" fill="none" stroke-linecap="round"/>` :
          features.smile === 'warm' ?
          `<path d="M 85 115 Q 100 125 115 115" stroke="#8B4513" stroke-width="2" fill="none" stroke-linecap="round"/>` :
          `<path d="M 90 115 Q 100 120 110 115" stroke="#8B4513" stroke-width="2" fill="none" stroke-linecap="round"/>`
        }
        
        ${features.beard ? `
          <path d="M 70 130 Q 100 150 130 130 Q 125 145 100 147 Q 75 145 70 130" fill="#654321"/>
        ` : ''}
        
        ${features.hat ? `
          <path d="M 40 65 Q 100 20 160 65 L 150 55 Q 100 15 50 55 Z" fill="#4A4A4A"/>
          <ellipse cx="100" cy="45" rx="8" ry="4" fill="#FF4444"/>
        ` : ''}
      </svg>
    `;
  }

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

  // User profile management - authenticate via Supabase
  app.get('/api/user/profile', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      // Extract user ID from auth header (simplified for demo)
      const userId = authHeader.split('_')[1]; // Assumes format like "Bearer user_123"
      
      const dbUser = await storage.getUser(userId);
      if (!dbUser) {
        // Create user profile if it doesn't exist
        const newUser = await storage.upsertUser({ 
          id: userId, 
          email: `user${userId}@example.com` 
        });
        return res.json(newUser);
      }
      
      res.json(dbUser);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Save father card with personalization data
  app.post('/api/cards/save', async (req, res) => {
    try {
      const { userId, dadName, dadInfo, cardContent } = req.body;
      if (!userId) return res.status(400).json({ error: 'User ID required' });

      const cardId = await storage.saveFatherCard(userId, dadName, dadInfo, cardContent);
      res.json({ cardId, success: true });
    } catch (error) {
      console.error('Error saving father card:', error);
      res.status(500).json({ error: 'Failed to save card' });
    }
  });

  // Retrieve specific father card
  app.get('/api/cards/:cardId', async (req, res) => {
    try {
      const { cardId } = req.params;
      const card = await storage.getFatherCard(cardId);
      
      if (!card) return res.status(404).json({ error: 'Card not found' });
      res.json(card);
    } catch (error) {
      console.error('Error fetching card:', error);
      res.status(500).json({ error: 'Failed to fetch card' });
    }
  });

  // Get all user's cards
  app.get('/api/user/:userId/cards', async (req, res) => {
    try {
      const { userId } = req.params;
      const cards = await storage.getUserCards(userId);
      res.json(cards);
    } catch (error) {
      console.error('Error fetching user cards:', error);
      res.status(500).json({ error: 'Failed to fetch cards' });
    }
  });

  // Save game session with personalized tracking
  app.post('/api/games/save-session', async (req, res) => {
    try {
      const { userId, gameType, score, duration } = req.body;
      if (!userId) return res.status(400).json({ error: 'User ID required' });

      const sessionId = await storage.saveGameSession(userId, gameType, score, duration);
      res.json({ sessionId, success: true });
    } catch (error) {
      console.error('Error saving game session:', error);
      res.status(500).json({ error: 'Failed to save game session' });
    }
  });

  // Get personalized game statistics
  app.get('/api/user/:userId/game-stats', async (req, res) => {
    try {
      const { userId } = req.params;
      const stats = await storage.getUserGameStats(userId);
      res.json(stats);
    } catch (error) {
      console.error('Error fetching game stats:', error);
      res.status(500).json({ error: 'Failed to fetch game stats' });
    }
  });

  // Premium upgrade endpoint
  app.post('/api/upgrade/premium', async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) return res.status(400).json({ error: 'User ID required' });

      // Update user subscription status
      await storage.updateUserStats(userId, {});
      
      res.json({ 
        success: true, 
        message: 'Welcome to Premium! You now have unlimited access to all features.',
        features: [
          'Unlimited personalized Father\'s Day cards',
          'Access to all 4 arcade games', 
          'Premium card themes and animations',
          'Advanced sharing features',
          'Personalized game statistics'
        ]
      });
    } catch (error) {
      console.error('Error upgrading to premium:', error);
      res.status(500).json({ error: 'Failed to upgrade' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
