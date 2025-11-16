import { GoogleGenAI, Type } from "@google/genai";
import type { ScenarioContent, ImagePrompt } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateScenarioIdeas(): Promise<string[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Agis en tant qu'expert du jeu de rôle Paranoia. Génère 5 idées de scénarios courtes et percutantes pour Paranoia. Chaque idée doit être une seule phrase intrigante.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ideas: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Une liste de 5 idées de scénario."
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
    throw new Error("Impossible de générer les idées de scénario.");
  }
}


export async function generateScenarioContent(selectedIdea: string): Promise<ScenarioContent> {
  const prompt = `
    Agis en tant qu'expert du jeu de rôle Paranoia et maître du jeu expérimenté. En te basant sur l'idée de scénario suivante : "${selectedIdea}", génère un scénario complet, extrêmement détaillé et très long.
    Le ton doit être humoristique, absurde et plein de danger, typique de Paranoia.
    Le résultat DOIT être un objet JSON valide. Ne fournis aucune explication ou texte en dehors de l'objet JSON.
    Respecte les contraintes de contenu et de longueur suivantes :
    - La 'presentation' doit faire environ 500 mots.
    - Chaque 'description' dans les 'etapes' du scénario doit faire au moins 300-400 mots.
    - Chaque 'description' dans les 'fiches' doit être très détaillée, environ 200-300 mots.
    - Génère au moins 8 fiches.
    - Génère au moins 6 indices substantiels et détaillés.
    - Génère au moins 8 messages de l'ordinateur.
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
            titre: { type: Type.STRING, description: "Un titre accrocheur pour le scénario" },
            presentation: { type: Type.STRING, description: "Résumé très détaillé d'environ 500 mots pour le maître du jeu uniquement." },
            introduction: { type: Type.STRING, description: "Texte d'ambiance long et immersif à lire aux joueurs." },
            joueurs: {
              type: Type.ARRAY,
              description: "4 personnages joueurs avec des descriptions physiques et psychologiques très détaillées.",
              items: {
                type: Type.OBJECT,
                properties: {
                  nom: { type: Type.STRING, description: "ex: ZAP-R-DED" },
                  description: { type: Type.STRING, description: "Description physique et personnalité très détaillée (2-3 paragraphes)." },
                  societeSecrete: { type: Type.STRING, description: "ex: Les Francs-Maçons Illuminés" },
                  objectifSocieteSecrete: { type: Type.STRING, description: "Objectif secret détaillé lié à la société." },
                  mutation: { type: Type.STRING, description: "ex: Pyrotechnie" },
                  objectifPersonnel: { type: Type.STRING, description: "Un objectif secret personnel détaillé, souvent en conflit avec les autres." }
                },
                required: ["nom", "description", "societeSecrete", "objectifSocieteSecrete", "mutation", "objectifPersonnel"]
              }
            },
            etapes: {
              type: Type.ARRAY,
              description: "5 à 7 étapes clés du scénario, chacune décrite en très grand détail (300-400 mots par étape).",
              items: {
                type: Type.OBJECT,
                properties: {
                  titre: { type: Type.STRING, description: "Titre de l'étape" },
                  description: { type: Type.STRING, description: "Description très détaillée de ce qui se passe, des choix et des conséquences." }
                },
                required: ["titre", "description"]
              }
            },
            fiches: {
              type: Type.ARRAY,
              description: "Au moins 8 fiches détaillées (200-300 mots chacune) pour PNJ, lieux et objets importants.",
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, description: "PNJ, Lieu, ou Objet" },
                  nom: { type: Type.STRING },
                  description: { type: Type.STRING, description: "Description complète et détaillée et rôle dans le scénario (plusieurs paragraphes)." }
                },
                required: ["type", "nom", "description"]
              }
            },
            indices: {
              type: Type.ARRAY,
              description: "Au moins 6 indices substantiels et détaillés à donner aux joueurs.",
              items: {
                type: Type.OBJECT,
                properties: {
                  titre: { type: Type.STRING, description: "ex: 'Message Intercepté'" },
                  contenu: { type: Type.STRING, description: "Le contenu détaillé de l'indice." }
                },
                required: ["titre", "contenu"]
              }
            },
            messagesOrdinateur: {
              type: Type.ARRAY,
              description: "Au moins 8 messages de l'Ordinateur (3 lignes, max 23 char/ligne, séparées par \\n)",
              items: { type: Type.STRING }
            },
            imagesPrompts: {
              type: Type.ARRAY,
              description: "5 prompts pour générer des images. Chaque prompt doit se terminer par 'Style: semi-realistic digital painting, highly detailed, cinematic composition, dramatic lighting, intense sci-fi comic book art atmosphere.'",
              items: {
                type: Type.OBJECT,
                properties: {
                  titre: { type: Type.STRING, description: "Le nom de l'image (ex: 'Le PNJ Technicien-BOB')" },
                  prompt: { type: Type.STRING, description: "Un prompt détaillé pour un modèle de génération d'image, incluant une instruction de style stricte." }
                },
                required: ["titre", "prompt"]
              }
            }
          },
          required: ["titre", "presentation", "introduction", "joueurs", "etapes", "fiches", "indices", "messagesOrdinateur", "imagesPrompts"]
        }
      }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);

  } catch (error) {
    console.error("Error generating scenario content:", error);
    throw new Error("Impossible de générer le contenu du scénario.");
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