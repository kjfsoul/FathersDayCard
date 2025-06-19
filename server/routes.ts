import type { Express } from "express";
import { createServer, type Server } from "http";
import OpenAI from "openai";
import { supabase } from "../client/src/lib/supabase"; // Corrected path

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

Craft a message that is **primarily witty and humorous**, especially if the personality is 'funny'. Even for other personalities (serious, adventurous, gentle), try to **inject subtle, light-hearted humor** where appropriate, while still being heartfelt and personal. The message should cleverly incorporate the provided details about dad. Aim for 3-5 sentences.
Also suggest an appropriate emoji that reflects the card's theme and humor.

The message must be suitable for a Father's Day card.

Respond with JSON in this format:
{
  "title": "Happy Father's Day, ${dadInfo.name}!",
  "message": "Witty, humorous, and personalized message here...",
  "animation": "😂", // Example emoji, the AI should pick a suitable one
  "colors": { // AI can suggest thematic colors or use these defaults
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
            `Dad, you're the king of dad jokes and the master of making us laugh! Your love for ${dadInfo.favoriteHobby} shows your fun side, and your ${dadInfo.specialTrait} makes every day brighter. Thanks for all the amazing memories, especially ${dadInfo.favoriteMemory}.`,
            `${dadName}, your humor lights up our family! Whether you're enjoying ${dadInfo.favoriteHobby} or just being yourself, you make everything better. Your ${dadInfo.specialTrait} is one of the many things we love about you.`,
            `Dear ${dadName}, you have this incredible gift of making us smile no matter what. Your passion for ${dadInfo.favoriteHobby} and your ${dadInfo.specialTrait} remind us how lucky we are to have such an amazing father.`
          ],
          colors: { primaryColor: '#FF6B6B', secondaryColor: '#4ECDC4', accentColor: '#45B7D1' }
        },
        serious: {
          messages: [
            `${dadName}, your wisdom and strength guide our family every day. Your dedication to ${dadInfo.favoriteHobby} shows your thoughtful nature, and your ${dadInfo.specialTrait} makes us proud to be your children. Thank you for being our rock.`,
            `Dad, you've taught us the value of hard work and integrity. Your love for ${dadInfo.favoriteHobby} and your ${dadInfo.specialTrait} inspire us to be better people. Memories like ${dadInfo.favoriteMemory} show us your caring heart.`,
            `Dear ${dadName}, your steady presence and thoughtful guidance mean everything to us. Whether you're pursuing ${dadInfo.favoriteHobby} or just being the amazing father you are, we admire your ${dadInfo.specialTrait}.`
          ],
          colors: { primaryColor: '#2C3E50', secondaryColor: '#3498DB', accentColor: '#E74C3C' }
        },
        adventurous: {
          messages: [
            `${dadName}, you've shown us that life is meant to be lived to the fullest! Your adventurous spirit and love for ${dadInfo.favoriteHobby} inspire us to chase our dreams. Your ${dadInfo.specialTrait} makes every adventure more exciting.`,
            `Dad, you're proof that growing up doesn't mean giving up on fun! Your passion for ${dadInfo.favoriteHobby} and your ${dadInfo.specialTrait} teach us to embrace life's adventures. Thanks for memories like ${dadInfo.favoriteMemory}.`,
            `Dear ${dadName}, you've taught us to be brave and curious about the world. Your love for ${dadInfo.favoriteHobby} and your ${dadInfo.specialTrait} show us what it means to live boldly and love deeply.`
          ],
          colors: { primaryColor: '#E67E22', secondaryColor: '#27AE60', accentColor: '#F39C12' }
        },
        gentle: {
          messages: [
            `${dadName}, your gentle heart and kind soul make our home a place of love and warmth. Your passion for ${dadInfo.favoriteHobby} and your ${dadInfo.specialTrait} show us the beauty of a caring father. We treasure you.`,
            `Dad, your gentle strength and loving nature have shaped who we are today. Whether you're enjoying ${dadInfo.favoriteHobby} or just being present for us, your ${dadInfo.specialTrait} makes us feel so loved.`,
            `Dear ${dadName}, you've shown us that true strength comes from kindness. Your love for ${dadInfo.favoriteHobby} and your ${dadInfo.specialTrait} remind us daily how blessed we are to have you as our father.`
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
      <svg width="180" height="180" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="display: block; margin: 0 auto;">
        <defs>
          <radialGradient id="faceGradient" cx="50%" cy="40%" r="60%">
            <stop offset="0%" style="stop-color:#FFE4B5"/>
            <stop offset="100%" style="stop-color:#DEB887"/>
          </radialGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <dropShadow dx="2" dy="2" stdDeviation="3" flood-color="#00000040"/>
          </filter>
        </defs>
        
        <!-- Background circle -->
        <circle cx="100" cy="100" r="85" fill="#f0f0f0" stroke="#ddd" stroke-width="2"/>
        
        <!-- Face -->
        <circle cx="100" cy="100" r="70" fill="url(#faceGradient)" stroke="#8B4513" stroke-width="2" filter="url(#shadow)"/>
        
        <!-- Hair -->
        <path d="M 40 70 Q 100 30 160 70 Q 150 45 100 35 Q 50 45 40 70" fill="#654321"/>
        
        <!-- Eyes -->
        <circle cx="80" cy="88" r="5" fill="#333"/>
        <circle cx="120" cy="88" r="5" fill="#333"/>
        <circle cx="82" cy="86" r="2" fill="#FFF"/>
        <circle cx="122" cy="86" r="2" fill="#FFF"/>
        
        ${features.glasses ? `
          <circle cx="80" cy="88" r="12" fill="none" stroke="#333" stroke-width="2"/>
          <circle cx="120" cy="88" r="12" fill="none" stroke="#333" stroke-width="2"/>
          <line x1="92" y1="88" x2="108" y2="88" stroke="#333" stroke-width="2"/>
        ` : ''}
        
        <!-- Eyebrows -->
        <path d="M 70 78 Q 80 75 90 78" stroke="#654321" stroke-width="2" fill="none"/>
        <path d="M 110 78 Q 120 75 130 78" stroke="#654321" stroke-width="2" fill="none"/>
        
        <!-- Nose -->
        <ellipse cx="100" cy="102" rx="3" ry="6" fill="#CD853F"/>
        
        <!-- Mouth based on smile type -->
        ${features.smile === 'big' ? 
          `<path d="M 80 118 Q 100 138 120 118" stroke="#8B4513" stroke-width="3" fill="none" stroke-linecap="round"/>` :
          features.smile === 'warm' ?
          `<path d="M 85 118 Q 100 128 115 118" stroke="#8B4513" stroke-width="2" fill="none" stroke-linecap="round"/>` :
          `<path d="M 90 118 Q 100 123 110 118" stroke="#8B4513" stroke-width="2" fill="none" stroke-linecap="round"/>`
        }
        
        ${features.beard ? `
          <path d="M 75 130 Q 100 150 125 130 Q 120 145 100 147 Q 80 145 75 130" fill="#654321"/>
        ` : ''}
        
        ${features.hat ? `
          <path d="M 45 70 Q 100 25 155 70 L 145 60 Q 100 20 55 60 Z" fill="#2c3e50"/>
          <ellipse cx="100" cy="50" rx="6" ry="3" fill="#e74c3c"/>
        ` : ''}
        
        <!-- Shirt collar -->
        <path d="M 70 170 Q 100 175 130 170 L 130 200 L 70 200 Z" fill="#4a90e2"/>
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
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: Missing or invalid Authorization header' });
      }
      const jwt = authHeader.replace('Bearer ', '');

      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(jwt);

      if (authError || !authUser) {
        console.error('Auth error:', authError?.message);
        return res.status(401).json({ error: 'Unauthorized: Invalid token or authentication error' });
      }

      // Attempt to fetch user profile from a 'profiles' table
      // This assumes you have a 'profiles' table linked to auth.users via id
      let { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') { // PGRST116: "Searched for a single row, but found no rows" (i.e., profile doesn't exist)
        console.error('Error fetching profile:', profileError.message);
        // Do not expose detailed database errors to the client
        return res.status(500).json({ error: 'Internal server error while fetching profile' });
      }

      if (!profile) {
        // Profile doesn't exist, create it
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: authUser.id,
            email: authUser.email,
            // Add any other default fields for a new profile, e.g.,
            // subscription_status: 'free',
            // cards_generated: 0,
            // games_played: 0,
            // total_score: 0,
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating profile:', insertError.message);
          return res.status(500).json({ error: 'Internal server error while creating profile' });
        }
        profile = newProfile;
      }
      
      // Combine auth user info with profile info if needed, or just return profile
      // For now, returning the profile which should contain relevant fields
      res.json(profile);

    } catch (error: any) {
      console.error('Error in /api/user/profile:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Save father card with personalization data
  app.post('/api/cards/save', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const jwt = authHeader.replace('Bearer ', '');
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(jwt);

      if (authError || !authUser) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { dadName, dadInfo, cardContent } = req.body;
      if (!dadName || !dadInfo || !cardContent) {
        return res.status(400).json({ error: 'Missing required card data' });
      }

      const cardId = `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const { error: insertError } = await supabase.from('father_cards').insert({
        id: cardId,
        user_id: authUser.id,
        dad_name: dadName,
        dad_info: dadInfo,
        card_content: cardContent,
        // created_at will default to now() if table is set up that way
        // view_count will default to 0 if table is set up that way
      });

      if (insertError) {
        console.error('Error saving card:', insertError.message);
        return res.status(500).json({ error: 'Failed to save card' });
      }

      // Optionally, update user's cards_generated count in 'profiles' table
      // This requires 'profiles' table to have 'cards_generated' column
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('cards_generated')
        .eq('id', authUser.id)
        .single();

      if (profile && !profileError) {
        await supabase
          .from('profiles')
          .update({ cards_generated: (profile.cards_generated || 0) + 1 })
          .eq('id', authUser.id);
      } // else, log profileError or handle missing profile if critical

      res.json({ cardId, success: true });
    } catch (error: any) {
      console.error('Error in /api/cards/save:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Retrieve specific father card
  app.get('/api/cards/:cardId', async (req, res) => {
    try {
      const { cardId } = req.params;
      if (!cardId) {
        return res.status(400).json({ error: 'Card ID required' });
      }

      const { data: card, error } = await supabase
        .from('father_cards')
        .select('*')
        .eq('id', cardId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116: no rows found
        console.error('Error fetching card:', error.message);
        return res.status(500).json({ error: 'Failed to fetch card' });
      }

      if (!card) {
        return res.status(404).json({ error: 'Card not found' });
      }

      // Increment view_count (non-atomically for simplicity here)
      // For atomic increment, an RPC function in Supabase DB is better.
      await supabase
        .from('father_cards')
        .update({ view_count: (card.view_count || 0) + 1 })
        .eq('id', cardId);
      
      // Return the card with potentially stale view_count or re-fetch,
      // for simplicity, return the card fetched initially.
      // To return updated view_count, add `card.view_count = (card.view_count || 0) + 1;`
      res.json(card);
    } catch (error: any) {
      console.error('Error in /api/cards/:cardId:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get all user's cards (for the authenticated user)
  app.get('/api/user/cards', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const jwt = authHeader.replace('Bearer ', '');
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(jwt);

      if (authError || !authUser) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { data: cards, error } = await supabase
        .from('father_cards')
        .select('*')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user cards:', error.message);
        return res.status(500).json({ error: 'Failed to fetch user cards' });
      }

      res.json(cards || []);
    } catch (error: any) {
      console.error('Error in /api/user/cards:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Save game session with personalized tracking
  app.post('/api/games/save-session', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const jwt = authHeader.replace('Bearer ', '');
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(jwt);

      if (authError || !authUser) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { gameType, score, duration } = req.body; // 'completed' field can be added if needed
      if (!gameType || typeof score !== 'number') {
        return res.status(400).json({ error: 'Missing required game session data (gameType, score)' });
      }

      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const { error: insertError } = await supabase.from('game_sessions').insert({
        id: sessionId,
        user_id: authUser.id,
        game_type: gameType,
        score: score,
        duration_seconds: duration,
        // completed: completed // if you add 'completed' to req.body
      });

      if (insertError) {
        console.error('Error saving game session:', insertError.message);
        return res.status(500).json({ error: 'Failed to save game session' });
      }

      // Update user's game stats in 'profiles' table
      // Assumes 'profiles' table has 'games_played' and 'total_score' columns
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('games_played, total_score')
        .eq('id', authUser.id)
        .single();

      if (profile && !profileError) {
        await supabase
          .from('profiles')
          .update({
            games_played: (profile.games_played || 0) + 1,
            total_score: (profile.total_score || 0) + score
          })
          .eq('id', authUser.id);
      } // else, log profileError or handle if critical

      res.json({ sessionId, success: true });
    } catch (error: any) {
      console.error('Error in /api/games/save-session:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get personalized game statistics for the authenticated user
  app.get('/api/user/game-stats', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const jwt = authHeader.replace('Bearer ', '');
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(jwt);

      if (authError || !authUser) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { data: sessions, error: sessionsError } = await supabase
        .from('game_sessions')
        .select('game_type, score')
        .eq('user_id', authUser.id);

      if (sessionsError) {
        console.error('Error fetching game sessions for stats:', sessionsError.message);
        return res.status(500).json({ error: 'Failed to fetch game stats' });
      }

      const totalScore = sessions.reduce((sum, session) => sum + (session.score || 0), 0);
      const gamesPlayed = sessions.length;

      const highScores: Record<string, number> = {};
      sessions.forEach(session => {
        const gameType = session.game_type;
        if (gameType && (session.score || 0) > (highScores[gameType] || 0)) {
          highScores[gameType] = session.score || 0;
        }
      });

      res.json({ totalScore, gamesPlayed, highScores });
    } catch (error: any) {
      console.error('Error in /api/user/game-stats:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Premium upgrade endpoint
  app.post('/api/upgrade/premium', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const jwt = authHeader.replace('Bearer ', '');
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(jwt);

      if (authError || !authUser) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Update user's premium status in 'profiles' table
      // Using a boolean field 'is_premium'
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ is_premium: true }) // Assuming 'is_premium' is a boolean field
        .eq('id', authUser.id);

      if (updateError) {
        console.error('Error upgrading to premium:', updateError.message);
        return res.status(500).json({ error: 'Failed to upgrade to premium' });
      }
      
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
    } catch (error: any) {
      console.error('Error in /api/upgrade/premium:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
