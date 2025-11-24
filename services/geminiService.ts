import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { ScenarioContent } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const langMap: { [key: string]: string } = {
  en: 'English',
  fr: 'French',
  it: 'Italian',
  es: 'Spanish',
  de: 'German'
};

const safetySettings = [
  { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
  { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' }
];

export async function generateScenarioIdeas(language: string, theme?: string): Promise<string[]> {
  const targetLanguage = langMap[language] || 'English';
  
  let themeInstruction = "";
  if (theme && theme.trim() !== "") {
    themeInstruction = `The scenario ideas MUST be strictly based on the following theme(s): "${theme}".`;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Act as an expert in the Paranoia RPG. Generate 5 short and punchy scenario ideas. Each idea must be a single intriguing sentence. ${themeInstruction} The output language for the ideas MUST be ${targetLanguage}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ideas: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A list of 5 scenario ideas."
            }
          }
        }
      }
    });

    const jsonText = response.text.trim();
    const data = JSON.parse(jsonText);
    return data.ideas;
  } catch (error) {
    console.error("Error generating scenario ideas:", error);
    throw new Error("Could not generate scenario ideas.");
  }
}


export async function generateScenarioContent(selectedIdea: string, playerCount: number, language: string): Promise<ScenarioContent> {
  const targetLanguage = langMap[language] || 'English';
  const prompt = `
    Act as an expert Paranoia RPG game master. Based on the following scenario idea: "${selectedIdea}", generate a complete, extremely detailed, and very long scenario for ${playerCount} players.
    The entire output, including all text fields in the JSON object, MUST be in ${targetLanguage}.
    The tone must be humorous, absurd, and full of danger, typical of Paranoia.
    The output MUST be a valid JSON object. Do not provide any explanation or text outside of the JSON object.

    CRUCIAL DESIGN RULES:
    1. **CRESCENDO OF PANIC:** The scenario must start with minor bureaucratic annoyances and escalate to total chaos, hallucinations, and explosions. The Computer must become increasingly oppressive and send contradictory orders.
    2. **CONFLICTING OBJECTIVES:** Player Secret Society/Personal objectives MUST collide. (e.g., Player A must destroy the device, Player B must steal it, Player C must eat it). Give them reasons to kill each other before the finale.
    3. **DYNAMIC BRANCHING:** In the 'etapes' (steps), you MUST provide between 2 and 5 distinct options/courses of action for the players depending on the situation. Do not strictly stick to 2 options if the situation allows for more.
    4. **DISRUPTIVE NPCs:** NPCs are not just quest givers. They are obstacles. They try to frame players, steal their credits, or report them for treason.
    5. **ACTIONABLE CLUES:** Clues should not just be flavor text. They must implicate specific players or force dangerous binary choices.
    6. **PITCH & COVER:** You must generate a short "Pitch" (1-2 sentences) summarizing the mission, and a detailed prompt for a Cover Image.

    Adhere to the following content and length constraints:
    - 'joueurs': Generate exactly ${playerCount} player characters. Do NOT use specific names like "Bob-R-3". Use generic placeholders like "Player A", "Player B", etc.
    - 'briefings': Generate an individual briefing for each player character.
    - 'presentation': Write a presentation of about 500 words for the game master.
    - 'etapes': Each 'description' must be MASSIVE and EXTREMELY DETAILED (MINIMUM 1500 words). It MUST act as a complete guide for the Game Master, describing the environment, the location, sensory details, and the behavior/mannerisms of every character involved in that step.
    - 'fiches': Generate at least 8 detailed cards (200-300 words each).
    - 'indices': Generate at least 6 substantial clues linked to decisions.
    - 'finsAlternatives': Generate 3 distinct, absurd endings based on player performance.
  `;
  
  try {
     const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            titre: { type: Type.STRING, description: "A catchy title for the scenario." },
            pitch: { type: Type.STRING, description: "A very short, catchy summary (1-2 sentences) of the mission, suitable for a back-of-the-book blurb." },
            presentation: { type: Type.STRING, description: "A very detailed summary of about 500 words for the Game Master only." },
            introduction: { type: Type.STRING, description: "A long and immersive flavor text to be read to the players." },
            joueurs: {
              type: Type.ARRAY,
              description: `A list of ${playerCount} player characters. Use generic names "Player A", "Player B", etc. ENSURE Secret Objectives conflict with each other to create PvP tension.`,
              items: {
                type: Type.OBJECT,
                properties: {
                  nom: { type: Type.STRING, description: "Use generic names: 'Player A', 'Player B', etc." },
                  description: { type: Type.STRING, description: "Very detailed physical description and personality (2-3 paragraphs)." },
                  societeSecrete: { type: Type.STRING, description: "e.g., The Enlightened Freemasons" },
                  objectifSocieteSecrete: { type: Type.STRING, description: "A detailed secret objective. MUST conflict with other players." },
                  mutation: { type: Type.STRING, description: "e.g., Pyrokinesis" },
                  objectifPersonnel: { type: Type.STRING, description: "A detailed personal secret objective, often conflicting with others." }
                },
                required: ["nom", "description", "societeSecrete", "objectifSocieteSecrete", "mutation", "objectifPersonnel"]
              }
            },
            briefings: {
              type: Type.ARRAY,
              description: "An individual briefing for each player, containing rumors and hidden objectives.",
              items: {
                type: Type.OBJECT,
                properties: {
                  pourJoueur: { type: Type.STRING, description: "The name of the player character this briefing is for (Player A, Player B...)." },
                  contenu: { type: Type.STRING, description: "The content of the secret briefing for this player." }
                },
                required: ["pourJoueur", "contenu"]
              }
            },
            etapes: {
              type: Type.ARRAY,
              description: "5 to 7 key stages. Each description MUST be at least 1500 words long.",
              items: {
                type: Type.OBJECT,
                properties: {
                  titre: { type: Type.STRING, description: "Title of the step." },
                  description: { type: Type.STRING, description: "EXTREMELY LONG (1500+ words). Detailed environment, sensory details, location specificities, and character mannerisms." },
                  options: {
                    type: Type.ARRAY,
                    description: "A list of 2 to 5 distinct choices available to players.",
                    items: {
                      type: Type.OBJECT,
                      properties: {
                         label: { type: Type.STRING, description: "Short title of the option (e.g., 'Option A: Blast the door')" },
                         action: { type: Type.STRING, description: "Description of the action." },
                         consequence: { type: Type.STRING, description: "Immediate result and long-term consequence." }
                      },
                      required: ["label", "action", "consequence"]
                    }
                  },
                  actionsTable: { type: Type.STRING, description: "A summary table in Markdown format of possible/expected actions, clues, and progression." }
                },
                required: ["titre", "description", "options", "actionsTable"]
              }
            },
            fiches: {
              type: Type.ARRAY,
              description: "At least 8 detailed info cards. NPCs must be disruptive/manipulative.",
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, description: "PNJ (NPC), Lieu (Location), or Objet (Item)" },
                  nom: { type: Type.STRING },
                  description: { type: Type.STRING, description: "A complete and detailed description and its role in the scenario (several paragraphs)." }
                },
                required: ["type", "nom", "description"]
              }
            },
            indices: {
              type: Type.ARRAY,
              description: "At least 6 substantial clues. They must drive decisions or incriminate players.",
              items: {
                type: Type.OBJECT,
                properties: {
                  titre: { type: Type.STRING, description: "e.g., 'Intercepted Message'" },
                  contenu: { type: Type.STRING, description: "The detailed content of the clue." }
                },
                required: ["titre", "contenu"]
              }
            },
            finsAlternatives: {
              type: Type.ARRAY,
              description: "3 different possible endings based on player choices/success.",
              items: {
                type: Type.OBJECT,
                properties: {
                  titre: { type: Type.STRING, description: "Title of the ending (e.g., 'Total Party Kill', 'Bureaucratic Nightmare')." },
                  condition: { type: Type.STRING, description: "What leads to this ending." },
                  description: { type: Type.STRING, description: "Description of the finale." }
                },
                required: ["titre", "condition", "description"]
              }
            },
            imagePrompt: {
              type: Type.STRING,
              description: "A single, highly detailed prompt for the main cover image of the scenario. IMPORTANT: Prompts must be PG-13. Do NOT use words like 'demonic', 'torture', 'gore', 'blood', 'suicide', 'sinister', or 'menacing'. Use 'unsettling', 'broken', 'red fluid', 'termination' instead. The prompt MUST end with: 'Style: High quality 16-bit pixel art style, retro sci-fi / dieselpunk aesthetic from the 90's. Dithering effects and pixelated textures. Detailed grungy industrial sci-fi environnement. Muted, earthy color palette: olive greens, rusted browns, metallic beige dominating the environment. Dramatic volumetric lighting with deep shadows. Strong emissive light sources: glowing green energy, vibrant purple plasma discharge with a shimmering effect. Dynamic action poses for characters. Characters are semi-realistic but pixelated. Detailed environmental elements: scattered debris, visible cables and conduits, worn-out machinery, broken panels. Atmospheric, dystopian feel.'"
            }
          },
          required: ["titre", "pitch", "presentation", "introduction", "joueurs", "briefings", "etapes", "fiches", "indices", "finsAlternatives", "imagePrompt"]
        }
      }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);

  } catch (error) {
    console.error("Error generating scenario content:", error);
    throw new Error("Could not generate scenario content.");
  }
}

