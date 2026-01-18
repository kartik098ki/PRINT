import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const OrderContext = createContext();

export const useOrder = () => useContext(OrderContext);

export const OrderProvider = ({ children }) => {
    const { user } = useAuth();
    const [orders, setOrders] = useState(() => {
        const saved = localStorage.getItem('jprint_orders');
        return saved ? JSON.parse(saved) : [];
    });

    const [currentOrder, setCurrentOrder] = useState({
        files: [],
        settings: {
            copies: 1,
            color: false, // false = B/W, true = Color
            doubleSided: false,
        },
        status: 'draft', // draft, paid, printed, collected
    });

    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    useEffect(() => {
        localStorage.setItem('jprint_orders', JSON.stringify(orders));
    }, [orders]);

    // Real-time sync across tabs
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'jprint_orders') {
                const newOrders = e.newValue ? JSON.parse(e.newValue) : [];
                setOrders(newOrders);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const addFile = (file) => {
        // In a real app, we'd upload. Here we just store metadata and create an object URL for preview.
        const fileObj = {
            id: crypto.randomUUID(),
            name: file.name,
            type: file.type,
            size: file.size,
            previewUrl: URL.createObjectURL(file), // For previewing images
            timestamp: Date.now()
        };
        setCurrentOrder(prev => ({
            ...prev,
            files: [...prev.files, fileObj]
        }));
    };

    const removeFile = (fileId) => {
        setCurrentOrder(prev => ({
            ...prev,
            files: prev.files.filter(f => f.id !== fileId)
        }));
    };

    const updateSettings = (key, value) => {
        setCurrentOrder(prev => ({
            ...prev,
            settings: { ...prev.settings, [key]: value }
        }));
    };

    // Ensure unique OTP
    const generateUniqueOtp = (currentOrders) => {
        let newOtp;
        let isUnique = false;
        // Get all active OTPs to avoid collision
        const activeOtps = new Set(currentOrders.map(o => o.otp));

        while (!isUnique) {
            newOtp = Math.floor(1000 + Math.random() * 9000).toString();
            if (!activeOtps.has(newOtp)) {
                isUnique = true;
            }
        }
        return newOtp;
    };

    const placeOrder = (amount) => {
        return new Promise((resolve) => {
            setIsProcessingPayment(true);
            setTimeout(() => {
                // READ latest orders directly from storage to prevent collisions/stale state
                const currentStored = localStorage.getItem('jprint_orders');
                const latestOrders = currentStored ? JSON.parse(currentStored) : [];

                const newOtp = generateUniqueOtp(latestOrders);
                const newOrder = {
                    id: Date.now().toString(),
                    userId: user?.id || 'guest',
                    userEmail: user?.email || 'Guest',
                    files: currentOrder.files,
                    settings: currentOrder.settings,
                    totalAmount: amount,
                    status: 'paid', // paid, printed, collected
                    otp: newOtp,
                    createdAt: new Date().toISOString()
                };

                const updatedOrders = [newOrder, ...latestOrders];

                // Update State AND LocalStorage immediately
                setOrders(updatedOrders);
                localStorage.setItem('jprint_orders', JSON.stringify(updatedOrders));

                setIsProcessingPayment(false);
                setCurrentOrder({ files: [], settings: { copies: 1, color: false, doubleSided: false } }); // Reset
                resolve(newOtp);
            }, 1000); // Simulate payment delay
        });
    };

    const calculateTotal = () => {
        // Pricing Mock: 
        // B/W: 2 rs per page
        // Color: 10 rs per page
        const baseRate = currentOrder.settings.color ? 10 : 2;
        const items = currentOrder.files.length;
        const copies = currentOrder.settings.copies;
        return items * copies * baseRate;
    };

    // Vendor Actions
    const verifyOrderOtp = (orderId, otpInput) => {
        const order = orders.find(o => o.id === orderId);
        if (!order) return { success: false, message: 'Order not found' };
        if (order.otp === otpInput) {
            return { success: true, order };
        }
        return { success: false, message: 'Invalid OTP' };
    };

    const markAsPrinted = (orderId) => {
        const updated = orders.map(o => o.id === orderId ? { ...o, status: 'printed' } : o);
        setOrders(updated);
        localStorage.setItem('jprint_orders', JSON.stringify(updated));
    };

    const markAsCollected = (orderId) => {
        const updated = orders.map(o => o.id === orderId ? { ...o, status: 'collected' } : o);
        setOrders(updated);
        localStorage.setItem('jprint_orders', JSON.stringify(updated));
    };

    return (
        <OrderContext.Provider value={{
            orders,
            currentOrder,
            addFile,
            removeFile,
            updateSettings,
            placeOrder,
            calculateTotal,
            verifyOrderOtp,
            markAsPrinted,
            markAsCollected
        }}>
            {children}
        </OrderContext.Provider>
    );
};
