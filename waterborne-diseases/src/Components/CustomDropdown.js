import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown } from 'react-icons/fa';

const CustomDropdown = ({ options, value, onChange, placeholder, name }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
    const dropdownRef = useRef(null);

    // Update coordinates when opening
    useLayoutEffect(() => {
        if (isOpen && dropdownRef.current) {
            const rect = dropdownRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom + window.scrollY + 8, // 8px gap
                left: rect.left + window.scrollX,
                width: rect.width
            });
        }
    }, [isOpen]);

    // Handle Resize / Scroll to update or close
    useEffect(() => {
        const handleResize = () => setIsOpen(false); // Close on resize to avoid misalignment

        // Optional: Close on scroll if sticky behavior is hard to track perfectly
        const handleScroll = () => {
            if (isOpen) setIsOpen(false);
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('scroll', handleScroll, { capture: true }); // Capture to catch container scrolls

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', handleScroll, { capture: true });
        };
    }, [isOpen]);


    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Check if click is on the trigger or the portal menu
            // Note: Portal menu is separate, but we can check if target is inside .jr-dropdown-menu-portal
            const portalMenu = document.getElementById(`dropdown-portal-${name}`);

            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                (!portalMenu || !portalMenu.contains(event.target))
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [name]);


    const handleSelect = (optionValue) => {
        onChange({ target: { name, value: optionValue } });
        setIsOpen(false);
    };

    // Find display label
    const getDisplayLabel = () => {
        if (!value) return placeholder;
        if (typeof options[0] === 'string') return value;
        const selected = options.find(opt => opt.value === value || opt === value);
        if (selected) return selected.label || selected;
        return value;
    };

    // Normalized options
    const normalizedOptions = options.map(opt => {
        if (typeof opt === 'string') return { value: opt, label: opt };
        return opt;
    });

    return (
        <div className="position-relative" ref={dropdownRef}>
            <div
                className={`jr-custom-select ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
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

            {/* Portal for the Menu */}
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
                                position: 'absolute',
                                top: coords.top,
                                left: coords.left,
                                width: coords.width,
                                zIndex: 9999, // Super high z-index
                                maxHeight: '300px',
                                overflowY: 'auto'
                            }}
                        >
                            {normalizedOptions.map((option, index) => (
                                <div
                                    key={index}
                                    className={`jr-dropdown-item ${value === option.value ? 'selected' : ''}`}
                                    onClick={() => handleSelect(option.value)}
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
