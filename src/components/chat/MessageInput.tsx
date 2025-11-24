import React, { useState } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';

interface MessageInputProps {
    onSendMessage: (content: string) => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage }) => {
    const [message, setMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim()) {
            onSendMessage(message);
            setMessage('');
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="p-4 bg-white border-t border-gray-100 flex items-center gap-4"
        >
            <button
                type="button"
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-50"
            >
                <Paperclip className="w-5 h-5" />
            </button>

            <div className="flex-1 relative">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="w-full bg-gray-50 border-none rounded-full py-3 pl-4 pr-12 focus:ring-2 focus:ring-[#7D2AE8]/20 focus:bg-white transition-all outline-none"
                />
                <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <Smile className="w-5 h-5" />
                </button>
            </div>

            <button
                type="submit"
                disabled={!message.trim()}
                className="p-3 bg-[#7D2AE8] text-white rounded-full hover:bg-[#6D24CA] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center"
            >
                <Send className="w-5 h-5" />
            </button>
        </form>
    );
};
