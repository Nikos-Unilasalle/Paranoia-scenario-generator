
import React, { useState, useCallback } from 'react';
import { generateScenarioIdeas, generateScenarioContent, generateImage, improveText } from './services/geminiService';
import type { Scenario, ScenarioContent } from './types';
import LoadingSpinner from './components/LoadingSpinner';
import ScenarioDisplay from './components/ScenarioDisplay';

declare var JSZip: any;

type AppState = 'idle' | 'loadingIdeas' | 'ideasReady' | 'selectingLanguage' | 'selectingPlayerCount' | 'loadingScenario' | 'scenarioReady' | 'error';
type Language = 'en' | 'fr' | 'it' | 'es' | 'de';

const translations = {
    en: {
        languageName: "English",
        headerTitle: "[ PARANOIA SCENARIO GENERATOR ]",
        headerSubtitle: "The Computer is your friend. The Computer has a mission for you. Failure to complete your mission is treason. Treason is punishable by summary execution.",
        getMissionButton: "RECEIVE A MISSION FROM THE COMPUTER",
        loadingIdeas: "The Computer is contemplating perilous missions",
        chooseMission: "[ CHOOSE YOUR MISSION, TROUBLESHOOTER ]",
        generateMoreIdeas: "GENERATE MORE IDEAS",
        selectLanguage: "[ SELECT MISSION LANGUAGE ]",
        missionBriefing: "MISSION BRIEFING:",
        confirmTeam: "[ CONFIRM MISSION SQUAD SIZE ]",
        selectTroubleshooters: "SELECT NUMBER OF (DISPOSABLE) TROUBLESHOOTERS:",
        players: "PLAYERS",
        loadingScenario: "Analyzing mission briefing",
        generatingVisuals: "Generating propaganda visuals",
        errorTitle: "[ TREASON DETECTED ]",
        unknownError: "An unknown error occurred.",
        retryButton: "> TRY AGAIN",
        downloadButton: "DOWNLOAD SCENARIO (.ZIP)",
        newScenarioButton: "GENERATE NEW SCENARIO",
        footer: "REMINDER: HAPPINESS IS MANDATORY. NOT BEING HAPPY IS TREASON.",
        improvingText: "Consulting The Computer for... improvements",
        improveButton: "IMPROVE",
        accordionPresentation: "Presentation (Game Master)",
        accordionIntro: "Introduction (Players)",
        accordionPCs: "Player Characters",
        accordionBriefings: "Individual Player Briefings",
        accordionSteps: "Scenario Steps",
        accordionInfoCards: "Info Cards (NPCs, Locations, Items)",
        accordionClues: "Clues",
        accordionComputer: "Computer Messages",
        accordionGallery: "Image Gallery",
        step: "Step",
        summaryTable: "Summary Table",
        for: "For",
        infoCard: "Info Card",
        clue: "Clue",
        contextPresentation: 'Game Master Presentation',
        contextIntroduction: 'Player Introduction',
        contextStep: 'Scenario Step',
        zipPresentation: "01_presentation",
        zipIntroduction: "02_introduction",
        zipPCs: "03_player_characters",
        zipBriefings: "04_briefings",
        zipSteps: "05_scenario_steps",
        zipInfoCards: "06_info_cards",
        zipClues: "07_clues",
        zipComputer: "08_computer_messages",
    },
    fr: {
        languageName: "Français",
        headerTitle: "[ GÉNÉRATEUR DE SCÉNARIO PARANOIA ]",
        headerSubtitle: "L'Ordinateur est votre ami. L'Ordinateur a une mission pour vous. Ne pas accomplir votre mission est une trahison. La trahison est punie par l'exécution.",
        getMissionButton: "RECEVOIR UNE MISSION DE L'ORDINATEUR",
        loadingIdeas: "L'Ordinateur réfléchit à des missions périlleuses",
        chooseMission: "[ CHOISISSEZ VOTRE MISSION, CLARIFICATEUR ]",
        generateMoreIdeas: "GÉNÉRER D'AUTRES IDÉES",
        selectLanguage: "[ SÉLECTIONNEZ LA LANGUE DE LA MISSION ]",
        missionBriefing: "SUJET DE LA MISSION :",
        confirmTeam: "[ CONFIRMEZ L'EFFECTIF DE LA MISSION ]",
        selectTroubleshooters: "SÉLECTIONNEZ LE NOMBRE DE CLARIFICATEURS (JETABLES) :",
        players: "JOUEURS",
        loadingScenario: "Analyse du briefing de mission",
        generatingVisuals: "Génération des visuels de propagande",
        errorTitle: "[ ERREUR DE TRAHISON DÉTECTÉE ]",
        unknownError: "Une erreur inconnue est survenue.",
        retryButton: "> RECOMMENCER",
        downloadButton: "TÉLÉCHARGER LE SCÉNARIO (.ZIP)",
        newScenarioButton: "GÉNÉRER UN NOUVEAU SCÉNARIO",
        footer: "RAPPEL : LE BONHEUR EST OBLIGATOIRE. NE PAS ÊTRE HEUREUX EST UNE TRAHISON.",
        improvingText: "Consultation de l'Ordinateur pour... améliorations",
        improveButton: "AMÉLIORER",
        accordionPresentation: "Présentation (Maître du jeu)",
        accordionIntro: "Introduction (Joueurs)",
        accordionPCs: "Personnages Joueurs",
        accordionBriefings: "Briefings Individuels des Joueurs",
        accordionSteps: "Étapes du Scénario",
        accordionInfoCards: "Fiches (PNJ, Lieux, Objets)",
        accordionClues: "Indices",
        accordionComputer: "Messages de l'Ordinateur",
        accordionGallery: "Galerie d'Images",
        step: "Étape",
        summaryTable: "Tableau Récapitulatif",
        for: "Pour",
        infoCard: "Fiche",
        clue: "Indice",
        contextPresentation: 'Présentation pour le Maître du Jeu',
        contextIntroduction: 'Introduction pour les Joueurs',
        contextStep: 'Étape du scénario',
        zipPresentation: "01_presentation",
        zipIntroduction: "02_introduction",
        zipPCs: "03_personnages_joueurs",
        zipBriefings: "04_briefings",
        zipSteps: "05_etapes_scenario",
        zipInfoCards: "06_fiches",
        zipClues: "07_indices",
        zipComputer: "08_messages_ordinateur",
    },
    it: {
        languageName: "Italiano",
        headerTitle: "[ GENERATORE DI SCENARI PARANOIA ]",
        headerSubtitle: "Il Computer è tuo amico. Il Computer ha una missione per te. Non completare la tua missione è tradimento. Il tradimento è punibile con l'esecuzione sommaria.",
        getMissionButton: "RICEVI UNA MISSIONE DAL COMPUTER",
        loadingIdeas: "Il Computer sta contemplando missioni pericolose",
        chooseMission: "[ SCEGLI LA TUA MISSIONE, RISOLUTORE ]",
        generateMoreIdeas: "GENERA ALTRE IDEE",
        selectLanguage: "[ SELEZIONA LA LINGUA DELLA MISSIONE ]",
        missionBriefing: "OGGETTO DELLA MISSIONE:",
        confirmTeam: "[ CONFERMA DIMENSIONE SQUADRA MISSIONE ]",
        selectTroubleshooters: "SELEZIONA NUMERO DI RISOLUTORI (USA E GETTA):",
        players: "GIOCATORI",
        loadingScenario: "Analisi del briefing di missione",
        generatingVisuals: "Generazione immagini di propaganda",
        errorTitle: "[ TRADIMENTO RILEVATO ]",
        unknownError: "Si è verificato un errore sconosciuto.",
        retryButton: "> RIPROVA",
        downloadButton: "SCARICA SCENARIO (.ZIP)",
        newScenarioButton: "GENERA NUOVO SCENARIO",
        footer: "RICORDA: LA FELICITÀ È OBBLIGATORIA. NON ESSERE FELICI È TRADIMENTO.",
        improvingText: "Consultando il Computer per... miglioramenti",
        improveButton: "MIGLIORA",
        accordionPresentation: "Presentazione (Game Master)",
        accordionIntro: "Introduzione (Giocatori)",
        accordionPCs: "Personaggi Giocanti",
        accordionBriefings: "Briefing Individuali Giocatori",
        accordionSteps: "Fasi dello Scenario",
        accordionInfoCards: "Schede (PNG, Luoghi, Oggetti)",
        accordionClues: "Indizi",
        accordionComputer: "Messaggi del Computer",
        accordionGallery: "Galleria Immagini",
        step: "Fase",
        summaryTable: "Tabella Riassuntiva",
        for: "Per",
        infoCard: "Scheda",
        clue: "Indizio",
        contextPresentation: 'Presentazione per il Game Master',
        contextIntroduction: 'Introduzione per i Giocatori',
        contextStep: 'Fase dello scenario',
        zipPresentation: "01_presentazione",
        zipIntroduction: "02_introduzione",
        zipPCs: "03_personaggi_giocanti",
        zipBriefings: "04_briefing",
        zipSteps: "05_fasi_scenario",
        zipInfoCards: "06_schede",
        zipClues: "07_indizi",
        zipComputer: "08_messaggi_computer",
    },
    es: {
        languageName: "Español",
        headerTitle: "[ GENERADOR DE ESCENARIOS PARANOIA ]",
        headerSubtitle: "El Ordenador es tu amigo. El Ordenador tiene una misión para ti. No completar tu misión es traición. La traición se castiga con la ejecución sumaria.",
        getMissionButton: "RECIBIR UNA MISIÓN DEL ORDENADOR",
        loadingIdeas: "El Ordenador está contemplando misiones peligrosas",
        chooseMission: "[ ELIGE TU MISIÓN, ACLARADOR ]",
        generateMoreIdeas: "GENERAR MÁS IDEAS",
        selectLanguage: "[ SELECCIONA EL IDIOMA DE LA MISIÓN ]",
        missionBriefing: "ASUNTO DE LA MISIÓN:",
        confirmTeam: "[ CONFIRMAR TAMAÑO DEL EQUIPO DE MISIÓN ]",
        selectTroubleshooters: "SELECCIONA EL NÚMERO DE ACLARADORES (DESECHABLES):",
        players: "JUGADORES",
        loadingScenario: "Analizando informe de misión",
        generatingVisuals: "Generando visuales de propaganda",
        errorTitle: "[ TRAICIÓN DETECTADA ]",
        unknownError: "Ocurrió un error desconocido.",
        retryButton: "> INTENTAR DE NUEVO",
        downloadButton: "DESCARGAR ESCENARIO (.ZIP)",
        newScenarioButton: "GENERAR NUEVO ESCENARIO",
        footer: "RECUERDA: LA FELICIDAD ES OBLIGATORIA. NO SER FELIZ ES TRAICIÓN.",
        improvingText: "Consultando al Ordenador para... mejoras",
        improveButton: "MEJORAR",
        accordionPresentation: "Presentación (Director de Juego)",
        accordionIntro: "Introducción (Jugadores)",
        accordionPCs: "Personajes Jugadores",
        accordionBriefings: "Informes Individuales de Jugadores",
        accordionSteps: "Pasos del Escenario",
        accordionInfoCards: "Fichas (PNJs, Lugares, Objetos)",
        accordionClues: "Pistas",
        accordionComputer: "Mensajes del Ordenador",
        accordionGallery: "Galería de Imágenes",
        step: "Paso",
        summaryTable: "Tabla Resumen",
        for: "Para",
        infoCard: "Ficha",
        clue: "Pista",
        contextPresentation: 'Presentación para el Director de Juego',
        contextIntroduction: 'Introducción para los Jugadores',
        contextStep: 'Paso del escenario',
        zipPresentation: "01_presentacion",
        zipIntroduction: "02_introduccion",
        zipPCs: "03_personajes_jugadores",
        zipBriefings: "04_informes",
        zipSteps: "05_pasos_escenario",
        zipInfoCards: "06_fichas",
        zipClues: "07_pistas",
        zipComputer: "08_mensajes_ordenador",
    },
    de: {
        languageName: "Deutsch",
        headerTitle: "[ PARANOIA-SZENARIO-GENERATOR ]",
        headerSubtitle: "Der Computer ist dein Freund. Der Computer hat eine Mission für dich. Das Scheitern deiner Mission ist Verrat. Verrat wird mit sofortiger Exekution bestraft.",
        getMissionButton: "EINE MISSION VOM COMPUTER ERHALTEN",
        loadingIdeas: "Der Computer denkt über gefährliche Missionen nach",
        chooseMission: "[ WÄHLE DEINE MISSION, TROUBLESHOOTER ]",
        generateMoreIdeas: "WEITERE IDEEN GENERIEREN",
        selectLanguage: "[ MISSIONSSPRACHE AUSWÄHLEN ]",
        missionBriefing: "MISSIONSBERICHT:",
        confirmTeam: "[ MISSIONS-TRUPPGRÖSSE BESTÄTIGEN ]",
        selectTroubleshooters: "ANZAHL DER (VERBRAUCHBAREN) TROUBLESHOOTER AUSWÄHLEN:",
        players: "SPIELER",
        loadingScenario: "Missionsbriefing wird analysiert",
        generatingVisuals: "Propaganda-Visuals werden generiert",
        errorTitle: "[ VERRAT ENTDECKT ]",
        unknownError: "Ein unbekannter Fehler ist aufgetreten.",
        retryButton: "> ERNEUT VERSUCHEN",
        downloadButton: "SZENARIO HERUNTERLADEN (.ZIP)",
        newScenarioButton: "NEUES SZENARIO GENERIEREN",
        footer: "ERINNERUNG: GLÜCK IST PFLICHT. NICHT GLÜCKLICH ZU SEIN IST VERRAT.",
        improvingText: "Der Computer wird für... Verbesserungen konsultiert",
        improveButton: "VERBESSERN",
        accordionPresentation: "Präsentation (Spielleiter)",
        accordionIntro: "Einführung (Spieler)",
        accordionPCs: "Spielercharaktere",
        accordionBriefings: "Individuelle Spieler-Briefings",
        accordionSteps: "Szenario-Schritte",
        accordionInfoCards: "Infokarten (NSCs, Orte, Gegenstände)",
        accordionClues: "Hinweise",
        accordionComputer: "Computer-Nachrichten",
        accordionGallery: "Bildergalerie",
        step: "Schritt",
        summaryTable: "Zusammenfassungstabelle",
        for: "Für",
        infoCard: "Infokarte",
        clue: "Hinweis",
        contextPresentation: 'Präsentation für den Spielleiter',
        contextIntroduction: 'Einführung für die Spieler',
        contextStep: 'Szenario-Schritt',
        zipPresentation: "01_praesentation",
        zipIntroduction: "02_einfuehrung",
        zipPCs: "03_spielercharaktere",
        zipBriefings: "04_briefings",
        zipSteps: "05_szenario_schritte",
        zipInfoCards: "06_infokarten",
        zipClues: "07_hinweise",
        zipComputer: "08_computer_nachrichten",
    }
};


