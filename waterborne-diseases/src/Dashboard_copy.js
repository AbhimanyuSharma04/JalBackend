import React, { useState, useEffect, useRef } from 'react';
import { sensorDB } from './firebase/config'; // Make sure this path is correct
import { supabase } from './supabaseClient';
import { ref, query, orderByChild, limitToLast, get } from "firebase/database";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaTimes, FaRobot, FaHome, FaDatabase, FaUsers, FaInfoCircle, FaMoon, FaSun, FaComments, FaGlobe, FaPhone, FaHospital, FaStethoscope, FaMapMarkerAlt, FaVideo, FaFlask, FaShieldAlt, FaMicrochip, FaBolt, FaChevronDown } from 'react-icons/fa';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import ReactMarkdown from 'react-markdown';
import SafetyScale from './Components/SafetyScale';
import PredictionGauge from './Components/PredictionGauge';
import CustomDropdown from './Components/CustomDropdown';
import './Dashboard.css'; // MUST be last to override Bootstrap

const CustomChartTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="jr-chart-tooltip">
                <p className="jr-tooltip-label">{label}</p>
                {payload.map((entry, index) => (
                    <div key={index} className="jr-tooltip-item">
                        <span style={{ color: entry.color, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: entry.color }}></span>
                            {entry.name}:
                        </span>
                        <span className="jr-tooltip-value">
                            {entry.value.toLocaleString()}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

// Helper component to handle map interaction state
const MapInteractionController = ({ isInteractive }) => {
    const map = useMap();

    useEffect(() => {
        if (isInteractive) {
            map.dragging.enable();
            map.scrollWheelZoom.enable();
            map.touchZoom.enable();
            map.doubleClickZoom.enable();
            map.boxZoom.enable();
            map.keyboard.enable();
            if (map.tap) map.tap.enable();
        } else {
            map.dragging.disable();
            map.scrollWheelZoom.disable();
            map.touchZoom.disable();
            map.doubleClickZoom.disable();
            map.boxZoom.disable();
            map.keyboard.disable();
            if (map.tap) map.tap.disable();
        }
    }, [isInteractive, map]);

    return null;
};
const OutbreakMap = ({ outbreaks, devices = [], title, mapId }) => {
    // Default center for India map
    let mapCenter = [22.351114, 78.667742];
    const [isInteractive, setIsInteractive] = useState(false);
    let defaultZoom = 5;

    // If implementing "Nearby", center on a specific location (e.g., Delhi for mock)
    if (mapId === 'nearby') {
        mapCenter = [28.6139, 77.2090];
        defaultZoom = 12;
    }

    const getMarkerOptions = (outbreak) => {
        let color;
        switch (outbreak.severity) {
            case 'critical': color = '#ef4444'; break;
            case 'high': color = '#f97316'; break;
            case 'medium': color = '#3b82f6'; break;
            case 'low': color = '#10b981'; break;
            default: color = '#64748b';
        }
        return {
            radius: 5 + (outbreak.cases / 3000),
            fillColor: color,
            color: color,
            weight: 1,
            opacity: 1,
            fillOpacity: 0.6
        };
    };

    const getDeviceMarkerOptions = (device) => {
        let color = '#06b6d4'; // Cyan for devices
        if (device.status === 'Alert') color = '#ef4444';

        return {
            radius: 8,
            fillColor: color,
            color: '#ffffff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
        };
    };

    return (
        <div
            className="jr-card mb-4 p-0 overflow-hidden h-100"
            onClick={() => setIsInteractive(true)}
            onMouseLeave={() => setIsInteractive(false)}
            style={{ cursor: isInteractive ? 'grab' : 'pointer' }}
        >
            <div className="p-3 border-bottom border-light border-opacity-10 bg-dark bg-opacity-25 d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fs-6 fw-bold text-white"><FaMapMarkerAlt className="me-2 text-primary" />{title}</h5>
                {!isInteractive && <small className="text-white-50" style={{ fontSize: '0.7em' }}>Click map to interact</small>}
            </div>
            <MapContainer
                key={mapId}
                center={mapCenter}
                zoom={defaultZoom}
                zoomControl={false}
                attributionControl={false}
                scrollWheelZoom={false} // Start disabled
                dragging={false} // Start disabled
                touchZoom={false} // Start disabled
                doubleClickZoom={false} // Start disabled
                style={{
                    height: '400px',
                    width: '100%',
                    background: '#f8f9fa',
                }}
            >
                <MapInteractionController isInteractive={isInteractive} />
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {outbreaks.map(outbreak => (
                    <CircleMarker
                        key={`outbreak-${outbreak.id}`}
                        center={outbreak.position}
                        pathOptions={getMarkerOptions(outbreak)}
                    >
                        <Popup>
                            <div style={{ color: 'black' }}>
                                <div className="fw-bold fs-6 mb-2">{outbreak.name}</div>
                                <div className="small mb-1"><FaMapMarkerAlt className="me-1" />{outbreak.state}</div>
                                <div className="mb-1"><strong>Cases:</strong> {outbreak.cases.toLocaleString()}</div>
                                <div className="mb-2"><strong className="text-capitalize">Severity:</strong> <span style={{ color: getMarkerOptions(outbreak).fillColor }}>{outbreak.severity}</span></div>
                            </div>
                        </Popup>
                    </CircleMarker>
                ))}

                {devices.map(device => (
                    <CircleMarker
                        key={`device-${device.id}`}
                        center={device.position}
                        pathOptions={getDeviceMarkerOptions(device)}
                    >
                        <Popup>
                            <div style={{ color: 'black' }}>
                                <div className="fw-bold fs-6 mb-1">{device.name}</div>
                                <div className="badge bg-primary mb-2">{device.type}</div>
                                <div className="small mb-1"><strong>Status:</strong> <span className={device.status === 'Alert' ? 'text-danger fw-bold' : 'text-success'}>{device.status}</span></div>
                                <div className="p-2 bg-light rounded border mt-2">
                                    <div className="d-flex justify-content-between small mb-1"><span>pH Level:</span> <strong>{device.readings.ph}</strong></div>
                                    <div className="d-flex justify-content-between small mb-1"><span>Turbidity:</span> <strong>{device.readings.turbidity} NTU</strong></div>
                                    <div className="d-flex justify-content-between small"><span>Battery:</span> <strong>{device.battery}</strong></div>
                                </div>
                            </div>
                        </Popup>
                    </CircleMarker>
                ))}
            </MapContainer>
        </div>
    );
};




const App = () => {
    const [activeTab, setActiveTab] = useState('home');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);
    const [userMessage, setUserMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [darkMode, setDarkMode] = useState(true);
    const [selectedOutbreak, setSelectedOutbreak] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: '',
        location: '',
        symptoms: [],
    });

    // Mock Data for Nearby Map
    const nearbyOutbreaks = [
        { id: 'n1', name: 'Potential Contamination', state: 'Sector 4, Rohini', cases: 12, severity: 'high', position: [28.6139, 77.2090], healthContact: '108', nearbyHospitals: 2, latestNews: 'High coliform levels detected' },
        { id: 'n2', name: 'Safe Zone', state: 'Connaught Place', cases: 0, severity: 'low', position: [28.6270, 77.2180], healthContact: '108', nearbyHospitals: 5, latestNews: 'Water quality normal' }
    ];

    const nearbyDevices = [
        { id: 'd1', name: 'Jal-Rakshak Unit #102', type: 'Sensor Buoy', status: 'Active', position: [28.6100, 77.2000], readings: { ph: 7.2, turbidity: 4.5 }, battery: '85%' },
        { id: 'd2', name: 'Jal-Rakshak Unit #105', type: 'Pipeline Monitor', status: 'Alert', position: [28.6150, 77.2150], readings: { ph: 8.9, turbidity: 12.0 }, battery: '12%' }
    ];

    const [waterFormData, setWaterFormData] = useState({
        ph: '',
        turbidity: '',
        contaminantLevel: '',
        temperature: '',
        water_source_type: '',
        uv_sensor: '',
        guva_sensor: '',
        conductivity: ''
    });
    const [language, setLanguage] = useState('en');

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [isWaterAnalyzing, setIsWaterAnalyzing] = useState(false);
    const [waterAnalysisResult, setWaterAnalysisResult] = useState(null);
    const [waterAnalysisError, setWaterAnalysisError] = useState(null);
    const mainChatRef = useRef(null);
    const widgetChatRef = useRef(null);
    const [isFetching, setIsFetching] = useState(false);
    const [fetchMessage, setFetchMessage] = useState('');
    const [userName, setUserName] = useState('');

    // Device Management State
    const [devices, setDevices] = useState([]);
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [showDeviceDropdown, setShowDeviceDropdown] = useState(false);
    const [showAddDeviceModal, setShowAddDeviceModal] = useState(false);
    const [newDeviceData, setNewDeviceData] = useState({ id: '', name: '' });
    const [deviceLoading, setDeviceLoading] = useState(false);

    useEffect(() => {
        const fetchUserNameAndDevices = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Try to get name from profiles table first
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('full_name')
                    .eq('id', user.id)
                    .single();

                if (profile && profile.full_name) {
                    setUserName(profile.full_name);
                } else if (user.user_metadata && user.user_metadata.full_name) {
                    setUserName(user.user_metadata.full_name);
                } else {
                    setUserName(user.email.split('@')[0]);
                }

                // Fetch Devices
                const { data: userDevices, error } = await supabase
                    .from('devices')
                    .select('*')
                    .eq('user_id', user.id);

                if (userDevices) {
                    setDevices(userDevices);
                    if (userDevices.length > 0) {
                        setSelectedDevice(userDevices[0]); // Select first by default
                    }
                }
            }
        };
        fetchUserNameAndDevices();
    }, []);

    const handleAddDevice = async (e) => {
        e.preventDefault();
        setDeviceLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return; // Should handle error

        try {
            const { data, error } = await supabase
                .from('devices')
                .insert([
                    {
                        user_id: user.id,
                        device_id: newDeviceData.id,
                        device_name: newDeviceData.name
                    }
                ])
                .select();

            if (error) throw error;

            if (data) {
                const newDevice = data[0];
                setDevices([...devices, newDevice]);
                setSelectedDevice(newDevice); // Auto select new device
                setShowAddDeviceModal(false);
                setNewDeviceData({ id: '', name: '' });
                alert('Device added successfully!');
            }
        } catch (error) {
            alert('Error adding device: ' + error.message);
        } finally {
            setDeviceLoading(false);
        }
    };

    const translations = {
        en: {
            home: "Home",
            submitWaterData: "Submit Data",
            diseasePrediction: "Disease Prediction",
            community: "Community Outreach",
            aiAssistant: "AI Assistant",
            about: "About Us",
            language: "Language",
            english: "English",
            hindi: "Hindi",
            assamese: "Assamese",
            bengali: "Bengali",
            heroTitle: "All-India Waterborne Disease Monitor",
            heroSubtitle: "Real-time Surveillance and Response System for Water-Borne Diseases",
            outbreakTitle: "Diarrhea Outbreak",
            statisticsTitle: "All-India State Comparison",
            trendsTitle: "Disease Trends (Monthly)",
            emergencyTitle: "Emergency Response Status",
            disease: "Disease",
            state: "State",
            severity: "Severity Level",
            responseTeam: "Response Team",
            lastUpdate: "Last Update",
            predictionTitle: "Submit Health Data for AI Disease Prediction",
            predictionSubtitle: "Select symptoms and patient data, and our AI will provide a preliminary analysis of potential waterborne illnesses.",
            patientInfo: "Patient Information",
            fullName: "Full Name",
            age: "Age",
            gender: "Gender",
            location: "Location",
            symptoms: "Symptoms Observed",
            waterQuality: "Water Quality Parameters",
            waterSourceType: "Water Source Type",
            pH: "pH Level",
            turbidity: "Turbidity (NTU)",
            contaminantLevelPpm: "Contaminant Level (ppm)",
            waterTemperatureC: "Water Temperature (°C)",
            conductivity: "Conductivity (µS/cm)",
            upload: "Upload File",
            submitButton: "Submit Data & Get Analysis",
            analysisTitle: "AI Analysis Results",
            analysisPlaceholder: "Your analysis will appear here after submission.",
            analyzingPlaceholder: "Our AI is analyzing the data... Please wait.",
            communityTitle: "Community Outreach Programs",
            communitySubtitle: "Join our health education initiatives and community events across India to learn about water safety and disease prevention.",
            eventsTitle: "Upcoming Events",
            programHighlights: "Program Highlights",
            onlinePrograms: "Online Programs",
            offlineEvents: "Offline Events",
            waterTesting: "Water Testing",
            chatTitle: "Jal-Rakshak AI Assistant",
            chatPlaceholder: "Ask about waterborne diseases...",
            chatFeatures: "AI Assistant Features",
            quickHelp: "Quick Help",
            diseaseSymptoms: "Disease symptoms",
            preventionTips: "Prevention tips",
            waterTesting2: "Water testing",
            aboutTitle: "About Jal-Rakshak",
            missionTitle: "Our Mission",
            missionText: "Jal-Rakshak is dedicated to revolutionizing public health monitoring through advanced AI and machine learning technologies. Our mission is to create a smart health surveillance system that detects, monitors, and prevents outbreaks of waterborne diseases in vulnerable communities across rural India.",
            visionTitle: "Our Vision",
            visionText: "To establish a comprehensive early warning system that empowers communities, health workers, and government officials with real-time insights and actionable intelligence to combat waterborne diseases effectively.",
            techStack: "Technology Stack",
            teamTitle: "Our Team",
            critical: "Critical",
            high: "High",
            medium: "Medium",
            low: "Low",
            upcoming: "Upcoming",
            registered: "registered",
            registerNow: "Register Now",
            description: "Description",
            prevention: "Prevention Methods",
            reportedCases: "Reported Cases",
            rate: "Rate",
            cases: "Cases",
            location2: "Location",
            send: "Send",
            aboutAI: "About Jal-Rakshak AI",
            aboutAIText: "Our AI assistant provides instant answers to your questions about waterborne diseases, prevention methods, and health resources in multiple languages.",
            symptomsTitle: "Symptoms:",
            preventionTitle: "Prevention Methods:",
            remediesTitle: "Cure and Remedies",
            statistics: "Outbreak Statistics",
            probability: "Match Score",
            noDiseaseDetectedTitle: "No Specific Disease Detected",
            noDiseaseDetectedDescription: "The combination of symptoms does not strongly match a single waterborne disease in our database. This does not rule out an illness.",
            noDiseaseDetectedRemedy: "Please consult a healthcare professional for an accurate diagnosis. Ensure you stay hydrated and monitor your symptoms.",
            genderOptions: { male: "Male", female: "Female", other: "Other" },
            symptomsList: ["Fever", "Diarrhea", "Vomiting", "Abdominal Pain", "Dehydration", "Headache", "Fatigue", "Nausea", "Jaundice", "Dark colored urine", "Rose spots", "Bloating", "Weight loss"],
            diseases: {
                hepatitisA: { name: "Hepatitis A", description: "A liver infection caused by the Hepatitis A virus (HAV), highly contagious and spread through contaminated food or water.", remedies: ["Rest is crucial as there's no specific treatment.", "Stay hydrated by drinking plenty of fluids.", "Avoid alcohol and medications that can harm the liver."] },
                cholera: { name: "Cholera", description: "An acute diarrheal illness caused by infection of the intestine with Vibrio cholerae bacteria, which can be severe.", remedies: ["Immediate rehydration with Oral Rehydration Solution (ORS) is key.", "Seek urgent medical attention for severe cases.", "Zinc supplements can help reduce the duration of diarrhea."] },
                gastroenteritis: { name: "Gastroenteritis (Diarrhea)", description: "An intestinal infection marked by watery diarrhea, abdominal cramps, nausea or vomiting, and sometimes fever.", remedies: ["Drink plenty of liquids to prevent dehydration (ORS is best).", "Eat bland foods like bananas, rice, and toast (BRAT diet).", "Avoid dairy, fatty, or spicy foods."] },
                typhoid: { name: "Typhoid Fever", description: "A serious bacterial infection caused by Salmonella Typhi, characterized by a sustained high fever.", remedies: ["Requires immediate medical attention and is treated with antibiotics.", "Drink plenty of fluids to prevent dehydration.", "Eat a high-calorie, nutritious diet."] },
                giardiasis: { name: "Giardiasis", description: "An intestinal infection caused by a microscopic parasite called Giardia lamblia, often causing bloating and cramps without fever.", remedies: ["Medical treatment with prescription drugs is usually required.", "Stay well-hydrated.", "Avoid caffeine and dairy products, which can worsen diarrhea."] },
                crypto: { name: "Cryptosporidiosis", description: "A diarrheal disease caused by the microscopic parasite Cryptosporidium. It can cause watery diarrhea and is a common cause of waterborne disease.", remedies: ["Most people with a healthy immune system recover without treatment.", "Drink plenty of fluids to prevent dehydration.", "Anti-diarrheal medicine may help, but consult a doctor first."] }
            },
            ai: {
                initialGreeting: "Hello! I'm Jal-Rakshak AI. How can I assist you with waterborne diseases today? You can ask me things like 'What causes cholera?' or 'How to prevent typhoid?'",
                fallback: "I'm sorry, I don't have information on that. I can answer questions about the causes, symptoms, treatment, and prevention of diseases like Cholera, Typhoid, Hepatitis A, Giardiasis, and Gastroenteritis. Please try asking your question differently.",
            },
            // Newly added keys
            welcome: "Welcome",
            devices: "Devices",
            addDevice: "+ Add Device",
            heroTitleBadge: "ALL-INDIA",
            heroTitleMain: "Waterborne Disease Monitor",
            allIndiaMapTitle: "All India Disease Outbreak Monitor",
            nearbyMapTitle: "Nearby Disease Outbreak",
            heroPill1: "AI-Powered Detection",
            heroPill2: "Real-Time Alerts",
            heroPill3: "All-India Focus",
            statisticsInfo: "Highest reported cases in UP & Bihar",
            trendsInfo: "Peak transmission observed in July-Aug",
            waterFormTitle: "Water Quality Parameters",
            waterFormSubtitle: "Submit the following parameters for a detailed analysis of your water source.",
            basicWaterInfo: "Basic Water Info",
            physicalParams: "Physical Parameters",
            chemicalParams: "Chemical Parameters",
            sensorReadings: "Sensor Readings",
            rgbSensor: "RGB Sensor",
            uvSensor: "UV Sensor",
            initialPrediction: "Initial Prediction",
            fetchFromDevice: "Fetch From Device",
            fetching: "Fetching...",
            joinCause: "Join Our Cause",
            joinCauseText: "Interested in contributing to Jal-Rakshak? We are always looking for volunteers and partners.",
            contactUs: "Contact Us",
            deviceName: "Device Name",
            deviceId: "Device ID",
            addNewDevice: "Add New Device",
            adding: "Adding...",
            deviceAdded: "Device added successfully!",
            deviceAddError: "Error adding device: ",
            selectSource: "Select Source",
            selectColor: "Select Color",
            selectGender: "Select Gender",
        },
        hi: {
            home: " होम ",
            submitWaterData: " डेटा सबमिट करें ",
            diseasePrediction: " रोग की भविष्यवाणी ",
            community: " सामुदायिक आउटरीच ",
            aiAssistant: " एआई सहायक ",
            about: " हमारे बारे में ",
            language: " भाषा ",
            english: " अंग्रेज़ी ",
            hindi: " हिंदी ",
            assamese: " অসমিয়া ",
            bengali: " बंगाली ",
            heroTitle: " अखिल-भारतीय जलजनित रोग मॉनिटर ",
            heroSubtitle: " जल-जनित रोगों के लिए वास्तविक समय की निगरानी और प्रतिक्रिया प्रणाली ",
            outbreakTitle: " डायरिया का प्रकोप ",
            statisticsTitle: " अखिल-भारतीय राज्य तुलना ",
            trendsTitle: " रोग के रुझान (मासिक )",
            emergencyTitle: " आपातकालीन प्रतिक्रिया स्थिति ",
            disease: " रोग ",
            state: " राज्य ",
            severity: " गंभीरता स्तर ",
            responseTeam: " प्रतिक्रिया दल ",
            lastUpdate: " अंतिम अपडेट ",
            predictionTitle: " एआई रोग भविष्यवाणी के लिए स्वास्थ्य डेटा सबमिट करें ",
            predictionSubtitle: " लक्षण और रोगी डेटा चुनें, और हमारा एआई संभावित जलजनित बीमारियों का प्रारंभिक विश्लेषण प्रदान करेगा। ",
            patientInfo: " रोगी की जानकारी ",
            fullName: " पूरा नाम ",
            age: " आयु ",
            gender: " लिंग ",
            location: " स्थान ",
            symptoms: " देखे गए लक्षण ",
            waterQuality: " जल गुणवत्ता मापदंड ",
            waterSourceType: " जल स्रोत का प्रकार ",
            pH: " पीएच स्तर ",
            turbidity: " गंदलापन (NTU)",
            contaminantLevelPpm: " संदूषक स्तर (ppm)",
            waterTemperatureC: " पानी का तापमान (°C)",
            conductivity: " चालकता (µS/cm)",
            upload: " फ़ाइल अपलोड करें ",
            submitButton: " डेटा सबमिट करें और विश्लेषण प्राप्त करें ",
            analysisTitle: " एआई विश्लेषण परिणाम ",
            analysisPlaceholder: " आपका विश्लेषण सबमिशन के बाद यहां दिखाई देगा। ",
            analyzingPlaceholder: " हमारा एआई डेटा का विश्लेषण कर रहा है... कृपया प्रतीक्षा करें। ",
            communityTitle: " सामुदायिक आउटरीच कार्यक्रम ",
            communitySubtitle: " जल सुरक्षा और रोग की रोकथाम के बारे में जानने के लिए अखिल-भारत में हमारी स्वास्थ्य शिक्षा पहलों और सामुदायिक कार्यक्रमों में शामिल हों। ",
            eventsTitle: " आगामी कार्यक्रम ",
            programHighlights: " कार्यक्रम की मुख्य विशेषताएं ",
            onlinePrograms: " ऑनलाइन कार्यक्रम ",
            offlineEvents: " ऑफलाइन कार्यक्रम ",
            waterTesting: " जल परीक्षण ",
            chatTitle: " जल-रक्षक एआई सहायक ",
            chatPlaceholder: " जलजनित रोगों के बारे में पूछें ...",
            chatFeatures: " एआई सहायक की विशेषताएं ",
            quickHelp: " त्वरित मदद ",
            diseaseSymptoms: " रोग के लक्षण ",
            preventionTips: " रोकथाम के उपाय ",
            waterTesting2: " जल परीक्षण ",
            aboutTitle: " जल-रक्षक के बारे में ",
            missionTitle: " हमारा मिशन ",
            missionText: " जल-रक्षक उन्नत एआई और मशीन लर्निंग तकनीकों के माध्यम से सार्वजनिक स्वास्थ्य निगरानी में क्रांति लाने के लिए समर्पित है। हमारा मिशन एक स्मार्ट स्वास्थ्य निगरानी प्रणाली बनाना है जो ग्रामीण अखिल-भारत में कमजोर समुदायों में जलजनित बीमारियों के प्रकोप का पता लगाता है, निगरानी करता है और रोकता है। ",
            visionTitle: " हमारी दृष्टि ",
            visionText: " एक व्यापक प्रारंभिक चेतावनी प्रणाली स्थापित करना जो समुदायों, स्वास्थ्य कार्यकर्ताओं और सरकारी अधिकारियों को जलजनित बीमारियों से प्रभावी ढंग से निपटने के लिए वास्तविक समय की अंतर्दृष्टि और कार्रवाई योग्य बुद्धिमत्ता के साथ सशक्त बनाती है। ",
            techStack: " प्रौद्योगिकी स्टैक ",
            teamTitle: " हमारी टीम ",
            critical: " गंभीर ",
            high: " उच्च ",
            medium: " मध्यम ",
            low: " कम ",
            upcoming: " आगामी ",
            registered: " पंजीकृत ",
            registerNow: " अभी पंजीकरण करें ",
            description: " विवरण ",
            prevention: " रोकथाम के तरीके ",
            reportedCases: " दर्ज मामले ",
            rate: " दर ",
            cases: " मामले ",
            location2: " स्थान ",
            send: " भेजें ",
            aboutAI: " जल-रक्षक एआई के बारे में ",
            aboutAIText: " हमारा एआई सहायक कई भाषाओं में जलजनित रोगों, रोकथाम के तरीकों और स्वास्थ्य संसाधनों के बारे में आपके सवालों के तुरंत जवाब देता है। ",
            symptomsTitle: " लक्षण :",
            preventionTitle: " रोकथाम के तरीके :",
            remediesTitle: " इलाज और उपचार ",
            statistics: " प्रकोप के आँकड़े ",
            probability: " मिलान स्कोर ",
            noDiseaseDetectedTitle: " कोई विशेष रोग नहीं मिला ",
            noDiseaseDetectedDescription: " लक्षणों का संयोजन हमारे डेटाबेस में किसी एक जलजनित रोग से दृढ़ता से मेल नहीं खाता है। यह किसी बीमारी को खारिज नहीं करता है। ",
            noDiseaseDetectedRemedy: " कृपया सटीक निदान के लिए एक स्वास्थ्य पेशेवर से परामर्श करें। सुनिश्चित करें कि आप हाइड्रेटेड रहें और अपने लक्षणों की निगरानी करें। ",
            genderOptions: { male: " पुरुष ", female: " महिला ", other: " अन्य " },
            symptomsList: [" बुखार ", " दस्त ", " उल्टी ", " पेट दर्द ", " निर्जलीकरण ", " सिरदर्द ", " थकान ", " जी मिचलाना ", " पीलिया ", " गहरे रंग का मूत्र ", " गुलाबी धब्बे ", " पेट फूलना ", " वजन कम होना "],
            diseases: {
                hepatitisA: { name: " हेपेटाइटिस ए ", description: " हेपेटाइटिस ए वायरस (HAV) के कारण होने वाला एक यकृत संक्रमण, जो अत्यधिक संक्रामक है और दूषित भोजन या पानी से फैलता है। ", remedies: [" आराम महत्वपूर्ण है क्योंकि कोई विशिष्ट उपचार नहीं है। ", " खूब सारे तरल पदार्थ पीकर हाइड्रेटेड रहें। ", " शराब और यकृत को नुकसान पहुँचाने वाली दवाओं से बचें। "] },
                cholera: { name: " हैजा ", description: " विब्रियो कोलेरी बैक्टीरिया से आंत के संक्रमण के कारण होने वाली एक गंभीर दस्त की बीमारी, जो गंभीर हो सकती है। ", remedies: [" ओरल रिहाइड्रेशन सॉल्यूशन (ORS) से तत्काल पुनर्जलीकरण महत्वपूर्ण है। ", " गंभीर मामलों के लिए तत्काल चिकित्सा सहायता लें। ", " जिंक सप्लीमेंट दस्त की अवधि को कम करने में मदद कर सकते हैं। "] },
                gastroenteritis: { name: " गैस्ट्रोएंटेराइटिस (दस्त )", description: " एक आंतों का संक्रमण जिसमें पानी वाले दस्त, पेट में ऐंठन, मतली या उल्टी और कभी-कभी बुखार होता है। ", remedies: [" निर्जलीकरण को रोकने के लिए खूब सारे तरल पदार्थ पिएं (ORS सबसे अच्छा है ) । ", " केला, चावल और टोस्ट (BRAT आहार ) जैसे नरम खाद्य पदार्थ खाएं। ", " डेयरी, वसायुक्त या मसालेदार भोजन से बचें। "] },
                typhoid: { name: " टाइफाइड बुखार ", description: " साल्मोनेला टाइफी के कारण होने वाला एक गंभीर जीवाणु संक्रमण, जिसकी विशेषता लगातार तेज बुखार है। ", remedies: [" तत्काल चिकित्सा ध्यान देने की आवश्यकता है और इसका इलाज एंटीबायोटिक दवाओं से किया जाता है। ", " निर्जलीकरण को रोकने के लिए खूब सारे तरल पदार्थ पिएं। ", " उच्च-कैलोरी, पौष्टिक आहार खाएं। "] },
                giardiasis: { name: " गिआर्डियासिस ", description: " जिआर्डिया लैम्ब्लिया नामक एक सूक्ष्म परजीवी के कारण होने वाला एक आंतों का संक्रमण, जो अक्सर बिना बुखार के पेट फूलना और ऐंठन का कारण बनता है। ", remedies: [" आमतौर पर पर्चे वाली दवाओं से चिकित्सा उपचार की आवश्यकता होती है। ", " अच्छी तरह से हाइड्रेटेड रहें। ", " कैफीन और डेयरी उत्पादों से बचें, जो दस्त को बढ़ा सकते हैं। "] },
                crypto: { name: " क्रिप्टोस्पोरिडिओसिस ", description: " सूक्ष्म परजीवी क्रिप्टोस्पोरिडियम के कारण होने वाली एक दस्त की बीमारी। यह पानी वाले दस्त का कारण बन सकती है और जलजनित बीमारी का एक आम कारण है। ", remedies: [" ज्यादातर लोग बिना इलाज के ठीक हो जाते हैं। ", " निर्जलीकरण को रोकने के लिए खूब सारे तरल पदार्थ पिएं। ", " दस्त-रोधी दवा मदद कर सकती है, लेकिन पहले डॉक्टर से सलाह लें। "] }
            },
            ai: {
                initialGreeting: " नमस्ते ! मैं जल-रक्षक एआई हूँ। आज मैं जलजनित रोगों के बारे में आपकी कैसे सहायता कर सकता हूँ ? आप मुझसे ' हैजा का कारण क्या है ?' या ' टाइफाइड से कैसे बचें ?' जैसे सवाल पूछ सकते हैं। ",
                fallback: " मुझे खेद है, मेरे पास उस पर जानकारी नहीं है। मैं हैजा, टाइफाइड, हेपेटाइटिस ए, जिआर्डियासिस और गैस्ट्रोएंटेराइटिस जैसे रोगों के कारण, लक्षण, उपचार और रोकथाम के बारे में सवालों के जवाब दे सकता हूँ। कृपया अपना प्रश्न अलग तरीके से पूछने का प्रयास करें। ",
            },
            welcome: "स्वागत है",
            devices: "उपकरण",
            addDevice: "+ उपकरण जोड़ें",
            heroTitleBadge: "अखिल भारतीय",
            heroTitleMain: "जलजनित रोग निगरानी",
            allIndiaMapTitle: "अखिल भारतीय रोग प्रकोप निगरानी",
            nearbyMapTitle: "निकटवर्ती रोग प्रकोप",
            heroPill1: "एआई-संचालित जांच",
            heroPill2: "वास्तविक समय अलर्ट",
            heroPill3: "अखिल भारतीय फोकस",
            statisticsInfo: "यूपी और बिहार में सबसे अधिक मामले दर्ज",
            trendsInfo: "जुलाई-अगस्त में चरम संचरण देखा गया",
            waterFormTitle: "जल गुणवत्ता पैरामीटर",
            waterFormSubtitle: "अपने जल स्रोत के विस्तृत विश्लेषण के लिए निम्नलिखित पैरामीटर सबमिट करें।",
            basicWaterInfo: "बुनियादी जल जानकारी",
            physicalParams: "भौतिक पैरामीटर",
            chemicalParams: "रासायनिक पैरामीटर",
            sensorReadings: "सेंसर रीडिंग",
            rgbSensor: "आरजीबी सेंसर",
            uvSensor: "यूवी सेंसर",
            initialPrediction: "प्रारंभिक भविष्यवाणी",
            fetchFromDevice: "डिवाइस से प्राप्त करें",
            fetching: "प्राप्त कर रहा है...",
            joinCause: "हमारे मकसद में शामिल हों",
            joinCauseText: "जल-रक्षक में योगदान करने के इच्छुक हैं? हम हमेशा स्वयंसेवकों और भागीदारों की तलाश में रहते हैं।",
            contactUs: "संपर्क करें",
            deviceName: "डिवाइस का नाम",
            deviceId: "डिवाइस आईडी",
            addNewDevice: "नया डिवाइस जोड़ें",
            adding: "जोड़ा जा रहा है...",
            deviceAdded: "डिवाइस सफलतापूर्वक जोड़ा गया!",
            deviceAddError: "डिवाइस जोड़ने में त्रुटि: ",
            selectSource: "स्रोत का चयन करें",
            selectColor: "रंग चुनें",
            selectGender: "लिंग चुनें",
        },
        as: {
            home: " ঘৰ ",
            submitWaterData: " তথ্য জমা দিয়ক ",
            diseasePrediction: " ৰোগৰ ভৱিষ্যদ্বাণী ",
            community: " সামাজিক প্ৰসাৰণ ",
            aiAssistant: " এআই সহায়ক ",
            about: " আমাৰ বিষয়ে ",
            language: " ভাষা ",
            english: " ইংৰাজী ",
            hindi: " হিন্দী ",
            assamese: " অসমীয়া ",
            bengali: " বাংলা ",
            heroTitle: " সৰ্বভাৰতীয় জলবাহিত ৰোগ নিৰীক্ষণ ",
            heroSubtitle: " জল-বাহিত ৰোগৰ বাবে বাস্তৱ-সময়ৰ নিৰীক্ষণ আৰু সঁহাৰি প্ৰণালী ",
            outbreakTitle: " ডায়েৰিয়াৰ প্ৰাদুৰ্ভাৱ ",
            statisticsTitle: " সৰ্বভাৰতীয় ৰাজ্যসমূহৰ তুলনা ",
            trendsTitle: " ৰোগৰ প্ৰৱণতা (মাহেকীয়া )",
            emergencyTitle: " জৰুৰীকালীন সঁহাৰি স্থিতি ",
            disease: " ৰোগ ",
            state: " ৰাজ্য ",
            severity: " গুৰুত্বৰ স্তৰ ",
            responseTeam: " সঁহাৰি দল ",
            lastUpdate: " শেষ আপডেট ",
            predictionTitle: " এআই ৰোগৰ ভৱিষ্যদ্বাণীৰ বাবে স্বাস্থ্য তথ্য জমা দিয়ক ",
            predictionSubtitle: " লক্ষণ আৰু ৰোগীৰ তথ্য বাছনি কৰক, আৰু আমাৰ এআই-এ সম্ভাৱ্য পানীজনিত ৰোগৰ প্ৰাৰম্ভিক বিশ্লেষণ প্ৰদান কৰিব। ",
            patientInfo: " ৰোগীৰ তথ্য ",
            fullName: " সম্পূৰ্ণ নাম ",
            age: " বয়স ",
            gender: " লিঙ্গ ",
            location: " স্থান ",
            symptoms: " পৰ্যবেক্ষণ কৰা লক্ষণসমূহ ",
            waterQuality: " পানীৰ গুণগত মানৰ মাপকাঠী ",
            waterSourceType: " পানীৰ উৎসৰ প্ৰকাৰ ",
            pH: " পিএইচ স্তৰ ",
            turbidity: " ঘোলাपन (NTU)",
            contaminantLevelPpm: " দূষক স্তৰ (ppm)",
            waterTemperatureC: " পানীৰ উষ্ণতা (°C)",
            upload: " ফাইল আপলোড কৰক ",
            submitButton: " তথ্য জমা দিয়ক আৰু বিশ্লেষণ লাভ কৰক ",
            analysisTitle: " এআই বিশ্লেষণৰ ফলাফল ",
            analysisPlaceholder: " আপোনাৰ বিশ্লেষণ দাখিলৰ পিছত ইয়াত দেখা যাব। ",
            analyzingPlaceholder: " আমাৰ এআই-এ তথ্য বিশ্লেষণ কৰি আছে... অনুগ্ৰহ কৰি অপেক্ষা কৰক। ",
            communityTitle: " সামাজিক প্ৰসাৰণ কাৰ্যসূচী ",
            communitySubtitle: " পানীৰ সুৰক্ষা আৰু ৰোগ প্ৰতিৰোধৰ বিষয়ে জানিবলৈ সৰ্বভাৰতত আমাৰ স্বাস্থ্য শিক্ষাৰ পদক্ষেপ আৰু সামাজিক কাৰ্যসূচীত যোগদান কৰক। ",
            eventsTitle: " আগন্তুক কাৰ্যসূচী ",
            programHighlights: " কাৰ্যসূচীৰ মুখ্য অংশ ",
            onlinePrograms: " অনলাইন কাৰ্যসূচী ",
            offlineEvents: " অফলাইন কাৰ্যসূচী ",
            waterTesting: " পানী পৰীক্ষা ",
            chatTitle: " জল-ৰক্ষক এআই সহায়ক ",
            chatPlaceholder: " জলবাহিত ৰোগৰ বিষয়ে সোধক ...",
            chatFeatures: " এআই সহায়কৰ বৈশিষ্ট্য ",
            quickHelp: " দ্ৰুত সহায় ",
            diseaseSymptoms: " ৰোগৰ লক্ষণ ",
            preventionTips: " প্ৰতিৰোধৰ উপায় ",
            waterTesting2: " পানী পৰীক্ষা ",
            aboutTitle: " জল-ৰক্ষকৰ বিষয়ে ",
            missionTitle: " আমাৰ উদ্দেশ্য ",
            missionText: " জল-ৰক্ষক উন্নত এআই আৰু মেচিন লাৰ্নিং প্ৰযুক্তিৰ জৰিয়তে জনস্বাস্থ্য নিৰীক্ষণত বৈপ্লৱিক পৰিৱৰ্তন আনিবলৈ সমৰ্পিত। আমাৰ উদ্দেশ্য হৈছে গ্ৰাম্য সৰ্বভাৰতত দুৰ্বল সম্প্ৰদায়সমূহত জলবাহিত ৰোগৰ প্ৰাদুৰ্ভাৱ চিনাক্ত, নিৰীক্ষণ আৰু প্ৰতিৰোধ কৰা এক স্মাৰ্ট স্বাস্থ্য নিৰীক্ষণ প্ৰণালী সৃষ্টি কৰা। ",
            visionTitle: " আমাৰ দৃষ্টিভংগী ",
            visionText: " এক ব্যাপক আগতীয়া সতৰ্কবাণী প্ৰণালী স্থাপন কৰা যি সম্প্ৰদায়, স্বাস্থ্য কৰ্মী আৰু চৰকাৰী বিষয়াসকলক জলবাহিত ৰোগৰ সৈতে ফলপ্ৰসূভাৱে মোকাবিলা কৰিবলৈ বাস্তৱ-সময়ৰ জ্ঞান আৰু কাৰ্যকৰী বুদ্ধিমত্তাৰে সজ্জিত কৰে। ",
            techStack: " প্ৰযুক্তিৰ ষ্টেক ",
            teamTitle: " আমাৰ দল ",
            critical: " সংকটজনক ",
            high: " উচ্চ ",
            medium: " মাধ্যম ",
            low: " নিম্ন ",
            upcoming: " আগন্তুক ",
            registered: " পঞ্জীভুক্ত ",
            registerNow: " এতিয়া পঞ্জীয়ন কৰক ",
            description: " বিৱৰণ ",
            prevention: " প্ৰতিৰোধ পদ্ধতি ",
            reportedCases: " ৰিপোৰ্ট কৰা ঘটনা ",
            rate: " হাৰ ",
            cases: " ঘটনা ",
            location2: " স্থান ",
            send: " প্ৰেৰণ কৰক ",
            aboutAI: " জল-ৰক্ষক এআইৰ বিষয়ে ",
            aboutAIText: " আমাৰ এআই সহায়কে বহু ভাষাত জলবাহিত ৰোগ, প্ৰতিৰোধ পদ্ধতি আৰু স্বাস্থ্য সম্পদৰ বিষয়ে আপোনাৰ প্ৰশ্নৰ তৎকালীন উত্তৰ দিয়ে। ",
            symptomsTitle: " লক্ষণসমূহ :",
            preventionTitle: " প্ৰতিৰোধ পদ্ধতি :",
            remediesTitle: " নিৰাময় আৰু প্ৰতিকাৰ ",
            statistics: " প্ৰাদুৰ্ভাৱৰ পৰিসংখ্যা ",
            probability: " মিল স্কোৰ ",
            noDiseaseDetectedTitle: " কোনো নিৰ্দিষ্ট ৰোগ ধৰা পৰা নাই ",
            noDiseaseDetectedDescription: " লক্ষণসমূহৰ সংমিশ্ৰণে আমাৰ ডাটাবেছত কোনো এটা জলবাহিত ৰোগৰ সৈতে শক্তিশালীভাৱে মিল নাখায়। ই কোনো ৰোগ নুই নকৰে। ",
            noDiseaseDetectedRemedy: " অনুগ্ৰহ কৰি সঠিক ৰোগ নিৰ্ণয়ৰ বাবে এজন স্বাস্থ্যসেৱা পেছাদাৰীৰ সৈতে পৰামৰ্শ কৰক। আপুনি হাইড্ৰেটেড থকাটো নিশ্চিত কৰক আৰু আপোনাৰ লক্ষণসমূহ নিৰীক্ষণ কৰক। ",
            genderOptions: { male: " পুৰুষ ", female: " মহিলা ", other: " অন্য " },
            symptomsList: [" জ্বৰ ", " ডায়েৰিয়া ", " বমি ", " পেটৰ বিষ ", " ডিহাইড্ৰেচন ", " মূৰৰ বিষ ", " ভাগৰ ", " বমি ভাব ", " জণ্ডিচ ", " গাঢ় ৰঙৰ প্ৰস্ৰাৱ ", " গোলাপী দাগ ", " পেট ফুলা ", " ওজন হ্ৰাস "],
            diseases: {
                hepatitisA: { name: " হেপাটাইটিছ এ ", description: " হেপাটাইটিছ এ ভাইৰাছ (HAV) ৰ ফলত হোৱা যকৃতৰ সংক্ৰমণ, যি অতি সংক্ৰামক আৰু দূষিত খাদ্য বা পানীৰ জৰিয়তে বিয়পে। ", remedies: [" কোনো নিৰ্দিষ্ট চিকিৎসা নথকাৰ বাবে জিৰণি লোৱাটো গুৰুত্বপূৰ্ণ। ", " যথেষ্ট তৰল পদাৰ্থ পান কৰি হাইড্ৰেটেড থাকক। ", " মদ আৰু যকৃতৰ ক্ষতি কৰিব পৰা ঔষধ পৰিহাৰ কৰক। "] },
                cholera: { name: " কলেৰা ", description: " ভিব্রিঅ' কলেৰি বেক্টেৰিয়াৰ দ্বাৰা অন্ত্ৰৰ সংক্ৰমণৰ ফলত হোৱা এক তীব্ৰ ডায়েৰিয়া ৰোগ, যি গুৰুতৰ হ'ব পাৰে। ", remedies: [" ওৰেল ৰিহাইড্ৰেচন চলিউচন (ORS) ৰ সৈতে তৎকালীনভাৱে পুনৰজলীকৰণ কৰাটো মূল কথা। ", " গুৰুতৰ ক্ষেত্ৰত তৎকালীন চিকিৎসাৰ সহায় লওক। ", " জিংক পৰিপূৰকে ডায়েৰিয়াৰ সময়সীমা হ্ৰাস কৰাত সহায় কৰিব পাৰে। "] },
                gastroenteritis: { name: " গেষ্ট্ৰ'এণ্টেৰাইটিছ (ডায়েৰিয়া )", description: " পনীয়া ডায়েৰিয়া, পেটৰ বিষ, বমি ভাব বা বমি, আৰু কেতিয়াবা জ্বৰৰ দ্বাৰা চিহ্নিত এক অন্ত্ৰৰ সংক্ৰমণ। ", remedies: [" ডিহাইড্ৰেচন প্ৰতিৰোধ কৰিবলৈ যথেষ্ট তৰল পদাৰ্থ পান কৰক (ORS শ্ৰেষ্ঠ ) । ", " কল, ভাত আৰু টোষ্ট (BRAT diet) ৰ দৰে পাতল খাদ্য খাওক। ", " গাখীৰ, চৰ্বিযুক্ত বা মচলাযুক্ত খাদ্য পৰিহাৰ কৰক। "] },
                typhoid: { name: " টাইফয়েড জ্বৰ ", description: " চালমোনেলা টাইফিৰ ফলত হোৱা এক গুৰুতৰ বেক্টেৰিয়া সংক্ৰমণ, যাৰ বৈশিষ্ট্য হৈছে এক দীৰ্ঘস্থায়ী উচ্চ জ্বৰ। ", remedies: [" তৎকালীন চিকিৎসাৰ প্ৰয়োজন আৰু ইয়াক এন্টিবায়োটিকৰ দ্বাৰা চিকিৎসা কৰা হয়। ", " ডিহাইড্ৰেচন প্ৰতিৰোধ কৰিবলৈ যথেষ্ট তৰল পদাৰ্থ পান কৰক। ", " উচ্চ কেলৰিযুক্ত, পুষ্টিকৰ আহাৰ খাওক। "] },
                giardiasis: { name: " গিয়াৰ্ডিয়াচিছ ", description: " গিয়াৰ্ডিয়া লেম্বলিয়া নামৰ এক অণুবীক্ষণিক পৰজীৱীৰ ফলত হোৱা এক অন্ত্ৰৰ সংক্ৰমণ, যিয়ে প্ৰায়ে জ্বৰ অবিহনে পেট ফুলা আৰু বিষৰ সৃষ্টি কৰে। ", remedies: [" সাধাৰণতে চিকিৎসকৰ পৰামৰ্শ মতে ঔষধৰ সৈতে চিকিৎসাৰ প্ৰয়োজন হয়। ", " ভালদৰে হাইড্ৰেটেড থাকক। ", " কেফেইন আৰু গাখীৰৰ সামগ্ৰী পৰিহাৰ কৰক, যিয়ে ডায়েৰিয়া বঢ়াব পাৰে। "] },
                crypto: { name: " ক্ৰিপ্টোস্প'ৰিডিওচিছ ", description: " অণুবীক্ষণিক পৰজীৱী ক্ৰিপ্টোস্প'ৰিডিয়ামৰ ফলত হোৱা এক ডায়েৰিয়া ৰোগ। ই পনীয়া ডায়েৰিয়াৰ সৃষ্টি কৰিব পাৰে আৰু ই জলবাহিত ৰোগৰ এক সাধাৰণ কাৰণ। ", remedies: [" বেছিভাগ লোক চিকিৎসা অবিহনে আৰোগ্য হয়। ", " ডিহাইড্ৰেচন প্ৰতিৰোধ কৰিবলৈ যথেষ্ট তৰল পদাৰ্থ পান কৰক। ", " ডায়েৰিয়া-প্ৰতিৰোধী ঔষধে সহায় কৰিব পাৰে, কিন্তু প্ৰথমে চিকিৎসকৰ পৰামৰ୍শ লওক। "] }
            },
            ai: {
                initialGreeting: " নমস্কাৰ ! মই জল-ৰক্ষক এআই। মই আজি আপোনাক জলবাহিত ৰোগৰ বিষয়ে কেনেদৰে সহায় কৰিব পাৰোঁ ? আপুনি মোক ' কলেৰাৰ কাৰণ কি ?' বা ' টাইফয়েড কেনেকৈ প্ৰতিৰোধ কৰিব ?' আদি প্ৰশ্ন সুধিব পাৰে। ",
                fallback: " মই দুঃখিত, মোৰ ওচৰত সেই বিষয়ে তথ্য নাই। মই কলেৰা, টাইফয়েড, হেপাটাইটিছ এ, গিয়াৰ্ডিয়াচিছ, আৰু গেষ্ট্ৰ'এণ্টেৰাইটিছৰ দৰে ৰোগৰ কাৰণ, লক্ষণ, চিকিৎসা, আৰু প্ৰতিৰোধৰ বিষয়ে প্ৰশ্নৰ উত্তৰ দিব পাৰোঁ। অনুগ্ৰহ কৰি আপোনাৰ প্ৰশ্নটো বেলেগ ধৰণে সুধিবলৈ চেষ্টা কৰক। ",
            },
            welcome: "স্বাগতম",
            devices: "ডিভাইচ",
            addDevice: "+ ডিভাইচ যোগ কৰক",
            heroTitleBadge: "সৰ্বভাৰতীয়",
            heroTitleMain: "জলবাহিত ৰোগ নিৰীক্ষণ",
            allIndiaMapTitle: "সৰ্বভাৰতীয় ৰোগৰ প্ৰাদুৰ্ভাৱ মনিটৰ",
            nearbyMapTitle: "ওচৰৰ ৰোগৰ প্ৰাদুৰ্ভাৱ",
            heroPill1: "এআই-চালিত চিনাক্তকৰণ",
            heroPill2: "বাস্তৱ-সময়ৰ সতৰ্কবাণী",
            heroPill3: "সৰ্বভাৰতীয় ফোকাচ",
            statisticsInfo: "উত্তৰ প্ৰদেশ আৰু বিহাৰত সৰ্বাধিক ৰিপ'ৰ্ট কৰা ঘটনা",
            trendsInfo: "জুলাই-আগষ্টত সৰ্বাধিক সংক্ৰমণ পৰিলক্ষিত হৈছে",
            waterFormTitle: "পানীৰ গুণগত মানৰ পৰিমাণ",
            waterFormSubtitle: "আপোনাৰ পানীৰ উৎসৰ বিশদ বিশ্লেষণৰ বাবে তলত দিয়া পৰিমাণসমূহ জমা দিয়ক।",
            basicWaterInfo: "পানীৰ মূল তথ্য",
            physicalParams: "ভৌতিক পৰিমাপসমূহ",
            chemicalParams: "ৰাসায়নিক পৰিমাপসমূহ",
            sensorReadings: "চেন্সৰ ৰিডিং",
            rgbSensor: "আৰজিবি চেন্সৰ",
            uvSensor: "ইউভি চেন্সৰ",
            initialPrediction: "প্ৰাৰম্ভিক ভৱিষ্যদ্বাণী",
            fetchFromDevice: "ডিভাইচৰ পৰা আনক",
            fetching: "অনা হৈ আছে...",
            joinCause: "আমাৰ উদ্দেশ্যত যোগদান কৰক",
            joinCauseText: "জল-ৰক্ষকত অৱদান আগবঢ়াবলৈ আগ্ৰহী নেকি? আমি সদায় স্বেচ্ছাসেৱক আৰু অংশীদাৰ বিচাৰি থাকোঁ।",
            contactUs: "যোগাযোগ কৰক",
            deviceName: "ডিভাইচৰ নাম",
            deviceId: "ডিভাইচ আইডি",
            addNewDevice: "নতুন ডিভাইচ যোগ কৰক",
            adding: "যোগ কৰা হৈছে...",
            deviceAdded: "ডিভাইচ সফলভাৱে যোগ কৰা হ'ল!",
            deviceAddError: "ডিভাইচ যোগ কৰাত ত্ৰুটি: ",
            selectSource: "উৎস বাছনি কৰক",
            selectColor: "ৰং বাছনি কৰক",
            selectGender: "লিঙ্গ বাছনি কৰক",
        },
        bn: {
            home: " হোম ",
            submitWaterData: " ডেটা জমা দিন ",
            diseasePrediction: " রোগের পূর্বাভাস ",
            community: " সম্প্রদায় আউটরিচ ",
            aiAssistant: " এআই সহকারী ",
            about: " আমাদের সম্পর্কে ",
            language: " ভাষা ",
            english: " ইংরেজি ",
            hindi: " হিন্দি ",
            assamese: " অসমিয়া ",
            bengali: " বাংলা ",
            heroTitle: " সর্ব-ভারত জলবাহিত রোগ মনিটর ",
            heroSubtitle: " জল-বাহিত রোগের জন্য রিয়েল-টাইম নজরদারি এবং প্রতিক্রিয়া ব্যবস্থা ",
            outbreakTitle: " ডায়রিয়ার প্রাদুর্ভাব ",
            statisticsTitle: " সর্ব-ভারত রাজ্যগুলির তুলনা ",
            trendsTitle: " রোগের প্রবণতা (মাসিক )",
            emergencyTitle: " জরুরী প্রতিক্রিয়া স্থিতি ",
            disease: " রোগ ",
            state: " রাজ্য ",
            severity: " গুরুতরতার স্তর ",
            responseTeam: " প্রতিক্রিয়া দল ",
            lastUpdate: " শেষ আপডেট ",
            predictionTitle: " এআই রোগ পূর্বাভাসের জন্য স্বাস্থ্য ডেটা জমা দিন ",
            predictionSubtitle: " লক্ষণ এবং রোগীর ডেটা নির্বাচন করুন, এবং আমাদের এআই সম্ভাব্য জলবাহিত অসুস্থতার একটি প্রাথমিক বিশ্লেষণ প্রদান করবে। ",
            patientInfo: " রোগীর তথ্য ",
            fullName: " পুরো নাম ",
            age: " বয়স ",
            gender: " লিঙ্গ ",
            location: " অবস্থান ",
            symptoms: " পর্যবেক্ষণ করা লক্ষণ ",
            waterQuality: " জলের গুণমান পরামিতি ",
            waterSourceType: " জলের উৎসের প্রকার ",
            pH: " পিএইচ স্তর ",
            turbidity: " ঘোলাত্ব (NTU)",
            contaminantLevelPpm: " দূষক স্তর (ppm)",
            waterTemperatureC: " জলের তাপমাত্রা (°C)",
            upload: " ফাইল আপলোড করুন ",
            submitButton: " ডেটা জমা দিন এবং বিশ্লেষণ পান ",
            analysisTitle: " এআই বিশ্লেষণ ফলাফল ",
            analysisPlaceholder: " আপনার বিশ্লেষণ জমা দেওয়ার পরে এখানে উপস্থিত হবে। ",
            analyzingPlaceholder: " আমাদের এআই ডেটা বিশ্লেষণ করছে... অনুগ্রহ করে অপেক্ষা করুন। ",
            communityTitle: " সম্প্রদায় আউটরিচ প্রোগ্রাম ",
            communitySubtitle: " জল নিরাপত্তা এবং রোগ প্রতিরোধ সম্পর্কে জানতে সর্ব-ভারত জুড়ে আমাদের স্বাস্থ্য শিক্ষা উদ্যোগ এবং সম্প্রদায় ইভেন্টগুলিতে যোগ দিন। ",
            eventsTitle: " আসন্ন ঘটনাবলী ",
            programHighlights: " প্রোগ্রামের হাইলাইটস ",
            onlinePrograms: " অনলাইন প্রোগ্রাম ",
            offlineEvents: " অফলাইন ইভেন্টস ",
            waterTesting: " জল পরীক্ষা ",
            chatTitle: " জল-রक्षक এআই সহকারী ",
            chatPlaceholder: " জলবাহিত রোগ সম্পর্কে জিজ্ঞাসা করুন ...",
            chatFeatures: " এআই সহকারীর বৈশিষ্ট্য ",
            quickHelp: " দ্রুত সাহায্য ",
            diseaseSymptoms: " রোগের লক্ষণ ",
            preventionTips: " প্রতিরোধ টিপস ",
            waterTesting2: " জল পরীক্ষা ",
            aboutTitle: " জল-রक्षक সম্পর্কে ",
            missionTitle: " আমাদের লক্ষ্য ",
            missionText: " জল-রक्षक উন্নত এআই এবং মেশিন লার্নিং প্রযুক্তির মাধ্যমে জনস্বাস্থ্য পর্যবেক্ষণে বিপ্লব ঘটাতে নিবেদিত। আমাদের লক্ষ্য হল একটি স্মার্ট স্বাস্থ্য নজরদারি ব্যবস্থা তৈরি করা যা গ্রামীণ সর্ব-ভারতে দুর্বল সম্প্রদায়গুলিতে জলবাহিত রোগের প্রাদুর্ভাব সনাক্ত, পর্যবেক্ষণ এবং প্রতিরোধ করে। ",
            visionTitle: " আমাদের দৃষ্টি ",
            visionText: " একটি ব্যাপক প্রারম্ভিক সতর্কতা ব্যবস্থা প্রতিষ্ঠা করা যা সম্প্রদায়, স্বাস্থ্যকর্মী এবং সরকারী কর্মকর্তাদেরকে জলবাহিত রোগের বিরুদ্ধে কার্যকরভাবে লড়াই করার জন্য রিয়েল-টাইম অন্তর্দৃষ্টি এবং কার্যকরী বুদ্ধিমত্তা দিয়ে শক্তিশালী করে। ",
            techStack: " প্রযুক্তি স্ট্যাক ",
            teamTitle: " আমাদের দল ",
            critical: " সংকটজনক ",
            high: " উচ্চ ",
            medium: " মাঝারি ",
            low: " নিম্ন ",
            upcoming: " আসন্ন ",
            registered: " নিবন্ধিত ",
            registerNow: " এখন নিবন্ধন করুন ",
            description: " বিবরণ ",
            prevention: " প্রতিরোধ পদ্ধতি ",
            reportedCases: " রিপোর্ট করা কেস ",
            rate: " হার ",
            cases: " কেস ",
            location2: " অবস্থান ",
            send: " প্রেরণ ",
            aboutAI: " জল-রक्षक এআই সম্পর্কে ",
            aboutAIText: " আমাদের এআই সহকারী একাধিক ভাষায় জলবাহিত রোগ, প্রতিরোধ পদ্ধতি এবং স্বাস্থ্য সম্পদ সম্পর্কে আপনার প্রশ্নের তাত্ক্ষণিক উত্তর প্রদান করে। ",
            symptomsTitle: " লক্ষণ :",
            preventionTitle: " প্রতিরোধ পদ্ধতি :",
            remediesTitle: " নিরাময় ও প্রতিকার ",
            statistics: " প্রাদুর্ভাবের পরিসংখ্যান ",
            probability: " ম্যাচ স্কোর ",
            noDiseaseDetectedTitle: " কোনো নির্দিষ্ট রোগ সনাক্ত করা যায়নি ",
            noDiseaseDetectedDescription: " লক্ষণগুলির সংমিশ্রণ আমাদের ডাটাবেসের কোনো একক জলবাহিত রোগের সাথে দৃঢ়ভাবে মেলে না। এটি কোনো অসুস্থতা বাতিল করে না। ",
            noDiseaseDetectedRemedy: " সঠিক নির্ণয়ের জন্য অনুগ্রহ করে একজন স্বাস্থ্যসেবা পেশাদারের সাথে পরামর্শ করুন। আপনি হাইড্রেটেড আছেন তা নিশ্চিত করুন এবং আপনার লক্ষণগুলি পর্যবেক্ষণ করুন। ",
            genderOptions: { male: " পুরুষ ", female: " মহিলা ", other: " অন্যান্য " },
            symptomsList: [" জ্বর ", " ডায়রিয়া ", " বমি ", " পেটে ব্যথা ", " ডিহাইড্রেশন ", " মাথাব্যথা ", " ক্লান্তি ", " বমি বমি ভাব ", " জন্ডিস ", " গাঢ় রঙের প্রস্রাব ", " গোলাপী দাগ ", " পেট ফাঁপা ", " ওজন হ্রাস "],
            diseases: {
                hepatitisA: { name: " হেপাটাইটিস এ ", description: " হেপাটাইটিস এ ভাইরাস (HAV) দ্বারা সৃষ্ট একটি লিভারের সংক্রমণ, যা অত্যন্ত সংক্রাকক এবং দূষিত খাবার বা জলের মাধ্যমে ছড়ায়। ", remedies: [" বিশ্রাম অপরিহার্য কারণ কোনো নির্দিষ্ট চিকিৎসা নেই। ", " প্রচুর পরিমাণে তরল পান করে হাইড্রেটেড থাকুন। ", " অ্যালকোহল এবং লিভারের ক্ষতি করতে পারে এমন ওষুধ এড়িয়ে চলুন। "] },
                cholera: { name: " কলেরা ", description: " ভিব্রিও কলেরি ব্যাকটেরিয়া দ্বারা অন্ত্রের সংক্রমণের কারণে সৃষ্ট একটি তীব্র ডায়রিয়ার অসুস্থতা, যা গুরুতর হতে পারে। ", remedies: [" ওরাল রিহাইড্রেশন সলিউশন (ORS) দিয়ে অবিলম্বে পুনরুদ দরকার। ", " গুরুতর ক্ষেত্রে জরুরি চিকিৎসার সহায়তা নিন। ", " জিঙ্ক সাপ্লিমেন্ট ডায়রিয়ার সময়কাল কমাতে সাহায্য করতে পারে। "] },
                gastroenteritis: { name: " গ্যাস্ট্রোএন্টারাইটিস (ডায়রিয়া )", description: " একটি অন্ত্রের সংক্রমণ যা জলীয় ডায়রিয়া, পেটে ব্যথা, বমি বমি ভাব বা বমি এবং কখনও কখনও জ্বর দ্বারা চিহ্নিত করা হয়। ", remedies: [" ডিহাইড্রেশন প্রতিরোধ করতে প্রচুর পরিমাণে তরল পান করুন (ORS সেরা ) । ", " কলা, ভাত এবং টোস্টের মতো নরম খাবার খান (BRAT ডায়েট ) । ", " দুগ্ধজাত, চর্বিযুক্ত বা মশলাদার খাবার এড়িয়ে চলুন। "] },
                typhoid: { name: " টাইফয়েড জ্বর ", description: " সালমোনেলা টাইফি দ্বারা সৃষ্ট একটি গুরুতর ব্যাকটেরিয়া সংক্রমণ, যা একটি স্থায়ী উচ্চ জ্বর দ্বারা চিহ্নিত করা হয়। ", remedies: [" অবিলম্বে চিকিৎসার প্রয়োজন এবং এটি অ্যান্টিবায়োটিক দিয়ে চিকিৎসা করা হয়। ", " ডিহাইড্রেশন প্রতিরোধ করতে প্রচুর পরিমাণে তরল পান করুন। ", " একটি উচ্চ-ক্যালোরি, পুষ্টিকর খাদ্য গ্রহণ করুন। "] },
                giardiasis: { name: " জিয়ার্ডিয়াসিস ", description: " জিয়ার্ডিয়া ল্যাম্বলিয়া নামক একটি আণুবীক্ষণিক পরজীবী দ্বারা সৃষ্ট একটি অন্ত্রের সংক্রমণ, যা প্রায়শই জ্বর ছাড়াই পেট ফাঁপা এবং ব্যথার কারণ হয়। ", remedies: [" সাধারণত প্রেসক্রিপশন ওষুধের সাথে চিকিৎসা প্রয়োজন। ", " ভালভাবে হাইড্রেটেড থাকুন। ", " ক্যাফিন এবং দুগ্ধজাত পণ্য এড়িয়ে চলুন, যা ডায়রিয়াকে আরও খারাপ করতে পারে। "] },
                crypto: { name: " ক্রিপ্টোস্পোরিডিওসিস ", description: " আণুবীক্ষণিক পরজীবী ক্রিপ্টোস্পোরিডিয়াম দ্বারা সৃষ্ট একটি ডায়রিয়ার রোগ। এটি জলীয় ডায়রিয়ার কারণ হতে পারে এবং এটি জলবাহিত রোগের একটি সাধারণ কারণ। ", remedies: [" বেশিরভাগ লোক চিকিৎসা ছাড়াই সুস্থ হয়ে ওঠে। ", " ডিহাইড্রেশন প্রতিরোধ করতে প্রচুর পরিমাণে তরল পান করুন। ", " অ্যান্টি-ডায়রিয়াল ওষুধ সাহায্য করতে পারে, তবে প্রথমে একজন ডাক্তারের সাথে পরামর্শ করুন। "] }
            },
            ai: {
                initialGreeting: " নমস্কার ! আমি জল-রक्षक এআই। আমি আজ আপনাকে জলবাহিত রোগ সম্পর্কে কীভাবে সহায়তা করতে পারি ? আপনি আমাকে জিজ্ঞাসা করতে পারেন ' কলেরার কারণ কী ?' বা ' টাইফয়েড কীভাবে প্রতিরোধ করা যায় ?'",
                fallback: " আমি দুঃখিত, আমার কাছে সেই বিষয়ে তথ্য নেই। আমি কলেরা, টাইফয়েড, হেপাটাইটিস এ, জিয়ার্ডিয়াসিস এবং গ্যাস্ট্রোএন্টারাইটিসের মতো রোগের কারণ, লক্ষণ, চিকিৎসা এবং প্রতিরোধ সম্পর্কে প্রশ্নের উত্তর দিতে পারি। অনুগ্রহ করে আপনার প্রশ্নটি ভিন্নভাবে জিজ্ঞাসা করার চেষ্টা করুন। ",
            },
            welcome: "স্বাগতম",
            devices: "ডিভাইস",
            addDevice: "+ ডিভাইস যোগ করুন",
            heroTitleBadge: "সর্ব-ভারত",
            heroTitleMain: "জলবাহিত রোগ মনিটর",
            allIndiaMapTitle: "সর্বভারতীয় রোগ প্রাদুর্ভাব মনিটর",
            nearbyMapTitle: "কাছাকাছি রোগ প্রাদুর্ভাব",
            heroPill1: "এআই-চালিত সনাক্তকরণ",
            heroPill2: "রিয়েল-টাইম সতর্কতা",
            heroPill3: "সর্ব-ভারত ফোকাস",
            statisticsInfo: "ইউপি এবং বিহারে সর্বোচ্চ রিপোর্ট করা ঘটনা",
            trendsInfo: "জুলাই-আগস্টে সর্বোচ্চ সংক্রমণ পরিলক্ষিত হয়েছে",
            waterFormTitle: "জলের গুণমান পরিমাপ",
            waterFormSubtitle: "আপনার জলের উৎসের বিস্তারিত বিশ্লেষণের জন্য নিম্নলিখিত পরিমাপগুলি জমা দিন।",
            basicWaterInfo: "জলের মৌলিক তথ্য",
            physicalParams: "ভৌত পরামিতি",
            chemicalParams: "রাসায়নিক পরামিতি",
            sensorReadings: "সেন্সর রিডিং",
            rgbSensor: "আরজিবি সেন্সর",
            uvSensor: "ইউভি সেন্সর",
            initialPrediction: "প্রাথমিক পূর্বাভাস",
            fetchFromDevice: "ডিভাইস থেকে আনুন",
            fetching: "আনা হচ্ছে...",
            joinCause: "আমাদের উদ্দেশ্যে যোগ দিন",
            joinCauseText: "জল-রক্ষকে অবদান রাখতে আগ্রহী? আমরা সর্বদা স্বেচ্ছাসেবক এবং অংশীদারদের খুঁজছি।",
            contactUs: "যোগাযোগ করুন",
            deviceName: "ডিভাইসের নাম",
            deviceId: "ডিভাইস আইডি",
            addNewDevice: "নতুন ডিভাইস যোগ করুন",
            adding: "যোগ করা হচ্ছে...",
            deviceAdded: "ডিভাইস সফলভাবে যোগ করা হয়েছে!",
            deviceAddError: "ডিভাইস যোগ করতে ত্রুটি: ",
            selectSource: "উৎস নির্বাচন করুন",
            selectColor: "রঙ নির্বাচন করুন",
            selectGender: "লিঙ্গ নির্বাচন করুন",
        }
    };

    const t = (key) => {
        const keys = key.split('.');
        const resolve = (languageObject, keyParts) => {
            let current = languageObject;
            for (const part of keyParts) {
                if (current === undefined || typeof current !== 'object' || current === null) {
                    return undefined;
                }
                current = current[part];
            }
            return current;
        };
        let result = resolve(translations[language], keys);
        if (result === undefined && language !== 'en') {
            result = resolve(translations['en'], keys);
        }
        return result !== undefined ? result : key;
    };

    useEffect(() => {
        setMessages([
            {
                id: 1,
                text: t('ai.initialGreeting'),
                sender: 'ai',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
        ]);
    }, [language]);

    const diseaseInfoDatabase = {
        hepatitisA: {
            name: "Hepatitis A",
            keywords: ["hepatitis", "jaundice", "hav"],
            info: {
                causes: "Hepatitis A is caused by the Hepatitis A virus (HAV). It's typically transmitted through consuming food or water contaminated with fecal matter from an infected person.",
                symptoms: "Key symptoms are fever, fatigue, loss of appetite, nausea, abdominal pain, dark urine, and jaundice (yellowing of the skin and eyes).",
                treatment: "There is no specific treatment for Hepatitis A. The body usually clears the virus on its own. Doctors recommend rest, adequate nutrition, and plenty of fluids. It's vital to avoid alcohol.",
                prevention: "The best prevention is the Hepatitis A vaccine. Also, always wash your hands with soap and water after using the bathroom and before preparing food. Drink only purified or boiled water."
            }
        },
        cholera: {
            name: "Cholera",
            keywords: ["cholera"],
            info: {
                causes: "Cholera is caused by the bacterium Vibrio cholerae, which is found in water or food sources contaminated by feces from an infected person.",
                symptoms: "The hallmark symptom is profuse watery diarrhea, often described as 'rice-water stools'. Other symptoms include vomiting and leg cramps. It leads to rapid dehydration.",
                treatment: "Immediate rehydration is critical. This is done using Oral Rehydration Solution (ORS). In severe cases, intravenous fluids and antibiotics are required. See a doctor immediately.",
                prevention: "Prevention relies on ensuring access to clean, safe drinking water and proper sanitation. Boiling or treating water before use is essential in high-risk areas."
            }
        },
        gastroenteritis: {
            name: "Gastroenteritis",
            keywords: ["gastroenteritis", "diarrhea", "stomach flu", "loose motion"],
            info: {
                causes: "Gastroenteritis, or infectious diarrhea, can be caused by various viruses (like rotavirus and norovirus), bacteria, or parasites. It spreads through contaminated food or water, or contact with an infected person.",
                symptoms: "Common symptoms include watery diarrhea, abdominal cramps, nausea, vomiting, and sometimes fever. Dehydration is a major concern.",
                treatment: "Treatment focuses on preventing dehydration by drinking plenty of fluids, especially ORS. Eat bland foods (like bananas, rice, toast). Most cases resolve on their own.",
                prevention: "Frequent and thorough handwashing is the best way to prevent it. Also, ensure food is cooked properly and avoid consuming untreated water."
            }
        },
        typhoid: {
            name: "Typhoid Fever",
            keywords: ["typhoid", "enteric fever"],
            info: {
                causes: "Typhoid fever is caused by the bacterium Salmonella Typhi. It is spread through contaminated food and water, and by close contact with an infected person.",
                symptoms: "It is characterized by a sustained high fever that can reach 104°F (40°C). Other symptoms include headache, weakness, stomach pain, and sometimes a rash of flat, rose-colored spots.",
                treatment: "Typhoid requires prompt treatment with antibiotics prescribed by a doctor. Without treatment, it can be fatal.",
                prevention: "Vaccination is available and recommended for people in high-risk areas. Always drink safe water, avoid raw food from street vendors, and practice good hand hygiene."
            }
        },
        giardiasis: {
            name: "Giardiasis",
            keywords: ["giardiasis", "giardia"],
            info: {
                causes: "This intestinal infection is caused by a microscopic parasite called Giardia lamblia. It is found in contaminated water, food, or soil and can be transmitted from person to person.",
                symptoms: "Symptoms can include watery diarrhea, gas, greasy stools that tend to float, stomach cramps, and dehydration. Some people have no symptoms.",
                treatment: "A doctor will prescribe specific anti-parasitic medications to treat Giardiasis.",
                prevention: "Avoid swallowing water from pools, lakes, or streams. Practice good hygiene, especially handwashing. Peel or wash raw fruits and vegetables before eating."
            }
        },
        crypto: {
            name: "Cryptosporidiosis",
            keywords: ["cryptosporidiosis", "crypto"],
            info: {
                causes: "Cryptosporidiosis is caused by the microscopic parasite Cryptosporidium. It is a common cause of waterborne disease and can be found in water, food, soil, or on surfaces contaminated with the feces of an infected human or animal.",
                symptoms: "The primary symptom is watery diarrhea. Other symptoms include stomach cramps, dehydration, nausea, vomiting, fever, and weight loss.",
                treatment: "Most people with a healthy immune system recover without treatment. The focus is on drinking plenty of fluids to prevent dehydration. A doctor may prescribe anti-diarrheal medicine.",
                prevention: "Good hygiene, including thorough handwashing, is key. Do not swallow water when swimming in public pools or natural bodies of water."
            }
        }
    };

    const handleSendMessage = async () => {
        if (!userMessage.trim()) return;

        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const newUserMessage = { id: Date.now(), text: userMessage, sender: 'user', timestamp };
        setMessages(prev => [...prev, newUserMessage]);

        const messageToSend = userMessage;
        setUserMessage(''); // Clear input immediately for better UX
        setIsTyping(true);

        try {
            // Call your backend's /api/chat endpoint
            const response = await fetch('https://jalbackend.onrender.com/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: messageToSend }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            const aiResponseText = data.reply; // Get the AI's reply

            // Add the AI's message to the chat
            const aiResponse = {
                id: Date.now() + 1,
                text: aiResponseText,
                sender: 'ai',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, aiResponse]);

        } catch (error) {
            console.error("Error fetching AI response:", error);
            // Display an error message in the chat if the call fails
            const errorResponse = {
                id: Date.now() + 1,
                text: "I'm having trouble connecting to my brain right now. Please try again in a moment.",
                sender: 'ai',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, errorResponse]);
        } finally {
            setIsTyping(false);
        }
    };

    useEffect(() => {
        if (mainChatRef.current) {
            mainChatRef.current.scrollTop = mainChatRef.current.scrollHeight;
        }
        if (widgetChatRef.current) {
            widgetChatRef.current.scrollTop = widgetChatRef.current.scrollHeight;
        }
    }, [messages]);

    const diseaseDatabase = {
        hepatitisA: { keywords: ["Fever", "Fatigue", "Nausea", "Jaundice", "Dark colored urine", "Abdominal Pain", "Vomiting"], },
        cholera: { keywords: ["Diarrhea", "Vomiting", "Dehydration", "Nausea"], },
        gastroenteritis: { keywords: ["Diarrhea", "Vomiting", "Nausea", "Abdominal Pain", "Fever", "Dehydration", "Headache"], },
        typhoid: { keywords: ["Fever", "Headache", "Fatigue", "Abdominal Pain", "Rose spots", "Diarrhea"], },
        giardiasis: { keywords: ["Diarrhea", "Fatigue", "Abdominal Pain", "Nausea", "Dehydration", "Bloating", "Weight loss"], },
        crypto: { keywords: ["Diarrhea", "Dehydration", "Weight loss", "Abdominal Pain", "Fever", "Nausea", "Vomiting"], }
    };

    const runAIAnalysis = (selectedSymptoms) => {
        const translatedSymptomsList = t('symptomsList');
        const englishSelectedSymptoms = selectedSymptoms.map(symptom => {
            const index = translatedSymptomsList.indexOf(symptom);
            return translations['en'].symptomsList[index];
        });
        let scores = [];
        for (const diseaseKey in diseaseDatabase) {
            const disease = diseaseDatabase[diseaseKey];
            const matchingSymptoms = disease.keywords.filter(keyword => englishSelectedSymptoms.includes(keyword));
            if (matchingSymptoms.length > 0) {
                const score = Math.round((matchingSymptoms.length / disease.keywords.length) * 100);
                if (score > 20) {
                    scores.push({
                        ...t(`diseases.${diseaseKey}`),
                        probability: score,
                    });
                }
            }
        }
        scores.sort((a, b) => b.probability - a.probability);
        return scores.length > 0 ? scores.slice(0, 3) : [];
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (formData.symptoms.length === 0) {
            alert('Please select at least one symptom for analysis.');
            return;
        }
        setIsAnalyzing(true);
        setAnalysisResult(null);
        setTimeout(() => {
            const results = runAIAnalysis(formData.symptoms);
            setAnalysisResult(results);
            setIsAnalyzing(false);
        }, 2500);
    };

    const handleWaterFormSubmit = async (e) => {
        e.preventDefault();
        setIsWaterAnalyzing(true);
        setWaterAnalysisResult(null);
        setWaterAnalysisError(null);
        const API_URL = 'https://karan0301-sih.hf.space/predict'; // Your ML Model API

        const submissionData = {
            contaminant: parseFloat(waterFormData.contaminantLevel) || 0,
            ph: parseFloat(waterFormData.ph) || 0,
            turbidity: parseFloat(waterFormData.turbidity) || 0,
            temperature: parseFloat(waterFormData.temperature) || 0,
            water_source: waterFormData.water_source_type || 'River',
            uv_sensor: (waterFormData.uv_sensor || 'Green').toLowerCase(),
            guva_sensor: parseFloat(waterFormData.guva_sensor) || 0
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submissionData),
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || `HTTP error! Status: ${response.status}`);
            }
            const result = await response.json();
            console.log("API Response:", result);

            // Normalize Result because APIs are inconsistent
            const normalizedResult = {
                ...result,
                risk_level: result.risk_level || result.prediction || result.label || result.result || "Unknown",
                confidence: result.confidence || result.score || result.probability || 0
            };

            setWaterAnalysisResult(normalizedResult);

            // Temporary: Show raw result in UI for debugging if needed
            // setFetchMessage(`Debug: ${JSON.stringify(result)}`); 
            // Better: Just clear error
            setWaterAnalysisError(null);

        } catch (error) {
            console.error("API call failed:", error);
            setWaterAnalysisError(`Failed to get analysis. ${error.message}`);
        } finally {
            setIsWaterAnalyzing(false);
        }
    };

    const handleFetchFromDevice = async () => {
        setIsFetching(true);
        setFetchMessage(''); // Clear any previous message

        const dataRef = ref(sensorDB, 'waterData');

        try {
            const snapshot = await get(dataRef);
            if (snapshot.exists()) {
                const sensorValues = snapshot.val();
                console.log("Fetched data:", sensorValues);

                setWaterFormData(prevData => ({
                    ...prevData,
                    ph: Number(sensorValues.ph).toFixed(2) ?? '',
                    turbidity: Number(sensorValues.turbidity).toFixed(2) ?? '',
                    temperature: Number(sensorValues.temperature).toFixed(2) ?? '',
                    conductivity: Number(sensorValues.conductivity).toFixed(2) ?? '',
                    contaminantLevel: Number(sensorValues.tds).toFixed(2) ?? '', // Map 'tds' from Firebase
                    uv_sensor: sensorValues.color ?? 'Green',                   // Map 'color' from Firebase
                    guva_sensor: Number(sensorValues.uv).toFixed(2) ?? ''
                }));

                // Set a success message instead of an alert
                setFetchMessage('Successfully fetched the latest sensor data!');
            } else {
                // Set an error message
                setFetchMessage('Could not find any sensor data in the database.');
            }
        } catch (error) {
            console.error("Error fetching data from Firebase:", error);
            // Set an error message
            setFetchMessage('An error occurred while fetching data.');
        } finally {
            setIsFetching(false);
        }
    };


    const handleWaterInputChange = (e) => {
        const { name, value } = e.target;
        setWaterFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSymptomChange = (symptom) => {
        setFormData(prev => {
            const symptoms = prev.symptoms.includes(symptom)
                ? prev.symptoms.filter(s => s !== symptom)
                : [...prev.symptoms, symptom];
            return { ...prev, symptoms };
        });
    };

    const toggleChat = () => setChatOpen(!chatOpen);
    const toggleDarkMode = () => setDarkMode(!darkMode);
    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    useEffect(() => {
        if (darkMode) {
            document.body.classList.add('bg-dark', 'text-light');
        } else {
            document.body.classList.remove('bg-dark', 'text-light');
        }
    }, [darkMode]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sidebarOpen && !event.target.closest('.sidebar') && !event.target.closest('.hamburger-btn')) {
                setSidebarOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [sidebarOpen]);

    const diseaseOutbreaks = [
        { id: 1, name: 'Diarrhea Outbreak', state: 'Uttar Pradesh', cases: 95000, rate: 25.5, severity: 'critical', position: [26.8467, 80.9462], healthContact: "104", nearbyHospitals: 25, latestNews: "Govt. launches new initiative for clean drinking water in rural UP." },
        { id: 2, name: 'Cholera Outbreak', state: 'West Bengal', cases: 88000, rate: 22.1, severity: 'high', position: [22.5726, 88.3639], healthContact: "108", nearbyHospitals: 18, latestNews: "Health department issues high alert following monsoon flooding in Kolkata." },
        { id: 3, name: 'Typhoid Outbreak', state: 'Maharashtra', cases: 75000, rate: 20.8, severity: 'medium', position: [19.0760, 72.8777], healthContact: "102", nearbyHospitals: 14, latestNews: "Vaccination drive for Typhoid begins in Mumbai and surrounding areas." },
        { id: 4, name: 'Hepatitis Outbreak', state: 'Bihar', cases: 62000, rate: 18.2, severity: 'low', position: [25.0961, 85.3131], healthContact: "103", nearbyHospitals: 10, latestNews: "Awareness campaigns about contaminated water sources are underway." },
        { id: 5, name: 'Gastroenteritis', state: 'Gujarat', cases: 55000, rate: 16.5, severity: 'medium', position: [23.0225, 72.5714], healthContact: "108", nearbyHospitals: 12, latestNews: "Mobile medical units dispatched to rural districts of Gujarat." },
        { id: 6, name: 'Typhoid Fever', state: 'Punjab', cases: 48000, rate: 15.3, severity: 'low', position: [30.7333, 76.7794], healthContact: "101", nearbyHospitals: 9, latestNews: "Community health camps are being organized in key villages." },
    ];

    const communityEvents = [
        { id: 1, title: 'Online Health Webinar', type: 'online', platform: 'Zoom', date: 'October 20, 2025', time: '3:00 PM - 5:00 PM', description: 'Join our health education initiatives and community events across India to learn about water safety and disease prevention.', attendees: 250, status: 'upcoming' },
        { id: 2, title: 'Rural Health Camp', type: 'offline', venue: 'Tura Community Center, Meghalaya', date: 'November 5, 2025', time: '9:00 AM - 3:00 PM', description: 'Free health checkups and water quality testing.', attendees: 85, status: 'upcoming' },
        { id: 3, title: 'Water Quality Workshop', type: 'online', platform: 'Microsoft Teams', date: 'November 15, 2025', time: '11:00 AM - 1:00 PM', description: 'Virtual training session on water purification.', attendees: 180, status: 'upcoming' },
        { id: 4, title: 'Village Health Screening', type: 'offline', venue: 'Kohima School Complex, Nagaland', date: 'December 2, 2025', time: '8:00 AM - 2:00 PM', description: 'Special health camp focusing on pediatric waterborne diseases.', attendees: 200, status: 'upcoming' },
        { id: 5, title: 'Water Safety Training', type: 'offline', venue: 'Public Hall, Patna, Bihar', date: 'December 15, 2025', time: '10:00 AM - 1:00 PM', description: 'Hands-on training for community leaders on water safety.', attendees: 120, status: 'upcoming' },
        { id: 6, title: 'AI for Public Health Seminar', type: 'online', platform: 'Google Meet', date: 'January 10, 2026', time: '2:00 PM - 4:00 PM', description: 'Discussing the future of AI in public health.', attendees: 300, status: 'upcoming' },
    ];

    const allIndiaStats = [
        { state: 'UP', cases: 95000, rate: 25.5 },
        { state: 'WB', cases: 88000, rate: 22.1 },
        { state: 'MH', cases: 75000, rate: 20.8 },
        { state: 'BR', cases: 62000, rate: 18.2 },
        { state: 'GJ', cases: 55000, rate: 16.5 },
    ];

    const diseaseTrends = [
        { month: 'Jan', diarrhea: 12000, cholera: 8500, typhoid: 6500, hepatitis: 4500 },
        { month: 'Feb', diarrhea: 15000, cholera: 9500, typhoid: 7500, hepatitis: 5500 },
        { month: 'Mar', diarrhea: 20000, cholera: 12000, typhoid: 10000, hepatitis: 7000 },
        { month: 'Apr', diarrhea: 28000, cholera: 18000, typhoid: 15000, hepatitis: 11000 },
        { month: 'May', diarrhea: 35000, cholera: 22000, typhoid: 18000, hepatitis: 14000 },
        { month: 'Jun', diarrhea: 42000, cholera: 28000, typhoid: 22000, hepatitis: 18000 },
        { month: 'Jul', diarrhea: 50000, cholera: 35000, typhoid: 28000, hepatitis: 23000 },
        { month: 'Aug', diarrhea: 48000, cholera: 32000, typhoid: 26000, hepatitis: 21000 },
        { month: 'Sep', diarrhea: 40000, cholera: 28000, typhoid: 22000, hepatitis: 18000 },
        { month: 'Oct', diarrhea: 32000, cholera: 22000, typhoid: 18000, hepatitis: 15000 },
        { month: 'Nov', diarrhea: 20000, cholera: 15000, typhoid: 12000, hepatitis: 9000 },
        { month: 'Dec', diarrhea: 15000, cholera: 10000, typhoid: 8000, hepatitis: 6000 }
    ];

    const teamMembers = [
        { name: "Abhimanyu" }, { name: "Siddharth" }, { name: "Rudra" },
    ];

    return (
        <div className="jr-app-wrapper" style={{ background: 'radial-gradient(circle at 50% 0%, #1e293b 0%, #0b1120 100%)', minHeight: '100vh', color: '#ffffff' }}>
            <header className="shadow sticky-top" style={{ background: 'rgba(11, 17, 32, 0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="container-fluid">
                    <div className="d-flex justify-content-between align-items-center py-3">
                        <div className="d-flex align-items-center">
                            <button
                                className="hamburger-btn btn me-3"
                                onClick={toggleSidebar}
                                aria-label={sidebarOpen ? "Close sidebar menu" : "Open sidebar menu"}
                                style={{ color: darkMode ? 'white' : 'black' }}
                            >
                                {sidebarOpen ? <FaTimes size={20} aria-hidden="true" /> : <FaBars size={20} aria-hidden="true" />}
                            </button>
                            <div className="me-2" style={{ width: '40px', height: '40px', background: 'linear-gradient(to right, #0D6EFD, #198754)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg className="text-white" width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </div>
                            <h1 className="h4 fw-bold mb-0">JAL-RAKSHAK</h1>
                        </div>

                        <div className="d-flex align-items-center">
                            <span className="text-white me-3 d-none d-md-block">Welcome, <span className="fw-bold text-info">{userName || 'User'}</span></span>
                            <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white fw-bold" style={{ width: '40px', height: '40px', fontSize: '1.2rem' }}>
                                {userName ? userName.charAt(0).toUpperCase() : 'U'}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="d-flex">
                <aside
                    className="sidebar shadow position-fixed"
                    style={{
                        width: '280px',
                        height: '100vh',
                        top: '0',
                        left: sidebarOpen ? '0' : '-280px',
                        background: 'linear-gradient(180deg, #011C40 0%, #023859 100%)', // LUNA Gradient
                        borderRight: '1px solid rgba(167, 235, 242, 0.1)',
                        transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        zIndex: 1000,
                        paddingTop: '20px',
                        color: 'white',
                        backdropFilter: 'blur(10px)'
                    }}
                >
                    <div className="p-4 border-bottom border-secondary mb-3">
                        <div className="d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center">
                                <div className="me-3 jr-icon-wrapper" style={{ boxShadow: '0 0 15px rgba(84, 172, 191, 0.3)' }}>
                                    <svg className="text-cyan" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </div>
                                <h2 className="h5 fw-bold mb-0 text-white" style={{ letterSpacing: '0.05em' }}>JAL-RAKSHAK</h2>
                            </div>
                            <button onClick={() => setSidebarOpen(false)} className="btn btn-sm btn-link text-white-50 p-0">
                                <FaTimes size={18} />
                            </button>
                        </div>
                    </div>
                    <nav className="px-3">
                        <ul className="list-unstyled d-flex flex-column gap-2">
                            <li>
                                <button
                                    onClick={() => { setActiveTab('home'); setSidebarOpen(false); }}
                                    className={`sidebar-link ${activeTab === 'home' ? 'active' : ''}`}
                                >
                                    <div className="sidebar-icon"><FaHome /></div> {t('home')}
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => { setActiveTab('waterData'); setSidebarOpen(false); }}
                                    className={`sidebar-link ${activeTab === 'waterData' ? 'active' : ''}`}
                                >
                                    <div className="sidebar-icon"><FaDatabase /></div> {t('submitWaterData')}
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => { setActiveTab('prediction'); setSidebarOpen(false); }}
                                    className={`sidebar-link ${activeTab === 'prediction' ? 'active' : ''}`}
                                >
                                    <div className="sidebar-icon"><FaStethoscope /></div> {t('diseasePrediction')}
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => { setActiveTab('community'); setSidebarOpen(false); }}
                                    className={`sidebar-link ${activeTab === 'community' ? 'active' : ''}`}
                                >
                                    <div className="sidebar-icon"><FaUsers /></div> {t('community')}
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => { setActiveTab('chat'); setSidebarOpen(false); }}
                                    className={`sidebar-link ${activeTab === 'chat' ? 'active' : ''}`}
                                >
                                    <div className="sidebar-icon"><FaRobot /></div> {t('aiAssistant')}
                                </button>
                            </li>

                            {/* Devices Dropdown */}
                            <li>
                                <button
                                    onClick={() => setShowDeviceDropdown(!showDeviceDropdown)}
                                    className={`sidebar-link d-flex justify-content-between align-items-center w-100 ${activeTab === 'devices' ? 'active' : ''}`}
                                >
                                    <div className="d-flex align-items-center">
                                        <div className="sidebar-icon"><FaMicrochip /></div> {t('devices')}
                                    </div>
                                    <FaChevronDown style={{ transform: showDeviceDropdown ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s' }} size={12} />
                                </button>
                                <AnimatePresence>
                                    {showDeviceDropdown && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <ul className="list-unstyled ps-4 py-2" style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', marginLeft: '24px' }}>
                                                {devices.map(device => (
                                                    <li key={device.id} className="mb-2">
                                                        <button
                                                            onClick={() => { setSelectedDevice(device); }}
                                                            className="btn btn-sm text-start w-100 d-flex align-items-center"
                                                            style={{
                                                                color: selectedDevice?.id === device.id ? '#10b981' : '#cbd5e1', // Green if selected
                                                                fontWeight: selectedDevice?.id === device.id ? 'bold' : 'normal'
                                                            }}
                                                        >
                                                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: selectedDevice?.id === device.id ? '#10b981' : 'rgba(255,255,255,0.2)', marginRight: '10px' }}></div>
                                                            {device.device_name}
                                                        </button>
                                                    </li>
                                                ))}
                                                <li>
                                                    <button
                                                        onClick={() => setShowAddDeviceModal(true)}
                                                        className="btn btn-sm text-info text-start w-100 mt-1"
                                                    >
                                                        {t('addDevice')}
                                                    </button>
                                                </li>
                                            </ul>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </li>

                            <li>
                                <button
                                    onClick={() => { setActiveTab('about'); setSidebarOpen(false); }}
                                    className={`sidebar-link ${activeTab === 'about' ? 'active' : ''}`}
                                >
                                    <div className="sidebar-icon"><FaInfoCircle /></div> {t('about')}
                                </button>
                            </li>

                            <li className="mt-4 pt-3 border-top border-secondary">
                                <small className="text-uppercase text-muted fw-bold mb-3 d-block px-2" style={{ fontSize: '0.7rem', letterSpacing: '0.1em' }}>{t('language')}</small>
                                <div className="d-grid gap-2 px-2">
                                    <div className="row g-2">
                                        {['en', 'hi', 'as', 'bn'].map(lang => (
                                            <div className="col-6" key={lang}>
                                                <button
                                                    onClick={() => setLanguage(lang)}
                                                    className={`btn btn-sm w-100 ${language === lang ? 'btn-info text-dark fw-bold' : 'btn-outline-secondary text-light'}`}
                                                    style={{ borderRadius: '8px', fontSize: '0.8rem', borderColor: language === lang ? 'transparent' : 'rgba(255,255,255,0.1)' }}
                                                >
                                                    {t(lang === 'en' ? 'english' : lang === 'hi' ? 'hindi' : lang === 'as' ? 'assamese' : 'bengali')}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </nav>
                </aside>

                <main
                    style={{
                        marginLeft: sidebarOpen ? '280px' : '0',
                        padding: '24px',
                        width: '100%',
                        transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        background: 'transparent'
                    }}
                >
                    {activeTab === 'home' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div className="jr-hero-container mb-4 d-flex flex-column justify-content-center text-center p-5" style={{ minHeight: '300px' }}>
                                <div style={{ zIndex: 2 }}>
                                    <div className="jr-hero-sub-badge">{t('heroTitleBadge')}</div>
                                    <h1 className="jr-hero-title">{t('heroTitleMain')}</h1>
                                    <p className="jr-hero-subtitle">Real-time Surveillance and Response System for Water-Borne Diseases</p>

                                    <div className="d-flex justify-content-center gap-3 mt-4 flex-wrap">
                                        <span className="jr-hero-pill">{t('heroPill1')}</span>
                                        <span className="jr-hero-pill">{t('heroPill2')}</span>
                                        <span className="jr-hero-pill">{t('heroPill3')}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="row g-4 mb-4">
                                <div className="col-lg-6">
                                    <OutbreakMap
                                        outbreaks={diseaseOutbreaks}
                                        title={t('allIndiaMapTitle') || "All India Disease Outbreak Monitor"}
                                        mapId="india"
                                    />
                                </div>
                                <div className="col-lg-6">
                                    <OutbreakMap
                                        outbreaks={nearbyOutbreaks}
                                        devices={nearbyDevices}
                                        title={t('nearbyMapTitle') || "Nearby Disease Outbreak"}
                                        mapId="nearby"
                                    />
                                </div>
                            </div>

                            <div className="row mb-4">
                                <div className="col-lg-6 mb-3">
                                    <div className="jr-card">
                                        <div className="jr-card-header mb-0">
                                            <div className="jr-icon-wrapper"><FaDatabase /></div>
                                            <div>
                                                {t('statisticsTitle')}
                                                <div className="text-muted small fw-normal mt-1" style={{ fontSize: '0.75rem', letterSpacing: '0.02em' }}>
                                                    <FaInfoCircle className="me-1" size={10} /> {t('statisticsInfo')}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ width: "100%", minHeight: "400px" }}>
                                            <ResponsiveContainer width="100%" height={400}>
                                                <BarChart data={allIndiaStats} barSize={20} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                                    <defs>
                                                        <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9} />
                                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.4} />
                                                        </linearGradient>
                                                        <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.9} />
                                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.4} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                                    <XAxis dataKey="state" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                                                    <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                                                    <Tooltip content={<CustomChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                                                    <Legend verticalAlign="top" height={36} wrapperStyle={{ color: '#cbd5e1', fontSize: '12px' }} iconType="circle" />
                                                    <Bar dataKey="cases" fill="url(#colorCases)" name={t('cases')} radius={[4, 4, 0, 0]} />
                                                    <Bar dataKey="rate" fill="url(#colorRate)" name={`${t('rate')} per 1000`} radius={[4, 4, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-6 mb-3">
                                    <div className="jr-card">
                                        <div className="jr-card-header mb-0">
                                            <div className="jr-icon-wrapper"><FaMapMarkerAlt /></div>
                                            <div>
                                                {t('trendsTitle')}
                                                <div className="text-muted small fw-normal mt-1" style={{ fontSize: '0.75rem', letterSpacing: '0.02em' }}>
                                                    <FaInfoCircle className="me-1" size={10} /> {t('trendsInfo')}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ width: "100%", minHeight: "400px" }}>
                                            <ResponsiveContainer width="100%" height={400}>
                                                <AreaChart data={diseaseTrends} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                                    <defs>
                                                        <linearGradient id="colorDiarrhea" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                                        </linearGradient>
                                                        <linearGradient id="colorCholera" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                                        </linearGradient>
                                                        <linearGradient id="colorTyphoid" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                                    <XAxis dataKey="month" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                                                    <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                                                    <Tooltip content={<CustomChartTooltip />} />
                                                    <Legend verticalAlign="top" height={36} wrapperStyle={{ color: '#cbd5e1', fontSize: '12px' }} iconType="circle" />

                                                    <Area type="monotone" dataKey="diarrhea" stroke="#ef4444" strokeWidth={2} fill="url(#colorDiarrhea)" name="Diarrhea" activeDot={{ r: 6, strokeWidth: 0 }} />
                                                    <Area type="monotone" dataKey="cholera" stroke="#f59e0b" strokeWidth={2} fill="url(#colorCholera)" name="Cholera" activeDot={{ r: 6, strokeWidth: 0 }} />
                                                    <Area type="monotone" dataKey="typhoid" stroke="#3b82f6" strokeWidth={2} fill="url(#colorTyphoid)" name="Typhoid" activeDot={{ r: 6, strokeWidth: 0 }} />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="jr-card mb-4" style={{ overflow: 'hidden' }}>
                                <div className="jr-card-header">
                                    <div className="jr-icon-wrapper"><FaVideo /></div>
                                    {t('emergencyTitle')}
                                </div>
                                <div className="table-responsive">
                                    <table className="jr-table">
                                        <thead>
                                            <tr>
                                                <th scope="col">{t('disease')}</th>
                                                <th scope="col">{t('state')}</th>
                                                <th scope="col">{t('severity')}</th>
                                                <th scope="col">{t('responseTeam')}</th>
                                                <th scope="col">{t('lastUpdate')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {diseaseOutbreaks.slice(0, 4).map((outbreak) => (
                                                <tr key={outbreak.id}>
                                                    <td className="fw-semibold text-white">{outbreak.name}</td>
                                                    <td className="text-white-50">{outbreak.state}</td>
                                                    <td>
                                                        <span className={`jr-badge-cell ${outbreak.severity === 'critical' ? 'jr-badge-critical' : outbreak.severity === 'high' ? 'jr-badge-high' : 'jr-badge-medium'}`}>
                                                            {outbreak.severity.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="text-cyan"><span className="d-flex align-items-center gap-2"><div style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }}></div> Deployed</span></td>
                                                    <td className="text-muted small">2 hours ago</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </motion.div>
                    )}
                    {
                        activeTab === 'waterData' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="container-fluid p-4">
                                <h2 className="fs-3 fw-bold mb-1 text-white">{t('waterFormTitle')}</h2>
                                <p className="text-muted mb-4 small">
                                    {t('waterFormSubtitle')}
                                </p>

                                <form onSubmit={handleWaterFormSubmit}>
                                    <div className="row g-4">
                                        {/* --- COLUMN 1 --- */}
                                        <div className="col-lg-4">
                                            <div className="d-flex flex-column gap-4">
                                                {/* Basic Water Info */}
                                                <div className="jr-card">
                                                    <div className="jr-card-header">
                                                        <div className="jr-icon-wrapper"><i className="bi bi-droplet-fill"></i></div>
                                                        {t('basicWaterInfo')}
                                                    </div>
                                                    <label className="jr-label">{t('waterSourceType')}</label>
                                                    <CustomDropdown
                                                        name="water_source_type"
                                                        value={waterFormData.water_source_type}
                                                        onChange={handleWaterInputChange}
                                                        options={['River', 'Well', 'Lake', 'Pond', 'Tap Water', 'Borewell', 'Rainwater']}
                                                        placeholder={t('selectSource')}
                                                    />
                                                </div>

                                                {/* Physical Parameters */}
                                                <div className="jr-card">
                                                    <div className="jr-card-header">
                                                        <div className="jr-icon-wrapper"><i className="bi bi-thermometer-half"></i></div>
                                                        {t('physicalParams')}
                                                    </div>

                                                    <SafetyScale
                                                        label="PH Level"
                                                        name="ph"
                                                        value={waterFormData.ph}
                                                        min={0} max={14}
                                                        trackType="ph"
                                                        unit=""
                                                        onChange={handleWaterInputChange}
                                                    />

                                                    <SafetyScale
                                                        label="Contaminant Level (ppm)"
                                                        name="contaminantLevel"
                                                        value={waterFormData.contaminantLevel}
                                                        min={0} max={1000}
                                                        unit="ppm"
                                                        onChange={handleWaterInputChange}
                                                    />
                                                </div>

                                                {/* Sensor Readings Part 1 */}
                                                <div className="jr-card">
                                                    <div className="jr-card-header">
                                                        <div className="jr-icon-wrapper"><i className="bi bi-cpu"></i></div>
                                                        {t('sensorReadings')}
                                                    </div>
                                                    <label className="jr-label">{t('rgbSensor')}</label>
                                                    <CustomDropdown
                                                        name="uv_sensor"
                                                        value={waterFormData.uv_sensor}
                                                        onChange={handleWaterInputChange}
                                                        options={['Blue', 'Green', 'Red']}
                                                        placeholder={t('selectColor')}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* --- COLUMN 2 --- */}
                                        <div className="col-lg-4">
                                            <div className="d-flex flex-column gap-4">
                                                {/* Chemical Parameters */}
                                                <div className="jr-card">
                                                    <div className="jr-card-header">
                                                        <div className="jr-icon-wrapper"><i className="bi bi-flask"></i></div>
                                                        {t('chemicalParams')}
                                                    </div>

                                                    <SafetyScale
                                                        label="Turbidity (NTU)"
                                                        name="turbidity"
                                                        value={waterFormData.turbidity}
                                                        min={0} max={10}
                                                        unit="NTU"
                                                        onChange={handleWaterInputChange}
                                                    />

                                                    <SafetyScale
                                                        label="Temp Level (°C)"
                                                        name="temperature"
                                                        value={waterFormData.temperature}
                                                        min={0} max={50}
                                                        unit="°C"
                                                        onChange={handleWaterInputChange}
                                                    />
                                                </div>

                                                {/* Sensor Readings Part 2 */}
                                                <div className="jr-card">
                                                    <div className="jr-card-header">
                                                        <div className="jr-icon-wrapper"><i className="bi bi-sun"></i></div>
                                                        {t('sensorReadings')}
                                                    </div>

                                                    <SafetyScale
                                                        label="UV Sensor"
                                                        name="guva_sensor"
                                                        value={waterFormData.guva_sensor}
                                                        min={0} max={15}
                                                        unit="Index"
                                                        onChange={handleWaterInputChange}
                                                    />

                                                    <SafetyScale
                                                        label={`${t('conductivity')} (µS/cm)`}
                                                        name="conductivity"
                                                        value={waterFormData.conductivity}
                                                        min={0} max={1000}
                                                        unit="µS/cm"
                                                        onChange={handleWaterInputChange}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* --- COLUMN 3: PREDICTION --- */}
                                        <div className="col-lg-4">
                                            <div className="d-flex flex-column gap-3 h-100">
                                                <h3 className="h5 text-white mb-0">{t('initialPrediction')}</h3>

                                                <div className="jr-card d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                                                    <PredictionGauge
                                                        isAnalyzing={isWaterAnalyzing}
                                                        prediction={waterAnalysisResult?.risk_level}
                                                        confidence={waterAnalysisResult?.confidence}
                                                    />
                                                </div>

                                                <button type="submit" className="jr-btn-submit" disabled={isWaterAnalyzing}>
                                                    {isWaterAnalyzing ? 'Analyzing...' : t('submitButton')}
                                                </button>

                                                <button
                                                    type="button"
                                                    className="jr-btn-fetch"
                                                    onClick={handleFetchFromDevice}
                                                    disabled={isFetching}
                                                >
                                                    {isFetching ? t('fetching') : t('fetchFromDevice')}
                                                </button>
                                                {fetchMessage && (
                                                    <div className="text-center small mt-2 text-info">{fetchMessage}</div>
                                                )}
                                                {waterAnalysisError && (
                                                    <div className="text-center small mt-2 text-danger bg-danger bg-opacity-10 p-2 rounded">{waterAnalysisError}</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </motion.div>
                        )
                    }

                    {
                        activeTab === 'prediction' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <div className="jr-card" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                                    <h2 className="card-title h3 fw-bold mb-4">{t('predictionTitle')}</h2>
                                    <p className="mb-4 text-muted">{t('predictionSubtitle')}</p>
                                    <div className="row">
                                        <div className="col-lg-6">
                                            <h3 className="h5 fw-bold mb-3">{t('patientInfo')}</h3>
                                            <form onSubmit={handleFormSubmit}>
                                                <div className="mb-3">
                                                    <label className="jr-label">{t('fullName')}</label>
                                                    <input
                                                        type="text"
                                                        className="jr-input w-100"
                                                        name="name"
                                                        value={formData.name}
                                                        onChange={handleInputChange}
                                                        placeholder={t('fullName')}
                                                        style={{ height: '45px' }}
                                                    />
                                                </div>
                                                <div className="row">
                                                    <div className="col-md-6 mb-3">
                                                        <label className="jr-label">{t('age')}</label>
                                                        <input
                                                            type="number"
                                                            className="jr-input w-100"
                                                            name="age"
                                                            value={formData.age}
                                                            onChange={handleInputChange}
                                                            placeholder={t('age')}
                                                            style={{ height: '45px' }}
                                                        />
                                                    </div>
                                                    <div className="col-md-6 mb-3">
                                                        <label className="jr-label">{t('gender')}</label>
                                                        <CustomDropdown
                                                            name="gender"
                                                            value={formData.gender}
                                                            onChange={handleInputChange}
                                                            placeholder={t('gender')}
                                                            options={[
                                                                { value: 'male', label: t('genderOptions').male },
                                                                { value: 'female', label: t('genderOptions').female },
                                                                { value: 'other', label: t('genderOptions').other }
                                                            ]}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="mb-3">
                                                    <label className="jr-label">{t('location')}</label>
                                                    <input
                                                        type="text"
                                                        className="jr-input w-100"
                                                        name="location"
                                                        value={formData.location}
                                                        onChange={handleInputChange}
                                                        placeholder={t('location')}
                                                        style={{ height: '45px' }}
                                                    />
                                                </div>
                                                <div className="mb-3">
                                                    <label className="jr-label">{t('symptoms')}</label>
                                                    <div className="p-3" style={{ maxHeight: '300px', overflowY: 'auto', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                        <div className="row">
                                                            {t('symptomsList').map((symptom, index) => (
                                                                <div key={index} className="col-md-6 mb-2">
                                                                    <div className="form-check">
                                                                        <input
                                                                            className="form-check-input"
                                                                            type="checkbox"
                                                                            checked={formData.symptoms.includes(symptom)}
                                                                            onChange={() => handleSymptomChange(symptom)}
                                                                            id={`symptom-${index}`}
                                                                            style={{ backgroundColor: formData.symptoms.includes(symptom) ? '#3b82f6' : 'transparent', borderColor: '#475569' }}
                                                                        />
                                                                        <label className="form-check-label text-white small" htmlFor={`symptom-${index}`}>
                                                                            {symptom}
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <button type="submit" className="jr-btn-submit mt-3" disabled={isAnalyzing}>
                                                    {isAnalyzing ? t('analyzingPlaceholder') : t('submitButton')}
                                                </button>
                                            </form>
                                        </div>
                                        <div className="col-lg-6 mt-4 mt-lg-0">
                                            <h3 className="h5 fw-bold mb-3">{t('analysisTitle')}</h3>
                                            <div className="jr-card d-flex flex-column justify-content-center align-items-center text-center p-4" style={{ minHeight: '400px', border: '1px dashed rgba(255,255,255,0.2)', background: 'transparent' }}>
                                                {analysisResult ? (
                                                    <div className="w-100">
                                                        {analysisResult.length === 0 ? (
                                                            <div>
                                                                <FaInfoCircle className="text-warning mb-3" size={40} />
                                                                <h4 className="h6 fw-bold">{t('noDiseaseDetectedTitle')}</h4>
                                                                <p className="small text-muted">{t('noDiseaseDetectedDescription')}</p>
                                                            </div>
                                                        ) : (
                                                            <div className="d-flex flex-column gap-3">
                                                                {analysisResult.map((result, idx) => (
                                                                    <div key={idx} className="p-3 rounded text-start" style={{ background: 'rgba(59, 130, 246, 0.1)', borderLeft: '4px solid #3b82f6' }}>
                                                                        <div className="d-flex justify-content-between mb-1">
                                                                            <strong className="text-white">{result.name}</strong>
                                                                            <span className="badge bg-primary">{result.probability}% Match</span>
                                                                        </div>
                                                                        <p className="small text-muted mb-2">{result.description}</p>
                                                                        <div className="small">
                                                                            <strong className="text-white-50">Remedies:</strong>
                                                                            <ul className="mb-0 ps-3">
                                                                                {result.remedies.map((remedy, rIdx) => (
                                                                                    <li key={rIdx} className="text-muted">{remedy}</li>
                                                                                ))}
                                                                            </ul>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <>
                                                        <FaRobot className="text-muted mb-3" size={48} style={{ opacity: 0.3 }} />
                                                        <p className="text-muted">{isAnalyzing ? t('analyzingPlaceholder') : t('analysisPlaceholder')}</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    }

                    {

                        activeTab === 'community' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <div className="jr-card" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                                    <div className="jr-card-header mb-0">
                                        <div className="jr-icon-wrapper"><FaUsers /></div>
                                        {t('communityTitle')}
                                    </div>
                                    <p className="mb-4 text-muted ps-3">{t('communitySubtitle')}</p>

                                    <div className="row p-3">
                                        <div className="col-lg-8">
                                            <h3 className="h5 fw-bold mb-3 text-white">{t('eventsTitle')}</h3>
                                            <div className="row row-cols-1 row-cols-md-2 g-4">
                                                {communityEvents.map(event => (
                                                    <div key={event.id} className="col">
                                                        <motion.div whileHover={{ scale: 1.03 }} className="jr-card h-100 p-0" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                                            <div className="p-3 d-flex flex-column h-100">
                                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                                    <div className="d-flex align-items-center">
                                                                        {event.type === 'online' ? (
                                                                            <FaVideo size={20} className="text-primary me-2" />
                                                                        ) : (
                                                                            <FaMapMarkerAlt size={20} className="text-info me-2" />
                                                                        )}
                                                                        <div>
                                                                            <h4 className="h6 fw-bold mb-0 text-white">{event.title}</h4>
                                                                            <p className="small mb-0 text-muted">{event.type === 'online' ? event.platform : event.venue}</p>
                                                                        </div>
                                                                    </div>
                                                                    <span className="jr-badge jr-badge-safe">{t('upcoming')}</span>
                                                                </div>
                                                                <p className="mb-2 small flex-grow-1 text-white-50">{event.description}</p>
                                                                <div className="d-flex justify-content-between align-items-center mt-auto pt-2 border-top border-secondary">
                                                                    <small className="text-muted">{event.date}</small>
                                                                    <button className="jr-btn-fetch py-1 px-3" style={{ fontSize: '0.8rem' }}>{t('registerNow')}</button>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="col-lg-4 mt-4 mt-lg-0">
                                            <h3 className="h5 fw-bold mb-3 text-white">{t('programHighlights')}</h3>
                                            <div className="d-flex flex-column gap-3">
                                                <motion.div whileHover={{ scale: 1.02 }} className="jr-card p-3 d-flex align-items-center text-center">
                                                    <div className="jr-icon-wrapper mb-2"><FaVideo /></div>
                                                    <h5 className="h6 fw-bold text-white">{t('onlinePrograms')}</h5>
                                                    <p className="small mb-0 text-muted">Webinars and virtual workshops</p>
                                                </motion.div>
                                                <motion.div whileHover={{ scale: 1.02 }} className="jr-card p-3 d-flex align-items-center text-center">
                                                    <div className="jr-icon-wrapper mb-2"><FaUsers /></div>
                                                    <h5 className="h6 fw-bold text-white">{t('offlineEvents')}</h5>
                                                    <p className="small mb-0 text-muted">Health camps and field visits</p>
                                                </motion.div>
                                                <motion.div whileHover={{ scale: 1.02 }} className="jr-card p-3 d-flex align-items-center text-center">
                                                    <div className="jr-icon-wrapper mb-2"><FaFlask /></div>
                                                    <h5 className="h6 fw-bold text-white">{t('waterTesting')}</h5>
                                                    <p className="small mb-0 text-muted">Quality assessment and purification</p>
                                                </motion.div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    }

                    {
                        activeTab === 'chat' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-100">
                                <div className="jr-chat-page-container">
                                    {/* Main Chat Area */}
                                    <div className="jr-chat-main-area">
                                        {/* Header */}
                                        <div className="jr-chat-header px-4 py-3">


                                            <div className="d-flex align-items-center gap-3">
                                                <div className="jr-icon-wrapper" style={{ width: 48, height: 48 }}><FaRobot size={24} /></div>
                                                <div>
                                                    <h2 className="h5 fw-bold text-white mb-0">{t('chatTitle')}</h2>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <span className="bg-success rounded-circle" style={{ width: 8, height: 8 }}></span>
                                                        <span className="text-white-50 small">Online • Jal-Rakshak AI</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Messages */}
                                        <div className="jr-chat-main-body" ref={mainChatRef}>
                                            {messages.map((msg) => (
                                                <div key={msg.id} className={`d-flex mb-4 ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                                                    {msg.sender === 'ai' && (
                                                        <div className="me-3 d-flex align-items-end mb-1">
                                                            <div className="jr-icon-wrapper" style={{ width: 36, height: 36 }}><FaRobot size={16} /></div>
                                                        </div>
                                                    )}
                                                    <div className={msg.sender === 'user' ? 'jr-chat-bubble-user' : 'jr-chat-bubble-ai'}>
                                                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                                                        <div className={`mt-2 small opacity-50 ${msg.sender === 'user' ? 'text-end' : 'text-start'}`}>
                                                            {msg.timestamp}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {isTyping && (
                                                <div className="d-flex justify-content-start mb-4">
                                                    <div className="me-3 d-flex align-items-end mb-1">
                                                        <div className="jr-icon-wrapper" style={{ width: 36, height: 36 }}><FaRobot size={16} /></div>
                                                    </div>
                                                    <div className="jr-chat-bubble-ai">
                                                        <div className="d-flex gap-1 py-1">
                                                            <div className="jr-typing-dot"></div>
                                                            <div className="jr-typing-dot"></div>
                                                            <div className="jr-typing-dot"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Input Area */}
                                        <div className="jr-chat-fullscreen-input">
                                            <div className="jr-chat-input-group">
                                                <input
                                                    type="text"
                                                    value={userMessage}
                                                    onChange={(e) => setUserMessage(e.target.value)}
                                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                                    placeholder={t('chatPlaceholder')}
                                                    className="jr-chat-input"
                                                    autoFocus
                                                />
                                                <button
                                                    onClick={handleSendMessage}
                                                    disabled={!userMessage.trim()}
                                                    className="jr-chat-send"
                                                >
                                                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                                        <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sidebar Info Panels */}
                                    <div className="jr-chat-sidebar d-none d-lg-flex">
                                        <div className="jr-info-card">
                                            <h4 className="h6 fw-bold text-white mb-3 d-flex align-items-center gap-2">
                                                <FaInfoCircle className="text-cyan" /> {t('quickHelp')}
                                            </h4>
                                            <div className="d-flex flex-column gap-2">
                                                <button onClick={() => setUserMessage(t('diseaseSymptoms'))} className="btn btn-sm btn-outline-light text-start border-0 bg-white bg-opacity-10 hover-bg-opacity-20 rounded-pill px-3">
                                                    🤒 {t('diseaseSymptoms')}
                                                </button>
                                                <button onClick={() => setUserMessage(t('preventionTips'))} className="btn btn-sm btn-outline-light text-start border-0 bg-white bg-opacity-10 hover-bg-opacity-20 rounded-pill px-3">
                                                    🛡️ {t('preventionTips')}
                                                </button>
                                                <button onClick={() => setUserMessage(t('waterTesting2'))} className="btn btn-sm btn-outline-light text-start border-0 bg-white bg-opacity-10 hover-bg-opacity-20 rounded-pill px-3">
                                                    🧪 {t('waterTesting2')}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="jr-info-card">
                                            <h4 className="h6 fw-bold text-white mb-3">{t('chatFeatures')}</h4>
                                            <ul className="list-unstyled small text-muted mb-0 d-flex flex-column gap-2">
                                                <li className="d-flex gap-2"><span className="text-success">✔</span> 24/7 AI Health Support</li>
                                                <li className="d-flex gap-2"><span className="text-success">✔</span> Multi-language Support</li>
                                                <li className="d-flex gap-2"><span className="text-success">✔</span> Symptom Analysis</li>
                                            </ul>
                                        </div>

                                        <div className="jr-info-card mt-auto" style={{ background: 'linear-gradient(135deg, rgba(1, 28, 64, 0.8) 0%, transparent 100%)' }}>
                                            <div className="d-flex align-items-center gap-2 mb-2">
                                                <FaShieldAlt className="text-cyan" size={20} />
                                                <span className="fw-bold text-white">Jal-Rakshak</span>
                                            </div>
                                            <p className="small text-white-50 mb-0">
                                                Empowering communities with real-time water safety intelligence.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    }

                    {
                        activeTab === 'about' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <div className="jr-card" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                                    <div className="jr-card-header mb-4">
                                        <div className="jr-icon-wrapper"><FaInfoCircle /></div>
                                        {t('aboutTitle')}
                                    </div>
                                    <div className="row">
                                        <div className="col-lg-6">
                                            <h3 className="h5 fw-bold mb-3 text-white">{t('missionTitle')}</h3>
                                            <p className="mb-4 text-white-50">{t('missionText')}</p>

                                            <h3 className="h5 fw-bold mb-3 text-white">{t('visionTitle')}</h3>
                                            <p className="mb-4 text-white-50">{t('visionText')}</p>

                                            <h3 className="h5 fw-bold mb-3 text-white">{t('techStack')}</h3>
                                            <ul className="list-group list-group-flush bg-transparent">
                                                <li className="list-group-item bg-transparent text-white-50 border-secondary"><FaRobot className="me-2 text-primary" /> AI/ML Models</li>
                                                <li className="list-group-item bg-transparent text-white-50 border-secondary"><FaMicrochip className="me-2 text-success" /> IoT Sensors</li>
                                                <li className="list-group-item bg-transparent text-white-50 border-secondary"><FaBolt className="me-2 text-warning" /> Real-time Alert System</li>
                                            </ul>
                                        </div>
                                        <div className="col-lg-6 mt-4 mt-lg-0">
                                            <h3 className="h5 fw-bold mb-3 text-white">{t('teamTitle')}</h3>
                                            <div className="d-flex flex-wrap justify-content-start gap-4 mt-4">
                                                {teamMembers.map((member, index) => (
                                                    <div key={index} className="text-center">
                                                        <div className="mb-2 position-relative" style={{ width: '80px', height: '80px' }}>
                                                            <img
                                                                src={`https://placehold.co/80x80/${['4ade80', '60a5fa', 'f59e0b', 'ef4444', '8b5cf6', '10b981'][index]}/ffffff?text=${member.name.charAt(0)}`}
                                                                alt={member.name}
                                                                className="rounded-circle w-100 h-100"
                                                                style={{ objectFit: 'cover', border: '2px solid rgba(255,255,255,0.2)' }}
                                                            />
                                                            <div className="position-absolute bottom-0 end-0 bg-success rounded-circle" style={{ width: '15px', height: '15px', border: '2px solid #0f172a' }}></div>
                                                        </div>
                                                        <div className="fw-bold small text-white">{member.name}</div>
                                                        <div className="small text-muted" style={{ fontSize: '0.75rem' }}>Core Member</div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="mt-5 p-4 rounded bg-dark bg-opacity-50 border border-secondary">
                                                <h5 className="h6 fw-bold text-white mb-2">{t('joinCause')}</h5>
                                                <p className="small text-white-50 mb-3">{t('joinCauseText')}</p>
                                                <button className="jr-btn-fetch w-100">{t('contactUs')}</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    }
                </main >
            </div >
            {
                selectedOutbreak && (
                    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setSelectedOutbreak(null)}>
                        <div className="modal-dialog modal-lg" onClick={e => e.stopPropagation()}>
                            <div className={`modal-content ${darkMode ? 'bg-dark text-light' : ''}`}>
                                <div className="modal-header">
                                    <h5 className="modal-title">{selectedOutbreak.name}</h5>
                                    <button type="button" className="btn-close" onClick={() => setSelectedOutbreak(null)}></button>
                                </div>
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-md-8">
                                            <p><strong>{t('state')}:</strong> {selectedOutbreak.state}</p>
                                            <p><strong>{t('cases')}:</strong> {selectedOutbreak.cases.toLocaleString()}</p>
                                            <p><strong>{t('rate')}:</strong> {selectedOutbreak.rate}/1000</p>
                                            <p><strong>{t('description')}:</strong> {t(`diseases.${selectedOutbreak.name.split(' ')[0].toLowerCase()}`).description}</p>
                                        </div>
                                        <div className="col-md-4">
                                            <div className={`p-3 rounded ${darkMode ? 'bg-secondary' : 'bg-light'}`}>
                                                <h6>{t('statistics')}</h6>
                                                <div className="text-center my-3">
                                                    <div className="display-6 fw-bold text-danger">{selectedOutbreak.cases.toLocaleString()}</div>
                                                    <div className={`small ${darkMode ? 'text-light' : 'text-muted'}`}>{t('reportedCases')}</div>
                                                </div>
                                                <div className="progress mb-3" style={{ height: '8px' }}>
                                                    <div className="progress-bar bg-danger" role="progressbar" style={{ width: `${(selectedOutbreak.rate / 20) * 100}%` }}></div>
                                                </div>
                                                <div className="d-flex justify-content-between">
                                                    <span className={`small ${darkMode ? 'text-light' : 'text-muted'}`}>{t('rate')}: {selectedOutbreak.rate}/1000</span>
                                                    <span className={`small ${darkMode ? 'text-light' : 'text-muted'}`}>{t('location2')}: {selectedOutbreak.state}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
            <button
                onClick={toggleChat}
                aria-label="Open Jal-Rakshak AI chat window"
                className="jr-chat-toggle"
            >
                {chatOpen ? <FaTimes size={24} color="white" /> : <FaComments size={28} color="white" />}
            </button>

            <AnimatePresence>
                {chatOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="jr-chat-window"
                    >
                        {/* Header */}
                        <div className="jr-chat-header">
                            <div className="d-flex align-items-center gap-2">
                                <div className="bg-white bg-opacity-10 p-2 rounded-circle">
                                    <FaRobot className="text-white" size={18} />
                                </div>
                                <div>
                                    <div className="fw-bold text-white" style={{ fontSize: '0.95rem' }}>{t('chatTitle')}</div>
                                    <div className="text-white-50" style={{ fontSize: '0.75rem' }}>Online • AI Assistant</div>
                                </div>
                            </div>
                            <button onClick={toggleChat} className="btn-close btn-close-white opacity-75 hover-opacity-100"></button>
                        </div>

                        {/* Body */}
                        <div className="jr-chat-body" ref={widgetChatRef}>
                            {messages.map((msg) => (
                                <div key={msg.id} className={`jr-chat-message ${msg.sender === 'user' ? 'user' : 'ai'}`}>
                                    <div className="markdown-container-small">
                                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                                    </div>
                                    <div className={`jr-chat-timestamp ${msg.sender === 'user' ? 'text-end text-white-50' : 'text-start text-muted'}`}>
                                        {msg.timestamp}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="jr-chat-message ai">
                                    <div className="d-flex gap-1 py-1">
                                        <div className="jr-typing-dot"></div>
                                        <div className="jr-typing-dot"></div>
                                        <div className="jr-typing-dot"></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="jr-chat-footer">
                            <div className="jr-chat-input-group">
                                <input
                                    type="text"
                                    value={userMessage}
                                    onChange={(e) => setUserMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder={t('chatPlaceholder')}
                                    className="jr-chat-input"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!userMessage.trim()}
                                    className="jr-chat-send"
                                >
                                    <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Add Device Modal - Global */}
            {showAddDeviceModal && (
                <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1060 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content text-white" style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div className="modal-header border-secondary">
                                <h5 className="modal-title">{t('addNewDevice')}</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowAddDeviceModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleAddDevice}>
                                    <div className="mb-3">
                                        <label className="form-label text-muted">{t('deviceName')}</label>
                                        <input
                                            type="text"
                                            className="form-control bg-dark text-white border-secondary"
                                            value={newDeviceData.name}
                                            onChange={e => setNewDeviceData({ ...newDeviceData, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label text-muted">{t('deviceId')}</label>
                                        <input
                                            type="text"
                                            className="form-control bg-dark text-white border-secondary"
                                            value={newDeviceData.id}
                                            onChange={e => setNewDeviceData({ ...newDeviceData, id: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="d-grid">
                                        <button type="submit" className="btn btn-primary" disabled={deviceLoading}>
                                            {deviceLoading ? t('adding') : t('addNewDevice')}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;