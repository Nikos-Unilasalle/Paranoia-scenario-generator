
import { GoogleGenAI, Type } from "@google/genai";
import type { ScenarioContent, ImagePrompt } from '../types';

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

export async function generateScenarioIdeas(language: string): Promise<string[]> {
  const targetLanguage = langMap[language] || 'English';
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Act as an expert in the Paranoia RPG. Generate 5 short and punchy scenario ideas. Each idea must be a single intriguing sentence. The output language for the ideas MUST be ${targetLanguage}.`,
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

    CRUCIAL LORE REMINDER: ALPHA Complex is NOT a communist state. It is a totalitarian, dystopian world run by a paranoid AI, The Computer. There is no democracy. Communism (and capitalism) are ideologies of secret societies and are considered high treason. The Computer is obsessed with eradicating traitors, mutants, and secret society members. Ensure the scenario reflects this tension and paranoia, not a simple caricature of communism.

    Adhere to the following content and length constraints:
    - 'joueurs': Generate exactly ${playerCount} player characters.
    - 'briefings': Generate an individual briefing for each player character. Each briefing should contain rumors (true or false) about the mission, NPCs, or other player characters.
    - 'presentation': Write a presentation of about 500 words for the game master.
    - 'etapes': Each 'description' in the steps must be extremely detailed, making about 1000 words. Each step must also include an 'actionsTable', which is a summary table in Markdown format. This table should list possible or expected actions, clues to find, and how to progress.
    - 'fiches': Generate at least 8 detailed cards (200-300 words each).
    - 'indices': Generate at least 6 substantial clues.
    - 'messagesOrdinateur': Generate at least 8 computer messages.
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
            presentation: { type: Type.STRING, description: "A very detailed summary of about 500 words for the Game Master only." },
            introduction: { type: Type.STRING, description: "A long and immersive flavor text to be read to the players." },
            joueurs: {
              type: Type.ARRAY,
              description: `A list of ${playerCount} player characters with highly detailed physical and psychological descriptions.`,
              items: {
                type: Type.OBJECT,
                properties: {
                  nom: { type: Type.STRING, description: "e.g., ZAP-R-DED" },
                  description: { type: Type.STRING, description: "Very detailed physical description and personality (2-3 paragraphs)." },
                  societeSecrete: { type: Type.STRING, description: "e.g., The Enlightened Freemasons" },
                  objectifSocieteSecrete: { type: Type.STRING, description: "A detailed secret objective related to the society." },
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
                  pourJoueur: { type: Type.STRING, description: "The name of the player character this briefing is for." },
                  contenu: { type: Type.STRING, description: "The content of the secret briefing for this player." }
                },
                required: ["pourJoueur", "contenu"]
              }
            },
            etapes: {
              type: Type.ARRAY,
              description: "5 to 7 key stages of the scenario, each described in great detail (approx. 1000 words).",
              items: {
                type: Type.OBJECT,
                properties: {
                  titre: { type: Type.STRING, description: "Title of the step." },
                  description: { type: Type.STRING, description: "A very detailed description of what happens, choices, and consequences (approx. 1000 words)." },
                  actionsTable: { type: Type.STRING, description: "A summary table in Markdown format of possible/expected actions, clues, and progression." }
                },
                required: ["titre", "description", "actionsTable"]
              }
            },
            fiches: {
              type: Type.ARRAY,
              description: "At least 8 detailed info cards (200-300 words each) for important NPCs, locations, and items.",
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
              description: "At least 6 substantial and detailed clues to give to the players.",
              items: {
                type: Type.OBJECT,
                properties: {
                  titre: { type: Type.STRING, description: "e.g., 'Intercepted Message'" },
                  contenu: { type: Type.STRING, description: "The detailed content of the clue." }
                },
                required: ["titre", "contenu"]
              }
            },
            messagesOrdinateur: {
              type: Type.ARRAY,
              description: "At least 8 messages from The Computer (3 lines, max 23 char/line, separated by \\n).",
              items: { type: Type.STRING }
            },
            imagesPrompts: {
              type: Type.ARRAY,
              description: "5 prompts for generating images. Each prompt must end with 'Style: semi-realistic digital painting, highly detailed, cinematic composition, dramatic lighting, intense sci-fi comic book art atmosphere.'",
              items: {
                type: Type.OBJECT,
                properties: {
                  titre: { type: Type.STRING, description: "The name of the image (e.g., 'The NPC Technician-BOB')" },
                  prompt: { type: Type.STRING, description: "A detailed prompt for an image generation model, including a strict style instruction." }
                },
                required: ["titre", "prompt"]
              }
            }
          },
          required: ["titre", "presentation", "introduction", "joueurs", "briefings", "etapes", "fiches", "indices", "messagesOrdinateur", "imagesPrompts"]
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
          aspectRatio: '16:9', // Using a cinematic ratio
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    throw new Error("No image was generated.");
  } catch (error) {
    console.error(`Error generating image for prompt "${prompt}":`, error);
    return "https://via.placeholder.com/1024x576.png/0A0A0A/FFB000?text=IMAGE+GENERATION+FAILED";
  }
}
