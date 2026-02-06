import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

/**
 * This component ensures that users (especially those from Google Login)
 * have their location saved in the 'profiles' table.
 * 
 * If location is invalid/missing, it attempts to auto-detect and update it.
 */
const LocationEnforcer = ({ children }) => {
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const checkAndEnforceLocation = async () => {
            try {
                // 1. Get current user
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                // 2. Check if profile exists and has location
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('location')
                    .eq('id', user.id)
                    .single();

                // If profile doesn't exist yet (race condition with trigger), wait?
                // Or if location is missing/null/empty
                if (!profile || !profile.location) {
                    console.log('Location missing from profile. Auto-detecting...');
                    await autoDetectAndUpdate(user.id);
                } // else location is good

            } catch (err) {
                console.error('Error enforcing location:', err);
            } finally {
                setChecking(false);
            }
        };

        checkAndEnforceLocation();
    }, []);

    const autoDetectAndUpdate = (userId) => {
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                console.warn('Geolocation not supported');
                resolve();
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

                        if (locationString) {
                            // Update Supabase Profile
                            const { error } = await supabase
                                .from('profiles')
                                .upsert({ id: userId, location: locationString });

                            if (error) console.error('Failed to update location:', error);
                            else console.log('Location updated automatically:', locationString);
                        }
                    } catch (err) {
                        console.error('Error fetching/saving location:', err);
                    }
                    resolve();
                },
                (err) => {
                    console.warn('Location access denied or failed:', err);
                    resolve();
                }
            );
        });
    };

    return <>{children}</>;
};

export default LocationEnforcer;
