import { useState, useEffect } from 'react';
import { useOrder } from '../context/OrderContext';
import { Search, CheckCircle, Clock, Download, Printer, Check, X, Bell, RefreshCw, TrendingUp, FileText, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { Link } from 'react-router-dom';

export default function Vendor() {
    const { orders, verifyOrderOtp, markAsPrinted, markAsCollected } = useOrder();
    const [otpInput, setOtpInput] = useState('');
    const [verificationResult, setVerificationResult] = useState(null);
    const [activeTab, setActiveTab] = useState('queue'); // queue, completed

    const handleVerify = (e) => {
        e.preventDefault();
        if (otpInput.length < 4) return;

        const matchingOrder = orders.find(o => o.otp === otpInput && o.status !== 'collected');

        if (matchingOrder) {
            setVerificationResult({ success: true, message: `Verified #${matchingOrder.id}!`, orderId: matchingOrder.id });
            setOtpInput('');
            setTimeout(() => setVerificationResult(null), 3000);
        } else {
            setVerificationResult({ success: false, message: 'Invalid OTP' });
            setTimeout(() => setVerificationResult(null), 3000);
        }
    };

    const queueOrders = orders.filter(o => o.status === 'paid' || o.status === 'printed');
    const completedOrders = orders.filter(o => o.status === 'collected');
    const displayedOrders = activeTab === 'queue' ? queueOrders : completedOrders;

    // Stats Check
    const totalEarnings = orders.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
    const pendingOrdersCount = queueOrders.length;
    const completedOrdersCount = completedOrders.length;

    return (
        <div className="min-h-screen bg-gray-50 pb-20 font-sans">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 p-4 sticky top-0 z-30 shadow-sm">
                <div className="container mx-auto max-w-4xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                            <Printer size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                            <div>
                                <h1 className="font-bold text-lg leading-tight">JIIT 128 Print Admin</h1>
                                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Campus Link Active
                                </p>
                            </div>
                        </div>
                    </div>
                    <Link to="/" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                        <User size={20} className="text-gray-600" />
                    </Link>
                </div>
            </div>

            <div className="container mx-auto max-w-4xl p-4 space-y-6">

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4">
                    <StatCard label="Earnings" value={`₹${totalEarnings}`} icon={<TrendingUp size={16} />} color="text-green-600 bg-green-50" />
                    <StatCard label="Pending" value={pendingOrdersCount} icon={<Clock size={16} />} color="text-orange-600 bg-orange-50" />
                    <StatCard label="Done" value={completedOrdersCount} icon={<CheckCircle size={16} />} color="text-blue-600 bg-blue-50" />
                </div>

                {/* OTP Input Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <form onSubmit={handleVerify} className="max-w-md mx-auto text-center">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 block">Quick Verify</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="0 0 0 0"
                                value={otpInput}
                                onChange={(e) => setOtpInput(e.target.value)}
                                maxLength={4}
                                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-center text-3xl font-mono tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-gray-900 placeholder:text-gray-300"
                            />
                        </div>
                        <button
                            type="submit"
                            className="mt-4 w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
                            disabled={otpInput.length !== 4}
                        >
                            Verify Code
                        </button>

                        <AnimatePresence>
                            {verificationResult && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className={clsx(
                                        "mt-4 p-3 rounded-xl font-bold flex items-center justify-center gap-2",
                                        verificationResult.success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                    )}
                                >
                                    {verificationResult.success ? <CheckCircle size={18} /> : <X size={18} />}
                                    {verificationResult.message}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </form>
                </div>

                {/* Tabs */}
                <div>
                    <div className="flex gap-6 border-b border-gray-100 px-2">
                        <TabButton active={activeTab === 'queue'} onClick={() => setActiveTab('queue')}>
                            Live Queue <span className="ml-2 bg-gray-100 text-gray-600 text-xs py-0.5 px-2 rounded-full">{queueOrders.length}</span>
                        </TabButton>
                        <TabButton active={activeTab === 'completed'} onClick={() => setActiveTab('completed')}>
                            History
                        </TabButton>
                    </div>
                </div>

                {/* Orders List */}
                <div className="space-y-3 pb-24">
                    <AnimatePresence mode='popLayout'>
                        {displayedOrders.length === 0 ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                                <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FileText size={32} />
                                </div>
                                <p className="text-gray-400 font-medium">No orders in this list</p>
                            </motion.div>
                        ) : (
                            displayedOrders.map((order) => (
                                <OrderCard
                                    key={order.id}
                                    order={order}
                                    onPrint={() => markAsPrinted(order.id)}
                                    onCollect={() => markAsCollected(order.id)}
                                />
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon, color }) {
    return (
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center gap-2">
            <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center", color)}>
                {icon}
            </div>
            <div>
                <div className="text-lg font-bold text-gray-900 leading-none mb-1">{value}</div>
                <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</div>
            </div>
        </div>
    )
}

function TabButton({ children, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={clsx(
                "pb-3 font-bold text-sm transition-colors relative",
                active ? "text-primary" : "text-gray-400 hover:text-gray-600"
            )}
        >
            {children}
            {active && <motion.div layoutId="tab" className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />}
        </button>
    )
}

function OrderCard({ order, onPrint, onCollect }) {
    const downloadFile = () => {
        // Mock download
        const text = `Mock File Content for Order #${order.id}\nFiles: ${order.files.map(f => f.name).join(', ')}`;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `jprint_order_${order.id}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden group hover:border-primary/30 transition-all"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className={clsx("w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl",
                        order.status === 'paid' ? "bg-blue-50 text-blue-600" :
                            order.status === 'printed' ? "bg-amber-50 text-amber-600" : "bg-green-50 text-green-600"
                    )}>
                        {order.otp}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Order #{order.id}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <StatusBadge status={order.status} />
                            <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded font-bold">Paid ₹{order.totalAmount}</span>
                        </div>
                    </div>
                </div>
                <span className="text-xs text-gray-400 font-medium">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 mb-4 space-y-2">
                {order.files.map((file, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                        <FileText size={14} className="text-gray-400" />
                        <span className="truncate flex-1">{file.name}</span>
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-3 text-xs font-semibold text-gray-500 mb-4 px-1">
                <span className="bg-gray-100 px-2 py-1 rounded">{order.settings.color ? 'Color' : 'B&W'}</span>
                <span className="bg-gray-100 px-2 py-1 rounded">{order.settings.doubleSided ? 'Double Sided' : 'Single Sided'}</span>
                <span className="bg-gray-100 px-2 py-1 rounded">{order.settings.copies} Copies</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={downloadFile}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors"
                >
                    <Download size={16} /> Download
                </button>

                {order.status === 'paid' && (
                    <button onClick={onPrint} className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                        <Printer size={16} /> Mark Printed
                    </button>
                )}

                {order.status === 'printed' && (
                    <button onClick={onCollect} className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-green-600 text-white font-bold text-sm hover:bg-green-700 transition-colors shadow-lg shadow-green-200">
                        <Check size={16} /> Complete Order
                    </button>
                )}
                {order.status === 'collected' && (
                    <button disabled className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gray-100 text-gray-400 font-bold text-sm cursor-not-allowed">
                        <CheckCircle size={16} /> Completed
                    </button>
                )}
            </div>
        </motion.div>
    );
}

function StatusBadge({ status }) {
    const styles = {
        paid: "text-blue-600",
        printed: "text-amber-600",
        collected: "text-green-600"
    };
    const labels = {
        paid: "In Queue",
        printed: "Printed",
        collected: "Collected"
    };
    return (
        <span className={clsx("text-xs font-bold", styles[status])}>
            {labels[status]}
        </span>
    );
}
