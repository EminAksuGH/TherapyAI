import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { conversationText, previousContext, existingMemories } = body;

    // Get OpenAI API key from server-side environment variable
    const API_KEY = process.env.OPENAI_API_KEY;

    if (!API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Check if this is a meta-query about memory itself without additional context
    const isGenericMemoryQuery = /^(?:do you (?:remember|know|recall)|(?:hatırlıyor|biliyor) mu(?:sun)?).*?$/i.test(conversationText.trim());
    
    // Check if user is explicitly asking to remember/save something
    const isExplicitSaveRequest = /(?:(?:remember|save|store|keep|hatırla|kaydet|sakla|tut) this|bunu (?:hatırla|kaydet|sakla|tut|aklında tut)|(?:bana|sana).+(?:hitap|böyle|şekilde).+istiyorum|(?:adım|ismim).+(?:bana|sana).+(?:hitap|çağır|de)|bundan böyle.+istiyorum)/i.test(conversationText.trim());
    
    // If user explicitly asks to remember something, we'll prioritize storing it
    if (isExplicitSaveRequest) {
      // Extract what they want to remember
      const extractedContent = conversationText
        .replace(/(?:(?:can you |please |lütfen |)?(?:remember|save|store|keep|hatırla|kaydet|sakla|tut) this|bunu (?:hatırla|kaydet|sakla|tut|aklında tut))(?:\s*:\s*|\s+)/i, '')
        .trim();
      
      const contentToCheck = extractedContent || conversationText;
      
      // For explicit requests, we'll check duplicates via the similarity API
      // For now, return a response indicating it should be stored
      return NextResponse.json({
        importance: 6,
        extractedMemory: contentToCheck,
        topics: ["Kullanıcı Talebi"],
        reasoning: "Kullanıcı bu bilgiyi kaydetmek için özel olarak talepte bulundu",
        shouldStore: true
      });
    }
    
    // Check for low-value content
    const isLowValueContent = 
      conversationText.length < 15 || 
      /^(ok|tamam|merhaba|selam|hi|hello|hey|thanks|teşekkür)$/i.test(conversationText.trim());
    
    if (isGenericMemoryQuery || isLowValueContent) {
      const containsSpecificContent = /\b[A-Z][a-z]{2,}\b|\b(?!do|you|remember|know|recall|hatırlıyor|musun|mu|biliyor)[a-zA-Z]{5,}\b/i.test(conversationText);
      
      if (!containsSpecificContent) {
        return NextResponse.json({
          importance: 2,
          extractedMemory: conversationText.substring(0, 100),
          topics: ["Sohbet"],
          reasoning: "Genel sorgu veya önemli kişisel içerik içermeyen basit selamlama",
          shouldStore: false
        });
      }
    }

    // Call OpenAI API to analyze the conversation
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
            content: `You are an AI that analyzes conversations to determine what information might be important to remember for future interactions.
                        
Instructions:
1. Analyze the given message and extract any potentially important information about the user
2. Assign an importance score (1-10) based on how critical this information would be for future interactions
3. Create a concise memory statement summarizing the important information IN TURKISH (since this is a Turkish therapy app)
4. Determine appropriate topics/tags for categorizing this memory IN TURKISH
5. CRITICAL: Check if this information is already captured in existing memories to avoid duplicates

For importance scoring - USE THE FULL RANGE (1-10) based on actual content, but be conservative:
- 1-3: Very casual remarks, routine information, simple questions or basic preferences
- 4-5: Noteworthy information, moderate emotional content, recurring interests
- 6-7: Significant personal information, important relationships, notable events
- 8-10: Critical information (major life events, trauma, crucial needs, deep emotional content)

Be conservative with scoring - memories should be meaningful:
- Default to lower scores (1-5) unless content is truly significant
- Reserve scores of 6+ for genuinely important emotional or personal content
- Casual memory checks (like "do you remember X?") without emotional depth should be 2-3
- Basic biographical information without emotional context should be 3-4
- New user preferences or interests without emotional significance should be 4-5
- Only conversations with real emotional depth, important relationships, or significant life events should reach 6+

Focus especially on:
- Personal relationships (with appropriate score based on significance)
- Names and how the user wants to be addressed (CRITICAL - score 7+)
- Emotional states or patterns
- Life events (minor to major)
- Expressed needs or challenges
- Recurring themes or concerns
- Cultural context or background
- User preferences for interaction style

IMPORTANT: Since this is a Turkish therapy application:
- Write all memory content (extractedMemory) in TURKISH
- Use Turkish topic names (e.g., "isim" instead of "name", "tercihler" instead of "preferences")
- Keep the natural flow of Turkish language in memory descriptions

Do not extract or remember:
- Simple greetings or short exchanges without substance
- Specific passwords or security information
- Private identifiable information that isn't relevant for emotional support
- Information that is already captured in existing memories
- Each message doesn't necessarily need to create a new memory
- Generic memory queries like "do you remember?" without specific content
- Questions that are just checking if AI remembers something
- Factual queries unrelated to emotional support (score appropriately if they must be remembered)

DUPLICATE PREVENTION:
- Carefully compare the new information with existing memories
- If similar information already exists, set shouldStore to false
- Only store if the information adds significant new details or updates existing information
- Consider variations in wording but same core meaning as duplicates

About memory-related queries:
- If a query like "Do you remember X?" contains important personal information (like names, relationships, events), DO extract the actual information about X
- Rate the importance based on the content being asked about, not the fact that it's a memory query
- Assign appropriate scores to memory queries based on their actual content value
- If a memory query reveals new information about the user's life or relationships, assign a score that matches its true significance

Special attention to names and addressing:
- When a user shares their name (e.g., "Benim adım X" / "My name is X"), this should be scored 7+ as it's critical for personalization
- When a user requests specific addressing (e.g., "Bana X olarak hitap et" / "Address me as X"), this should be scored 7+ 
- Turkish phrases like "bundan böyle", "istiyorum", "hitap et" often indicate important preferences
- Names and addressing preferences are fundamental to building rapport and should always be remembered
- For names: write in Turkish like "Kullanıcının adı X" instead of "User's name is X"
- For addressing preferences: write in Turkish like "X adıyla hitap edilmek istiyor" instead of "Prefers to be addressed as X"

Output JSON only with the following structure:
{
  "importance": number, // 1-10, using the full scale but be conservative
  "extractedMemory": string, // Concise memory statement IN TURKISH
  "topics": string[], // 1-3 relevant topic tags IN TURKISH
  "reasoning": string, // Brief explanation of why this information matters and justification for the importance score IN TURKISH
  "shouldStore": boolean // Whether this is worth storing as a new memory, default to false for importance < 6 or if duplicate
}`
          },
          {
            role: "user",
            content: `Previous context (if any):
${previousContext || ''}

User's message:
${conversationText}

Existing user memories:
${existingMemories.map(m => `[${m.topic}]: ${m.content}`).join('\n')}

Analyze this message and determine what should be remembered. CRITICALLY check if this information is already captured in existing memories to avoid duplicates. Return valid JSON only.`
          }
        ],
        temperature: 0.3,
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to analyze memory' },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (!data || !data.choices || data.choices.length === 0) {
      return NextResponse.json(
        { error: 'Invalid API response' },
        { status: 500 }
      );
    }

    // Parse the AI response to extract the JSON
    const aiResponse = data.choices[0].message.content;
    
    // Extract the JSON data from the response
    let jsonData;
    try {
      jsonData = JSON.parse(aiResponse);
    } catch (e) {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonData = JSON.parse(jsonMatch[0]);
      } else {
        jsonData = {
          importance: 5,
          extractedMemory: conversationText.substring(0, 100),
          topics: ["Sohbet"],
          reasoning: "Varsayılan hafıza oluşturma",
          shouldStore: existingMemories.length === 0
        };
      }
    }

    // Set default for shouldStore if it's not present
    if (jsonData.shouldStore === undefined) {
      if (existingMemories.length < 5) {
        jsonData.shouldStore = jsonData.importance >= 5;
      } else if (existingMemories.length < 15) {
        jsonData.shouldStore = jsonData.importance >= 5;
      } else {
        jsonData.shouldStore = jsonData.importance >= 6;
      }
    }

    return NextResponse.json(jsonData);

  } catch (error) {
    console.error('Analyze memory API error:', error);
    const conversationText = body?.conversationText || '';
    return NextResponse.json(
      { 
        importance: 3,
        extractedMemory: conversationText.substring(0, 100),
        topics: ["Sohbet"],
        reasoning: "Varsayılan hafıza oluşturma (analiz başarısız)",
        shouldStore: false
      },
      { status: 500 }
    );
  }
}

