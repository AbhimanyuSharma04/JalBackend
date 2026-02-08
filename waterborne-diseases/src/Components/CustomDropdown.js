import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown } from 'react-icons/fa';

const CustomDropdown = ({ options, value, onChange, placeholder, name }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
    const dropdownRef = useRef(null);

    // Update coordinates when opening
    const updateCoords = () => {
        if (dropdownRef.current) {
            const rect = dropdownRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom + 8, // Fixed position relative to viewport
                left: rect.left,
                width: rect.width
            });
        }
    };

    useLayoutEffect(() => {
        if (isOpen) {
            updateCoords();
            window.addEventListener('scroll', updateCoords, { capture: true });
            window.addEventListener('resize', updateCoords);
        }
        return () => {
            window.removeEventListener('scroll', updateCoords, { capture: true });
            window.removeEventListener('resize', updateCoords);
        };
    }, [isOpen]);

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event) => {
            const portalMenu = document.getElementById(`dropdown-portal-${name}`);
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                (!portalMenu || !portalMenu.contains(event.target))
            ) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, name]);


    const handleSelect = (optionValue) => {
        // Ensure we send the correct event structure that parent expects
        onChange({ target: { name, value: optionValue } });
        setIsOpen(false);
    };

    // Find display label
    const getDisplayLabel = () => {
        if (!value) return placeholder;
        // Handle both simple string array and object array
        const selected = options.find(opt =>
            (opt.value === value) || (opt === value)
        );
        if (selected) return selected.label || selected;
        return value; // Fallback
    };

    // Normalized options for internal rendering
    const normalizedOptions = options.map(opt => {
        if (typeof opt === 'string') return { value: opt, label: opt };
        return opt;
    });

    return (
        <div className="position-relative" ref={dropdownRef}>
            <div
                className={`jr-custom-select ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                style={{ cursor: 'pointer' }}
            >
                <div className="d-flex align-items-center justify-content-between w-100">
                    <span className={!value ? "text-muted" : "text-white fw-medium"}>
                        {getDisplayLabel()}
                    </span>
                    <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <FaChevronDown size={12} className="text-cyan" />
                    </motion.div>
                </div>
            </div>

            {/* Portal for the Menu - Renders outside of any overflow:hidden containers */}
            {createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            id={`dropdown-portal-${name}`}
                            initial={{ opacity: 0, y: -10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.98 }}
                            transition={{ duration: 0.15 }}
                            className="jr-dropdown-menu"
                            style={{
                                position: 'fixed', // Fixed positioning is key here
                                top: coords.top,
                                left: coords.left,
                                width: coords.width,
                                zIndex: 9999,
                                maxHeight: '300px',
                                overflowY: 'auto'
                            }}
                        >
                            {normalizedOptions.map((option, index) => (
                                <div
                                    key={index}
                                    className={`jr-dropdown-item ${value === option.value ? 'selected' : ''}`}
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent bubbling
                                        handleSelect(option.value);
                                    }}
                                >
                                    {option.label}
                                    {value === option.value && <div className="jr-indicator" />}
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
};

export default CustomDropdown;
