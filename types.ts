
export interface PlayerCharacter {
  nom: string;
  description: string;
  societeSecrete: string;
  objectifSocieteSecrete: string;
  mutation: string;
  objectifPersonnel: string;
}

export interface ScenarioStep {
  titre: string;
  description: string;
}

export interface InfoCard {
  type: 'PNJ' | 'Lieu' | 'Objet';
  nom:string;
  description: string;
}

export interface Clue {
  titre: string;
  contenu: string;
}

export interface ImagePrompt {
    titre: string;
    prompt: string;
}

export interface GeneratedImage {
    titre: string;
    url: string;
}

export interface Scenario {
  titre: string;
  presentation: string;
  introduction: string;
  joueurs: PlayerCharacter[];
  etapes: ScenarioStep[];
  fiches: InfoCard[];
  indices: Clue[];
  messagesOrdinateur: string[];
  images: GeneratedImage[];
}

// Type for the initial JSON response before image generation
export interface ScenarioContent {
    titre: string;
    presentation: string;
    introduction: string;
    joueurs: PlayerCharacter[];
    etapes: ScenarioStep[];
    fiches: InfoCard[];
    indices: Clue[];
    messagesOrdinateur: string[];
    imagesPrompts: ImagePrompt[];
}
