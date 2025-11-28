import React from 'react';
import { format } from 'date-fns';

interface MessageBubbleProps {
    message: {
        id: string;
        content: string;
        senderId: string;
        timestamp: Date;
        isOwn: boolean;
    };
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
    return (
        <div className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
            <div
                className={`max-w-[70%] rounded-[1.25rem] px-5 py-3 shadow-sm ${message.isOwn
                        ? 'bg-slate-900 text-white rounded-br-sm'
                        : 'bg-white text-slate-800 border border-slate-100 rounded-bl-sm'
                    }`}
            >
                <p className="text-sm leading-relaxed font-medium">{message.content}</p>
                <div
                    className={`text-[10px] mt-1.5 text-right font-medium ${message.isOwn ? 'text-slate-400' : 'text-slate-400'
                        }`}
                >
                    {format(message.timestamp, 'HH:mm')}
                </div>
            </div>
        </div>
    );
};
