import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Priority {
  id: string;
  name: string;
  domain: 'you' | 'relationships' | 'work';
  weight: number;
}

interface RequestBody {
  priorities: Priority[];
  voiceInput?: string;
  currentTime?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { priorities, voiceInput, currentTime }: RequestBody = await req.json();
    
    console.log('Generating schedule with priorities:', priorities);
    console.log('Voice input:', voiceInput);
    console.log('Current time:', currentTime);

    // Build context from priorities
    const priorityContext = priorities.map(p => 
      `- ${p.name} (Bereich: ${p.domain === 'you' ? 'Persönlich' : p.domain === 'relationships' ? 'Beziehungen' : 'Arbeit'}, Gewichtung: ${p.weight}/5)`
    ).join('\n');

    const systemPrompt = `Du bist ein hilfreicher Tagesplaner-Assistent. Du erstellst personalisierte Zeitblock-Vorschläge basierend auf den Prioritäten des Nutzers.

WICHTIGE REGELN:
1. Erstelle 8-12 sinnvolle Zeitblöcke für einen Tag (6:00 - 22:00)
2. Berücksichtige die Gewichtung der Prioritäten (1-5)
3. Höhere Gewichtung = mehr Zeit für diese Aktivität
4. Plane realistische Zeitfenster (mindestens 30 Min, max 3 Std)
5. Füge Pausen und Erholungszeiten ein
6. Die Blöcke sollten NICHT überlappen

KATEGORIEN (nutze genau diese Werte):
- "focus" = Konzentrierte Arbeit, Deep Work
- "admin" = Administrative Aufgaben, E-Mails, Organisation
- "social" = Soziale Aktivitäten, Familie, Freunde, Meetings
- "play" = Freizeit, Hobbys, Sport, Spaß
- "rest" = Ruhe, Schlaf, Meditation, Erholung

Antworte NUR mit einem JSON-Array in diesem Format:
[
  {"title": "Morgenroutine", "category": "rest", "startTime": "06:00", "endTime": "07:00"},
  {"title": "Deep Work: Projektarbeit", "category": "focus", "startTime": "07:00", "endTime": "10:00"}
]`;

    const userPrompt = voiceInput 
      ? `Der Nutzer hat folgendes gesagt: "${voiceInput}"
      
Berücksichtige auch diese Prioritäten:
${priorityContext}

Aktuelle Uhrzeit: ${currentTime || 'Morgen'}

Erstelle passende Zeitblock-Vorschläge basierend auf der Spracheingabe und den Prioritäten.`
      : `Erstelle einen personalisierten Tagesplan basierend auf diesen Prioritäten:

${priorityContext}

Aktuelle Uhrzeit: ${currentTime || 'Morgen'}

Erstelle einen ausgewogenen Tagesplan, der diese Prioritäten berücksichtigt.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Zu viele Anfragen. Bitte warte einen Moment.' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'KI-Credits aufgebraucht. Bitte später erneut versuchen.' 
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    console.log('AI response:', content);

    // Parse the JSON from the response
    let suggestions;
    try {
      // Try to extract JSON array from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON array found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Return fallback suggestions
      suggestions = [
        { title: 'Morgenroutine', category: 'rest', startTime: '06:00', endTime: '07:00' },
        { title: 'Deep Work', category: 'focus', startTime: '07:00', endTime: '10:00' },
        { title: 'Pause & Admin', category: 'admin', startTime: '10:00', endTime: '11:00' },
        { title: 'Kreative Arbeit', category: 'focus', startTime: '11:00', endTime: '13:00' },
        { title: 'Mittagspause', category: 'play', startTime: '13:00', endTime: '14:00' },
        { title: 'Meetings & Kommunikation', category: 'social', startTime: '14:00', endTime: '16:00' },
        { title: 'Wrap-up', category: 'admin', startTime: '16:00', endTime: '17:00' },
        { title: 'Freizeit', category: 'play', startTime: '17:00', endTime: '19:00' },
        { title: 'Abendroutine', category: 'rest', startTime: '21:00', endTime: '22:00' },
      ];
    }

    // Validate and clean suggestions
    const validCategories = ['focus', 'admin', 'social', 'play', 'rest'];
    const cleanedSuggestions = suggestions.map((s: any) => ({
      title: String(s.title || 'Zeitblock'),
      category: validCategories.includes(s.category) ? s.category : 'focus',
      startTime: String(s.startTime || '09:00'),
      endTime: String(s.endTime || '10:00'),
    }));

    console.log('Returning suggestions:', cleanedSuggestions);

    return new Response(JSON.stringify({ suggestions: cleanedSuggestions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-schedule:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Ein Fehler ist aufgetreten' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
