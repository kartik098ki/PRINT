import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Lock, Mail, Loader2, ShieldCheck } from 'lucide-react';

export default function VendorLogin() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            // For vendor, we assume they are already registered or we just allow login 
            // mocking authentication for registered vendors
            await login(email, password, 'vendor');
            navigate('/vendor');
        } catch (err) {
            setError(err.toString());
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col justify-center p-6 relative overflow-hidden text-white">
            {/* Dark Theme Background */}
            <div className="absolute top-[-20%] right-[-20%] w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-20%] left-[-20%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="w-full max-w-md mx-auto"
            >
                <div className="mb-10 text-center">
                    <Link to="/" className="inline-flex items-center gap-2 text-gray-400 font-bold mb-6 hover:text-white transition-colors">
                        <ArrowLeft size={16} /> Exit to Store
                    </Link>
                    <div className="w-16 h-16 bg-gradient-to-tr from-green-400 to-emerald-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-green-500/20">
                        <ShieldCheck size={32} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Vendor Portal</h1>
                    <p className="text-gray-400">Secure Access for JIIT 128 Admins</p>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 ml-1">Admin Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@jiit128.edu"
                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-800/50 border border-gray-700 focus:bg-gray-800 focus:border-green-500/50 focus:ring-4 focus:ring-green-500/10 rounded-xl outline-none transition-all font-medium text-white placeholder:text-gray-600"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-800/50 border border-gray-700 focus:bg-gray-800 focus:border-green-500/50 focus:ring-4 focus:ring-green-500/10 rounded-xl outline-none transition-all font-medium text-white placeholder:text-gray-600"
                                    required
                                />
                            </div>
                        </div>

                        {error && <p className="text-red-400 text-sm text-center font-medium bg-red-400/10 p-2 rounded-lg border border-red-400/20">{error}</p>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-500/20 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <>Access Dashboard <ArrowRight size={20} /></>}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/5 text-center">
                        <p className="text-gray-500 text-xs">New Vendor? <Link to="/register" className="text-green-400 hover:text-green-300 font-bold">Register with Key</Link></p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
