import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowUp, ArrowRight, Loader2, BookOpen, Video, Users, Layers, Radio, Tags, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { processStep1Prompt } from '../../lib/campaigns/api';
import type { Step1ParseResult, Step2FormData } from '../../lib/campaigns/types';
import { Step2Configuration } from './Step2Configuration';
// icon image replaced with vector icon from lucide-react to keep design consistent

// Helper function para formatar range de seguidores
function formatFollowersRange(live: { followersMin: number | null; followersMax: number | null }): string {
  if (live.followersMin === null && live.followersMax === null) {
    return '';
  }

  if (live.followersMin !== null && live.followersMax !== null) {
    if (live.followersMin === live.followersMax) {
      return formatFollowerNumber(live.followersMin);
    }
    return `${formatFollowerNumber(live.followersMin)} - ${formatFollowerNumber(live.followersMax)}`;
  }

  if (live.followersMin !== null) {
    return `${formatFollowerNumber(live.followersMin)}+`;
  }

  if (live.followersMax !== null) {
    return `up to ${formatFollowerNumber(live.followersMax)}`;
  }

  return '';
}

function formatFollowerNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(0)}k`;
  }
  return num.toString();
}

export const CreateCampaign: React.FC = () => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [showResults, setShowResults] = useState(false);
  const [parseResult, setParseResult] = useState<Step1ParseResult | null>(null);
  const [step2Data, setStep2Data] = useState<Step2FormData | null>(null);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const stepsContainerRef = useRef<HTMLDivElement>(null);
  const step1Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);
  const [lineTop, setLineTop] = useState(0);
  const [lineHeight, setLineHeight] = useState(0);
  const [lineLeft, setLineLeft] = useState(22);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isScrollAtEnd, setIsScrollAtEnd] = useState(false);
  const [isScrollAtStart, setIsScrollAtStart] = useState(true);

  useEffect(() => {
    const computeLine = () => {
      if (!stepsContainerRef.current || !step1Ref.current || !step3Ref.current) return;
      const containerRect = stepsContainerRef.current.getBoundingClientRect();
      const step1Rect = step1Ref.current.getBoundingClientRect();
      const step3Rect = step3Ref.current.getBoundingClientRect();
      const startY = step1Rect.top - containerRect.top + step1Rect.height / 2;
      const endY = step3Rect.top - containerRect.top + step3Rect.height / 2;
      const height = Math.max(Math.round(endY - startY), 0);
      setLineTop(startY);
      setLineHeight(height);
      const centerX = step1Rect.left - containerRect.left + step1Rect.width / 2;
      setLineLeft(centerX);
    };
    computeLine();
    window.addEventListener('resize', computeLine);
    return () => window.removeEventListener('resize', computeLine);
  }, []);

  useEffect(() => {
    const computeScrollEnd = () => {
      const node = scrollRef.current;
      if (!node) return;
      const atEnd = Math.ceil(node.scrollLeft + node.clientWidth) >= node.scrollWidth;
      const atStart = Math.floor(node.scrollLeft) <= 0;
      setIsScrollAtEnd(atEnd);
      setIsScrollAtStart(atStart);
    };
    computeScrollEnd();
    const el = scrollRef.current;
    el?.addEventListener('scroll', computeScrollEnd);
    window.addEventListener('resize', computeScrollEnd);
    return () => {
      el?.removeEventListener('scroll', computeScrollEnd);
      window.removeEventListener('resize', computeScrollEnd);
    };
  }, []);

  // Análise em tempo real do input usando a nova lógica de parse
  useEffect(() => {
    if (inputValue.trim().length === 0) {
      setParseResult(null);
      return;
    }

    // Debounce para evitar processamento excessivo
    const timeoutId = setTimeout(async () => {
      try {
        const result = await processStep1Prompt(inputValue);
        setParseResult(result);
      } catch (error) {
        console.error('Error parsing campaign prompt:', error);
        setParseResult(null);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [inputValue]);

  const handleSubmit = async () => {
    if (!parseResult || !isFormValid) {
      return;
    }

    setIsLoading(true);

    try {
      // Processar e validar novamente antes de avançar
      const result = await processStep1Prompt(inputValue);

      // Verificar se todos os critérios estão válidos
      if (
        result.criteria.livesCount === 'valid' &&
        result.criteria.followers === 'valid' &&
        result.criteria.segments === 'valid'
      ) {
        setParseResult(result);
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Advance to Step 2
        setCurrentStep(2);
      }
    } catch (error) {
      console.error('Error submitting campaign:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isFormValid) {
        handleSubmit();
      }
    }

    // Navegação por teclado aprimorada
    if (e.key === 'Escape') {
      // Limpar input ao pressionar Escape
      setInputValue('');
      setParseResult(null);
      inputRef.current?.focus();
    }
  };

  // Adicionar navegação por Tab para os cards de resultado
  const handleResultsKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      // Voltar para a tela de criação
      setShowResults(false);
      setInputValue('');
      inputRef.current?.focus();
    }
  };

  // Verificar se todos os 3 critérios estão válidos
  const isFormValid =
    parseResult !== null &&
    parseResult.criteria.livesCount === 'valid' &&
    parseResult.criteria.followers === 'valid' &&
    parseResult.criteria.segments === 'valid';

  const handleBackToCreate = () => {
    setShowResults(false);
    setCurrentStep(1);
    setInputValue('');
    setParseResult(null);
    setStep2Data(null);
    inputRef.current?.focus();
  };

  const handleBackToStep1 = () => {
    setCurrentStep(1);
  };

  const handleStep2Next = (data: Step2FormData) => {
    setStep2Data(data);
    setCurrentStep(3);
    // TODO: Navigate to Step 3 (Review and Publication)
    console.log('Step 2 data:', data);
  };

  const handleUseSuggestion = (text: string) => {
    setInputValue(text);
    requestAnimationFrame(() => {
      const el = inputRef.current;
      if (el) {
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }
    });
  };

  // Show Step 2 Configuration
  if (currentStep === 2 && parseResult) {
    // Render Step 2 within the same layout structure
    // Don't return early - render within the main layout below
  }

  // Show old results view (will be replaced with Step 3 later)
  if (showResults && parseResult) {
    return (
      <div onKeyDown={handleResultsKeyDown} tabIndex={0}>
        <CampaignResults parseResult={parseResult} onBack={handleBackToCreate} />
      </div>
    );
  }

  // Step 1 - Campaign Definition
  return (
    <div className="h-screen bg-white flex overflow-hidden" role="main">
      {/* Sidebar lateral esquerda com os passos do fluxo */}
      <div className="w-[320px] h-screen bg-[#F9FAFC] border-r border-[#E2E8F0] p-6 flex flex-col overflow-y-auto">
        {/* Botão Voltar/Fechar dinâmico */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-8 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg" 
          onClick={() => {
            if (currentStep === 1) {
              navigate(-1);
            } else if (currentStep === 2) {
              setCurrentStep(1);
            } else if (currentStep === 3) {
              setCurrentStep(2);
            }
          }}
        >
          {currentStep === 1 ? (
            <>
              <X className="w-4 h-4 mr-2" />
              Close
            </>
          ) : (
            <>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </>
          )}
        </Button>


        <div className="flex-1 relative" ref={stepsContainerRef}>
          <div className={`absolute w-px rounded-full ${currentStep >= 2 ? 'bg-[#7D2AE8]' : 'bg-[#E2E8F0]/80'}`} style={{ left: lineLeft, top: lineTop, height: lineHeight }} />
          <div className="space-y-10">

            <div className="flex items-start gap-3">
              <div className="relative">
                <div ref={step1Ref} className={`w-[36px] h-[36px] rounded-[12px] shadow-sm flex items-center justify-center font-medium text-base transition-transform hover:scale-[1.03] ${currentStep === 1 || currentStep >= 2
                  ? 'bg-gradient-to-br from-[#7D2AE8] to-[#8D3AEC] ring-4 ring-[#F5F3FF] text-white'
                  : 'bg-white border border-[#E2E8F0] text-gray-600'
                  }`}>
                  {currentStep > 1 ? <span className="text-white">✓</span> : '1'}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-start gap-2">
                  <span className="text-xl">📝</span>
                  <h3 className="font-medium text-gray-900 text-sm mb-0.5">Campaign Definition</h3>
                </div>
                <p className="text-sm text-gray-600">Describe your campaign and criteria</p>
              </div>
            </div>


            <div className="flex items-start gap-3">
              <div className="relative">
                <div className={`w-[36px] h-[36px] rounded-[12px] shadow-sm flex items-center justify-center font-medium text-base transition-transform hover:scale-[1.03] ${currentStep === 2 || currentStep >= 3
                  ? 'bg-gradient-to-br from-[#7D2AE8] to-[#8D3AEC] ring-4 ring-[#F5F3FF] text-white'
                  : 'bg-white border border-[#E2E8F0] text-gray-600'
                  }`}>
                  {currentStep > 2 ? <span className="text-white">✓</span> : '2'}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-start gap-2">
                  <span className="text-xl">⚙️</span>
                  <h3 className="font-medium text-gray-900 text-sm mb-0.5">Live Configurations</h3>
                </div>
                <p className="text-sm text-gray-600">Configure details for each live</p>
              </div>
            </div>


            <div className="flex items-start gap-3">
              <div className="relative">
                <div ref={step3Ref} className={`w-[36px] h-[36px] rounded-[12px] shadow-sm flex items-center justify-center font-medium text-base transition-transform hover:scale-[1.03] ${currentStep === 3
                  ? 'bg-gradient-to-br from-[#7D2AE8] to-[#8D3AEC] ring-4 ring-[#F5F3FF] text-white'
                  : 'bg-white border border-[#E2E8F0] text-gray-600'
                  }`}>
                  {currentStep > 3 ? <span className="text-white">✓</span> : '3'}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-start gap-2">
                  <span className="text-xl">✅</span>
                  <h3 className="font-medium text-gray-900 text-sm mb-0.5">Review and Publication</h3>
                </div>
                <p className="text-sm text-gray-600">Review and publish your campaign</p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <div className="w-full bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-center space-x-2 p-1.5">
              <div className="w-[22px] h-[22px] rounded-full bg-purple-100 flex items-center justify-center">
                <Radio className="w-4 h-4 text-purple-600" />
              </div>
              <div className="w-[22px] h-[22px] rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div className="w-[22px] h-[22px] rounded-full bg-green-100 flex items-center justify-center">
                <Layers className="w-4 h-4 text-green-600" />
              </div>
            </div>
            <div>
              <p className="text-center text-xs leading-relaxed text-gray-600">
                Your campaign will generate <strong>live streams and videos</strong> to feed your e-commerce platform and drive sales. Each influencer becomes responsible for <strong>bringing their audience</strong> to watch the live streams they create for your brand.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs bg-white hover:bg-purple-50 border-purple-200 text-purple-700 hover:text-purple-800"
              onClick={() => window.open('/docs/campaigns', '_blank')}
            >
              <Layers className="w-4 h-4 mr-2" />
              View Campaign Guide & Tips
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area - Switch based on currentStep */}
      <>
        {currentStep === 1 && (
          <div className="flex-1 h-screen py-12 overflow-y-auto">
            <div className="mx-auto w-full max-w-[1120px] px-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-3 mb-3">
                  <BookOpen className="w-[30px] h-[30px] text-[#7D2AE8]" />
                  <h1 className="text-[28px] leading-[34px] font-normal text-gray-900">Create New Campaign</h1>
                </div>
                <p className="text-[16px] leading-[24px] text-gray-600">Describe your campaign with details</p>
              </div>

              <div className="max-w-[760px] mx-auto">
                <div className="mb-4 relative px-2 py-2">
                  <div ref={scrollRef} className="overflow-x-auto overflow-y-visible no-scrollbar">
                    <div className="flex gap-3 items-stretch">
                      {promptSuggestions.map((s, i) => (
                        <SuggestionCard key={i} text={s.text} tags={s.tags} onUse={() => handleUseSuggestion(s.text)} />
                      ))}
                    </div>
                  </div>
                  <div className={`pointer-events-none absolute right-0 top-0 bottom-0 w-14 bg-gradient-to-l from-white to-white/0 backdrop-blur-[1.5px] z-10 transition-opacity duration-200 ${isScrollAtEnd ? 'opacity-0' : 'opacity-100'}`} />
                  <div className={`pointer-events-none absolute left-0 top-0 bottom-0 w-14 bg-gradient-to-r from-white to-white/0 backdrop-blur-[1.5px] z-10 transition-opacity duration-200 ${isScrollAtStart ? 'opacity-0' : 'opacity-100'}`} />
                </div>


                <div className="bg-white rounded-[20px] border border-[#E2E8F0] p-4 shadow-none transition-shadow focus-within:border-[#7D2AE8]/30 focus-within:shadow-[0_8px_24px_rgba(125,42,232,0.12)]">
                  <div className="relative">
                    {/* input: removed internal strokes (border/outline/ring) */}
                    <textarea
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Describe your campaign: number of live streams, followers per creator for each live, and creator segments."
                      className="w-full min-h-[96px] p-4 pr-12 pb-14 rounded-[16px] border-none outline-none ring-0 focus:outline-none focus:ring-0 bg-white text-gray-900 text-sm leading-5 placeholder:text-[#D1D5DB] resize-none"
                      disabled={isLoading}
                      aria-label="Campaign description"
                      aria-describedby="input-helper"
                      aria-invalid={!isFormValid && inputValue.length > 0}
                      aria-busy={isLoading}
                    />
                    <button
                      onClick={handleSubmit}
                      disabled={!isFormValid || isLoading}
                      className={`absolute bottom-4 right-4 w-10 h-10 rounded-[12px] flex items-center justify-center transition-all ${isFormValid && !isLoading
                        ? 'bg-[#7D2AE8] text-white hover:bg-[#8D3AEC]'
                        : 'bg-gray-200 text-gray-400'
                        }`}
                      aria-label="Send"
                      aria-disabled={!isFormValid || isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                      ) : (
                        <ArrowUp className="w-5 h-5" aria-hidden="true" />
                      )}
                    </button>
                    <div className="absolute left-4 bottom-2 right-16">
                      <div className="flex gap-2 overflow-x-auto no-scrollbar whitespace-nowrap" role="status" aria-live="polite">
                        <ValidationTag
                          label="Live streams"
                          isValid={parseResult?.criteria.livesCount === 'valid'}
                          isError={parseResult?.criteria.livesCount === 'error'}
                          value={parseResult?.totalLives ? `${parseResult.totalLives} live${parseResult.totalLives > 1 ? 's' : ''}` : ''}
                          variant="purple"
                          icon={<Radio className="w-3 h-3" />}
                        />
                        <ValidationTag
                          label="Creator followers"
                          isValid={parseResult?.criteria.followers === 'valid'}
                          isError={parseResult?.criteria.followers === 'error'}
                          value={(() => {
                            if (!parseResult || parseResult.criteria.followers === 'invalid' || parseResult.lives.length === 0) return '';
                            if (parseResult.criteria.followers === 'error') return 'Mismatch count';

                            // Obter todos os valores formatados
                            const allFollowers = parseResult.lives.map(live => formatFollowersRange(live));

                            // Remover duplicatas mantendo a ordem
                            const uniqueFollowers = Array.from(new Set(allFollowers));

                            // Juntar com vírgula
                            return uniqueFollowers.join(', ');
                          })()}
                          variant="blue"
                          icon={<Users className="w-3 h-3" />}
                        />
                        <ValidationTag
                          label="Segments"
                          isValid={parseResult?.criteria.segments === 'valid'}
                          isError={parseResult?.criteria.segments === 'error'}
                          value={parseResult && parseResult.criteria.segments === 'valid' && parseResult.lives.length > 0 && parseResult.lives[0]?.segments.length > 0
                            ? parseResult.lives[0].segments.map(s => s.label).join(', ')
                            : (parseResult?.criteria.segments === 'error' ? 'Mismatch count' : '')}
                          variant="green"
                          icon={<Tags className="w-3 h-3" />}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2 Content */}
        {currentStep === 2 && parseResult && (
          <Step2Configuration
            step1Data={parseResult}
            onNext={handleStep2Next}
            onBack={handleBackToStep1}
          />
        )}
      </>
    </div>
  );
};

interface ValidationTagProps {
  label: string;
  isValid: boolean;
  isError?: boolean;
  value?: string;
  variant?: 'purple' | 'blue' | 'green';
  icon?: React.ReactNode;
}

const ValidationTag: React.FC<ValidationTagProps> = ({ label, isValid, isError, value, variant = 'green', icon }) => {
  let className = "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap flex-shrink-0 ";

  if (isValid) {
    // Cores específicas para cada variante quando válido
    switch (variant) {
      case 'purple':
        className += "bg-purple-50 text-purple-700 border border-purple-200 border-solid";
        break;
      case 'blue':
        className += "bg-blue-50 text-blue-700 border border-blue-200 border-solid";
        break;
      case 'green':
      default:
        className += "bg-green-50 text-green-700 border border-green-200 border-solid";
        break;
    }
  } else if (isError) {
    className += "bg-red-50 text-red-700 border border-red-200 border-solid";
  } else {
    className += "bg-white text-gray-400 border border-gray-200 border-dashed";
  }

  return (
    <div
      className={className}
      role="status"
      aria-live="polite"
      aria-label={`${label}: ${isValid ? 'validated' : (isError ? 'error' : 'pending')}`}
    >
      {icon && <span className="opacity-70">{icon}</span>}

      {/* Se válido, mostrar APENAS o valor (sem label, sem parênteses) */}
      {isValid && value ? (
        <span className="font-semibold">{value}</span>
      ) : (
        /* Se inválido ou erro, mostrar Label */
        <>
          <span>{label}</span>
          {/* Se for erro e tiver mensagem (ex: Mismatch count), mostrar entre parênteses */}
          {isError && value && <span className="font-semibold">({value})</span>}
        </>
      )}
    </div>
  );
};

const CampaignResults: React.FC<{ parseResult: Step1ParseResult; onBack: () => void }> = ({ parseResult, onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9] p-4" role="main" aria-label="Campaign results">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Campaign Created Successfully!</h1>
            <p className="text-gray-600">Here are the campaign's live streams</p>
          </div>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            aria-label="Back to create a new campaign"
            title="Back (Esc)"
          >
            Back
          </button>
        </div>

        <div className="grid gap-6" role="list" aria-label={`${parseResult.totalLives} campaign live streams`}>
          {parseResult.lives.map((live, index) => (
            <LiveCard key={live.index} live={live} />
          ))}
        </div>
      </div>
    </div>
  );
};

const LiveCard: React.FC<{ live: Step1ParseResult['lives'][0] }> = ({ live }) => {
  const followersText = formatFollowersRange(live);

  return (
    <div className="bg-white rounded-xl shadow-md border border-[#E2E8F0] p-6 hover:shadow-lg transition-shadow" role="listitem" aria-label={`Live ${live.index}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#7D2AE8] to-[#8D3AEC] rounded-lg flex items-center justify-center" aria-hidden="true">
            <span className="text-white font-bold">{live.index}</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Live {live.index}</h3>
            <p className="text-sm text-gray-600">
              {followersText && `Followers: ${followersText}`}
              {followersText && live.segments.length > 0 && ' • '}
              {live.segments.length > 0 && `Segments: ${live.segments.map(s => s.label).join(', ')}`}
            </p>
          </div>
        </div>
        {live.segments.length > 0 && (
          <div className="px-3 py-1 bg-[#7D2AE8]/10 text-[#7D2AE8] rounded-full text-sm font-medium" aria-label={`Segments: ${live.segments.map(s => s.label).join(', ')}`}>
            {live.segments[0].label.toUpperCase()}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor={`title-${live.index}`} className="block text-sm font-medium text-gray-700 mb-2">Live Title</label>
          <input
            id={`title-${live.index}`}
            type="text"
            className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7D2AE8] focus:border-transparent"
            placeholder="e.g., Launch Live – Fitness Collection 2024"
            aria-label={`Live Title ${live.index}`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date and Time</label>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              className="px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7D2AE8] focus:border-transparent"
              aria-label={`Live Date ${live.index}`}
            />
            <input
              type="time"
              className="px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7D2AE8] focus:border-transparent"
              aria-label={`Live Time ${live.index}`}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Segments</label>
          <div className="flex flex-wrap gap-2" role="group" aria-label={`Segments for Live ${live.index}`}>
            {live.segments.map(segment => (
              <span
                key={segment.key}
                className="px-3 py-1.5 rounded-full text-sm font-medium bg-[#7D2AE8]/10 text-[#7D2AE8] border border-[#7D2AE8]/20"
                aria-label={segment.label}
              >
                {segment.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const SuggestionCard: React.FC<{ text: string; tags: { label: string; color: 'green' | 'blue' | 'purple' }[]; onUse: () => void }> = ({ text, tags, onUse }) => {
  return (
    <div className="relative min-w-[460px] max-w-[460px] bg-white rounded-[12px] border border-[#E5E7EB] p-[14px] shadow-[0_4px_8px_rgba(17,24,39,0.06)] hover:shadow-[0_6px_12px_rgba(17,24,39,0.08)] transition-shadow">
      <div className="mr-12">
        <p className="text-[13px] leading-[18px] text-gray-500 font-normal">{text}</p>
        <div className="flex gap-2 mt-3 flex-nowrap overflow-hidden">
          {tags.map((t, i) => (
            <span
              key={i}
              title={t.label}
              className={
                t.color === 'purple'
                  ? 'px-2 py-0.5 rounded-full text-[10.5px] font-medium bg-[#7D2AE8]/10 text-[#7D2AE8] border border-[#7D2AE8]/20 max-w-[140px] truncate'
                  : t.color === 'blue'
                    ? 'px-2 py-0.5 rounded-full text-[10.5px] font-medium bg-blue-50 text-blue-700 border border-blue-200 max-w-[140px] truncate'
                    : 'px-2 py-0.5 rounded-full text-[10.5px] font-medium bg-green-50 text-green-700 border border-green-200 max-w-[140px] truncate'
              }
            >
              {t.label}
            </span>
          ))}
        </div>
      </div>
      <button onClick={onUse} className="absolute right-3 bottom-3 w-8 h-8 rounded-xl flex items-center justify-center text-gray-600 hover:text-[#7D2AE8] hover:bg-[#7D2AE8]/10 cursor-pointer select-none transition-colors">
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};

const promptSuggestions = [
  {
    text: 'I want a campaign with 3 live streams: one with a creator of 100k followers in Fitness and Fashion; another with 1M followers in Makeup; and the last with 600k followers in Fitness, Fashion, and Travel.',
    tags: [
      { label: '3 live streams', color: 'purple' as const },
      { label: '100k, 1M, 600k', color: 'blue' as const },
      { label: 'Fitness, Fashion, Makeup, Fitness, Fashion, Travel', color: 'green' as const },
    ],
  },
  {
    text: 'Set up 2 live streams: first with a 150k-follower creator in Tech; second with a 300k-follower creator in Fashion.',
    tags: [
      { label: '2 live streams', color: 'purple' as const },
      { label: '150k, 300k', color: 'blue' as const },
      { label: 'Tech, Fashion', color: 'green' as const },
    ],
  },
  {
    text: 'Plan 4 live streams: creators at 50k, 75k, 125k, and 250k followers, aligned to Gaming, Beauty, Fitness, and Travel respectively.',
    tags: [
      { label: '4 live streams', color: 'purple' as const },
      { label: '50k, 75k, 125k, 250k', color: 'blue' as const },
      { label: 'Gaming, Beauty, Fitness, Travel', color: 'green' as const },
    ],
  },
  {
    text: 'Run 3 live streams: each with an 80k-follower creator in Beauty.',
    tags: [
      { label: '3 live streams', color: 'purple' as const },
      { label: '80k, 80k, 80k', color: 'blue' as const },
      { label: 'Beauty, Beauty, Beauty', color: 'green' as const },
    ],
  },
  {
    text: 'Launch 5 live streams: creators at 100k, 100k, 200k, 200k, and 500k followers, focused on Lifestyle, Tech, Beauty, Fashion, and Fitness.',
    tags: [
      { label: '5 live streams', color: 'purple' as const },
      { label: '100k, 100k, 200k, 200k, 500k', color: 'blue' as const },
      { label: 'Lifestyle, Tech, Beauty, Fashion, Fitness', color: 'green' as const },
    ],
  },
];