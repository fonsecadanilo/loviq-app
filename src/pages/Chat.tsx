import React, { useState } from 'react';
import { Sidebar } from '../components/dashboard/Sidebar';
import { ChatLayout } from '../components/chat/ChatLayout';
import { ContactList } from '../components/chat/ContactList';
import { ChatWindow } from '../components/chat/ChatWindow';
import { Menu } from 'lucide-react';

// Mock Data
const MOCK_CONTACTS = [
    {
        id: '1',
        name: 'Sarah Wilson',
        lastMessage: 'The campaign looks great! 🚀',
        timestamp: new Date(),
        unreadCount: 2,
        online: true,
    },
    {
        id: '2',
        name: 'Mike Johnson',
        lastMessage: 'Can we reschedule the call?',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        unreadCount: 0,
        online: false,
    },
    {
        id: '3',
        name: 'Emma Davis',
        lastMessage: 'Thanks for the update.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
        unreadCount: 0,
        online: true,
    },
];

const MOCK_MESSAGES = [
    {
        id: '1',
        content: 'Hi there! How is the campaign going?',
        senderId: '2',
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
        isOwn: false,
    },
    {
        id: '2',
        content: 'It is going really well! We have reached 50% of the target.',
        senderId: 'me',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        isOwn: true,
    },
    {
        id: '3',
        content: 'That is amazing news! 🚀',
        senderId: '2',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        isOwn: false,
    },
];

export const Chat = () => {
    const [selectedContactId, setSelectedContactId] = useState<string | null>('1');
    const [messages, setMessages] = useState(MOCK_MESSAGES);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleSendMessage = (content: string) => {
        const newMessage = {
            id: Date.now().toString(),
            content,
            senderId: 'me',
            timestamp: new Date(),
            isOwn: true,
        };
        setMessages([...messages, newMessage]);
    };

    const selectedContact = MOCK_CONTACTS.find((c) => c.id === selectedContactId) || null;

    return (
        <div className="flex h-screen bg-white overflow-hidden">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 flex flex-col min-w-0 lg:pl-[280px] transition-all duration-300">
                <ChatLayout>
                    {/* Mobile Sidebar Toggle (Overlay on ContactList) */}
                    <div className="lg:hidden absolute top-4 left-4 z-20">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 bg-white rounded-full shadow-md text-gray-600 hover:text-[#7D2AE8]"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Contact List (Left) */}
                    <ContactList
                        contacts={MOCK_CONTACTS}
                        selectedContactId={selectedContactId}
                        onSelectContact={setSelectedContactId}
                    />

                    {/* Chat Window (Right) */}
                    <ChatWindow
                        contact={selectedContact}
                        messages={messages}
                        onSendMessage={handleSendMessage}
                        onBack={() => setSelectedContactId(null)} // Optional: Handle back on mobile if needed
                    />
                </ChatLayout>
            </div>
        </div>
    );
};

export default Chat;
