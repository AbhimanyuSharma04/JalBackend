import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase/config'; // Correctly import auth from your config file

const LoginPage = ({ darkMode }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState(''); // Used for registration
    const [error, setError] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const navigate = useNavigate();

    // Function to handle registration by calling your backend
    const handleRegister = async () => {
        try {
            const response = await fetch('https://jalbackend.onrender.com/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, name }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            alert('Registration successful! Please log in.');
            setIsRegistering(false); // Switch back to the login view
        } catch (err) {
            setError(err.message);
        }
    };

    // Function to handle login with email and password using Firebase
    const handleLogin = async () => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const token = await userCredential.user.getIdToken();
            localStorage.setItem('authToken', token);
            navigate('/dashboard');
        } catch (err) {
            setError('Failed to log in. Please check your credentials.');
        }
    };

    // Main form submission handler
    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        if (isRegistering) {
            handleRegister();
        } else {
            handleLogin();
        }
    };

    // Function to handle Sign in with Google
    const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const token = await result.user.getIdToken();
            localStorage.setItem('authToken', token);

            // Notify our backend about the new user
            await fetch('https://jalbackend.onrender.com/api/handle-social-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            navigate('/dashboard');
        } catch (err) {
            setError("Failed to sign in with Google.");
        }
    };

    return (
        <div className={`d-flex align-items-center justify-content-center vh-100 ${darkMode ? 'bg-dark text-light' : 'bg-light'}`}>
            <div className={`card p-4 shadow-lg ${darkMode ? 'bg-dark border-secondary' : ''}`} style={{ width: '400px', borderRadius: '1rem' }}>
                <div className="card-body">
                    <h2 className="text-center mb-4">{isRegistering ? 'Create Account' : 'JAL-RAKSHAK Login'}</h2>
                    <form onSubmit={handleSubmit}>
                        {isRegistering && (
                             <div className="form-group mb-3">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    className={`form-control ${darkMode ? 'bg-secondary text-light border-secondary' : ''}`}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                        )}
                        <div className="form-group mb-3">
                            <label>Email Address</label>
                            <input
                                type="email"
                                className={`form-control ${darkMode ? 'bg-secondary text-light border-secondary' : ''}`}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group mb-4">
                            <label>Password</label>
                            <input
                                type="password"
                                className={`form-control ${darkMode ? 'bg-secondary text-light border-secondary' : ''}`}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        {error && <div className="alert alert-danger">{error}</div>}
                        <button type="submit" className="btn btn-primary w-100 mb-3">
                            {isRegistering ? 'Register' : 'Login'}
                        </button>
                    </form>

                    <div className="d-flex align-items-center my-3">
                        <hr className="flex-grow-1" />
                        <span className="px-2 text-muted">OR</span>
                        <hr className="flex-grow-1" />
                    </div>

                    <button onClick={handleGoogleSignIn} className="btn w-100" style={{ backgroundColor: '#fff', color: '#000', border: '1px solid #ddd' }}>
                        <img src="https://www.google.com/favicon.ico" alt="Google icon" style={{ width: '20px', marginRight: '10px' }} />
                        Sign in with Google
                    </button>
                    
                    <button type="button" className="btn btn-link w-100 mt-3" onClick={() => setIsRegistering(!isRegistering)}>
                        {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;