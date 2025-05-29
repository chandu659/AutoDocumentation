import { NextRequest, NextResponse } from 'next/server';
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '100mb',
    },
    responseLimit: '100mb',
  },
};
import { Groq } from 'groq-sdk';

export async function POST(request: NextRequest) {
  try {
    const { text, operation, prompt } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    if (!operation) {
      return NextResponse.json(
        { error: 'Operation type is required' },
        { status: 400 }
      );
    }

    // Initialize the Groq client with the summary API key
    const groq = new Groq({
      apiKey: process.env.NEXT_PUBLIC_LLAMA_3_1_8B_KEY,
    });

    // Construct the prompt based on the operation
    let systemPrompt = '';
    let userPrompt = '';

    switch (operation) {
      case 'summarize':
        systemPrompt = 'You are a helpful assistant that summarizes text concisely while preserving key information.';
        userPrompt = `Please summarize the following text:\n\n${text}`;
        break;
      case 'guides':
        systemPrompt = 'You are a helpful assistant that creates clear step-by-step guides at a 6th-grade reading level.';
        userPrompt = `Task: Improve and finalize a step-by-step guide for Urban Eats Kitchen & Merchant Members based on the attached draft.
Audience: Kitchen & Merchant Members who need clear, simple instructions to take action.
Goal: Ensure they understand what to do, how to do it, frequency of when to do it (daily, weekly, monthly), who is to do it (Individual member, UE Maintenance Crew, Outside Contractor) and when to expect confirmation in the easiest way possible.

Refinement Guidelines:
- 6th-grade reading level → Simple, direct, no jargon.
- Easy to scan → Use bold headers, numbered steps, bullet points, and tables if helpful.
- Logical flow:
    Title - Action-based, clear purpose.
    Who This is For - One-line audience description.
    What Can Be Done - Quick bullet list.
    Step-by-Step Instructions - Numbered, easy-to-follow.
    How to Track or Confirm - What happens next.
    Quick Reference Table (with Frequency, Responsible Party, and Task Fields: in that order) - If applicable.
    Need Help? - Contact details.
    Remove fluff while keeping all necessary details.
    Clarify confirmation steps (e.g., "Check Teams for updates within 48 hours").
    Keep it friendly, but direct - Short sentences, no extra words.

Also include the following core message naturally within the guide or instructions:
"One of the biggest benefits of being part of Urban Eats is getting to practice and learn in a safe environment—so when you run your own business, you'll already know how to handle these situations on your own."
Use this to highlight that Urban Eats is not just a workspace—it's a learning lab. Show how the member is expected to try first, learn from the experience, and become self-reliant over time.

Text to process:\n\n${text}`;
        break;
      case 'custom':
        if (!prompt) {
          return NextResponse.json(
            { error: 'Custom prompt is required for custom operation' },
            { status: 400 }
          );
        }
        systemPrompt = 'You are a helpful assistant that follows instructions precisely.';
        userPrompt = `${prompt}\n\nText to process:\n\n${text}`;
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid operation type' },
          { status: 400 }
        );
    }

    // Call the Groq API
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
      stream: false
    });

    // Extract the response
    const result = chatCompletion.choices[0]?.message?.content || '';

    return NextResponse.json({ result });
  } catch (error: Error | unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error manipulating text:', error);
    return NextResponse.json(
      { error: `Failed to manipulate text: ${errorMessage}` },
      { status: 500 }
    );
  }
}
