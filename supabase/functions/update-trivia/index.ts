import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Placeholder - replace with your actual Google Sheet CSV URL
const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTQ_MY_EXAMPLE_SHEET_ID/pub?gid=0&single=true&output=csv';

interface TriviaQuestion {
  id?: string; // If CSV provides an ID for upserting
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
  category: string;
  difficulty: string;
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    // 1. Fetch CSV data
    const response = await fetch(CSV_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.statusText}`);
    }
    const csvText = await response.text();

    // 2. Parse CSV data
    // Basic CSV parser
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV data must have a header and at least one data row.');
    }
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase()); // Normalize headers
    const questions: TriviaQuestion[] = [];

    // Determine indices of required and optional columns
    const idIndex = headers.indexOf('id');
    const questionIndex = headers.indexOf('question');
    const correctAnswerIndex = headers.indexOf('correct_answer');
    const incorrectAnswersIndex = headers.indexOf('incorrect_answers');
    const categoryIndex = headers.indexOf('category');
    const difficultyIndex = headers.indexOf('difficulty');

    if (questionIndex === -1 || correctAnswerIndex === -1 || incorrectAnswersIndex === -1) {
      throw new Error('CSV must contain question, correct_answer, and incorrect_answers columns.');
    }

    for (let i = 1; i < lines.length; i++) {
      // More robust CSV line splitting: handle quoted fields containing commas
      const values = lines[i].match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)?.map(v => v.replace(/^"|"$/g, '').trim()) || [];

      if (values.length !== headers.length) {
        console.warn(`Skipping malformed row ${i + 1}: expected ${headers.length} values, got ${values.length}. Line: ${lines[i]}`);
        continue;
      }

      const questionText = values[questionIndex];
      const correctAnswerText = values[correctAnswerIndex];
      const incorrectAnswersText = values[incorrectAnswersIndex];

      if (!questionText || !correctAnswerText || !incorrectAnswersText) {
        console.warn(`Skipping row ${i + 1} due to missing essential fields (question, correct_answer, incorrect_answers).`);
        continue;
      }

      questions.push({
        id: idIndex !== -1 && values[idIndex] ? values[idIndex] : undefined,
        question: questionText,
        correct_answer: correctAnswerText,
        incorrect_answers: incorrectAnswersText.split(';').map((s: string) => s.trim()),
        category: categoryIndex !== -1 && values[categoryIndex] ? values[categoryIndex] : 'general',
        difficulty: difficultyIndex !== -1 && values[difficultyIndex] ? values[difficultyIndex] : 'medium',
      });
    }

    if (questions.length === 0) {
      return new Response(JSON.stringify({ message: 'No valid questions processed from CSV.' }), {
        status: 200, // Or 400 if this is considered an error client-side
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 3. Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.');
    }
    const supabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey);

    // 4. Upsert data
    // Upsert based on 'id' if provided, otherwise, it might insert duplicates if 'id' is missing and no other unique constraint matches.
    // If 'id' is consistently provided and unique, onConflict: 'id' is correct.
    // If 'id' can be null/undefined and you want to avoid duplicates based on question text,
    // you'd need a unique constraint on 'question' in your DB and use onConflict: 'question'.
    // For this implementation, we stick to 'id' as the primary conflict resolution key.
    const { data, error, count } = await supabaseClient
      .from('trivia_questions')
      .upsert(questions, { onConflict: 'id', ignoreDuplicates: false });

    if (error) {
      console.error('Supabase upsert error:', error);
      throw new Error(`Supabase error: ${error.message}`);
    }

    return new Response(JSON.stringify({ message: 'Trivia questions updated successfully!', upsertedCount: count ?? questions.length }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Function error:', err);
    // More detailed error logging to Supabase logs if possible
    return new Response(JSON.stringify({ error: err.message, details: err.stack }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
})
