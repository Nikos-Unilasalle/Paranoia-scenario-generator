
export interface PlayerCharacter {
  nom: string;
  description: string;
  societeSecrete: string;
  objectifSocieteSecrete: string;
  mutation: string;
  objectifPersonnel: string;
}

export interface Briefing {
  pourJoueur: string;
  contenu: string;
}

export interface ScenarioOption {
  label: string;
  action: string;
  consequence: string;
}

export interface ScenarioStep {
  titre: string;
  description: string;
  options: ScenarioOption[];
  actionsTable: string;
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

export interface Ending {
  titre: string;
  description: string;
  condition: string;
}

export interface Scenario {
  titre: string;
  presentation: string;
  introduction: string;
  joueurs: PlayerCharacter[];
  briefings: Briefing[];
  etapes: ScenarioStep[];
  fiches: InfoCard[];
  indices: Clue[];
  messagesOrdinateur: string[];
  finsAlternatives: Ending[];
  images: GeneratedImage[];
}

// Type for the initial JSON response before image generation
export interface ScenarioContent {
    titre: string;
    presentation: string;
    introduction: string;
    joueurs: PlayerCharacter[];
    briefings: Briefing[];
    etapes: ScenarioStep[];
    fiches: InfoCard[];
    indices: Clue[];
    messagesOrdinateur: string[];
    finsAlternatives: Ending[];
    imagesPrompts: ImagePrompt[];
}
