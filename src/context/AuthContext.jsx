import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('jprint_user');
        return saved ? JSON.parse(saved) : null;
    });

    useEffect(() => {
        if (user) {
            localStorage.setItem('jprint_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('jprint_user');
        }
    }, [user]);

    const login = (email, password, role = 'user') => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // STRICT VENDOR CHECK
                if (role === 'vendor') {
                    if (email === 'kartikguleria12@gmail.com' && password === 'kk@123') {
                        const vendorUser = {
                            id: 'vendor_admin',
                            name: 'Kartik Guleria',
                            email: email,
                            role: 'vendor'
                        };
                        setUser(vendorUser);
                        resolve(vendorUser);
                        return;
                    } else {
                        reject('Invalid Admin Credentials');
                        return;
                    }
                }

                // Normal User Login
                if (email && password) {
                    // Create consistent ID from email so data persists across logins
                    const normalizedEmail = email.toLowerCase().trim();
                    const userId = 'user_' + btoa(normalizedEmail).substring(0, 10);

                    const newUser = {
                        id: userId,
                        email: normalizedEmail,
                        name: normalizedEmail.split('@')[0],
                        role: 'user'
                    };
                    setUser(newUser);
                    resolve(newUser);
                } else {
                    reject('Invalid credentials');
                }
            }, 800);
        });
    };

    const register = (name, email, password, role = 'user', vendorKey = '') => {
        return new Promise((resolve, reject) => {
            // Block public vendor registration
            if (role === 'vendor') {
                reject("Vendor registration is closed. Please use Admin Login.");
                return;
            }

            setTimeout(() => {
                const normalizedEmail = email.toLowerCase().trim();
                const userId = 'user_' + btoa(normalizedEmail).substring(0, 10);
                const newUser = {
                    id: userId,
                    email: normalizedEmail,
                    name,
                    role
                };
                setUser(newUser);
                resolve(newUser);
            }, 800);
        });
    };

    const logout = () => {
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
