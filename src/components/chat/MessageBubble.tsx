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
                className={`max-w-[70%] rounded-2xl px-4 py-2 ${message.isOwn
                        ? 'bg-[#7D2AE8] text-white rounded-br-none'
                        : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none shadow-sm'
                    }`}
            >
                <p className="text-sm leading-relaxed">{message.content}</p>
                <div
                    className={`text-[10px] mt-1 text-right ${message.isOwn ? 'text-purple-200' : 'text-gray-400'
                        }`}
                >
                    {format(message.timestamp, 'HH:mm')}
                </div>
            </div>
        </div>
    );
};
