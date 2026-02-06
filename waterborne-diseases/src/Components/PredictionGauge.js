import React from 'react';
import { motion } from 'framer-motion';

const PredictionGauge = ({ prediction, confidence, isAnalyzing }) => {
    // Normalize prediction string
    const normalizedPred = (prediction || "").toString().toLowerCase();

    // Determine angle based on prediction
    let angle = -90; // Starting point (Safe)
    let label = "Safe";
    let color = "#10b981"; // Green

    if (['safe', 'good', 'low', 'normal'].includes(normalizedPred)) {
        angle = -60;
        label = "Safe";
        color = "#10b981";
    } else if (['moderate', 'medium', 'warning'].includes(normalizedPred)) {
        angle = 0;
        label = "Moderate";
        color = "#f59e0b";
    } else if (['unsafe', 'high risk', 'high', 'danger', 'critical', 'bad'].includes(normalizedPred)) {
        angle = 60;
        label = "High Risk";
        color = "#ef4444";
    } else {
        // Default / Neutral
        angle = -90;
        label = "Ready";
        color = "#94a3b8";
    }

    // Analyzing state animation
    const needleVariant = {
        analyzing: {
            rotate: [-90, 90, -90],
            transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        },
        result: {
            rotate: angle,
            transition: { type: "spring", stiffness: 50, damping: 10 }
        }
    };

    return (
        <div className="d-flex flex-column align-items-center justify-content-center p-4">
            {/* Gauge Container */}
            <div style={{ position: 'relative', width: '220px', height: '110px', overflow: 'hidden', marginBottom: '1rem' }}>
                {/* SVG Arc */}
                <svg viewBox="0 0 200 100" width="220" height="110">
                    <defs>
                        <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="50%" stopColor="#f59e0b" />
                            <stop offset="100%" stopColor="#ef4444" />
                        </linearGradient>
                    </defs>
                    <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="url(#gaugeGradient)" strokeWidth="15" strokeLinecap="round" />
                    {/* Tick marks */}
                    <line x1="20" y1="100" x2="10" y2="100" stroke="#94a3b8" strokeWidth="2" />
                    <line x1="180" y1="100" x2="190" y2="100" stroke="#94a3b8" strokeWidth="2" />
                    <line x1="100" y1="20" x2="100" y2="10" stroke="#94a3b8" strokeWidth="2" />
                </svg>

                {/* Needle */}
                <motion.div
                    initial={{ rotate: -90 }}
                    animate={isAnalyzing ? "analyzing" : "result"}
                    variants={needleVariant}
                    style={{
                        position: 'absolute',
                        bottom: '0',
                        left: '50%',
                        width: '4px',
                        height: '90px',
                        background: '#fbbf24', // Gold needle similar to image
                        transformOrigin: 'bottom center',
                        marginLeft: '-2px',
                        borderRadius: '2px 2px 0 0',
                        zIndex: 10
                    }}
                >
                    <div style={{ width: 16, height: 16, background: '#fbbf24', borderRadius: '50%', position: 'absolute', bottom: -8, left: -6, border: '4px solid #011C40' }}></div>
                </motion.div>
            </div>

            {/* Label and Status */}
            <h3 className="fw-bold fs-2 mb-1" style={{ color: isAnalyzing ? '#94a3b8' : color }}>
                {isAnalyzing ? "Analyzing..." : label}
            </h3>

            {!isAnalyzing && (
                <>
                    <div className="badge rounded-pill px-3 py-2 mb-3" style={{ background: 'rgba(255,255,255,0.1)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.2)' }}>
                        Predicted by AI
                    </div>

                    <p className="text-center text-muted small px-3">
                        {label === 'High Risk'
                            ? "Immediate action is required! Water is unsafe for consumption."
                            : "Water parameters are within acceptable ranges."}
                    </p>
                </>
            )}
        </div>
    );
};

export default PredictionGauge;
