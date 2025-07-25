import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GlobalSearch from './GlobalSearch';
import { BookOpenIcon, MenuIcon, XIcon, UserIcon, WandSparklesIcon } from './ui/Icons';

const NavItem: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-1.5 ${
                isActive ? 'bg-primary-100 text-primary-600' : 'text-secondary-700 hover:bg-primary-50 hover:text-primary-600'
            }`
        }
    >
        {children}
    </NavLink>
);

const Navigation: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navLinks = [
        { path: '/', label: 'Home' },
        { path: '/categories', label: 'Categories' },
        { path: '/ai-recs', label: 'AI Recs', auth: true, icon: <WandSparklesIcon className="h-4 w-4" /> },
        { path: '/dashboard', label: 'My Library', auth: true },
        { path: '/admin', label: 'Admin', admin: true },
    ].filter(link => {
        if (link.admin) return user?.role === 'admin';
        if (link.auth) return !!user;
        return true;
    });

    return (
        <nav className="bg-white shadow-lg sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                            <BookOpenIcon className="h-8 w-8 text-primary-600" />
                            <span className="text-2xl font-bold text-secondary-900 tracking-tight">MAV LIBRARY</span>
                        </Link>
                        <div className="hidden lg:block lg:ml-10">
                            <div className="flex items-baseline space-x-4">
                               {navLinks.map(link => <NavItem key={link.path} to={link.path}>{link.icon}{link.label}</NavItem>)}
                            </div>
                        </div>
                    </div>
                    <div className="hidden lg:flex items-center gap-4">
                        <GlobalSearch />
                        {user ? (
                            <div className="relative group">
                                <button className="flex items-center gap-2 p-2 rounded-full bg-secondary-100 hover:bg-secondary-200 transition">
                                    <UserIcon className="h-6 w-6 text-secondary-600" />
                                    <span className="text-sm font-medium text-secondary-700">Hi, {user.name.split(' ')[0]}</span>
                                </button>
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
                                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100">
                                        Logout
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <button onClick={() => navigate('/auth')} className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors">
                                    Login / Sign Up
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="-mr-2 flex lg:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-secondary-600 hover:text-secondary-800 hover:bg-secondary-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isMobileMenuOpen ? <XIcon className="block h-6 w-6" /> : <MenuIcon className="block h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {isMobileMenuOpen && (
                <div className="lg:hidden absolute top-16 left-0 w-full bg-white shadow-lg">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                         {navLinks.map(link => 
                             <NavLink key={link.path} to={link.path} onClick={() => setIsMobileMenuOpen(false)}
                                className={({ isActive }) => `flex items-center gap-2 block px-3 py-2 rounded-md text-base font-medium ${isActive ? 'bg-primary-100 text-primary-600' : 'text-secondary-700 hover:bg-primary-50 hover:text-primary-600'}`}
                             >{link.icon}{link.label}</NavLink>
                         )}
                    </div>
                    <div className="pt-4 pb-3 border-t border-secondary-200 px-4">
                         <div className="mb-4"><GlobalSearch /></div>
                         {user ? (
                             <div className="flex items-center">
                                 <UserIcon className="h-8 w-8 text-secondary-600 mr-3" />
                                 <div>
                                     <div className="text-base font-medium text-secondary-800">{user.name}</div>
                                     <div className="text-sm font-medium text-secondary-600">{user.email}</div>
                                 </div>
                                 <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="ml-auto bg-secondary-100 text-secondary-600 px-3 py-1 rounded-md text-sm font-medium hover:bg-secondary-200">
                                     Logout
                                 </button>
                             </div>
                         ) : (
                             <button onClick={() => { navigate('/auth'); setIsMobileMenuOpen(false); }} className="w-full px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors">
                                 Login / Sign Up
                             </button>
                         )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navigation;