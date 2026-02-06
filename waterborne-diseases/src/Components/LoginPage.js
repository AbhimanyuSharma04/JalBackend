import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { FaMapMarkerAlt } from 'react-icons/fa';

const LoginPage = ({ darkMode }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState(''); // For success messages
    const [isRegistering, setIsRegistering] = useState(false);
    const [loading, setLoading] = useState(false);
    const [detectingLocation, setDetectingLocation] = useState(false); // State for location loading
    const navigate = useNavigate();

    const handleRegister = async () => {
        setLoading(true);
        setError('');
        setMessage('');
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name,
                        location: location,
                    },
                },
            });

            if (error) throw error;

            if (data.user) {
                // Assuming "Confirm Email" is disabled, we can just say success
                // OR if session exists, redirect.
                if (data.session) {
                    alert('Registration successful!');
                    navigate('/dashboard');
                } else {
                    // Even if confirm email is disabled, sometimes session isn't immediate if auto-confirm is off?
                    // But user said they will remove confirm email option.
                    alert('Registration successful!');
                    navigate('/dashboard');
                }
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            console.log('Logged in user:', data.user);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Failed to log in.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isRegistering) {
            handleRegister();
        } else {
            handleLogin();
        }
    };

    const detectLocation = () => {
        setDetectingLocation(true);
        setError('');

        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser.");
            setDetectingLocation(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const response = await fetch(
                        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
                    );
                    const data = await response.json();

                    // Construct location string
                    const parts = [];
                    if (data.city) parts.push(data.city);
                    else if (data.locality) parts.push(data.locality);

                    if (data.principalSubdivision) parts.push(data.principalSubdivision);
                    if (data.countryName) parts.push(data.countryName);

                    const locationString = parts.join(', ');
                    setLocation(locationString);
                } catch (err) {
                    setError("Failed to fetch location details.");
                } finally {
                    setDetectingLocation(false);
                }
            },
            (err) => {
                setError("Unable to retrieve your location. Please allow location access.");
                setDetectingLocation(false);
            }
        );
    };

    return (
        <div className={`d-flex align-items-center justify-content-center vh-100 ${darkMode ? 'bg-dark text-light' : 'bg-light'}`}>
            <div className={`card p-4 shadow-lg ${darkMode ? 'bg-dark border-secondary' : ''}`} style={{ width: '400px', borderRadius: '1rem', color: darkMode ? '#fff' : 'inherit' }}>
                <div className="card-body">
                    <h2 className="text-center mb-4">{isRegistering ? 'Create Account' : 'JAL-RAKSHAK Login'}</h2>

                    {message && <div className="alert alert-success">{message}</div>}
                    {error && <div className="alert alert-danger">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        {isRegistering && (
                            <>
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
                                <div className="form-group mb-3">
                                    <label>Location</label>
                                    <div className="input-group">
                                        <input
                                            type="text"
                                            className={`form-control ${darkMode ? 'bg-secondary text-light border-secondary' : ''}`}
                                            value={location}
                                            readOnly
                                            placeholder="Detecting..."
                                            required
                                        />
                                        <button
                                            type="button"
                                            className={`btn ${darkMode ? 'btn-outline-light' : 'btn-outline-secondary'}`}
                                            onClick={detectLocation}
                                            disabled={detectingLocation}
                                            title="Detect My Location"
                                        >
                                            {detectingLocation ? (
                                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                            ) : (
                                                <FaMapMarkerAlt />
                                            )}
                                        </button>
                                    </div>
                                    <small className="form-text text-muted">
                                        Click the map icon to auto-detect your location.
                                    </small>
                                </div>
                            </>
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

                        <button type="submit" className="btn btn-primary w-100 mb-3" disabled={loading}>
                            {loading ? 'Processing...' : (isRegistering ? 'Register' : 'Login')}
                        </button>
                    </form>

                    <button type="button" className="btn btn-link w-100 mt-2" onClick={() => setIsRegistering(!isRegistering)}>
                        {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;