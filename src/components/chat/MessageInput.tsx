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
            className="p-4 bg-white border-t border-slate-100 flex items-center gap-4"
        >
            <button
                type="button"
                className="p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-50"
            >
                <Paperclip className="w-5 h-5" />
            </button>

            <div className="flex-1 relative">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="w-full bg-slate-50 border border-transparent rounded-xl py-3 pl-4 pr-12 focus:bg-white focus:border-slate-200 focus:ring-2 focus:ring-purple-500/20 transition-all outline-none text-slate-900 placeholder-slate-400"
                />
                <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <Smile className="w-5 h-5" />
                </button>
            </div>

            <button
                type="submit"
                disabled={!message.trim()}
                className="p-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md active:scale-95 flex items-center justify-center"
            >
                <Send className="w-5 h-5" />
            </button>
        </form>
    );
};
