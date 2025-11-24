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
            <div className="flex-1 flex flex-col items-center justify-center bg-[#F8FAFC] text-center p-8">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-4xl">👋</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Welcome to Loviq Chat
                </h3>
                <p className="text-gray-500 max-w-md">
                    Select a conversation from the right to start chatting with your influencers and partners.
                </p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] min-w-0">
            {/* Header */}
            <div className="h-16 px-6 bg-white border-b border-gray-200 flex items-center justify-between shadow-sm z-10 flex-shrink-0">
                <div className="flex items-center gap-4">
                    {onBack && (
                        <button onClick={onBack} className="lg:hidden p-2 -ml-2 text-gray-500">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    )}
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7D2AE8] to-[#9F5AFD] flex items-center justify-center text-white font-semibold flex-shrink-0">
                            {contact.avatar ? (
                                <img
                                    src={contact.avatar}
                                    alt={contact.name}
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                contact.name.charAt(0)
                            )}
                        </div>
                        {contact.online && (
                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                        <p className="text-xs text-green-600 font-medium">
                            {contact.online ? 'Online' : 'Offline'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-400 hover:text-[#7D2AE8] hover:bg-[#7D2AE8]/5 rounded-full transition-colors hidden sm:block">
                        <Phone className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-[#7D2AE8] hover:bg-[#7D2AE8]/5 rounded-full transition-colors hidden sm:block">
                        <Video className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors">
                        <MoreVertical className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-2 bg-[#F1F5F9]/50">
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
