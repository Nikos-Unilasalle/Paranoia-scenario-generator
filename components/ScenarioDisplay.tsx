import React, { useState, useCallback } from 'react';
import type { Scenario, PlayerCharacter, ScenarioStep, InfoCard, Clue, GeneratedImage } from '../types';

interface AccordionSectionProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  setIsOpen: () => void;
}

const AccordionSection: React.FC<AccordionSectionProps> = ({ title, children, isOpen, setIsOpen }) => (
  <div className="border border-terminal-amber/30 mb-4">
    <button
      onClick={setIsOpen}
      className="w-full text-left p-2 bg-terminal-amber/10 hover:bg-terminal-amber/20 transition-colors duration-200"
    >
      <div className="flex justify-between items-center">
        <h3>{isOpen ? '[-]' : '[+]'} {title}</h3>
      </div>
    </button>
    {isOpen && <div className="p-4 text-terminal-amber/90 whitespace-pre-wrap">{children}</div>}
  </div>
);

const PlayerCharacterCard: React.FC<{ pc: PlayerCharacter }> = ({ pc }) => (
    <div className="border border-terminal-amber/30 p-4 mb-4 break-inside-avoid">
        <h4 className="border-b border-terminal-amber/30 pb-2 mb-2">{pc.nom}</h4>
        <p className="mt-2"><strong>Description:</strong> {pc.description}</p>
        <p className="mt-2"><strong>Mutation:</strong> {pc.mutation}</p>
        <p className="mt-2"><strong>Société Secrète:</strong> {pc.societeSecrete}</p>
        <p className="mt-2"><strong>Objectif (Société):</strong> {pc.objectifSocieteSecrete}</p>
        <p className="mt-2"><strong>Objectif (Personnel):</strong> {pc.objectifPersonnel}</p>
    </div>
);

const InfoDisplayCard: React.FC<{ card: InfoCard }> = ({ card }) => (
    <div className="border border-terminal-amber/30 p-4 mb-4 break-inside-avoid">
         <h4 className="border-b border-terminal-amber/30 pb-2 mb-2">FICHE: {card.nom} [{card.type}]</h4>
        <p className="mt-2">{card.description}</p>
    </div>
);

const ClueCard: React.FC<{ clue: Clue }> = ({ clue }) => (
    <div className="border-2 border-dashed border-terminal-amber/50 p-4 mb-4 break-inside-avoid">
        <h4 className="border-b border-terminal-amber/30 pb-2 mb-2">INDICE: {clue.titre}</h4>
        <p className="whitespace-pre-wrap mt-2">{clue.contenu}</p>
    </div>
);

const ComputerMessageCard: React.FC<{ message: string }> = ({ message }) => (
    <div className="p-4 border border-terminal-amber/30 mb-4 break-inside-avoid">
        <pre className="whitespace-pre-wrap">{message}</pre>
    </div>
);

const ImageCard: React.FC<{ image: GeneratedImage }> = ({ image }) => (
    <div className="border border-terminal-amber/30 mb-4 break-inside-avoid">
        <img src={image.url} alt={image.titre} className="w-full h-auto object-cover" />
        <div className="p-2 border-t border-terminal-amber/30">
            <h4 className="text-center">{image.titre}</h4>
        </div>
    </div>
);


interface ScenarioDisplayProps {
  scenario: Scenario;
}

const ScenarioDisplay: React.FC<ScenarioDisplayProps> = ({ scenario }) => {
    const [openSection, setOpenSection] = useState<string | null>('Introduction (Joueurs)');

    const toggleSection = useCallback((title: string) => {
        setOpenSection(prev => (prev === title ? null : title));
    }, []);

    return (
        <div className="w-full">
            <div className="border-2 border-terminal-amber p-2 text-center mb-8">
                <h1>{scenario.titre}</h1>
            </div>

            <AccordionSection title="Présentation (Maître du jeu)" isOpen={openSection === 'Présentation (Maître du jeu)'} setIsOpen={() => toggleSection('Présentation (Maître du jeu)')}>
                <p>{scenario.presentation}</p>
            </AccordionSection>

            <AccordionSection title="Introduction (Joueurs)" isOpen={openSection === 'Introduction (Joueurs)'} setIsOpen={() => toggleSection('Introduction (Joueurs)')}>
                <p>{scenario.introduction}</p>
            </AccordionSection>

            <AccordionSection title="Personnages Joueurs" isOpen={openSection === 'Personnages Joueurs'} setIsOpen={() => toggleSection('Personnages Joueurs')}>
                <div className="md:columns-2 gap-4">
                   {scenario.joueurs.map((pc) => <PlayerCharacterCard key={pc.nom} pc={pc} />)}
                </div>
            </AccordionSection>
            
            <AccordionSection title="Étapes du Scénario" isOpen={openSection === 'Étapes du Scénario'} setIsOpen={() => toggleSection('Étapes du Scénario')}>
                 {scenario.etapes.map((step, index) => (
                    <div key={index} className="mb-6">
                        <h3 className="underline">ETAPE {index + 1}: {step.titre}</h3>
                        <p className="mt-2">{step.description}</p>
                    </div>
                ))}
            </AccordionSection>

            <AccordionSection title="Fiches (PNJ, Lieux, Objets)" isOpen={openSection === 'Fiches (PNJ, Lieux, Objets)'} setIsOpen={() => toggleSection('Fiches (PNJ, Lieux, Objets)')}>
                <div className="md:columns-2 lg:columns-3 gap-4">
                    {scenario.fiches.map((card, index) => <InfoDisplayCard key={index} card={card} />)}
                </div>
            </AccordionSection>

            <AccordionSection title="Indices" isOpen={openSection === 'Indices'} setIsOpen={() => toggleSection('Indices')}>
                <div className="md:columns-2 gap-4">
                    {scenario.indices.map((clue, index) => <ClueCard key={index} clue={clue} />)}
                </div>
            </AccordionSection>
            
            <AccordionSection title="Messages de l'Ordinateur" isOpen={openSection === 'Messages de l\'Ordinateur'} setIsOpen={() => toggleSection('Messages de l\'Ordinateur')}>
                <div className="md:columns-2 lg:columns-3 gap-4">
                    {scenario.messagesOrdinateur.map((msg, index) => <ComputerMessageCard key={index} message={msg} />)}
                </div>
            </AccordionSection>

            <AccordionSection title="Galerie d'Images" isOpen={openSection === 'Galerie d\'Images'} setIsOpen={() => toggleSection('Galerie d\'Images')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {scenario.images.map((img, index) => <ImageCard key={index} image={img} />)}
                </div>
            </AccordionSection>
        </div>
    );
};

export default ScenarioDisplay;