export async function improveText(originalText: string, context: string, language: string): Promise<string> {
  const targetLanguage = langMap[language] || 'English';

  const prompt = `
    You are an expert writer for the Paranoia RPG.
    Your task is to rewrite and significantly expand the following text.
    Make it more detailed, more immersive, and infused with the typical dark humor and constant danger of the Paranoia setting.
    The text is the "${context}" part of a scenario.
    The final output MUST be in ${targetLanguage}.

    Original text to improve:
    ---
    ${originalText}
    ---

    Now, provide the new, improved, and much longer version of the text:`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error(`Error improving text for context "${context}":`, error);
    throw new Error("Could not improve the text.");
  }
}

export async function generateImage(prompt: string): Promise<string> {
  try {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '16:9',
          safetySettings: safetySettings,
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    throw new Error("No image was generated by Imagen.");
  } catch (error) {
    console.warn(`Imagen 4.0 failed for prompt "${prompt}", retrying with Flash Image...`, error);
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: prompt }]
            },
            config: {
                responseModalities: [Modality.IMAGE],
                safetySettings: safetySettings,
            }
        });

        const part = response.candidates?.[0]?.content?.parts?.[0];
        if (part && part.inlineData && part.inlineData.data) {
             return `data:image/png;base64,${part.inlineData.data}`;
        }
        throw new Error("No image generated by Flash.");
    } catch (fallbackError) {
        console.error(`All image generation failed for prompt "${prompt}":`, fallbackError);
        return "https://via.placeholder.com/1024x576.png/0A0A0A/FFB000?text=IMAGE+GENERATION+FAILED";
    }
  }
}