
import React, { useState, useCallback } from 'react';
import { generateScenarioIdeas, generateScenarioContent, generateImage } from './services/geminiService';
import type { Scenario, ScenarioContent } from './types';
import LoadingSpinner from './components/LoadingSpinner';
import ScenarioDisplay from './components/ScenarioDisplay';

declare var JSZip: any;

type AppState = 'idle' | 'loadingIdeas' | 'ideasReady' | 'selectingPlayerCount' | 'loadingScenario' | 'scenarioReady' | 'error';

const Header: React.FC = () => (
    <header className="text-center my-8">
        <div className="inline-block border-2 border-terminal-amber p-2">
           <h1>[ PARANOIA SCENARIO GENERATOR ]</h1>
        </div>
        <p className="mt-4 max-w-2xl mx-auto">L'Ordinateur est votre ami. L'Ordinateur a une mission pour vous. Ne pas accomplir votre mission est une trahison. La trahison est punie par l'exécution.</p>
    </header>
);

const App: React.FC = () => {
    const [appState, setAppState] = useState<AppState>('idle');
    const [scenarioIdeas, setScenarioIdeas] = useState<string[]>([]);
    const [selectedIdea, setSelectedIdea] = useState<string | null>(null);
    const [generatedScenario, setGeneratedScenario] = useState<Scenario | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loadingMessage, setLoadingMessage] = useState<string>('');

    const handleGenerateIdeas = useCallback(async () => {
        setAppState('loadingIdeas');
        setError(null);
        setGeneratedScenario(null);
        setScenarioIdeas([]);
        setSelectedIdea(null);
        setLoadingMessage("L'Ordinateur réfléchit à des missions périlleuses");
        try {
            const ideas = await generateScenarioIdeas();
            setScenarioIdeas(ideas);
            setAppState('ideasReady');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur inconnue est survenue.');
            setAppState('error');
        }
    }, []);
    
    const handleIdeaClick = useCallback((idea: string) => {
        setSelectedIdea(idea);
        setAppState('selectingPlayerCount');
    }, []);

    const handleGenerateScenario = useCallback(async (playerCount: number) => {
        if (!selectedIdea) return;
        
        setAppState('loadingScenario');
        setError(null);
        
        try {
            setLoadingMessage("Analyse du briefing de mission");
            const scenarioContent: ScenarioContent = await generateScenarioContent(selectedIdea, playerCount);

            setLoadingMessage(`Génération des visuels de propagande (0/${scenarioContent.imagesPrompts.length})`);
            const imagePromises = scenarioContent.imagesPrompts.map((imgPrompt, index) => 
                generateImage(imgPrompt.prompt).then(url => {
                    setLoadingMessage(`Génération des visuels de propagande (${index + 1}/${scenarioContent.imagesPrompts.length})`);
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
            setError(err instanceof Error ? err.message : 'Une erreur inconnue est survenue.');
            setAppState('error');
        }
    }, [selectedIdea]);
    
    const handleReset = useCallback(() => {
      setAppState('idle');
      setScenarioIdeas([]);
      setSelectedIdea(null);
      setGeneratedScenario(null);
      setError(null);
    }, []);

    const handleDownloadZip = useCallback(async () => {
        if (!generatedScenario) return;

        setLoadingMessage("Compression des données de mission...");
        
        const zip = new JSZip();

        const sanitizeFilename = (name: string) => name.replace(/[^a-z0-9_ -]/gi, '_').toLowerCase();

        // 1. Add text files
        zip.file("01_presentation.txt", generatedScenario.presentation);
        zip.file("02_introduction.txt", generatedScenario.introduction);

        const joueursText = generatedScenario.joueurs.map(pc =>
            `NOM: ${pc.nom}\n\nDESCRIPTION: ${pc.description}\n\nMUTATION: ${pc.mutation}\n\nSOCIETE SECRETE: ${pc.societeSecrete}\nOBJECTIF (SOCIETE): ${pc.objectifSocieteSecrete}\n\nOBJECTIF (PERSONNEL): ${pc.objectifPersonnel}\n\n--------------------------------\n`
        ).join("\n");
        zip.file("03_personnages_joueurs.txt", joueursText);
        
        const briefingsText = generatedScenario.briefings.map(b =>
            `POUR: ${b.pourJoueur}\n\n${b.contenu}\n\n--------------------------------\n`
        ).join("\n");
        zip.file("04_briefings.txt", briefingsText);

        const etapesText = generatedScenario.etapes.map((etape, index) =>
            `ETAPE ${index + 1}: ${etape.titre}\n\n${etape.description}\n\nTABLEAU RECAPITULATIF:\n${etape.actionsTable}\n\n--------------------------------\n`
        ).join("\n");
        zip.file("05_etapes_scenario.txt", etapesText);

        const fichesText = generatedScenario.fiches.map(fiche =>
            `FICHE: ${fiche.nom} [${fiche.type}]\n\n${fiche.description}\n\n--------------------------------\n`
        ).join("\n");
        zip.file("06_fiches.txt", fichesText);

        const indicesText = generatedScenario.indices.map(indice =>
            `INDICE: ${indice.titre}\n\n${indice.contenu}\n\n--------------------------------\n`
        ).join("\n");
        zip.file("07_indices.txt", indicesText);

        const messagesText = generatedScenario.messagesOrdinateur.join("\n\n---\n\n");
        zip.file("08_messages_ordinateur.txt", messagesText);

        // 2. Add images
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

        // 3. Generate and download zip
        const content = await zip.generateAsync({ type: "blob" });

        const link = document.createElement("a");
        link.href = URL.createObjectURL(content);
        link.download = `${sanitizeFilename(generatedScenario.titre)}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setLoadingMessage(""); // Clear message after download
    }, [generatedScenario]);

    return (
        <div className="min-h-screen bg-terminal-bg text-terminal-amber font-mono p-4 md:p-8">
            <div className="container mx-auto max-w-7xl">
                <Header />

                <main className="mt-8">
                    {appState === 'idle' && (
                        <div className="text-center">
                            <button
                                onClick={handleGenerateIdeas}
                                className="bg-transparent hover:bg-terminal-amber/10 text-terminal-amber py-3 px-6 border border-terminal-amber transition-colors duration-200 blinking-cursor"
                            >
                                RECEVOIR UNE MISSION DE L'ORDINATEUR
                            </button>
                        </div>
                    )}

                    {(appState === 'loadingIdeas' || appState === 'loadingScenario') && (
                        <LoadingSpinner message={loadingMessage} />
                    )}
                    
                    {appState === 'error' && (
                        <div className="text-center border-2 border-terminal-amber/50 p-6 max-w-2xl mx-auto">
                            <h3 className="mb-4">[ ERREUR DE TRAHISON DÉTECTÉE ]</h3>
                            <p className="mb-6">{error}</p>
                            <button
                                onClick={handleReset}
                                className="bg-transparent hover:bg-terminal-amber/10 text-terminal-amber py-2 px-4 border border-terminal-amber/50 transition duration-200"
                            >
                                > RECOMMENCER
                            </button>
                        </div>
                    )}

                    {appState === 'ideasReady' && (
                        <div className="flex flex-col items-center">
                            <h3 className="mb-6 text-center">[ CHOISISSEZ VOTRE MISSION, CLARIFICATEUR ]</h3>
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
                                GENERER D'AUTRES IDEES
                            </button>
                        </div>
                    )}

                    {appState === 'selectingPlayerCount' && (
                      <div className="flex flex-col items-center">
                        <h3 className="mb-4 text-center">[ CONFIRMEZ L'EFFECTIF DE LA MISSION ]</h3>
                        <div className="p-6 border border-terminal-amber/30 w-full max-w-4xl mb-6">
                            <p className="text-terminal-amber/70 mb-2">SUJET DE LA MISSION:</p>
                            <p>> {selectedIdea}</p>
                        </div>
                        <h4 className="mb-6">SÉLECTIONNEZ LE NOMBRE DE CLARIFICATEURS (JETABLES) :</h4>
                        <div className="flex flex-wrap justify-center gap-4">
                            {[3, 4, 5, 6].map(count => (
                                <button
                                    key={count}
                                    onClick={() => handleGenerateScenario(count)}
                                    className="bg-transparent hover:bg-terminal-amber/10 text-terminal-amber py-3 px-8 border border-terminal-amber/50 hover:border-terminal-amber transition-all duration-200"
                                >
                                    {count} JOUEURS
                                </button>
                            ))}
                        </div>
                      </div>
                    )}
                    
                    {appState === 'scenarioReady' && generatedScenario && (
                        <>
                            <ScenarioDisplay scenario={generatedScenario} />
                            <div className="text-center mt-12 flex flex-col md:flex-row justify-center gap-4">
                                <button
                                    onClick={handleDownloadZip}
                                    className="bg-transparent hover:bg-terminal-amber/10 text-terminal-amber py-3 px-6 border border-terminal-amber transition-colors duration-200"
                                >
                                    TELECHARGER LE SCENARIO (.ZIP)
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="bg-transparent hover:bg-terminal-amber/10 text-terminal-amber py-3 px-6 border border-terminal-amber transition-colors duration-200"
                                >
                                    GENERER UN NOUVEAU SCENARIO
                                </button>
                            </div>
                        </>
                    )}
                </main>

                <footer className="text-center text-terminal-amber/40 mt-16 pb-4">
                  <p>RAPPEL : LE BONHEUR EST OBLIGATOIRE. NE PAS ETRE HEUREUX EST UNE TRAHISON.</p>
                </footer>
            </div>
        </div>
    );
};

export default App;
