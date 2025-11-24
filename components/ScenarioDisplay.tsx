
import React, { useState, useCallback } from 'react';
import type { Scenario, PlayerCharacter, Briefing, ScenarioStep, InfoCard, Clue, Ending } from '../types';
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
        <h3 className="uppercase">{isOpen ? '[-]' : '[+]'} {title}</h3>
      </div>
    </button>
    {isOpen && <div className="p-4 text-terminal-amber/90 whitespace-pre-wrap">{children}</div>}
  </div>
);

const PlayerCharacterCard: React.FC<{ pc: PlayerCharacter }> = ({ pc }) => (
    <div className="border border-terminal-amber/30 p-4 mb-4 break-inside-avoid">
        <h4 className="border-b border-terminal-amber/30 pb-2 mb-2 uppercase">{pc.nom}</h4>
        <p className="mt-2"><u>Description:</u> {pc.description}</p>
        <p className="mt-2"><u>Mutation:</u> {pc.mutation}</p>
        <p className="mt-2"><u>Société Secrète:</u> {pc.societeSecrete}</p>
        <p className="mt-2"><u>Objectif (Société):</u> {pc.objectifSocieteSecrete}</p>
        <p className="mt-2"><u>Objectif (Personnel):</u> {pc.objectifPersonnel}</p>
    </div>
);

const BriefingCard: React.FC<{ briefing: Briefing, t: any }> = ({ briefing, t }) => (
    <div className="border border-terminal-amber/30 p-4 mb-4 break-inside-avoid">
        <h4 className="border-b border-terminal-amber/30 pb-2 mb-2 uppercase">{t.for.toUpperCase()}: {briefing.pourJoueur}</h4>
        <p className="whitespace-pre-wrap mt-2">{briefing.contenu}</p>
    </div>
);


const InfoDisplayCard: React.FC<{ card: InfoCard, t: any }> = ({ card, t }) => (
    <div className="border border-terminal-amber/30 p-4 mb-4 break-inside-avoid">
         <h4 className="border-b border-terminal-amber/30 pb-2 mb-2 uppercase">{t.infoCard.toUpperCase()}: {card.nom} [{card.type}]</h4>
        <p className="mt-2">{card.description}</p>
    </div>
);

const ClueCard: React.FC<{ clue: Clue, t: any }> = ({ clue, t }) => (
    <div className="border-2 border-dashed border-terminal-amber/50 p-4 mb-4 break-inside-avoid">
        <h4 className="border-b border-terminal-amber/30 pb-2 mb-2 uppercase">{t.clue.toUpperCase()}: {clue.titre}</h4>
        <p className="whitespace-pre-wrap mt-2">{clue.contenu}</p>
    </div>
);

const EndingCard: React.FC<{ ending: Ending }> = ({ ending }) => (
    <div className="border border-terminal-amber/30 p-4 mb-4 break-inside-avoid bg-terminal-amber/5">
        <h4 className="border-b border-terminal-amber/30 pb-2 mb-2 uppercase">{ending.titre}</h4>
        <p className="mt-2 mb-2 text-terminal-amber/70"><u>Condition:</u> {ending.condition}</p>
        <p className="mt-2">{ending.description}</p>
    </div>
);


interface ScenarioDisplayProps {
  scenario: Scenario;
  handleImproveText: (section: string, index?: number) => void;
  improvingSection: { section: string; index?: number } | null;
  t: any; // Translation object
  playerCount: number;
}

const ScenarioDisplay: React.FC<ScenarioDisplayProps> = ({ scenario, handleImproveText, improvingSection, t, playerCount }) => {
    const [openSection, setOpenSection] = useState<string | null>(t.accordionIntro);

    const toggleSection = useCallback((title: string) => {
        setOpenSection(prev => (prev === title ? null : title));
    }, []);

    const ImproveButton = ({ section, index }: { section: string; index?: number }) => (
        <div className="text-right mt-4">
            <button
                onClick={() => handleImproveText(section, index)}
                disabled={!!improvingSection}
                className="bg-transparent hover:bg-terminal-amber/10 text-terminal-amber/80 py-1 px-3 border border-terminal-amber/30 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed uppercase"
            >
                [ {t.improveButton} ]
            </button>
        </div>
    );

    return (
        <div className="w-full">
            {/* Cover Section - Terminal Style */}
            <div className="mb-12 border-2 border-terminal-amber p-4 bg-black relative">
                <div className="border-b-2 border-terminal-amber pb-4 mb-4 text-center">
                    <h1 className="uppercase tracking-widest text-terminal-amber">
                        // {scenario.titre} //
                    </h1>
                </div>

                {scenario.coverImage && (
                    <div className="w-full mb-4 border border-terminal-amber p-1">
                         <img src={scenario.coverImage} alt={scenario.titre} className="w-full h-auto opacity-90" />
                    </div>
                )}
                
                <div className="border-l-2 border-terminal-amber pl-4 py-2 mb-4">
                    <p className="uppercase mb-2 text-terminal-amber/70">[ MISSION_BRIEFING_SUMMARY ]</p>
                    <p>{scenario.pitch}</p>
                </div>
                
                <div className="border-t-2 border-terminal-amber pt-4 text-center uppercase">
                    <span className="mr-4">[ TROUBLESHOOTERS: {playerCount} ]</span>
                    <span>[ CLEARANCE: MANDATORY ]</span>
                </div>
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
                        <h3 className="underline uppercase">{t.step.toUpperCase()} {index + 1}: {step.titre}</h3>
                        {improvingSection?.section === 'etape' && improvingSection?.index === index ? (
                            <LoadingSpinner message={t.improvingText} />
                        ) : (
                            <>
                                <p className="mt-2 whitespace-pre-wrap">{step.description}</p>
                                {step.options && step.options.length > 0 && (
                                    <div className="mt-6 space-y-4">
                                        {step.options.map((option, optIndex) => (
                                            <div key={optIndex} className="border-l-2 border-terminal-amber/50 pl-4 bg-terminal-amber/5 p-2">
                                                <p className="uppercase text-terminal-amber">{option.label}</p>
                                                <p className="mt-1 italic text-terminal-amber/80">{option.action}</p>
                                                <p className="mt-2 text-terminal-amber/90">-> {option.consequence}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <ImproveButton section="etape" index={index} />
                            </>
                        )}
                        <div className="mt-4 p-4 border border-terminal-amber/30 bg-black/50">
                            <h4 className="mb-2 text-terminal-amber/80 uppercase">{t.summaryTable.toUpperCase()} (MARKDOWN)</h4>
                            <pre className="whitespace-pre-wrap leading-relaxed">{step.actionsTable}</pre>
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
            
            {scenario.finsAlternatives && scenario.finsAlternatives.length > 0 && (
                <AccordionSection title={t.accordionEndings} isOpen={openSection === t.accordionEndings} setIsOpen={() => toggleSection(t.accordionEndings)}>
                    <div className="grid grid-cols-1 gap-4">
                        {scenario.finsAlternatives.map((ending, index) => <EndingCard key={index} ending={ending} />)}
                    </div>
                </AccordionSection>
            )}
        </div>
    );
};

export default ScenarioDisplay;
