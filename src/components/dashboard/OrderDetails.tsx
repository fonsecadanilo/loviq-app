import React, { useState, useEffect } from 'react';
import { X, Check, Megaphone, Radio, Loader2, Users, Mail, Phone, MapPin, Copy } from 'lucide-react';
import { cn } from '../../lib/utils';
import jsPDF from 'jspdf';

// Interfaces matching the data structure we need
export interface OrderDetailsData {
    id: string;
    customer: {
        name: string;
        email: string;
        phone: string;
    };
    date: string;
    total: string;
    status: string; // 'Completed' | 'Pending' | ...
    items: Array<{
        name: string;
        image: string;
        price: string;
        quantity: number;
        sku: string;
    }>;
    source: {
        liveName: string;
        campaignName: string;
        date: string;
    };
    influencer: {
        name: string;
        image: string;
        handle: string;
        commission: string;
        commissionRate: string;
    };
    payment: {
        method: string;
        installments?: string;
    };
}

interface OrderDetailsProps {
    order: OrderDetailsData;
    onClose: () => void;
}

export const OrderDetails: React.FC<OrderDetailsProps> = ({ order, onClose }) => {
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [toastVisible, setToastVisible] = useState(false);
    const [currentStatus, setCurrentStatus] = useState(order.status);
    const [cancelReason, setCancelReason] = useState('');
    const [isDownloading, setIsDownloading] = useState(false);

    // Reset reason when modal opens/closes
    useEffect(() => {
        if (!isCancelModalOpen) {
            setCancelReason('');
        }
    }, [isCancelModalOpen]);

    // Helper to get status badge styles
    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'Paid':
            case 'Completed':
                return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20';
            case 'Canceled':
            case 'Cancelled':
                return 'bg-slate-100 text-slate-500 ring-slate-500/10';
            case 'Pending':
                return 'bg-yellow-50 text-yellow-700 ring-yellow-600/20';
            default:
                return 'bg-slate-50 text-slate-700 ring-slate-600/20';
        }
    };

    const handleCancelOrder = () => {
        setIsCancelModalOpen(false);
        setCurrentStatus('Canceled');
        setToastVisible(true);

        // Hide toast after 4 seconds
        setTimeout(() => {
            setToastVisible(false);
        }, 4000);
    };

    const handleDownloadReceipt = async () => {
        setIsDownloading(true);
        
        // Small delay to show the spinner (UX)
        await new Promise(resolve => setTimeout(resolve, 800));

        const doc = new jsPDF();
        
        // Add logo or store name
        doc.setFontSize(22);
        doc.setTextColor(33, 33, 33);
        doc.text('Loviq Store', 20, 20);
        
        // Receipt Title
        doc.setFontSize(16);
        doc.setTextColor(100, 100, 100);
        doc.text('Order Receipt', 20, 35);
        
        // Divider
        doc.setDrawColor(200, 200, 200);
        doc.line(20, 40, 190, 40);
        
        // Order Info
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        doc.text(`Order ID: ${order.id}`, 20, 55);
        doc.text(`Date: ${order.date}`, 20, 62);
        doc.text(`Status: ${order.status}`, 20, 69);
        doc.text(`Payment Method: ${order.payment.method} ${order.payment.installments ? `(${order.payment.installments})` : ''}`, 20, 76);

        // Customer Info (Right side)
        doc.text(`Customer: ${order.customer.name}`, 120, 55);
        doc.text(`Email: ${order.customer.email}`, 120, 62);
        doc.text(`Phone: ${order.customer.phone}`, 120, 69);
        
        // Items Table Header
        let yPos = 95;
        doc.setFillColor(245, 245, 245);
        doc.rect(20, yPos - 5, 170, 10, 'F');
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text('Item', 25, yPos + 2);
        doc.text('Qty', 140, yPos + 2);
        doc.text('Price', 170, yPos + 2);
        
        yPos += 15;
        
        // Items List
        order.items.forEach((item) => {
            doc.setTextColor(60, 60, 60);
            doc.text(item.name, 25, yPos);
            doc.text(item.sku, 25, yPos + 5); // Subtitle for SKU
            doc.text(item.quantity.toString(), 140, yPos);
            doc.text(item.price, 170, yPos);
            yPos += 15;
        });
        
        // Divider
        doc.line(20, yPos, 190, yPos);
        yPos += 10;
        
        // Total
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text(`Total: ${order.total}`, 140, yPos);
        
        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('Thank you for your purchase!', 105, 280, { align: 'center' });
        
        // Save
        doc.save(`receipt-${order.id.replace('#', '')}.pdf`);
        
        setIsDownloading(false);
    };

    // Helper Component for Copyable Text
    const CopyableText = ({ text, icon: Icon, label }: { text: string, icon?: any, label?: string }) => {
        const [copied, setCopied] = useState(false);

        const handleCopy = () => {
            navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        };

        return (
            <div className="group relative flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-white overflow-visible">
                {/* Icon */}
                {Icon && (
                    <div className="p-2 bg-slate-50 rounded-lg text-slate-400 flex-shrink-0">
                        <Icon className="w-4 h-4" />
                    </div>
                )}
                
                {/* Content */}
                <div className="min-w-0 flex-1 relative">
                    {label && <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</span>}
                    
                    <div className="flex items-center justify-between gap-2">
                        {/* Text Container with Tooltip */}
                        <div className="relative group/tooltip min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-900 truncate cursor-default">
                                {text}
                            </p>
                            
                            {/* Custom Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-slate-900 text-white text-xs rounded-md opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-50 shadow-xl translate-y-1 group-hover/tooltip:translate-y-0">
                                {text}
                                {/* Arrow */}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                            </div>
                        </div>
                        
                        {/* Copy Button */}
                        <button 
                            onClick={handleCopy}
                            className={cn(
                                "text-slate-400 hover:text-slate-600 p-1.5 rounded-md hover:bg-slate-50 transition-all duration-200 flex-shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100",
                                copied && "text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 opacity-100"
                            )}
                            title="Copy to clipboard"
                        >
                            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="relative flex flex-col h-full">
            {/* Scrollable Container */}
            <div className="flex-1 overflow-y-auto">
                {/* Header - Sticky with Apple-style blur */}
                <div className="sticky top-0 z-20 px-6 py-5 border-b border-slate-200/60 flex items-center justify-between bg-white/80 backdrop-blur-xl backdrop-saturate-150">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl font-semibold tracking-tight text-slate-900">
                                {order.id}
                            </h1>
                            <span className={cn(
                                "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset transition-all duration-300",
                                getStatusBadgeClass(currentStatus)
                            )}>
                                {currentStatus}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                            Placed on {order.date} at 10:42 AM
                        </p>
                    </div>
                    <button 
                        type="button"
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-all duration-200"
                    >
                        <X className="w-5 h-5" strokeWidth={1.5} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-8">
                {/* Customer Details */}
                <section>
                    <div className="flex items-center gap-2 mb-4 text-slate-900">
                        <Users className="w-4 h-4 text-slate-400" />
                        <h2 className="text-sm font-medium">Customer Details</h2>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        {/* Header: Avatar + Name */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-sm font-bold uppercase">
                                {order.customer.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900">{order.customer.name}</h3>
                                <p className="text-sm text-slate-500">Customer since 2023</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {/* Contact Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <CopyableText text={order.customer.email} icon={Mail} />
                                <CopyableText text={order.customer.phone} icon={Phone} />
                            </div>

                            {/* Address */}
                            <CopyableText 
                                text="Av. Paulista, 1578 - Bela Vista - São Paulo, SP - 01310-200" 
                                icon={MapPin} 
                                label="Shipping Address" 
                            />

                            {/* Method */}
                            <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 bg-white">
                                <div className="p-2 bg-slate-50 rounded-lg text-slate-400 flex-shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="1" y="3" width="15" height="13"></rect>
                                        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                                        <circle cx="5.5" cy="18.5" r="2.5"></circle>
                                        <circle cx="18.5" cy="18.5" r="2.5"></circle>
                                    </svg>
                                </div>
                                <div>
                                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                                        Method
                                    </span>
                                    <div className="text-sm font-medium text-slate-900">
                                        Sedex Express (1-2 days)
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Order Items */}
                <section>
                    <div className="flex items-center gap-2 mb-4 text-slate-900">
                        <svg className="text-slate-400" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m7.5 4.27 9 5.15"></path>
                            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
                            <path d="m3.3 7 8.7 5 8.7-5"></path>
                            <path d="M12 22v-10"></path>
                        </svg>
                        <h2 className="text-sm font-medium">Items</h2>
                    </div>

                    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                        {order.items.map((item, idx) => (
                            <div key={idx} className="p-4 flex gap-4 items-start border-b border-slate-100 last:border-0">
                                <div className="h-16 w-16 bg-slate-100 rounded-md flex-shrink-0 overflow-hidden relative">
                                    <img src={item.image} className="object-cover h-full w-full" alt={item.name} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-sm font-medium text-slate-900 truncate">
                                                {item.name}
                                            </h3>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                SKU: {item.sku}
                                            </p>
                                        </div>
                                        <span className="text-sm font-medium text-slate-900">
                                            {item.price}
                                        </span>
                                    </div>
                                    <div className="mt-2 flex items-center gap-2">
                                        <span className="text-xs bg-slate-50 text-slate-600 px-1.5 py-0.5 rounded border border-slate-100">
                                            Qty: {item.quantity}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Attribution & Influencer */}
                <section>
                    <div className="flex items-center gap-2 mb-4 text-slate-900">
                        <svg className="text-slate-400" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"></path>
                            <path d="M8.5 8.5v.01"></path>
                            <path d="M16 15.5v.01"></path>
                            <path d="M12 12v.01"></path>
                            <path d="M11 17v.01"></path>
                            <path d="M7 14v.01"></path>
                        </svg>
                        <h2 className="text-sm font-medium">Attribution & Commission</h2>
                    </div>

                    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                        {/* Campaign */}
                        <div className="flex gap-4 p-4 pb-0 relative group">
                            {/* Line connector */}
                            <div className="absolute left-[2rem] top-8 bottom-0 border-l-2 border-dotted border-slate-200 group-last:hidden"></div>
                            
                            <div className="relative z-10 flex-shrink-0 w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                                <Megaphone className="w-4 h-4" strokeWidth={2} />
                            </div>
                            <div className="flex-1 pb-6">
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-0.5">Campaign</p>
                                <p className="text-sm font-medium text-slate-900">{order.source.campaignName}</p>
                            </div>
                        </div>

                        {/* Live */}
                        <div className="flex gap-4 p-4 pb-0 pt-0 relative group">
                            <div className="absolute left-[2rem] top-0 bottom-0 border-l-2 border-dotted border-slate-200 group-last:hidden"></div>
                            
                            <div className="relative z-10 flex-shrink-0 w-8 h-8 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                                <Radio className="w-4 h-4" strokeWidth={2} />
                            </div>
                            <div className="flex-1 pb-6">
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-0.5">Source Live</p>
                                <p className="text-sm font-medium text-slate-900">{order.source.liveName}</p>
                            </div>
                        </div>

                        {/* Influencer */}
                        <div className="flex gap-4 p-4 pt-0 relative group">
                            <div className="relative z-10 flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                                <img src={order.influencer.image} className="h-full w-full object-cover" alt={order.influencer.name} />
                            </div>
                            <div className="flex-1 flex justify-between items-start pb-4">
                                <div>
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-0.5">Influencer</p>
                                    <p className="text-sm font-medium text-slate-900">{order.influencer.name}</p>
                                    <p className="text-xs text-slate-400">{order.influencer.handle}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-400 mb-1">Commission</p>
                                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                                        + {order.influencer.commission}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Payment Summary */}
                <section className="border-t border-slate-100 pt-6">
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Subtotal</span>
                            <span className="text-slate-900">{order.total}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Shipping</span>
                            <span className="text-slate-900">Free</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Taxes</span>
                            <span className="text-slate-900">R$ 0,00</span>
                        </div>
                        <div className="h-px bg-slate-100 my-2"></div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-slate-900">Total</span>
                            <span className="text-xl font-semibold text-slate-900 tracking-tight">
                                {order.total}
                            </span>
                        </div>
                    </div>

                    <div className="mt-6 bg-slate-50 rounded-md p-3 flex items-center justify-between border border-slate-100">
                        <div className="flex items-center gap-2">
                            <svg className="text-slate-500" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect width="20" height="14" x="2" y="5" rx="2"></rect>
                                <line x1="2" x2="22" y1="10" y2="10"></line>
                            </svg>
                            <span className="text-sm text-slate-600">
                                Credit Card ending
                                <strong>4242</strong>
                            </span>
                        </div>
                        <span className="text-xs text-slate-400">Processed via Stripe</span>
                    </div>
                </section>

                {/* Danger Zone - Cancel Order */}
                <section className="border-t border-slate-100 pt-6">
                    <div className="flex items-center gap-2 mb-4 text-red-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" x2="12" y1="8" y2="12"></line>
                            <line x1="12" x2="12.01" y1="16" y2="16"></line>
                        </svg>
                        <h2 className="text-sm font-medium">Cancel Order</h2>
                    </div>
                    
                    <div className="bg-red-50/50 rounded-lg border border-red-100 p-4">
                        <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                            This action will cancel the order, notify the customer, and initiate a refund. 
                            Frequent cancellations may be flagged as suspicious activity and could result 
                            in a temporary suspension of live streaming privileges for your store.
                        </p>
                        <button 
                            onClick={() => setIsCancelModalOpen(true)}
                            disabled={currentStatus === 'Canceled' || currentStatus === 'Cancelled'}
                            className="flex items-center gap-2 px-4 py-2 rounded-md bg-white border border-red-200 text-sm font-medium text-red-600 hover:bg-red-50 hover:border-red-300 transition-all focus:ring-2 focus:ring-red-500/20 outline-none disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                            Cancel Order
                        </button>
                    </div>
                </section>

                    {/* Spacer for footer */}
                    <div className="h-4"></div>
                </div>
            </div>

            {/* Footer Actions - Fixed Bottom */}
            <div className="flex-shrink-0 border-t border-slate-100 p-6 bg-white grid grid-cols-2 gap-3">
                <button 
                    onClick={onClose}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-md border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all focus:ring-2 focus:ring-slate-200 outline-none"
                >
                    Close
                </button>
                <button 
                    onClick={handleDownloadReceipt}
                    disabled={isDownloading}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-all shadow-md shadow-slate-900/10 focus:ring-2 focus:ring-slate-900/20 outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isDownloading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" x2="12" y1="15" y2="3"></line>
                        </svg>
                    )}
                    {isDownloading ? 'Generating PDF...' : 'Download Receipt'}
                </button>
            </div>

            {/* Cancel Confirmation Modal */}
            {isCancelModalOpen && (
                <div className="fixed inset-0 z-[110]" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsCancelModalOpen(false)}
                    ></div>

                    {/* Modal Panel */}
                    <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-sm ring-1 ring-black/5">
                                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mx-auto flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-50 sm:mx-0 sm:h-10 sm:w-10">
                                            <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"></path>
                                            </svg>
                                        </div>
                                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                                            <h3 className="text-base font-semibold leading-6 text-slate-900" id="modal-title">
                                                Cancel Order
                                            </h3>
                                            <div className="mt-2">
                                                <p className="text-sm text-slate-500 mb-4">
                                                    Are you sure you want to cancel order
                                                    <span className="font-medium text-slate-900 mx-1">{order.id}</span>
                                                    ? This action cannot be undone and the customer will be
                                                    notified immediately.
                                                </p>
                                                
                                                <div className="space-y-1.5">
                                                    <label htmlFor="cancel-reason" className="block text-xs font-medium text-slate-700">
                                                        Reason for cancellation
                                                    </label>
                                                    <div className="relative">
                                                        <select
                                                            id="cancel-reason"
                                                            value={cancelReason}
                                                            onChange={(e) => setCancelReason(e.target.value)}
                                                            className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 bg-white appearance-none cursor-pointer"
                                                        >
                                                            <option value="" disabled>Select a reason</option>
                                                            <option value="out_of_stock">Out of Stock</option>
                                                            <option value="undeliverable">Shipping Address Undeliverable</option>
                                                        </select>
                                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-slate-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 border-t border-slate-100 gap-2">
                                    <button 
                                        type="button" 
                                        onClick={handleCancelOrder}
                                        disabled={!cancelReason}
                                        className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:w-auto transition-colors outline-none focus:ring-2 focus:ring-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Yes, Cancel
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => setIsCancelModalOpen(false)}
                                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 sm:mt-0 sm:w-auto transition-colors outline-none focus:ring-2 focus:ring-slate-200"
                                    >
                                        Keep Order
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification - Only render when visible */}
            {toastVisible && (
                <div className="fixed top-6 right-1/2 translate-x-1/2 sm:translate-x-0 sm:right-6 z-[120] transition-all duration-500 pointer-events-none">
                    <div className="flex items-center w-max max-w-sm p-3 gap-3 bg-white/80 backdrop-blur-xl rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/40 ring-1 ring-black/5 pointer-events-auto" role="alert">
                        <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-emerald-600 bg-emerald-100/60 rounded-full">
                            <Check className="w-4 h-4" strokeWidth={2} />
                            <span className="sr-only">Check icon</span>
                        </div>
                        <div className="text-sm font-medium text-slate-800 pr-2">
                            Order canceled successfully
                        </div>
                        <button 
                            type="button" 
                            onClick={() => setToastVisible(false)}
                            className="ml-auto -mx-1 -my-1 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100/50 rounded-md transition-colors focus:ring-2 focus:ring-slate-200 outline-none pointer-events-auto"
                        >
                            <X className="w-4 h-4" strokeWidth={2} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};