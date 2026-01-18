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
        // Mock Logic
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (email && password) {
                    const newUser = {
                        id: 'u_' + Math.floor(Math.random() * 1000),
                        email,
                        name: email.split('@')[0],
                        role
                    };
                    setUser(newUser);
                    resolve(newUser);
                } else {
                    reject('Invalid credentials');
                }
            }, 1000);
        });
    };

    const register = (name, email, password, role = 'user', vendorKey = '') => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (role === 'vendor' && vendorKey !== 'JIIT128') {
                    return reject('Invalid Vendor Access Key');
                }

                const newUser = {
                    id: 'u_' + Math.floor(Math.random() * 1000),
                    email,
                    name,
                    role
                };
                setUser(newUser);
                resolve(newUser);
            }, 1000);
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
