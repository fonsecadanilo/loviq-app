import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { LiveCard } from './LiveCard';
import { LiveConfigForm } from './LiveConfigForm';
import type { Step1ParseResult, Step2LiveConfig, Step2FormData } from '../../lib/campaigns/types';

interface Step2ConfigurationProps {
    step1Data: Step1ParseResult;
    onNext: (step2Data: Step2FormData) => void;
}

export const Step2Configuration: React.FC<Step2ConfigurationProps & { onBack: () => void }> = ({ step1Data, onNext, onBack }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [selectedLiveIndex, setSelectedLiveIndex] = useState(1);
    const [step2Data, setStep2Data] = useState<Step2FormData>({
        lives: step1Data.lives.map((live) => ({
            liveIndex: live.index,
            title: `Live ${live.index}`,
            contentFormat: null,
            creatorAgeRange: null,
            focusLocal: false,
            region: null,
            platformPreference: null,
            selectedProduct: null,
            liveDuration: null,
            defineDate: false,
            preferredDate: null,
        })),
    });

    // Simulate loading
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    const handleLiveConfigChange = (config: Step2LiveConfig) => {
        setStep2Data((prev) => ({
            lives: prev.lives.map((live) =>
                live.liveIndex === config.liveIndex ? config : live
            ),
        }));
    };

    const selectedLiveConfig = step2Data.lives.find((live) => live.liveIndex === selectedLiveIndex);
    const selectedLiveData = step1Data.lives.find((live) => live.index === selectedLiveIndex);

    // Check if all lives are configured
    const isAllConfigured = step2Data.lives.every((live) =>
        live.contentFormat !== null &&
        live.creatorAgeRange !== null &&
        live.platformPreference !== null &&
        live.selectedProduct !== null &&
        live.liveDuration !== null
    );

    const handleNext = () => {
        if (isAllConfigured) {
            onNext(step2Data);
        }
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto" />
                    <p className="text-gray-600 font-medium">Loading configuration...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Coluna de Lives - Fixed, encostada na sidebar */}
            <div className="w-[280px] h-screen bg-[#F9FAFC] border-r border-[#E2E8F0] p-4 overflow-y-auto">
                <h2 className="text-sm font-semibold text-gray-900 mb-4">Live Streams ({step1Data.lives.length})</h2>
                <div className="space-y-3">
                    {step1Data.lives.map((live) => (
                        <LiveCard
                            key={live.index}
                            live={live}
                            isSelected={selectedLiveIndex === live.index}
                            onClick={() => setSelectedLiveIndex(live.index)}
                        />
                    ))}
                </div>
            </div>

            {/* Área principal - Similar ao chat do Step 1 */}
            <div className="flex-1 h-screen py-12 overflow-y-auto">
                <div className="mx-auto w-full max-w-[1120px] px-6">

                    <div className="max-w-[760px] mx-auto">
                        <div className="bg-white p-6">
                            {/* Header removido - informações no card lateral */}
                            {selectedLiveConfig && selectedLiveData && (
                                <LiveConfigForm
                                    liveIndex={selectedLiveIndex}
                                    config={selectedLiveConfig}
                                    onChange={handleLiveConfigChange}
                                />
                            )}

                            {/* Next Button */}
                            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
                                <Button
                                    onClick={handleNext}
                                    disabled={!isAllConfigured}
                                    className={`px-6 py-3 rounded-[12px] flex items-center gap-2 transition-all ${isAllConfigured
                                            ? 'bg-[#7D2AE8] hover:bg-[#8D3AEC] text-white'
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    Continue to Review
                                    <ArrowRight className="w-5 h-5" />
                                </Button>
                            </div>
                            {!isAllConfigured && (
                                <p className="text-xs text-gray-500 text-right mt-2">
                                    Configure all {step1Data.lives.length} lives to continue
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
