import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Lock, Mail, User, Loader2 } from 'lucide-react';

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isVendor, setIsVendor] = useState(false);
    const [vendorKey, setVendorKey] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await register(name, email, password, isVendor ? 'vendor' : 'user', vendorKey);
            navigate(isVendor ? '/vendor' : '/');
        } catch (err) {
            setError(err.toString());
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-bg-app flex flex-col justify-center p-6 relative overflow-hidden">
            <div className="absolute bottom-[-20%] left-[-20%] w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="w-full max-w-md mx-auto"
            >
                <div className="mb-8 text-center">
                    <Link to="/" className="inline-flex items-center gap-2 text-primary font-bold mb-4 bg-primary/5 px-4 py-1.5 rounded-full text-sm hover:bg-primary/10 transition-colors">
                        <ArrowLeft size={16} /> Back to Home
                    </Link>
                    <h1 className="text-4xl font-bold mb-2">Create Account</h1>
                    <p className="text-muted text-lg">Join JPRINT today.</p>
                </div>

                <div className="bg-white/80 backdrop-blur-xl border border-white/50 p-8 rounded-3xl shadow-xl">
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5 ml-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="John Doe"
                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-transparent focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-xl outline-none transition-all font-medium"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5 ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="student@college.edu"
                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-transparent focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-xl outline-none transition-all font-medium"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5 ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-transparent focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-xl outline-none transition-all font-medium"
                                    required
                                />
                            </div>
                        </div>

                        <label className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                            <input
                                type="checkbox"
                                checked={isVendor}
                                onChange={(e) => setIsVendor(e.target.checked)}
                                className="w-5 h-5 accent-primary rounded-md"
                            />
                            <span className="font-medium text-sm">I am a Vendor / Shop Owner</span>
                        </label>

                        <AnimatePresence>
                            {isVendor && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <label className="block text-sm font-medium mb-1.5 ml-1 text-red-600">Vendor Access Key <span className="text-xs text-red-400">(Required)</span></label>
                                    <div className="relative mb-2">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-red-400" size={20} />
                                        <input
                                            type="password"
                                            value={vendorKey}
                                            onChange={(e) => setVendorKey(e.target.value)}
                                            placeholder="Enter Top Secret Key"
                                            className="w-full pl-11 pr-4 py-3.5 bg-red-50 border border-red-100 focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 rounded-xl outline-none transition-all font-medium text-red-900 placeholder:text-red-300"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {error && <p className="text-red-600 text-sm text-center font-medium bg-red-100 p-2 rounded-lg">{error}</p>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <>Create Account <ArrowRight size={20} /></>}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-muted text-sm">Already have an account?</p>
                        <Link to="/login" className="text-primary font-bold hover:underline">Sign In</Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
