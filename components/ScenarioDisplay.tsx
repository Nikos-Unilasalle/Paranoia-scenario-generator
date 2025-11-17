
import React, { useState, useCallback } from 'react';
import type { Scenario, PlayerCharacter, Briefing, ScenarioStep, InfoCard, Clue, GeneratedImage } from '../types';
import LoadingSpinner from './LoadingSpinner';

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

const BriefingCard: React.FC<{ briefing: Briefing, t: any }> = ({ briefing, t }) => (
    <div className="border border-terminal-amber/30 p-4 mb-4 break-inside-avoid">
        <h4 className="border-b border-terminal-amber/30 pb-2 mb-2">{t.for.toUpperCase()}: {briefing.pourJoueur}</h4>
        <p className="whitespace-pre-wrap mt-2">{briefing.contenu}</p>
    </div>
);


const InfoDisplayCard: React.FC<{ card: InfoCard, t: any }> = ({ card, t }) => (
    <div className="border border-terminal-amber/30 p-4 mb-4 break-inside-avoid">
         <h4 className="border-b border-terminal-amber/30 pb-2 mb-2">{t.infoCard.toUpperCase()}: {card.nom} [{card.type}]</h4>
        <p className="mt-2">{card.description}</p>
    </div>
);

const ClueCard: React.FC<{ clue: Clue, t: any }> = ({ clue, t }) => (
    <div className="border-2 border-dashed border-terminal-amber/50 p-4 mb-4 break-inside-avoid">
        <h4 className="border-b border-terminal-amber/30 pb-2 mb-2">{t.clue.toUpperCase()}: {clue.titre}</h4>
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
  handleImproveText: (section: string, index?: number) => void;
  improvingSection: { section: string; index?: number } | null;
  t: any; // Translation object
}

const ScenarioDisplay: React.FC<ScenarioDisplayProps> = ({ scenario, handleImproveText, improvingSection, t }) => {
    const [openSection, setOpenSection] = useState<string | null>(t.accordionIntro);

    const toggleSection = useCallback((title: string) => {
        setOpenSection(prev => (prev === title ? null : title));
    }, []);

    const ImproveButton = ({ section, index }: { section: string; index?: number }) => (
        <div className="text-right mt-4">
            <button
                onClick={() => handleImproveText(section, index)}
                disabled={!!improvingSection}
                className="bg-transparent hover:bg-terminal-amber/10 text-terminal-amber/80 text-sm py-1 px-3 border border-terminal-amber/30 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                [ {t.improveButton} ]
            </button>
        </div>
    );

    return (
        <div className="w-full">
            <div className="border-2 border-terminal-amber p-2 text-center mb-8">
                <h1>{scenario.titre}</h1>
            </div>

            <AccordionSection title={t.accordionPresentation} isOpen={openSection === t.accordionPresentation} setIsOpen={() => toggleSection(t.accordionPresentation)}>
                {improvingSection?.section === 'presentation' ? (
                    <LoadingSpinner message={t.improvingText} />
                ) : (
                    <>
                        <p>{scenario.presentation}</p>
                        <ImproveButton section="presentation" />
                    </>
                )}
            </AccordionSection>

            <AccordionSection title={t.accordionIntro} isOpen={openSection === t.accordionIntro} setIsOpen={() => toggleSection(t.accordionIntro)}>
                 {improvingSection?.section === 'introduction' ? (
                    <LoadingSpinner message={t.improvingText} />
                ) : (
                    <>
                        <p>{scenario.introduction}</p>
                        <ImproveButton section="introduction" />
                    </>
                )}
            </AccordionSection>

            <AccordionSection title={t.accordionPCs} isOpen={openSection === t.accordionPCs} setIsOpen={() => toggleSection(t.accordionPCs)}>
                <div className="md:columns-2 gap-4">
                   {scenario.joueurs.map((pc) => <PlayerCharacterCard key={pc.nom} pc={pc} />)}
                </div>
            </AccordionSection>
            
            <AccordionSection title={t.accordionBriefings} isOpen={openSection === t.accordionBriefings} setIsOpen={() => toggleSection(t.accordionBriefings)}>
                <div className="md:columns-2 gap-4">
                    {scenario.briefings.map((briefing, index) => <BriefingCard key={index} briefing={briefing} t={t}/>)}
                </div>
            </AccordionSection>

            <AccordionSection title={t.accordionSteps} isOpen={openSection === t.accordionSteps} setIsOpen={() => toggleSection(t.accordionSteps)}>
                 {scenario.etapes.map((step, index) => (
                    <div key={index} className="mb-8 border-b border-terminal-amber/20 pb-4">
                        <h3 className="underline">{t.step.toUpperCase()} {index + 1}: {step.titre}</h3>
                        {improvingSection?.section === 'etape' && improvingSection?.index === index ? (
                            <LoadingSpinner message={t.improvingText} />
                        ) : (
                            <>
                                <p className="mt-2">{step.description}</p>
                                <ImproveButton section="etape" index={index} />
                            </>
                        )}
                        <div className="mt-4 p-4 border border-terminal-amber/30 bg-black/50">
                            <h4 className="mb-2 text-terminal-amber/80">{t.summaryTable.toUpperCase()} (MARKDOWN)</h4>
                            <pre className="whitespace-pre-wrap text-sm leading-relaxed">{step.actionsTable}</pre>
                        </div>
                    </div>
                ))}
            </AccordionSection>

            <AccordionSection title={t.accordionInfoCards} isOpen={openSection === t.accordionInfoCards} setIsOpen={() => toggleSection(t.accordionInfoCards)}>
                <div className="md:columns-2 lg:columns-3 gap-4">
                    {scenario.fiches.map((card, index) => <InfoDisplayCard key={index} card={card} t={t} />)}
                </div>
            </AccordionSection>

            <AccordionSection title={t.accordionClues} isOpen={openSection === t.accordionClues} setIsOpen={() => toggleSection(t.accordionClues)}>
                <div className="md:columns-2 gap-4">
                    {scenario.indices.map((clue, index) => <ClueCard key={index} clue={clue} t={t}/>)}
                </div>
            </AccordionSection>
            
            <AccordionSection title={t.accordionComputer} isOpen={openSection === t.accordionComputer} setIsOpen={() => toggleSection(t.accordionComputer)}>
                <div className="md:columns-2 lg:columns-3 gap-4">
                    {scenario.messagesOrdinateur.map((msg, index) => <ComputerMessageCard key={index} message={msg} />)}
                </div>
            </AccordionSection>

            <AccordionSection title={t.accordionGallery} isOpen={openSection === t.accordionGallery} setIsOpen={() => toggleSection(t.accordionGallery)}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {scenario.images.map((img, index) => <ImageCard key={index} image={img} />)}
                </div>
            </AccordionSection>
        </div>
    );
};

export default ScenarioDisplay;
