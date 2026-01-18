import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Mail, Lock, Shield } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            // STRICTLY Student Login Only
            const targetRole = 'user';
            const user = await login(email, password, targetRole);

            // Redirect to home if successful
            navigate('/');
        } catch (err) {
            setError('Invalid email or password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center p-6 font-sans relative overflow-hidden">
            {/* Background Blobs */}
            <div className="absolute top-[-100px] right-[-100px] w-64 h-64 bg-green-200/50 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-100px] left-[-100px] w-64 h-64 bg-blue-200/50 rounded-full blur-3xl pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/50 relative z-10 w-full max-w-sm mx-auto"
            >
                <div className="mb-8 text-center">
                    <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center font-bold text-xl mx-auto mb-4 shadow-lg">
                        J.
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
                    <p className="text-gray-500 text-sm">Sign in to continue printing.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-3">
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={18} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Student Email"
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-gray-900 font-medium focus:bg-white focus:border-black/10 focus:ring-4 focus:ring-black/5 outline-none transition-all"
                                required
                            />
                        </div>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={18} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-gray-900 font-medium focus:bg-white focus:border-black/10 focus:ring-4 focus:ring-black/5 outline-none transition-all"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="text-red-500 text-xs font-bold text-center bg-red-50 py-2 rounded-xl"
                        >
                            {error}
                        </motion.div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-black text-white font-bold py-4 rounded-2xl text-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-black/20"
                    >
                        {isLoading ? <Loader2 className="animate-spin mx-auto" /> : 'Sign In'}
                    </button>

                    <div className="text-center pt-2">
                        <span className="text-gray-500 text-sm font-medium">New here? </span>
                        <Link to="/register" className="text-black font-bold text-sm hover:underline">Create Account</Link>
                    </div>
                </form>
            </motion.div>

            {/* Vendor Link */}
            <div className="mt-8 text-center relative z-10">
                <Link to="/vendor-login" className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-black transition-colors px-4 py-2 rounded-full hover:bg-white/50">
                    <Shield size={12} /> Vendor / Admin Access
                </Link>
            </div>
        </div>
    );
}
