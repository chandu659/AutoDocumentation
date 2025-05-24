import { NextRequest, NextResponse } from 'next/server';
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
      case 'analyze':
        systemPrompt = 'You are a helpful assistant that analyzes text to extract key insights, themes, and patterns.';
        userPrompt = `Please analyze the following text and provide key insights:\n\n${text}`;
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
  } catch (error: any) {
    console.error('Error manipulating text:', error);
    return NextResponse.json(
      { error: `Failed to manipulate text: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}
