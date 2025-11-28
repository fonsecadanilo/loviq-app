import React, { useEffect, useRef } from 'react';
import { Phone, Video, MoreVertical, ArrowLeft } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';

interface Message {
    id: string;
    content: string;
    senderId: string;
    timestamp: Date;
    isOwn: boolean;
}

interface Contact {
    id: string;
    name: string;
    avatar?: string;
    online: boolean;
}

interface ChatWindowProps {
    contact: Contact | null;
    messages: Message[];
    onSendMessage: (content: string) => void;
    onBack?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
    contact,
    messages,
    onSendMessage,
    onBack,
}) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    if (!contact) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-[#FAFAFA] text-center p-8">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100">
                    <span className="text-4xl">👋</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                    Welcome to Loviq Chat
                </h3>
                <p className="text-slate-500 max-w-md">
                    Select a conversation from the left to start chatting with your influencers and partners.
                </p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-[#FAFAFA] min-w-0">
            {/* Header */}
            <div className="h-20 px-6 bg-white border-b border-slate-100 flex items-center justify-between shadow-sm z-10 flex-shrink-0">
                <div className="flex items-center gap-4">
                    {onBack && (
                        <button onClick={onBack} className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-50 rounded-xl">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    )}
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-semibold flex-shrink-0 overflow-hidden border border-slate-100">
                            {contact.avatar ? (
                                <img
                                    src={contact.avatar}
                                    alt={contact.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                contact.name.charAt(0)
                            )}
                        </div>
                        {contact.online && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 text-base">{contact.name}</h3>
                        <p className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-md inline-block mt-0.5">
                            {contact.online ? 'Online' : 'Offline'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors hidden sm:block">
                        <Phone className="w-5 h-5" />
                    </button>
                    <button className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors hidden sm:block">
                        <Video className="w-5 h-5" />
                    </button>
                    <button className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
                        <MoreVertical className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
                {messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <MessageInput onSendMessage={onSendMessage} />
        </div>
    );
};
