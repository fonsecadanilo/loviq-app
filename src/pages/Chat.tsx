import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/dashboard/Sidebar';
import { ChatLayout } from '../components/chat/ChatLayout';
import { ContactList } from '../components/chat/ContactList';
import { ChatWindow } from '../components/chat/ChatWindow';
import { Menu, Bell } from 'lucide-react';
import { useSidebar } from '../contexts/SidebarContext';
import { ContactListSkeleton, ChatMessagesSkeleton } from '../components/ui/PageSkeletons';
import { UserMenu } from '../components/dashboard/UserMenu';
import { useUserProfile } from '../hooks/useUserProfile';

// Mock Data
const MOCK_CONTACTS = [
    {
        id: '1',
        name: 'Sarah Wilson',
        lastMessage: 'The campaign looks great! 🚀',
        timestamp: new Date(),
        unreadCount: 2,
        online: true,
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80'
    },
    {
        id: '2',
        name: 'Mike Johnson',
        lastMessage: 'Can we reschedule the call?',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        unreadCount: 0,
        online: false,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80'
    },
    {
        id: '3',
        name: 'Emma Davis',
        lastMessage: 'Thanks for the update.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
        unreadCount: 0,
        online: true,
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80'
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
    const { isCollapsed, toggleCollapse, mobileOpen, setMobileOpen } = useSidebar();
    const [isLoading, setIsLoading] = useState(true);
    const { profile, brand, influencer } = useUserProfile();

    const userProfileData = profile ? {
        profile,
        brand: brand || undefined,
        influencer: influencer || undefined
    } : null;

    // Simulate loading
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

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
            <Sidebar 
                isCollapsed={isCollapsed} 
                toggleCollapse={toggleCollapse}
                mobileOpen={mobileOpen} 
                setMobileOpen={setMobileOpen} 
            />

            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 relative bg-[#FAFAFA]">
                {/* Header with Profile */}
                <header className="flex-shrink-0 flex z-30 px-8 py-4 relative backdrop-blur-xl items-center justify-between border-b border-slate-100 bg-white/80">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setMobileOpen(true)}
                            className="lg:hidden p-2 -ml-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                        >
                            <Menu size={24} />
                        </button>
                        
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl font-bold text-slate-900">Messages</h1>
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                                {MOCK_CONTACTS.length} new
                            </span>
                        </div>
                    </div>

                    {/* Right Side: Notifications & Profile */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        <button className="relative p-2 rounded-lg hover:bg-gray-100 flex-shrink-0">
                            <Bell className="w-5 h-5 text-gray-600" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>

                        <UserMenu userProfile={userProfileData} />
                    </div>
                </header>

                {/* Chat Content */}
                <div className="flex-1 overflow-hidden p-4 lg:p-6">
                    <div className="h-full bg-white rounded-[1.5rem] border border-slate-100 shadow-sm flex overflow-hidden">
                        {isLoading ? (
                            <>
                                <ContactListSkeleton />
                                <ChatMessagesSkeleton />
                            </>
                        ) : (
                            <>
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
                                    onBack={() => setSelectedContactId(null)}
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chat;
