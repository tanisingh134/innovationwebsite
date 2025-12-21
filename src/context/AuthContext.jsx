import React, { createContext, useReducer, useContext, useEffect } from 'react';

const AuthContext = createContext();

const initialState = {
    token: localStorage.getItem('token'),
    isAuthenticated: null,
    loading: true,
    user: null
};

const authReducer = (state, action) => {
    switch (action.type) {
        case 'USER_LOADED':
            return {
                ...state,
                isAuthenticated: true,
                loading: false,
                user: action.payload
            };
        case 'REGISTER_SUCCESS':
        case 'LOGIN_SUCCESS':
            localStorage.setItem('token', action.payload.token);
            return {
                ...state,
                ...action.payload,
                isAuthenticated: true,
                loading: false
            };
        case 'REGISTER_FAIL':
        case 'AUTH_ERROR':
        case 'LOGIN_FAIL':
        case 'LOGOUT':
            localStorage.removeItem('token');
            return {
                ...state,
                token: null,
                isAuthenticated: false,
                loading: false,
                user: null
            };
        default:
            return state;
    }
};

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Load User
    const loadUser = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            dispatch({ type: 'AUTH_ERROR' });
            return;
        }

        try {
            const res = await fetch('http://localhost:5000/api/auth/me', {
                headers: { 'x-auth-token': token }
            });

            if (res.ok) {
                const user = await res.json();
                dispatch({ type: 'USER_LOADED', payload: user });
            } else {
                dispatch({ type: 'AUTH_ERROR' });
            }
        } catch (err) {
            console.error('Error loading user:', err);
            dispatch({ type: 'AUTH_ERROR' });
        }
    };

    useEffect(() => {
        loadUser();
    }, []);

    // Register
    const register = async (formData) => {
        try {
            const res = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.msg || 'Registration failed');

            dispatch({ type: 'REGISTER_SUCCESS', payload: data });
        } catch (err) {
            console.error('Registration error:', err);

            // Auto-fallback to Demo Mode if server is unreachable
            if (err.message === 'Failed to fetch' || err.message.includes('NetworkError')) {
                const demoUser = {
                    token: 'demo-token-123',
                    user: {
                        id: 'demo-1',
                        username: formData.username,
                        email: formData.email,
                        role: 'Student'
                    }
                };
                dispatch({ type: 'REGISTER_SUCCESS', payload: demoUser });
                alert('Server unreachable. Account created in Demo Mode.');
            } else {
                dispatch({ type: 'REGISTER_FAIL' });
                alert(err.message);
            }
        }
    };

    // Login
    const login = async (formData) => {
        try {
            const res = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.msg || 'Login failed');

            dispatch({ type: 'LOGIN_SUCCESS', payload: data });
        } catch (err) {
            console.error('Login error:', err);

            // Auto-fallback to Demo Mode if server is unreachable
            if (err.message === 'Failed to fetch' || err.message.includes('NetworkError')) {
                console.log('Switching to Demo Mode');
                const demoUser = {
                    token: 'demo-token-123',
                    user: {
                        id: 'demo-1',
                        username: 'Demo Student',
                        email: formData.email,
                        role: 'Student'
                    }
                };
                dispatch({ type: 'LOGIN_SUCCESS', payload: demoUser });
                alert('Server unreachable. Logged in as Demo User (Offline Mode).');
            } else {
                dispatch({ type: 'LOGIN_FAIL' });
                alert(err.message || 'Login failed');
            }
        }
    };

    // Logout
    const logout = () => dispatch({ type: 'LOGOUT' });

    return (
        <AuthContext.Provider value={{ ...state, register, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
