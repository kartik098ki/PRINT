import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const OrderContext = createContext();

export const useOrder = () => useContext(OrderContext);

export const OrderProvider = ({ children }) => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);

    // Order Creation State
    const [currentOrder, setCurrentOrder] = useState({
        files: [],
        settings: {
            copies: 1,
            color: false, // false = B/W, true = Color
            doubleSided: false,
        },
        status: 'draft',
    });

    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    // FETCH ORDERS (Live Sync / Polling)
    const fetchOrders = async () => {
        try {
            // Vendors see ALL orders (no userId filter), Users see only theirs
            // But currently the API handles filtering via query param if passed.
            // For Vendor Dashboard (where this context is used), we want everything if vendor.
            // For User Profile, we might want only theirs.
            // For now, let's fetch ALL orders and filter client side if needed, OR relies on role.

            // To simplify: The Backend /api/orders returns ALL orders by default.
            // We can filter in the UI.
            const res = await fetch('http://localhost:5001/api/orders');
            if (!res.ok) throw new Error(res.statusText);

            // Check content type to avoid JSON parse errors on 404 HTML responses
            const contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                console.warn("Backend not returning JSON. Is the server running?");
                return;
            }

            const data = await res.json();
            setOrders(data);
        } catch (error) {
            console.error("Failed to fetch orders:", error);
        }
    };

    // Initial Fetch & Polling
    useEffect(() => {
        fetchOrders();

        // Poll every 3 seconds for "Live" dashboard feeling
        const interval = setInterval(fetchOrders, 3000);
        return () => clearInterval(interval);
    }, []); // Run once on mount + interval

    const addFile = (file) => {
        const fileObj = {
            id: crypto.randomUUID(),
            name: file.name,
            type: file.type,
            size: file.size,
            previewUrl: null, // URLs don't persist well to DB without file server, skipping for now
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

    const generateUniqueOtp = (currentOrders) => {
        let newOtp;
        let isUnique = false;
        const activeOtps = new Set(currentOrders.map(o => o.otp));
        while (!isUnique) {
            newOtp = Math.floor(1000 + Math.random() * 9000).toString();
            if (!activeOtps.has(newOtp)) isUnique = true;
        }
        return newOtp;
    };

    const placeOrder = async (amount) => {
        setIsProcessingPayment(true);

        // Generate OTP based on current list
        const newOtp = generateUniqueOtp(orders);

        const orderData = {
            userId: user?.id || 'guest',
            userEmail: user?.email || 'Guest',
            files: currentOrder.files,
            settings: currentOrder.settings,
            totalAmount: amount,
            otp: newOtp
        };

        try {
            const response = await fetch('http://localhost:5001/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            if (response.ok) {
                const newOrder = await response.json();
                setOrders(prev => [newOrder, ...prev]);
                setCurrentOrder({ files: [], settings: { copies: 1, color: false, doubleSided: false } });
                setIsProcessingPayment(false);
                return newOtp;
            } else {
                throw new Error("Order failed");
            }
        } catch (err) {
            console.error(err);
            setIsProcessingPayment(false);
            return null;
        }
    };

    const calculateTotal = () => {
        const baseRate = currentOrder.settings.color ? 10 : 2;
        const items = currentOrder.files.length;
        const copies = currentOrder.settings.copies;
        return items * copies * baseRate;
    };

    // Vendor Actions
    const verifyOrderOtp = (orderId, otpInput) => {
        // Verification is just checking local list (which is synced via polling)
        const order = orders.find(o => o.id === orderId);
        if (!order) return { success: false, message: 'Order not found' };
        if (order.otp === otpInput) {
            return { success: true, order };
        }
        return { success: false, message: 'Invalid OTP' };
    };

    const markAsPrinted = async (orderId) => {
        // Optimistic UI update
        const updated = orders.map(o => o.id === orderId ? { ...o, status: 'printed' } : o);
        setOrders(updated);

        await fetch(`http://localhost:5001/api/orders/${orderId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'printed' })
        });
    };

    const markAsCollected = async (orderId) => {
        const updated = orders.map(o => o.id === orderId ? { ...o, status: 'collected' } : o);
        setOrders(updated);

        await fetch(`http://localhost:5001/api/orders/${orderId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'collected' })
        });
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
