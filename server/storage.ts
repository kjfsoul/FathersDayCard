import {
  users,
  father_cards,
  game_sessions,
  type User,
  type InsertUser,
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: { id: string; email: string }): Promise<User>;
  updateUserStats(id: string, updates: { cards_generated?: number; games_played?: number; total_score?: number }): Promise<void>;
  
  // Father card operations
  saveFatherCard(userId: string, dadName: string, dadInfo: any, cardContent: any): Promise<string>;
  getFatherCard(cardId: string): Promise<any>;
  getUserCards(userId: string): Promise<any[]>;
  
  // Game session operations
  saveGameSession(userId: string, gameType: string, score: number, duration?: number): Promise<string>;
  getUserGameStats(userId: string): Promise<{ totalScore: number; gamesPlayed: number; highScores: Record<string, number> }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: { id: string; email: string }): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        id: userData.id,
        email: userData.email,
        subscription_status: 'free',
        cards_generated: 0,
        games_played: 0,
        total_score: 0,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: userData.email,
        },
      })
      .returning();
    return user;
  }

  async updateUserStats(id: string, updates: { cards_generated?: number; games_played?: number; total_score?: number }): Promise<void> {
    await db.update(users).set(updates).where(eq(users.id, id));
  }

  // Father card operations
  async saveFatherCard(userId: string, dadName: string, dadInfo: any, cardContent: any): Promise<string> {
    const cardId = `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await db.insert(father_cards).values({
      id: cardId,
      user_id: userId,
      dad_name: dadName,
      dad_info: dadInfo,
      card_content: cardContent,
    });

    // Update user's card count
    const user = await this.getUser(userId);
    if (user) {
      await this.updateUserStats(userId, { cards_generated: (user.cards_generated || 0) + 1 });
    }

    return cardId;
  }

  async getFatherCard(cardId: string): Promise<any> {
    const [card] = await db.select().from(father_cards).where(eq(father_cards.id, cardId));
    if (card) {
      // Increment view count
      await db.update(father_cards)
        .set({ view_count: (card.view_count || 0) + 1 })
        .where(eq(father_cards.id, cardId));
    }
    return card;
  }

  async getUserCards(userId: string): Promise<any[]> {
    return await db.select().from(father_cards).where(eq(father_cards.user_id, userId));
  }

  // Game session operations
  async saveGameSession(userId: string, gameType: string, score: number, duration?: number): Promise<string> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await db.insert(game_sessions).values({
      id: sessionId,
      user_id: userId,
      game_type: gameType as any,
      score,
      duration_seconds: duration,
      completed: true,
    });

    // Update user's game stats
    const user = await this.getUser(userId);
    if (user) {
      await this.updateUserStats(userId, { 
        games_played: (user.games_played || 0) + 1,
        total_score: (user.total_score || 0) + score
      });
    }

    return sessionId;
  }

  async getUserGameStats(userId: string): Promise<{ totalScore: number; gamesPlayed: number; highScores: Record<string, number> }> {
    const sessions = await db.select().from(game_sessions).where(eq(game_sessions.user_id, userId));
    
    const totalScore = sessions.reduce((sum, session) => sum + (session.score || 0), 0);
    const gamesPlayed = sessions.length;
    
    const highScores: Record<string, number> = {};
    sessions.forEach(session => {
      const gameType = session.game_type;
      if (!highScores[gameType] || (session.score || 0) > highScores[gameType]) {
        highScores[gameType] = session.score || 0;
      }
    });

    return { totalScore, gamesPlayed, highScores };
  }
}

export const storage = new DatabaseStorage();
