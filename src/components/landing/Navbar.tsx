import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    return (
        <nav className="w-full bg-white py-4 px-4 sm:px-6 lg:px-8 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#7D2AE8] rounded-full flex items-center justify-center">
                        {/* Simple sun/star icon representation or just the Loviq logo placeholder */}
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07" />
                        </svg>
                    </div>
                    <span className="text-xl font-bold text-gray-900">loviq</span>
                </div>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-8">
                    <a href="#" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Products</a>
                    <a href="#" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Customer Stories</a>
                    <a href="#" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Resources</a>
                    <a href="#" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Pricing</a>
                </div>

                {/* Right Actions */}
                <div className="hidden md:flex items-center gap-6">
                    <a href="#" className="text-gray-900 font-medium text-sm">Book A Demo</a>
                    <Link
                        to="/signup"
                        className="bg-[#7D2AE8] text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-[#6d24ca] transition-colors"
                    >
                        Get Started
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 text-gray-600"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-white border-t border-gray-100 py-4 px-4 shadow-lg flex flex-col gap-4">
                    <a href="#" className="text-gray-600 font-medium">Products</a>
                    <a href="#" className="text-gray-600 font-medium">Customer Stories</a>
                    <a href="#" className="text-gray-600 font-medium">Resources</a>
                    <a href="#" className="text-gray-600 font-medium">Pricing</a>
                    <div className="h-px bg-gray-100 my-2"></div>
                    <a href="#" className="text-gray-900 font-medium">Book A Demo</a>
                    <Link
                        to="/signup"
                        className="bg-[#7D2AE8] text-white px-5 py-2.5 rounded-full text-center font-medium"
                    >
                        Get Started
                    </Link>
                </div>
            )}
        </nav>
    );
};
