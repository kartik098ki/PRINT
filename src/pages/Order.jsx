import { useState, useEffect } from 'react';
import { ArrowLeft, Check, ChevronRight, Loader2, Upload, File, X, FileImage, CreditCard } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useOrder } from '../context/OrderContext';
import { clsx } from 'clsx';

export default function Order() {
    const { currentOrder, addFile, removeFile, updateSettings, calculateTotal, placeOrder } = useOrder();
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Upload, 2: Settings, 3: Success
    const [isProcessing, setIsProcessing] = useState(false);
    const [completedOrder, setCompletedOrder] = useState(null);

    const total = calculateTotal();
    const hasFiles = currentOrder.files.length > 0;

    const handleNext = () => {
        if (step === 1 && hasFiles) setStep(2);
    };

    const handlePay = async () => {
        setIsProcessing(true);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Fake network delay
        const order = placeOrder();
        setCompletedOrder(order);
        setIsProcessing(false);
        setStep(3);
    };

    // Auto-scroll to top on step change
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [step]);

    if (step === 3 && completedOrder) {
        return (
            <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-6 text-center">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white mb-6 shadow-lg shadow-green-200"
                >
                    <Check size={48} strokeWidth={4} />
                </motion.div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Order Placed!</h2>
                <p className="text-gray-600 mb-8">Show this OTP at the counter.</p>

                <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 w-full max-w-sm mb-8">
                    <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Your OTP</div>
                    <div className="text-5xl font-mono font-bold text-gray-900 tracking-[0.2em]">{completedOrder.otp}</div>
                </div>

                <Link to="/" className="btn bg-gray-900 text-white w-full max-w-xs py-4 rounded-xl text-lg font-medium">
                    Back to Home
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-32">
            {/* Header */}
            <div className="bg-white sticky top-0 z-40 px-4 py-4 border-b border-gray-100 flex items-center gap-4">
                <button onClick={() => step === 1 ? navigate('/') : setStep(step - 1)} className="p-2 hover:bg-gray-100 rounded-full">
                </button>
                    )}
            </div>
        </div>
        </div >
    );
}
