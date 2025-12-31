import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { newMemoryContent, existingMemories } = body;

    if (!existingMemories || existingMemories.length === 0) {
      return NextResponse.json({
        isDuplicate: false,
        similarMemory: null,
        similarity: 0
      });
    }

    // Get OpenAI API key from server-side environment variable
    const API_KEY = process.env.OPENAI_API_KEY;

    if (!API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: "system",
            content: `You are analyzing whether a new memory is a duplicate or too similar to existing memories. 

Instructions:
1. Compare the new memory content with each existing memory
2. Determine if the new memory contains substantially the same information as any existing memory
3. Rate similarity on a scale of 0-100 (0 = completely different, 100 = exact duplicate)
4. Consider memories as duplicates if similarity is 70+ or if they contain the same key information
5. Look for semantic similarity, not just exact text matches

Return JSON only with this structure:
{
  "isDuplicate": boolean,
  "highestSimilarity": number,
  "similarMemoryId": string or null,
  "similarMemoryContent": string or null,
  "reasoning": string
}`
          },
          {
            role: "user",
            content: `New memory to check:
"${newMemoryContent}"

Existing memories:
${existingMemories.map((memory, index) => 
  `${index + 1}. [ID: ${memory.id}] [Topic: ${memory.topic}]: ${memory.content}`
).join('\n')}

Check if the new memory is a duplicate or too similar to any existing memory. Return valid JSON only.`
          }
        ],
        temperature: 0.3,
        max_tokens: 1200
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      // On error, allow the memory to be saved (better to have duplicates than lose important info)
      return NextResponse.json({
        isDuplicate: false,
        similarMemory: null,
        similarity: 0
      });
    }

    const data = await response.json();

    if (!data || !data.choices || data.choices.length === 0) {
      return NextResponse.json({
        isDuplicate: false,
        similarMemory: null,
        similarity: 0
      });
    }

    const aiResponse = data.choices[0].message.content;
    
    let jsonData;
    try {
      jsonData = JSON.parse(aiResponse);
    } catch (e) {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonData = JSON.parse(jsonMatch[0]);
      } else {
        return NextResponse.json({
          isDuplicate: false,
          similarMemory: null,
          similarity: 0
        });
      }
    }

    return NextResponse.json({
      isDuplicate: jsonData.isDuplicate || false,
      similarity: jsonData.highestSimilarity || 0,
      similarMemory: jsonData.similarMemoryId ? {
        id: jsonData.similarMemoryId,
        content: jsonData.similarMemoryContent
      } : null,
      reasoning: jsonData.reasoning || "No detailed analysis available"
    });

  } catch (error) {
    console.error('Check memory similarity API error:', error);
    // On error, allow the memory to be saved (better to have duplicates than lose important info)
    return NextResponse.json({
      isDuplicate: false,
      similarMemory: null,
      similarity: 0
    });
  }
}

