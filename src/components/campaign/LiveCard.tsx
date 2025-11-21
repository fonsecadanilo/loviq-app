import React from 'react';
import { Radio, Users, Tags } from 'lucide-react';
import type { Step1LiveConfig } from '../../lib/campaigns/types';
import { getCreatorProfile, getProfileBadgeColor } from '../../lib/campaigns/step2Utils';

interface LiveCardProps {
    live: Step1LiveConfig;
    isSelected: boolean;
    onClick: () => void;
}

function formatFollowerNumber(num: number): string {
    if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
    }
    if (num >= 1000) {
        return `${(num / 1000).toFixed(0)}k`;
    }
    return num.toString();
}

function formatFollowersRange(live: Step1LiveConfig): string {
    if (live.followersMin === null && live.followersMax === null) {
        return 'Not specified';
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

    return 'Not specified';
}

export const LiveCard: React.FC<LiveCardProps> = ({ live, isSelected, onClick }) => {
    const profile = getCreatorProfile(live.followersMin, live.followersMax);
    const profileColors = getProfileBadgeColor(profile);
    const followersDisplay = formatFollowersRange(live);

    return (
        <button
            onClick={onClick}
            className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 ${isSelected
                    ? 'border-purple-500 bg-purple-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-sm'
                }`}
            aria-label={`Configure Live ${live.index}`}
            aria-pressed={isSelected}
        >
            <div className="space-y-3">
                {/* Header: Live number and Profile badge */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isSelected ? 'bg-purple-500' : 'bg-purple-100'
                            }`}>
                            <Radio className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-purple-600'}`} />
                        </div>
                        <span className="font-semibold text-gray-900">Live {live.index}</span>
                    </div>

                    <div className={`px-2.5 py-1 rounded-full text-xs font-medium border ${profileColors.bg} ${profileColors.text} ${profileColors.border}`}>
                        {profile}
                    </div>
                </div>

                {/* Followers */}
                <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-700">{followersDisplay} followers</span>
                </div>

                {/* Segments */}
                {live.segments.length > 0 && (
                    <div className="flex items-start gap-2">
                        <Tags className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div className="flex flex-wrap gap-1.5">
                            {live.segments.map((segment) => (
                                <span
                                    key={segment.key}
                                    className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200"
                                >
                                    {segment.label}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </button>
    );
};
