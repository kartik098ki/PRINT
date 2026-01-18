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
            const res = await fetch('/api/orders');
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
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            name: file.name,
            type: file.type,
            size: file.size,
            previewUrl: null,
            timestamp: Date.now()
        };
        setCurrentOrder(prev => ({
            ...prev,
            files: [...prev.files, fileObj]
        }));
    };

    const addStationeryItem = (item) => {
        const itemObj = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            name: item.name,
            type: 'stationery',
            price: item.price,
            size: 0, // Placeholder
            timestamp: Date.now()
        };
        setCurrentOrder(prev => ({
            ...prev,
            files: [...prev.files, itemObj]
        }));
        // Optional: Trigger a toast or vibration here if possible
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

    const placeOrder = async (totalAmount) => {
        setIsProcessingPayment(true);
        // Sanitize files to only send metadata (JSON.stringify keeps File objects empty anyway, but this is cleaner)
        const filesData = currentOrder.files.map(f => ({
            id: f.id,
            name: f.name,
            size: f.size,
            type: f.type
        }));

        const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
        const orderData = {
            userId: user?.id,
            userEmail: user?.email,
            files: filesData,
            settings: currentOrder.settings,
            totalAmount: totalAmount || 0,
            otp: newOtp
        };

        try {
            console.log("Sending Order Data:", orderData);

            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const text = await response.text();
                console.error("Received non-JSON response:", text.substring(0, 100)); // Log first 100 chars
                throw new Error("Backend not reachable (Received HTML instead of JSON). Are you on Netlify? Netlify only hosts the frontend.");
            }

            const result = await response.json();

            if (response.ok) {
                // Clear order on success
                setOrders(prev => [result, ...prev]);
                setCurrentOrder({ files: [], settings: { copies: 1, color: false, doubleSided: false } });
                setIsProcessingPayment(false);
                return { success: true, otp: newOtp };
            } else {
                throw new Error(result.error || "Order failed");
            }
        } catch (err) {
            console.error("Place Order Error:", err);
            // Re-throw so the UI can display the stack trace
            throw err;
        }
    };

    const calculateTotal = () => {
        let total = 0;

        // Calculate Print Cost
        const printFiles = currentOrder.files.filter(f => f.type !== 'stationery');
        if (printFiles.length > 0) {
            const baseRate = currentOrder.settings.color ? 10 : 2;
            total += printFiles.length * currentOrder.settings.copies * baseRate;
        }

        // Calculate Stationery Cost
        const stationeryItems = currentOrder.files.filter(f => f.type === 'stationery');
        stationeryItems.forEach(item => {
            total += (item.price || 0);
        });

        return total;
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

        await fetch(`/api/orders/${orderId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'printed' })
        });
    };

    const markAsCollected = async (orderId) => {
        const updated = orders.map(o => o.id === orderId ? { ...o, status: 'collected' } : o);
        setOrders(updated);

        await fetch(`/api/orders/${orderId}`, {
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
            addStationeryItem,
            removeFile,
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