const Header: React.FC<{ t: any }> = ({ t }) => (
    <header className="text-center my-8">
        <div className="inline-block border-2 border-terminal-amber p-2">
           <h1>{t.headerTitle}</h1>
        </div>
        <p className="mt-4 max-w-2xl mx-auto">{t.headerSubtitle}</p>
    </header>
);

const App: React.FC = () => {
    const [appState, setAppState] = useState<AppState>('idle');
    const [language, setLanguage] = useState<Language>('en');
    const [scenarioIdeas, setScenarioIdeas] = useState<string[]>([]);
    const [selectedIdea, setSelectedIdea] = useState<string | null>(null);
    const [generatedScenario, setGeneratedScenario] = useState<Scenario | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [improvingSection, setImprovingSection] = useState<{ section: string; index?: number } | null>(null);

    const t = translations[language];

    const handleGenerateIdeas = useCallback(async () => {
        setAppState('loadingIdeas');
        setError(null);
        setGeneratedScenario(null);
        setScenarioIdeas([]);
        setSelectedIdea(null);
        setLoadingMessage(t.loadingIdeas);
        try {
            const ideas = await generateScenarioIdeas(language);
            setScenarioIdeas(ideas);
            setAppState('ideasReady');
        } catch (err) {
            setError(err instanceof Error ? err.message : t.unknownError);
            setAppState('error');
        }
    }, [language, t]);
    
    const handleIdeaClick = useCallback((idea: string) => {
        setSelectedIdea(idea);
        setAppState('selectingLanguage');
    }, []);

    const handleLanguageSelect = useCallback((lang: Language) => {
        setLanguage(lang);
        setAppState('selectingPlayerCount');
    }, []);

    const handleGenerateScenario = useCallback(async (playerCount: number) => {
        if (!selectedIdea) return;
        
        setAppState('loadingScenario');
        setError(null);
        
        const currentT = translations[language]; // Use translations for the selected language
        try {
            setLoadingMessage(currentT.loadingScenario);
            const scenarioContent: ScenarioContent = await generateScenarioContent(selectedIdea, playerCount, language);

            setLoadingMessage(`${currentT.generatingVisuals} (0/${scenarioContent.imagesPrompts.length})`);
            const imagePromises = scenarioContent.imagesPrompts.map((imgPrompt, index) => 
                generateImage(imgPrompt.prompt).then(url => {
                    setLoadingMessage(`${currentT.generatingVisuals} (${index + 1}/${scenarioContent.imagesPrompts.length})`);
                    return { titre: imgPrompt.titre, url };
                })
            );

            const generatedImages = await Promise.all(imagePromises);

            const fullScenario: Scenario = {
                ...scenarioContent,
                images: generatedImages,
            };

            setGeneratedScenario(fullScenario);
            setAppState('scenarioReady');
        } catch (err) {
            setError(err instanceof Error ? err.message : currentT.unknownError);
            setAppState('error');
        }
    }, [selectedIdea, language]);

    const handleImproveText = useCallback(async (section: string, index?: number) => {
        if (!generatedScenario) return;

        setImprovingSection({ section, index });
        setError(null);
        const currentT = translations[language];

        try {
            let originalText = '';
            let context = '';
            
            switch(section) {
                case 'presentation':
                    originalText = generatedScenario.presentation;
                    context = currentT.contextPresentation;
                    break;
                case 'introduction':
                    originalText = generatedScenario.introduction;
                    context = currentT.contextIntroduction;
                    break;
                case 'etape':
                    if (index !== undefined) {
                        originalText = generatedScenario.etapes[index].description;
                        context = `${currentT.contextStep} ${index + 1}: ${generatedScenario.etapes[index].titre}`;
                    }
                    break;
            }

            if (!originalText) {
                throw new Error('Original text not found.');
            }

            const improvedText = await improveText(originalText, context, language);

            setGeneratedScenario(prev => {
                if (!prev) return null;
                const newScenario = { ...prev };
                switch(section) {
                    case 'presentation':
                        newScenario.presentation = improvedText;
                        break;
                    case 'introduction':
                        newScenario.introduction = improvedText;
                        break;
                    case 'etape':
                        if (index !== undefined) {
                            const newEtapes = [...newScenario.etapes];
                            newEtapes[index] = { ...newEtapes[index], description: improvedText };
                            newScenario.etapes = newEtapes;
                        }
                        break;
                }
                return newScenario;
            });

        } catch (err) {
            setError(err instanceof Error ? err.message : currentT.unknownError);
        } finally {
            setImprovingSection(null);
        }
    }, [generatedScenario, language]);
    
    const handleReset = useCallback(() => {
      setAppState('idle');
      setLanguage('en');
      setScenarioIdeas([]);
      setSelectedIdea(null);
      setGeneratedScenario(null);
      setError(null);
    }, []);

    const handleDownloadZip = useCallback(async () => {
        if (!generatedScenario) return;

        const zip = new JSZip();
        const sanitizeFilename = (name: string) => name.replace(/[^a-z0-9_ -]/gi, '_').toLowerCase();
        
        const currentT = translations[language];

        zip.file(`${currentT.zipPresentation}.md`, `# ${currentT.accordionPresentation}\n\n${generatedScenario.presentation}`);
        zip.file(`${currentT.zipIntroduction}.md`, `# ${currentT.accordionIntro}\n\n${generatedScenario.introduction}`);

        const joueursText = generatedScenario.joueurs.map(pc =>
`## ${pc.nom}
- **Description:** ${pc.description}
- **Mutation:** ${pc.mutation}
- **Société Secrète:** ${pc.societeSecrete}
- **Objectif (Société):** ${pc.objectifSocieteSecrete}
- **Objectif (Personnel):** ${pc.objectifPersonnel}
`
        ).join("\n---\n\n");
        zip.file(`${currentT.zipPCs}.md`, `# ${currentT.accordionPCs}\n\n${joueursText}`);
        
        const briefingsText = generatedScenario.briefings.map(b =>
`## ${currentT.accordionBriefings} ${currentT.for} : ${b.pourJoueur}
${b.contenu}
`
        ).join("\n---\n\n");
        zip.file(`${currentT.zipBriefings}.md`, `# ${currentT.accordionBriefings}\n\n${briefingsText}`);

        const etapesText = generatedScenario.etapes.map((etape, index) =>
`## ${currentT.step.toUpperCase()} ${index + 1}: ${etape.titre}
${etape.description}

### ${currentT.summaryTable}
${etape.actionsTable}
`
        ).join("\n---\n\n");
        zip.file(`${currentT.zipSteps}.md`, `# ${currentT.accordionSteps}\n\n${etapesText}`);

        const fichesText = generatedScenario.fiches.map(fiche =>
`## ${fiche.nom} [${fiche.type}]
${fiche.description}
`
        ).join("\n---\n\n");
        zip.file(`${currentT.zipInfoCards}.md`, `# ${currentT.accordionInfoCards}\n\n${fichesText}`);

        const indicesText = generatedScenario.indices.map(indice =>
`## ${currentT.clue}: ${indice.titre}
${indice.contenu}
`
        ).join("\n---\n\n");
        zip.file(`${currentT.zipClues}.md`, `# ${currentT.accordionClues}\n\n${indicesText}`);

        const messagesText = generatedScenario.messagesOrdinateur.map(msg => 
`\`\`\`
${msg}
\`\`\`
`
        ).join("\n");
        zip.file(`${currentT.zipComputer}.md`, `# ${currentT.accordionComputer}\n\n${messagesText}`);

        const imgFolder = zip.folder("images");
        if (imgFolder) {
            generatedScenario.images.forEach((image, index) => {
                const base64Data = image.url.split(';base64,').pop();
                if (base64Data) {
                    const filename = `${String(index + 1).padStart(2, '0')}_${sanitizeFilename(image.titre)}.jpeg`;
                    imgFolder.file(filename, base64Data, { base64: true });
                }
            });
        }

        const content = await zip.generateAsync({ type: "blob" });

        const link = document.createElement("a");
        link.href = URL.createObjectURL(content);
        link.download = `${sanitizeFilename(generatedScenario.titre)}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [generatedScenario, language]);

    return (
        <div className="min-h-screen bg-terminal-bg text-terminal-amber font-mono p-4 md:p-8">
            <div className="container mx-auto max-w-7xl">
                <Header t={t} />

                <main className="mt-8">
                    {appState === 'idle' && (
                        <div className="text-center">
                            <button
                                onClick={handleGenerateIdeas}
                                className="bg-transparent hover:bg-terminal-amber/10 text-terminal-amber py-3 px-6 border border-terminal-amber transition-colors duration-200 blinking-cursor"
                            >
                                {t.getMissionButton}
                            </button>
                        </div>
                    )}

                    {(appState === 'loadingIdeas' || appState === 'loadingScenario') && (
                        <LoadingSpinner message={loadingMessage} />
                    )}
                    
                    {appState === 'error' && (
                        <div className="text-center border-2 border-terminal-amber/50 p-6 max-w-2xl mx-auto">
                            <h3 className="mb-4">{t.errorTitle}</h3>
                            <p className="mb-6">{error}</p>
                            <button
                                onClick={handleReset}
                                className="bg-transparent hover:bg-terminal-amber/10 text-terminal-amber py-2 px-4 border border-terminal-amber/50 transition duration-200"
                            >
                                {t.retryButton}
                            </button>
                        </div>
                    )}

                    {appState === 'ideasReady' && (
                        <div className="flex flex-col items-center">
                            <h3 className="mb-6 text-center">{t.chooseMission}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                                {scenarioIdeas.map((idea, index) => (
                                    <div
                                        key={index}
                                        onClick={() => handleIdeaClick(idea)}
                                        className="p-6 border border-terminal-amber/30 hover:bg-terminal-amber/10 hover:border-terminal-amber cursor-pointer transition-all duration-300"
                                    >
                                        <p>> {idea}</p>
                                    </div>
                                ))}
                            </div>
                              <button
                                onClick={handleGenerateIdeas}
                                className="mt-8 bg-transparent hover:bg-terminal-amber/10 text-terminal-amber/70 py-2 px-4 border border-terminal-amber/30 transition duration-200"
                            >
                                {t.generateMoreIdeas}
                            </button>
                        </div>
                    )}

                    {appState === 'selectingLanguage' && (
                        <div className="flex flex-col items-center">
                            <h3 className="mb-4 text-center">{t.selectLanguage}</h3>
                            <div className="p-6 border border-terminal-amber/30 w-full max-w-4xl mb-6">
                                <p className="text-terminal-amber/70 mb-2">{t.missionBriefing}</p>
                                <p>> {selectedIdea}</p>
                            </div>
                            <div className="flex flex-wrap justify-center gap-4">
                                {(Object.keys(translations) as Language[]).map(lang => (
                                    <button
                                        key={lang}
                                        onClick={() => handleLanguageSelect(lang)}
                                        className="bg-transparent hover:bg-terminal-amber/10 text-terminal-amber py-3 px-8 border border-terminal-amber/50 hover:border-terminal-amber transition-all duration-200"
                                    >
                                        {translations[lang].languageName}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {appState === 'selectingPlayerCount' && (
                      <div className="flex flex-col items-center">
                        <h3 className="mb-4 text-center">{t.confirmTeam}</h3>
                        <div className="p-6 border border-terminal-amber/30 w-full max-w-4xl mb-6">
                            <p className="text-terminal-amber/70 mb-2">{t.missionBriefing}</p>
                            <p>> {selectedIdea}</p>
                        </div>
                        <h4 className="mb-6">{t.selectTroubleshooters}</h4>
                        <div className="flex flex-wrap justify-center gap-4">
                            {[3, 4, 5, 6].map(count => (
                                <button
                                    key={count}
                                    onClick={() => handleGenerateScenario(count)}
                                    className="bg-transparent hover:bg-terminal-amber/10 text-terminal-amber py-3 px-8 border border-terminal-amber/50 hover:border-terminal-amber transition-all duration-200"
                                >
                                    {count} {t.players}
                                </button>
                            ))}
                        </div>
                      </div>
                    )}
                    
                    {appState === 'scenarioReady' && generatedScenario && (
                        <>
                            <ScenarioDisplay scenario={generatedScenario} handleImproveText={handleImproveText} improvingSection={improvingSection} t={t} />
                            <div className="text-center mt-12 flex flex-col md:flex-row justify-center gap-4">
                                <button
                                    onClick={handleDownloadZip}
                                    className="bg-transparent hover:bg-terminal-amber/10 text-terminal-amber py-3 px-6 border border-terminal-amber transition-colors duration-200"
                                >
                                    {t.downloadButton}
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="bg-transparent hover:bg-terminal-amber/10 text-terminal-amber py-3 px-6 border border-terminal-amber transition-colors duration-200"
                                >
                                    {t.newScenarioButton}
                                </button>
                            </div>
                        </>
                    )}
                </main>

                <footer className="text-center text-terminal-amber/40 mt-16 pb-4">
                  <p>{t.footer}</p>
                </footer>
            </div>
        </div>
    );
};

export default App;
