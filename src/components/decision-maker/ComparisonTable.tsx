import React, { useState, useEffect, useRef } from 'react';
import { IBreakdownItem, IResult } from '@/types/decision';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2, Navigation, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { firstResultService, BestLinksResponse } from '@/services/firstResultService';
import { actionLinksCacheService } from '@/services/actionLinksCacheService';
import { loadActionLinksFromCache, preloadAllActionLinks } from '@/utils/actionLinksLoader';
import { I18nService } from '@/services/i18nService';
import { MerchantLogo } from '@/components/MerchantLogo';
import { useI18nUI } from '@/contexts/I18nUIContext';
import { VoteButton } from './VoteButton';
import { votingService, VotingPermissions, VoteCount } from '@/services/votingService';
import { useAuth } from '@/hooks/useAuth';

interface ComparisonTableProps {
  breakdown: IBreakdownItem[];
  dilemma?: string;
  result?: IResult;
  onUpdateResult?: (updatedResult: IResult) => void;
  decisionId?: string;
  showVoting?: boolean;
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({
  breakdown,
  dilemma,
  result,
  onUpdateResult,
  decisionId,
  showVoting = false
}) => {
  const { t } = useI18nUI();
  const { user } = useAuth();
  const [actionLinks, setActionLinks] = useState<Record<string, BestLinksResponse | null>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [expandedPros, setExpandedPros] = useState<Record<string, boolean>>({});
  const [expandedCons, setExpandedCons] = useState<Record<string, boolean>>({});
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});
  const [voteCounts, setVoteCounts] = useState<Record<string, number>>({});
  const [userVotes, setUserVotes] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  const [maxCardHeight, setMaxCardHeight] = useState<number | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const cardsWrapperRef = useRef<HTMLDivElement | null>(null);
  const detectedLanguage = I18nService.getCurrentLanguage();
  
  // Ajouter/retirer la classe sur body et les conteneurs pour le fallback CSS
  useEffect(() => {
    if (viewMode === 'cards') {
      document.body.classList.add('has-cards-overflow');
      document.documentElement.classList.add('has-cards-overflow');
      
      // Ajouter la classe sur le main et les conteneurs parents
      const mainContent = document.getElementById('main-content');
      if (mainContent) {
        mainContent.classList.add('has-cards-overflow');
        const container = mainContent.closest('.container, .mx-auto');
        if (container) {
          container.classList.add('has-cards-overflow');
        }
        // Trouver le conteneur parent avec z-10
        const z10Container = mainContent.closest('[class*="z-10"]');
        if (z10Container) {
          (z10Container as HTMLElement).style.overflowX = 'visible';
        }
      }
      
      return () => {
        document.body.classList.remove('has-cards-overflow');
        document.documentElement.classList.remove('has-cards-overflow');
        if (mainContent) {
          mainContent.classList.remove('has-cards-overflow');
          const container = mainContent.closest('.container, .mx-auto');
          if (container) {
            container.classList.remove('has-cards-overflow');
          }
          const z10Container = mainContent.closest('[class*="z-10"]');
          if (z10Container) {
            (z10Container as HTMLElement).style.overflowX = '';
          }
        }
      };
    }
  }, [viewMode]);

  // Gérer le scroll horizontal avec JavaScript pour permettre le débordement visible
  useEffect(() => {
    if (viewMode !== 'cards' || !scrollContainerRef.current || !cardsWrapperRef.current) return;

    const container = scrollContainerRef.current;
    const wrapper = cardsWrapperRef.current;
    let isDragging = false;
    let startX = 0;
    let currentScroll = scrollPosition;

    // Fonction pour calculer le scroll maximum
    const getMaxScroll = () => {
      const containerWidth = container.getBoundingClientRect().width;
      const wrapperWidth = wrapper.scrollWidth;
      return Math.max(0, wrapperWidth - containerWidth);
    };

    // Fonction pour mettre à jour le scroll
    const updateScroll = (newScroll: number) => {
      const maxScroll = getMaxScroll();
      currentScroll = Math.max(0, Math.min(newScroll, maxScroll));
      setScrollPosition(currentScroll);
      wrapper.style.transform = `translateX(-${currentScroll}px)`;
    };

    const handleWheel = (e: WheelEvent) => {
      // Vérifier si on scroll horizontalement (shift + wheel) ou si deltaX est présent
      if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        const delta = e.deltaX || e.deltaY;
        updateScroll(currentScroll + delta);
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      startX = e.pageX;
      currentScroll = scrollPosition;
      container.style.cursor = 'grabbing';
      e.preventDefault();
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      const deltaX = startX - e.pageX;
      updateScroll(currentScroll + deltaX * 2);
      startX = e.pageX;
    };

    const handleMouseUp = () => {
      isDragging = false;
      container.style.cursor = 'grab';
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        startX = e.touches[0].pageX;
        currentScroll = scrollPosition;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      e.preventDefault();
      const deltaX = startX - e.touches[0].pageX;
      updateScroll(currentScroll + deltaX * 2);
      startX = e.touches[0].pageX;
    };

    const handleTouchEnd = () => {
      isDragging = false;
    };

    // Initialiser le cursor
    container.style.cursor = 'grab';

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [viewMode, scrollPosition]);
  const detectedVertical = dilemma ? I18nService.detectVertical(dilemma) : null;

  // Load voting data
  useEffect(() => {
    console.log('🔍 Voting debug:', { showVoting, decisionId, user: !!user });
    
    if (!showVoting || !decisionId || !user) {
      console.log('❌ Voting conditions not met:', { showVoting, decisionId, hasUser: !!user });
      return;
    }

    const loadVotingData = async () => {
      try {
        console.log('🔄 Loading voting data for decision:', decisionId);
        
        // Load vote counts (will return empty array on error)
        const counts = await votingService.getVoteCounts(decisionId);
        console.log('📊 Vote counts:', counts);
        const countsMap: Record<string, number> = {};
        if (counts && counts.length > 0) {
          counts.forEach(count => {
            countsMap[count.option_name] = count.vote_count;
          });
        }
        setVoteCounts(countsMap);

        // Load user votes (will return false on error)
        const votesMap: Record<string, boolean> = {};
        for (const option of breakdown) {
          try {
            const hasVoted = await votingService.hasUserVoted(decisionId, option.option, user.id);
            votesMap[option.option] = hasVoted;
          } catch (voteError) {
            // Silently handle individual vote check errors
            console.warn('Error checking vote for option:', option.option, voteError);
            votesMap[option.option] = false; // Default to not voted
          }
        }
        console.log('🗳️ User votes:', votesMap);
        setUserVotes(votesMap);
      } catch (error) {
        // Log but don't break the UI - voting is optional
        console.warn('Error loading voting data (non-blocking):', error);
        // Set empty defaults
        setVoteCounts({});
        setUserVotes({});
      }
    };

    loadVotingData();
  }, [showVoting, decisionId, user, breakdown]);

  // Calculer la hauteur maximale des cards pour uniformiser
  useEffect(() => {
    if (viewMode !== 'cards' || !cardRefs.current.length) return;

    const calculateMaxHeight = () => {
      const heights = cardRefs.current
        .filter(ref => ref !== null)
        .map(ref => ref?.offsetHeight || 0);
      
      if (heights.length > 0) {
        const maxHeight = Math.max(...heights);
        setMaxCardHeight(maxHeight);
      }
    };

    // Calculer après un court délai pour laisser le temps au rendu
    const timeoutId = setTimeout(calculateMaxHeight, 100);
    
    // Recalculer lors du redimensionnement
    window.addEventListener('resize', calculateMaxHeight);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', calculateMaxHeight);
    };
  }, [viewMode, breakdown, expandedPros, expandedCons, expandedDescriptions, actionLinks]);

  const handleVoteChange = (optionName: string, newCount: number, hasVoted: boolean) => {
    setVoteCounts(prev => ({ ...prev, [optionName]: newCount }));
    setUserVotes(prev => ({ ...prev, [optionName]: hasVoted }));
  };

  // Auto load action links for all options
  useEffect(() => {
    if (!breakdown?.length || !dilemma) return;

    // Load action links for all options automatically
    breakdown.forEach((option, index) => {
      const optionKey = option.option;
      
      // Vérifier si on a déjà tenté de charger cette option (succès ou échec)
      const hasCachedResult = result?.cachedActionLinks && result.cachedActionLinks.hasOwnProperty(optionKey);
      const hasLocalResult = actionLinks.hasOwnProperty(optionKey);
      
      // Si on a déjà un résultat local, ne pas recharger
      if (hasLocalResult) {
        return;
      }

      // Essayer de charger depuis le cache (local ou persistant)
      const cachedLinks = loadActionLinksFromCache({
        optionName: optionKey,
        dilemma: dilemma || '',
        result,
        onUpdateResult
      });
      
      if (cachedLinks) {
        setActionLinks(prev => ({
          ...prev,
          [optionKey]: cachedLinks
        }));
        return;
      }

      // Éviter de recharger si déjà en cours de chargement
      if (loadingStates[optionKey]) return;

      console.log(`🔍 Loading action links for ${optionKey} (not cached)`);
      setLoadingStates(prev => ({
        ...prev,
        [optionKey]: true
      }));
      firstResultService.getBestLinks({
        optionName: option.option,
        dilemma: dilemma,
        language: detectedLanguage,
        vertical: detectedVertical as any
      }).then(linksResult => {
        setActionLinks(prev => ({
          ...prev,
          [optionKey]: linksResult
        }));
        
        // Sauvegarder dans le cache
        if (result && onUpdateResult) {
          const updatedResult = {
            ...result,
            cachedActionLinks: {
              ...result.cachedActionLinks,
              [optionKey]: linksResult
            }
          };
          console.log(`💾 Caching action links for ${optionKey}`);
          onUpdateResult(updatedResult);
        }
      }).catch(error => {
        console.error(`Failed to get action links for ${optionKey}:`, error);
        
        // Créer une sentinelle pour indiquer l'échec
        const failureSentinel: BestLinksResponse = {
          official: undefined,
          merchants: [],
          maps: undefined,
          actionType: 'buy',
          provider: 'google_cse',
          fromCache: true
        };
        
        setActionLinks(prev => ({
          ...prev,
          [optionKey]: failureSentinel
        }));
        
        // Sauvegarder l'échec dans le cache pour éviter de re-essayer
        if (result && onUpdateResult) {
          const updatedResult = {
            ...result,
            cachedActionLinks: {
              ...result.cachedActionLinks,
              [optionKey]: failureSentinel
            }
          };
          console.log(`💾 Caching failure for ${optionKey}`);
          onUpdateResult(updatedResult);
        }
      }).finally(() => {
        setLoadingStates(prev => ({
          ...prev,
          [optionKey]: false
        }));
      });
    });
  }, [breakdown, dilemma, detectedLanguage, detectedVertical, result?.cachedActionLinks]);


  // Fonctions pour gérer l'expansion des avantages et inconvénients
  const toggleProsExpansion = (optionKey: string) => {
    setExpandedPros(prev => ({
      ...prev,
      [optionKey]: !prev[optionKey]
    }));
  };

  const toggleConsExpansion = (optionKey: string) => {
    setExpandedCons(prev => ({
      ...prev,
      [optionKey]: !prev[optionKey]
    }));
  };

  const toggleDescriptionExpansion = (optionKey: string) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [optionKey]: !prev[optionKey]
    }));
  };

  if (!breakdown || breakdown.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        <p>{t('decision.noResults')}</p>
      </div>
    );
  }

  // Garder l'ordre original des options (plus de tri par score)
  const sortedOptions = [...breakdown];

  // Afficher le tableau même avec une seule option
  if (sortedOptions.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        <p>{t('decision.noResults')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full" style={{ overflow: 'visible', paddingLeft: '0px', paddingRight: '0px' }}>
      {/* Toggle de vue masqué - une seule option disponible */}

      {/* Version mobile : Cards empilées */}
      <div className="block md:hidden space-y-4">
        {sortedOptions.map((option, index) => {
          const optionKey = option.option;
          const optionActionLinks = actionLinks?.[optionKey] || null;

          return (
            <Card key={index} className={`rounded-none p-4 ${index === 0 ? 'border-green-200 bg-green-50 dark:bg-green-950/30' : ''}`}>
              <div className="space-y-3">
                {/* Header avec badge recommandé */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-base leading-tight truncate">
                      {option.option.replace(/^Option\s+\d+:\s*/i, '').trim()}
                    </h3>
                  </div>
                </div>

                {/* Description */}
                {option.description && (
                  <div className="text-sm text-muted-foreground">
                    <div 
                      className={`overflow-hidden transition-all ${
                        expandedDescriptions[optionKey] 
                          ? '' 
                          : 'line-clamp-3'
                      }`}
                    >
                      {option.description}
                    </div>
                    {option.description.length > 100 && (
                      <button
                        onClick={() => toggleDescriptionExpansion(optionKey)}
                        className="text-xs text-muted-foreground italic hover:text-foreground hover:underline transition-colors cursor-pointer mt-1"
                      >
                        {expandedDescriptions[optionKey] 
                          ? t('decision.seeLess') 
                          : t('decision.seeMore') || 'See more'
                        }
                      </button>
                    )}
                  </div>
                )}

                {/* Bouton de vote - en premier */}
                {showVoting && decisionId && user && (
                  <VoteButton
                    decisionId={decisionId}
                    optionName={option.option}
                    initialVoteCount={voteCounts[option.option] || 0}
                    initialHasVoted={userVotes[option.option] || false}
                    onVoteChange={handleVoteChange}
                    className="text-xs h-7"
                  />
                )}


                {/* Avantages et Inconvénients en deux colonnes */}
                {(option.pros?.length > 0 || option.cons?.length > 0) && (
                  <div className="grid grid-cols-2 gap-4">
                    {/* Avantages */}
                    {option.pros && option.pros.length > 0 && (
                      <div>
                        <ul className="space-y-1">
                          {(expandedPros[optionKey] ? option.pros : option.pros.slice(0, 3)).map((pro, proIndex) => (
                            <li key={proIndex} className="text-xs text-muted-foreground flex items-start gap-2">
                              <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{pro}</span>
                            </li>
                          ))}
                          {option.pros.length > 3 && (
                            <button
                              onClick={() => toggleProsExpansion(optionKey)}
                              className="text-xs text-muted-foreground italic hover:text-foreground hover:underline transition-colors cursor-pointer"
                            >
                              {expandedPros[optionKey] 
                                ? t('decision.seeLess') 
                                : `+${option.pros.length - 3} more`
                              }
                            </button>
                          )}
                        </ul>
                      </div>
                    )}

                    {/* Inconvénients */}
                    {option.cons && option.cons.length > 0 && (
                      <div>
                        <ul className="space-y-1">
                          {(expandedCons[optionKey] ? option.cons : option.cons.slice(0, 3)).map((con, conIndex) => (
                            <li key={conIndex} className="text-xs text-muted-foreground flex items-start gap-2">
                              <XCircle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                              <span>{con}</span>
                            </li>
                          ))}
                          {option.cons.length > 3 && (
                            <button
                              onClick={() => toggleConsExpansion(optionKey)}
                              className="text-xs text-muted-foreground italic hover:text-foreground hover:underline transition-colors cursor-pointer"
                            >
                              {expandedCons[optionKey] 
                                ? t('decision.seeLess') 
                                : `+${option.cons.length - 3} more`
                              }
                            </button>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Boutons d'action - Search et liens intelligents (en bas sur mobile) */}
                <div className="flex flex-wrap gap-2">
                  {/* Bouton Search - toujours présent */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs h-7 hover:underline flex items-center justify-center gap-1.5 min-w-[100px]"
                    onClick={() => {
                      const searchQuery = option.option.replace(/^Option\s+\d+:\s*/i, '').trim();
                      window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
                    }}
                    aria-label={`${t('decision.search')} ${option.option.replace(/^Option\s+\d+:\s*/i, '').trim()}`}
                  >
                    <ExternalLink className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
                    <span>{t('decision.search')}</span>
                  </Button>

                  {/* Liens intelligents - seulement si disponibles */}
                  {optionActionLinks && (optionActionLinks.official || optionActionLinks.merchants && optionActionLinks.merchants.length > 0 || optionActionLinks.maps) ? (
                    <>
                      {/* Primary button: Based on action type */}
                      {optionActionLinks.actionType === 'directions' && optionActionLinks.maps ? (
                        <a href={optionActionLinks.maps.url} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" className="text-xs h-7">
                            <Navigation className="h-3 w-3 mr-1" />
                            {I18nService.getDirectionsLabel(detectedLanguage)}
                          </Button>
                        </a>
                      ) : optionActionLinks.official ? (
                        <a href={optionActionLinks.official.url} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" className="text-xs h-7">
                            <MerchantLogo url={optionActionLinks.official.url} size={14} className="mr-1" />
                            {I18nService.getOfficialSiteLabel(detectedLanguage)}
                          </Button>
                        </a>
                      ) : optionActionLinks.merchants?.[0] ? (
                        <a href={optionActionLinks.merchants[0].url} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" className="text-xs h-7">
                            <MerchantLogo url={optionActionLinks.merchants[0].url} size={14} className="mr-1" />
                            {optionActionLinks.actionType === 'reserve' ? I18nService.getReserveLabel(detectedLanguage) : firstResultService.getActionVerb(detectedVertical as any, detectedLanguage)}
                          </Button>
                        </a>
                      ) : null}
                      
                      {/* Secondary buttons: Merchants */}
                      {(optionActionLinks.actionType === 'directions' || optionActionLinks.official ? optionActionLinks.merchants || [] : (optionActionLinks.merchants || []).slice(1)).slice(0, 2).map((merchant, i) => (
                        <a key={i} href={merchant.url} target="_blank" rel="noopener noreferrer">
                          <Button variant="secondary" size="sm" className="text-xs h-7">
                            <MerchantLogo url={merchant.url} size={14} className="mr-1" />
                            {firstResultService.getDomainLabel(merchant.domain)}
                          </Button>
                        </a>
                      ))}
                    </>
                  ) : null}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Version desktop : Vue Cards horizontale */}
      {viewMode === 'cards' && (
        <div 
          className="hidden md:block cards-container-wrapper" 
          style={{ 
            marginLeft: '0px', 
            marginRight: '0px',
            marginTop: '0px',
            paddingLeft: '0px',
            paddingRight: '0px',
            position: 'relative',
            width: 'calc(100% + 48px)',
            overflowX: 'visible',
            overflowY: 'visible',
            zIndex: 1
          }}
        >
          <div 
            ref={scrollContainerRef}
            className="pb-4"
            style={{
              overflowX: 'visible',
              overflowY: 'visible',
              position: 'relative',
              cursor: 'grab',
              width: '100%',
              clipPath: 'none',
              WebkitClipPath: 'none'
            }}
          >
            <div 
              ref={cardsWrapperRef}
              className="flex gap-4 min-w-max" 
              style={{ 
                paddingRight: '0px',
                willChange: 'transform',
                position: 'relative'
              }}
            >
              {sortedOptions.map((option, index) => {
                const optionKey = option.option;
                const optionActionLinks = actionLinks?.[optionKey] || null;

                return (
                  <Card 
                    key={index}
                    ref={(el) => {
                      cardRefs.current[index] = el;
                    }}
                    className={`rounded-none min-w-[320px] max-w-[320px] flex-shrink-0 ${index === 0 ? 'border-green-200 bg-green-50 dark:bg-green-950/30' : ''}`}
                    style={maxCardHeight ? { height: `${maxCardHeight}px` } : {}}
                  >
                    <div className="p-4 space-y-4 flex flex-col h-full" style={maxCardHeight ? { height: '100%' } : { minHeight: '100%' }}>
                      {/* Header */}
                      <div className="space-y-2 min-w-0">
                        <h3 className="font-medium text-base leading-tight truncate">
                          {option.option.replace(/^Option\s+\d+:\s*/i, '').trim()}
                        </h3>
                      </div>

                      {/* Description */}
                      {option.description && (
                        <div className="text-sm text-muted-foreground">
                          <div 
                            className={`overflow-hidden transition-all ${
                              expandedDescriptions[optionKey] 
                                ? '' 
                                : 'line-clamp-3'
                            }`}
                          >
                            {option.description}
                          </div>
                          {option.description.length > 100 && (
                            <button
                              onClick={() => toggleDescriptionExpansion(optionKey)}
                              className="text-xs text-muted-foreground italic hover:text-foreground hover:underline transition-colors cursor-pointer mt-1"
                            >
                              {expandedDescriptions[optionKey] 
                                ? t('decision.seeLess') 
                                : t('decision.seeMore') || 'See more'
                              }
                            </button>
                          )}
                        </div>
                      )}

                      {/* Bouton de vote */}
                      {showVoting && decisionId && user && (
                        <VoteButton
                          decisionId={decisionId}
                          optionName={option.option}
                          initialVoteCount={voteCounts[option.option] || 0}
                          initialHasVoted={userVotes[option.option] || false}
                          onVoteChange={handleVoteChange}
                          className="text-xs w-full h-7"
                        />
                      )}

                      {/* Avantages */}
                      {option.pros && option.pros.length > 0 && (
                        <div className="flex-1">
                          <div className="text-xs font-semibold text-muted-foreground mb-2">
                            {t('decision.advantages')}
                          </div>
                          <ul className="space-y-1.5">
                            {(expandedPros[optionKey] ? option.pros : option.pros.slice(0, 4)).map((pro, proIndex) => (
                              <li key={proIndex} className="text-xs text-muted-foreground flex items-start gap-2">
                                <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                <span>{pro}</span>
                              </li>
                            ))}
                            {option.pros.length > 4 && (
                              <button
                                onClick={() => toggleProsExpansion(optionKey)}
                                className="text-xs text-muted-foreground italic hover:text-foreground hover:underline transition-colors cursor-pointer"
                              >
                                {expandedPros[optionKey] 
                                  ? t('decision.seeLess') 
                                  : `+${option.pros.length - 4} more`
                                }
                              </button>
                            )}
                          </ul>
                        </div>
                      )}

                      {/* Inconvénients */}
                      {option.cons && option.cons.length > 0 && (
                        <div className="flex-1">
                          <div className="text-xs font-semibold text-muted-foreground mb-2">
                            {t('decision.disadvantages')}
                          </div>
                          <ul className="space-y-1.5">
                            {(expandedCons[optionKey] ? option.cons : option.cons.slice(0, 4)).map((con, conIndex) => (
                              <li key={conIndex} className="text-xs text-muted-foreground flex items-start gap-2">
                                <XCircle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                                <span>{con}</span>
                              </li>
                            ))}
                            {option.cons.length > 4 && (
                              <button
                                onClick={() => toggleConsExpansion(optionKey)}
                                className="text-xs text-muted-foreground italic hover:text-foreground hover:underline transition-colors cursor-pointer"
                              >
                                {expandedCons[optionKey] 
                                  ? t('decision.seeLess') 
                                  : `+${option.cons.length - 4} more`
                                }
                              </button>
                            )}
                          </ul>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex flex-col gap-1.5 mt-auto pt-4 border-t">
                        {/* Bouton Search */}
                        <Button 
                          variant="outline" 
                          size="sm" 
className="text-xs w-full h-7 flex items-center justify-center gap-1.5 hover:underline"
                          onClick={() => {
                            const searchQuery = option.option.replace(/^Option\s+\d+:\s*/i, '').trim();
                            window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
                          }}
                            aria-label={`${t('decision.search')} ${option.option.replace(/^Option\s+\d+:\s*/i, '').trim()}`}
                          >
                            <ExternalLink className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
                            <span>{t('decision.search')}</span>
                          </Button>

                          {/* Liens intelligents */}
                        {optionActionLinks && (optionActionLinks.official || optionActionLinks.merchants && optionActionLinks.merchants.length > 0 || optionActionLinks.maps) ? (
                          <>
                            {optionActionLinks.actionType === 'directions' && optionActionLinks.maps ? (
                              <a href={optionActionLinks.maps.url} target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" size="sm" className="text-xs w-full h-7 flex items-center justify-center gap-1.5 hover:underline">
                                  <Navigation className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
                                  <span>{I18nService.getDirectionsLabel(detectedLanguage)}</span>
                                </Button>
                              </a>
                            ) : optionActionLinks.official ? (
                              <a href={optionActionLinks.official.url} target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" size="sm" className="text-xs w-full h-7 flex items-center justify-center gap-1.5 hover:underline">
                                  <MerchantLogo url={optionActionLinks.official.url} size={14} className="flex-shrink-0" />
                                  <span>{I18nService.getOfficialSiteLabel(detectedLanguage)}</span>
                                </Button>
                              </a>
                            ) : optionActionLinks.merchants?.[0] ? (
                              <a href={optionActionLinks.merchants[0].url} target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" size="sm" className="text-xs w-full h-7 flex items-center justify-center gap-1.5 hover:underline">
                                  <MerchantLogo url={optionActionLinks.merchants[0].url} size={14} className="flex-shrink-0" />
                                  <span>{optionActionLinks.actionType === 'reserve' ? I18nService.getReserveLabel(detectedLanguage) : firstResultService.getActionVerb(detectedVertical as any, detectedLanguage)}</span>
                                </Button>
                              </a>
                            ) : null}
                            
                            {(optionActionLinks.actionType === 'directions' || optionActionLinks.official ? optionActionLinks.merchants || [] : (optionActionLinks.merchants || []).slice(1)).slice(0, 2).map((merchant, i) => (
                              <a key={i} href={merchant.url} target="_blank" rel="noopener noreferrer">
                                <Button variant="secondary" size="sm" className="text-xs w-full h-7 flex items-center justify-center gap-1.5 hover:underline">
                                  <MerchantLogo url={merchant.url} size={14} className="flex-shrink-0" />
                                  <span>{firstResultService.getDomainLabel(merchant.domain)}</span>
                                </Button>
                              </a>
                            ))}
                          </>
                        ) : null}
                      </div>
                    </div>
                  </Card>
                );
              })}
              {/* Spacer invisible pour éviter la coupure de la dernière card */}
              <div className="flex-shrink-0" style={{ width: '100px', minWidth: '100px' }} aria-hidden="true" />
            </div>
          </div>
        </div>
      )}

      {/* Version desktop : Tableau */}
      {viewMode === 'table' && (
        <div className="hidden md:block px-6">
          <div className="rounded-none border w-full table-scroll-container">
            <Table className="comparison-table" style={{ minWidth: '800px' }}>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="w-[300px] border-r" 
                  style={{ paddingTop: '16px', paddingBottom: '16px', paddingLeft: '16px', paddingRight: '16px' }}
                >
                  Option
                </TableHead>
                <TableHead 
                  className="w-[300px] border-r bg-white" 
                  style={{ paddingTop: '16px', paddingBottom: '16px', paddingLeft: '16px', paddingRight: '16px' }}
                >
                  {t('decision.advantages')}
                </TableHead>
                <TableHead 
                  className="w-[300px]" 
                  style={{ paddingTop: '16px', paddingBottom: '16px', paddingLeft: '16px', paddingRight: '16px', backgroundColor: 'rgba(255, 255, 255, 1)' }}
                >
                  {t('decision.disadvantages')}
                </TableHead>
              </TableRow>
            </TableHeader>
          <TableBody>
            {sortedOptions.map((option, index) => {
              const optionKey = option.option;
              const optionActionLinks = actionLinks?.[optionKey] || null;

              return (
                <TableRow 
                  key={index} 
                  className={index === 0 ? 'bg-green-50 dark:bg-green-950/30' : ''}
                >
                  <TableCell className="font-medium align-top border-r" style={{ padding: '20px' }}>
                    <div className="space-y-4">
                      <div className="text-base font-medium truncate">
                        {option.option.replace(/^Option\s+\d+:\s*/i, '').trim()}
                      </div>
                      
                      {/* Description */}
                      {option.description && (
                        <div className="text-sm text-muted-foreground">
                          <div 
                            className={`overflow-hidden transition-all ${
                              expandedDescriptions[optionKey] 
                                ? '' 
                                : 'line-clamp-3'
                            }`}
                          >
                            {option.description}
                          </div>
                          {option.description.length > 100 && (
                            <button
                              onClick={() => toggleDescriptionExpansion(optionKey)}
                              className="text-xs text-muted-foreground italic hover:text-foreground hover:underline transition-colors cursor-pointer mt-1"
                            >
                              {expandedDescriptions[optionKey] 
                                ? t('decision.seeLess') 
                                : t('decision.seeMore') || 'See more'
                              }
                            </button>
                          )}
                        </div>
                      )}
                      
                      {/* Bouton de vote - en premier */}
                      {showVoting && decisionId && user && (
                        <div className="mt-6 w-full">
                          <VoteButton
                            decisionId={decisionId}
                            optionName={option.option}
                            initialVoteCount={voteCounts[option.option] || 0}
                            initialHasVoted={userVotes[option.option] || false}
                            onVoteChange={handleVoteChange}
                            className="text-xs w-full h-7"
                          />
                        </div>
                      )}

                      {/* Divider */}
                      <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>

                      {/* Action buttons - Search et liens intelligents */}
                      <div className="w-full">
                        <div className="flex flex-col gap-1 w-full">
                          {/* Bouton Search - toujours présent */}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-xs w-full h-7 flex items-center justify-center gap-1.5 hover:underline"
                            onClick={() => {
                              const searchQuery = option.option.replace(/^Option\s+\d+:\s*/i, '').trim();
                              window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
                            }}
                            aria-label={`${t('decision.search')} ${option.option.replace(/^Option\s+\d+:\s*/i, '').trim()}`}
                          >
                            <ExternalLink className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
                            <span>{t('decision.search')}</span>
                          </Button>

                          {/* Liens intelligents - seulement si disponibles */}
                          {optionActionLinks && (optionActionLinks.official || optionActionLinks.merchants && optionActionLinks.merchants.length > 0 || optionActionLinks.maps) ? (
                            <>
                              {/* Primary button: Based on action type */}
                              {optionActionLinks.actionType === 'directions' && optionActionLinks.maps ? (
                                <a href={optionActionLinks.maps.url} target="_blank" rel="noopener noreferrer">
                                  <Button variant="outline" size="sm" className="text-xs w-full h-7 flex items-center justify-center gap-1.5 hover:underline">
                                    <Navigation className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
                                    <span>{I18nService.getDirectionsLabel(detectedLanguage)}</span>
                                  </Button>
                                </a>
                              ) : optionActionLinks.official ? (
                                <a href={optionActionLinks.official.url} target="_blank" rel="noopener noreferrer">
                                  <Button variant="outline" size="sm" className="text-xs w-full h-7 flex items-center justify-center gap-1.5 hover:underline">
                                    <MerchantLogo url={optionActionLinks.official.url} size={14} className="flex-shrink-0" />
                                    <span>{I18nService.getOfficialSiteLabel(detectedLanguage)}</span>
                                  </Button>
                                </a>
                              ) : optionActionLinks.merchants?.[0] ? (
                                <a href={optionActionLinks.merchants[0].url} target="_blank" rel="noopener noreferrer">
                                  <Button variant="outline" size="sm" className="text-xs w-full h-7 flex items-center justify-center gap-1.5 hover:underline">
                                    <MerchantLogo url={optionActionLinks.merchants[0].url} size={14} className="flex-shrink-0" />
                                    <span>{optionActionLinks.actionType === 'reserve' ? I18nService.getReserveLabel(detectedLanguage) : firstResultService.getActionVerb(detectedVertical as any, detectedLanguage)}</span>
                                  </Button>
                                </a>
                              ) : null}
                             
                              {/* Secondary buttons: Merchants */}
                              {(optionActionLinks.actionType === 'directions' || optionActionLinks.official ? optionActionLinks.merchants || [] : (optionActionLinks.merchants || []).slice(1)).slice(0, 2).map((merchant, i) => (
                                <a key={i} href={merchant.url} target="_blank" rel="noopener noreferrer">
                                  <Button variant="secondary" size="sm" className="text-xs w-full h-7 flex items-center justify-center gap-1.5 hover:underline">
                                    <MerchantLogo url={merchant.url} size={14} className="flex-shrink-0" />
                                    <span>{firstResultService.getDomainLabel(merchant.domain)}</span>
                                  </Button>
                                </a>
                              ))}
                            </>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell className="align-top border-r" style={{ padding: '20px' }}>
                    <div className="space-y-2">
                      {(expandedPros[optionKey] ? option.pros : option.pros?.slice(0, 3))?.map((pro, proIndex) => (
                        <div key={proIndex} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{pro}</span>
                        </div>
                      ))}
                      {option.pros?.length > 3 && (
                        <button
                          onClick={() => toggleProsExpansion(optionKey)}
                          className="text-xs text-muted-foreground italic hover:text-foreground hover:underline transition-colors cursor-pointer"
                        >
                          {expandedPros[optionKey] 
                            ? t('decision.seeLess') 
                            : `+${option.pros.length - 3} more`
                          }
                        </button>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell className="align-top" style={{ padding: '20px' }}>
                    <div className="space-y-2">
                      {(expandedCons[optionKey] ? option.cons : option.cons?.slice(0, 3))?.map((con, conIndex) => (
                        <div key={conIndex} className="flex items-start gap-2 text-sm">
                          <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{con}</span>
                        </div>
                      ))}
                      {option.cons?.length > 3 && (
                        <button
                          onClick={() => toggleConsExpansion(optionKey)}
                          className="text-xs text-muted-foreground italic hover:text-foreground hover:underline transition-colors cursor-pointer"
                        >
                          {expandedCons[optionKey] 
                            ? t('decision.seeLess') 
                            : `+${option.cons.length - 3} more`
                          }
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        </div>
      </div>
      )}
      
      <div className="text-xs text-muted-foreground text-center sr-only">
        {t('decision.comparisonTableCaption').replace('{count}', sortedOptions.length.toString())}
      </div>
    </div>
  );
};