import React from 'react';

interface ChatLayoutProps {
    children: React.ReactNode;
}

export const ChatLayout: React.FC<ChatLayoutProps> = ({ children }) => {
    return (
        <div className="flex h-screen bg-white overflow-hidden">
            {children}
        </div>
    );
};
