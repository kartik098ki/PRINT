import { useAuth } from '../context/AuthContext';
import { useOrder } from '../context/OrderContext';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Wallet, History, ChevronRight, LogOut, FileText, CheckCircle, Clock, Printer } from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

export default function Profile() {
    const { user, logout } = useAuth();
    const { orders } = useOrder();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Mock Wallet Balance
    const walletBalance = 150;

    // Filter orders by User ID
    const myOrders = orders.filter(o => o.userId === user?.id);

    return (
        <div className="min-h-screen bg-gray-50 pb-24 font-sans text-gray-900">

            {/* Header */}
            <div className="bg-primary pt-12 pb-24 px-6 rounded-b-[40px] shadow-lg relative overflow-hidden">
                {/* Abstract Shapes */}
                <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-[10%] left-[-10%] w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10">
                    <div className="flex justify-between items-center mb-6">
                        <Link to="/" className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                            <ArrowLeft size={20} />
                        </Link>
                        <h1 className="text-white font-bold text-lg">My Profile</h1>
                        <div className="w-10" /> {/* Spacer */}
                    </div>

                    <div className="flex items-center gap-4 text-white">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl font-bold shadow-inner">
                            {user?.name?.[0].toUpperCase() || 'U'}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold leading-tight">{user?.name || 'Student'}</h2>
                            <p className="text-white/80 text-sm">{user?.email || 'guest@jiit.edu'}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container max-w-md mx-auto px-4 -mt-16 relative z-20 space-y-6">

                {/* Wallet Card */}
                <div className="bg-white p-5 rounded-2xl shadow-xl border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">J-Money Balance</p>
                        <h3 className="text-3xl font-bold text-gray-900">₹{walletBalance}</h3>
                    </div>
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                        <Wallet size={24} strokeWidth={2.5} />
                    </div>
                </div>

                {/* Menu List */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <Link to="/order" className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-50">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center"><FileText size={16} /></div>
                            <span className="font-bold text-gray-700">New Print Order</span>
                        </div>
                        <ChevronRight size={16} className="text-gray-300" />
                    </Link>
                    <button disabled className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 opacity-50 cursor-not-allowed">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center"><Wallet size={16} /></div>
                            <span className="font-bold text-gray-700">Add Money (Soon)</span>
                        </div>
                        <ChevronRight size={16} className="text-gray-300" />
                    </button>
                    <button onClick={handleLogout} className="w-full flex items-center justify-between p-4 hover:bg-red-50 transition-colors text-red-600">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center"><LogOut size={16} /></div>
                            <span className="font-bold">Log Out</span>
                        </div>
                    </button>
                </div>

                {/* Order History */}
                <div>
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <History size={18} className="text-primary" /> Recent Orders
                    </h3>

                    <div className="space-y-3">
                        {myOrders.length === 0 ? (
                            <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-200">
                                <p className="text-gray-400 text-sm">No orders yet</p>
                            </div>
                        ) : (
                            myOrders.map(order => (
                                <div key={order.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                                    <div className={clsx("w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white shrink-0",
                                        order.status === 'collected' ? "bg-green-500" :
                                            order.status === 'printed' ? "bg-amber-500" : "bg-blue-500"
                                    )}>
                                        {order.status === 'collected' ? <CheckCircle size={20} /> :
                                            order.status === 'printed' ? <Printer size={20} /> : <Clock size={20} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-gray-900 truncate">Order #{order.id}</h4>
                                            <span className="text-xs font-bold text-green-600">₹{order.totalAmount}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 truncate">{order.files.length} Files • {new Date(order.createdAt).toLocaleDateString()}</p>
                                        <div className="mt-1 flex items-center gap-2">
                                            <span className={clsx("text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider",
                                                order.status === 'collected' ? "bg-green-100 text-green-700" :
                                                    order.status === 'printed' ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                                            )}>
                                                {order.status === 'paid' ? 'In Queue' : order.status}
                                            </span>
                                            {order.status !== 'collected' && <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-mono">OTP: {order.otp}</span>}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
