import React from 'react';
import { Search, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';

interface Contact {
    id: string;
    name: string;
    avatar?: string;
    lastMessage: string;
    timestamp: Date;
    unreadCount: number;
    online: boolean;
}

interface ContactListProps {
    contacts: Contact[];
    selectedContactId: string | null;
    onSelectContact: (id: string) => void;
}

export const ContactList: React.FC<ContactListProps> = ({
    contacts,
    selectedContactId,
    onSelectContact,
}) => {
    return (
        <div className="flex flex-col h-full bg-white border-r border-gray-200 w-80 lg:w-96 flex-shrink-0">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="font-semibold text-gray-800">Messages</h2>
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                    <MoreVertical className="w-5 h-5" />
                </button>
            </div>

            <div className="p-4">
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search contacts..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7D2AE8]/20 focus:border-[#7D2AE8] transition-all"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {contacts.map((contact) => (
                    <div
                        key={contact.id}
                        onClick={() => onSelectContact(contact.id)}
                        className={`p-4 flex items-center gap-3 cursor-pointer transition-colors border-b border-gray-50 hover:bg-gray-50 ${selectedContactId === contact.id ? 'bg-[#7D2AE8]/5' : ''
                            }`}
                    >
                        <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#7D2AE8] to-[#9F5AFD] flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
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
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-1">
                                <h3 className="font-medium text-gray-900 truncate">{contact.name}</h3>
                                <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                    {format(contact.timestamp, 'HH:mm')}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-gray-500 truncate">{contact.lastMessage}</p>
                                {contact.unreadCount > 0 && (
                                    <span className="ml-2 min-w-[20px] h-5 px-1.5 flex items-center justify-center bg-[#7D2AE8] text-white text-[10px] font-bold rounded-full">
                                        {contact.unreadCount}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
