import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { motion } from 'framer-motion';
import { FaBars, FaTimes, FaRobot, FaHome, FaDatabase, FaUsers, FaInfoCircle, FaMoon, FaSun, FaComments, FaGlobe, FaPhone, FaHospital, FaStethoscope } from 'react-icons/fa';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-loading-skeleton/dist/skeleton.css';
import './App.css';

const OutbreakMap = ({ outbreaks, darkMode }) => {
  const mapCenter = [26.2006, 92.9376];

  const getMarkerOptions = (outbreak) => {
    let color;
    switch (outbreak.severity) {
      case 'critical': color = '#dc3545'; break;
      case 'high': color = '#fd7e14'; break;
      case 'medium': color = '#0dcaf0'; break;
      case 'low': color = '#6c757d'; break;
      default: color = '#6c757d';
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

  return (
    <div className={`card mb-4 ${darkMode ? 'bg-dark' : ''}`} style={{ borderRadius: '1rem', overflow: 'hidden' }}>
        <MapContainer center={mapCenter} zoom={6} style={{ height: '450px', width: '100%' }} zoomControl={false}>
            <TileLayer
                url={darkMode ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {outbreaks.map(outbreak => (
                <CircleMarker
                    key={outbreak.id}
                    center={outbreak.position}
                    pathOptions={getMarkerOptions(outbreak)}
                >
                    <Popup>
                        <div className="fw-bold fs-6 mb-2">{outbreak.name} - {outbreak.state}</div>
                        <div className="mb-1"><strong>Cases:</strong> {outbreak.cases.toLocaleString()}</div>
                        <div className="mb-2"><strong className="text-capitalize">Severity:</strong> <span style={{color: getMarkerOptions(outbreak).fillColor}}>{outbreak.severity}</span></div>
                        <hr className="my-2"/>
                        <div className="small mb-1"><FaPhone className="me-2 text-primary" /><strong>Helpline:</strong> {outbreak.healthContact}</div>
                        <div className="small mb-2"><FaHospital className="me-2 text-success" /><strong>Health Centers:</strong> {outbreak.nearbyHospitals}+</div>
                        <div className="small fst-italic"><strong>Latest Update:</strong> "{outbreak.latestNews}"</div>
                    </Popup>
                </CircleMarker>
            ))}
        </MapContainer>
    </div>
  );
};

const HealthTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 rounded bg-light shadow-sm" style={{ fontSize: '0.8rem' }}>
        <strong>{label}</strong><br />
        {payload.map((p, idx) => (
          <div key={idx} style={{ color: p.color }}>
            {p.name}: {p.value}
          </div>
        ))}
        <em className="text-muted">💡 Did you know? Clean water prevents 80% of diarrheal diseases.</em>
      </div>
    );
  }
  return null;
};

const App = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [userMessage, setUserMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedOutbreak, setSelectedOutbreak] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    location: '',
    symptoms: [],
  });
 
  const [waterFormData, setWaterFormData] = useState({
    ph: '6.8',
    turbidity: '12.3',
    contaminantLevel: '150.5',
    temperature: '25.4',
    water_source_type: 'Groundwater',
    bacteria_count_cfu_ml: '500',
    nitrate_level_mg_l: '10.2',
    dissolved_oxygen_mg_l: '4.5',
    file: null
  });

  const [language, setLanguage] = useState('en');
 
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const [isWaterAnalyzing, setIsWaterAnalyzing] = useState(false);
  const [waterAnalysisResult, setWaterAnalysisResult] = useState(null);
  const [waterAnalysisError, setWaterAnalysisError] = useState(null);

  const mainChatRef = useRef(null);
  const widgetChatRef = useRef(null);

  const translations = useMemo(() => ({
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
      heroTitle: "Northeast India Waterborne Disease Monitor",
      heroSubtitle: "Real-time Surveillance and Response System for Water-Borne Diseases",
      outbreakTitle: "Diarrhea Outbreak",
      statisticsTitle: "Northeast States Comparison",
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
      upload: "Upload File",
      submitButton: "Submit Data & Get Analysis",
      analysisTitle: "AI Analysis Results",
      analysisPlaceholder: "Your analysis will appear here after submission.",
      analyzingPlaceholder: "Our AI is analyzing the data... Please wait.",
      communityTitle: "Community Outreach Programs",
      communitySubtitle: "Join our health education initiatives and community events across Northeast India to learn about water safety and disease prevention.",
      eventsTitle: "Upcoming Events",
      programHighlights: "Program Highlights",
      onlinePrograms: "Online Programs",
      offlineEvents: "Offline Events",
      waterTesting: "Water Testing",
      chatTitle: "Healify AI Assistant",
      chatPlaceholder: "Ask about waterborne diseases...",
      chatFeatures: "AI Assistant Features",
      quickHelp: "Quick Help",
      diseaseSymptoms: "Disease symptoms",
      preventionTips: "Prevention tips",
      waterTesting2: "Water testing",
      aboutTitle: "About Healify",
      missionTitle: "Our Mission",
      missionText: "Healify is dedicated to revolutionizing public health monitoring through advanced AI and machine learning technologies. Our mission is to create a smart health surveillance system that detects, monitors, and prevents outbreaks of waterborne diseases in vulnerable communities across rural Northeast India.",
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
      aboutAI: "About Healify AI",
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
      symptomsList: [ "Fever", "Diarrhea", "Vomiting", "Abdominal Pain", "Dehydration", "Headache", "Fatigue", "Nausea", "Jaundice", "Dark colored urine", "Rose spots", "Bloating", "Weight loss" ],
      diseases: {
          hepatitisA: { name: "Hepatitis A", description: "A liver infection caused by the Hepatitis A virus (HAV), highly contagious and spread through contaminated food or water.", remedies: ["Rest is crucial as there's no specific treatment.", "Stay hydrated by drinking plenty of fluids.", "Avoid alcohol and medications that can harm the liver."] },
          cholera: { name: "Cholera", description: "An acute diarrheal illness caused by infection of the intestine with Vibrio cholerae bacteria, which can be severe.", remedies: ["Immediate rehydration with Oral Rehydration Solution (ORS) is key.", "Seek urgent medical attention for severe cases.", "Zinc supplements can help reduce the duration of diarrhea."] },
          gastroenteritis: { name: "Gastroenteritis (Diarrhea)", description: "An intestinal infection marked by watery diarrhea, abdominal cramps, nausea or vomiting, and sometimes fever.", remedies: ["Drink plenty of liquids to prevent dehydration (ORS is best).", "Eat bland foods like bananas, rice, and toast (BRAT diet).", "Avoid dairy, fatty, or spicy foods."] },
          typhoid: { name: "Typhoid Fever", description: "A serious bacterial infection caused by Salmonella Typhi, characterized by a sustained high fever.", remedies: ["Requires immediate medical attention and is treated with antibiotics.", "Drink plenty of fluids to prevent dehydration.", "Eat a high-calorie, nutritious diet."] },
          giardiasis: { name: "Giardiasis", description: "An intestinal infection caused by a microscopic parasite called Giardia lamblia, often causing bloating and cramps without fever.", remedies: ["Medical treatment with prescription drugs is usually required.", "Stay well-hydrated.", "Avoid caffeine and dairy products, which can worsen diarrhea."] },
          crypto: { name: "Cryptosporidiosis", description: "A diarrheal disease caused by the microscopic parasite Cryptosporidium. It can cause watery diarrhea and is a common cause of waterborne disease.", remedies: ["Most people recover without treatment.", "Drink plenty of fluids to prevent dehydration.", "Anti-diarrheal medicine may help, but consult a doctor first."] }
      },
      ai: {
        initialGreeting: "Hello! I'm Healify AI. How can I assist you with waterborne diseases today? You can ask me things like 'What causes cholera?' or 'How to prevent typhoid?'",
        fallback: "I'm sorry, I don't have information on that. I can answer questions about the causes, symptoms, treatment, and prevention of diseases like Cholera, Typhoid, Hepatitis A, Giardiasis, and Gastroenteritis. Please try asking your question differently.",
      }
    },
    hi: {
      home: "होम",
      submitWaterData: "डेटा जमा करें",
      diseasePrediction: "रोग पूर्वानुमान",
      community: "सामुदायिक पहुंच",
      aiAssistant: "एआई सहायक",
      about: "हमारे बारे में",
      language: "भाषा",
      english: "अंग्रेजी",
      hindi: "हिंदी",
      assamese: "असमिया",
      bengali: "बंगाली",
      heroTitle: "पूर्वोत्तर भारत जलजनित रोग मॉनिटर",
      heroSubtitle: "जल-जनित रोगों के लिए रियल-टाइम निगरानी और प्रतिक्रिया प्रणाली",
      outbreakTitle: "डायरिया का प्रकोप",
      symptomsList: [ "बुखार", "दस्त", "उल्टी", "पेट दर्द", "निर्जलीकरण", "सिरदर्द", "थकान", "मतली", "पीलिया", "गहरे रंग का मूत्र", "गुलाबी धब्बे", "पेट फूलना", "वजन घटाना" ],
      ai: {
        initialGreeting: "नमस्ते! मैं Healify AI हूं। आज मैं जल-जनित रोगों के बारे में आपकी कैसे सहायता कर सकता हूं?",
        fallback: "मुझे खुशी है, मेरे पास इसकी जानकारी नहीं है। कृपया अपना प्रश्न अलग तरीके से पूछने की कोशिश करें।",
      }
    },
    as: {
      home: "ঘৰ",
      submitWaterData: "তথ্য জমা দিয়ক",
      diseasePrediction: "ৰোগ পূৰ্বাভাস",
      community: "সামুদায়িক সম্পৰ্ক",
      aiAssistant: "এআই সহায়ক",
      about: "আমাৰ বিষয়ে",
      language: "ভাষা",
      english: "ইংৰাজী",
      hindi: "হিন্দী",
      assamese: "অসমীয়া",
      bengali: "বাংলা",
      heroTitle: "উত্তৰ-পূৰ্ব ভাৰত জলবাহিত ৰোগ মনিটৰ",
      heroSubtitle: "জল-বাহিত ৰোগৰ বাবে ৰিয়েল-টাইম নিৰীক্ষণ আৰু প্ৰতিক্ৰিয়া ব্যৱস্থা",
      outbreakTitle: "ডায়েৰিয়াৰ প্ৰাদুৰ্ভাৱ",
      symptomsList: [ "জ্বৰ", "ডায়েৰিয়া", "বমি", "পেটৰ বিষ", "নিৰ্জলীকৰণ", "মূৰৰ বিষ", "ক্লান্তি", "বমি ভাব", "জণ্ডিছ", "গাঢ় ৰঙৰ প্ৰস্ৰাব", "গোলাপী দাগ", "পেট ফুলা", "ওজন কমা" ],
      ai: {
        initialGreeting: "নমস্কাৰ! মই Healify AI। আজি মই জল-বাহিত ৰোগৰ বিষয়ে আপোনাক কেনেকৈ সহায় কৰিব পাৰোঁ?",
        fallback: "দুঃখিত, মোৰ ইয়াৰ তথ্য নাই। অনুগ্ৰহ কৰি আপোনাৰ প্ৰশ্ন বেলেগ ধৰণে সুধিবলৈ চেষ্টা কৰক।",
      }
    },
    bn: {
      home: "হোম",
      submitWaterData: "ডেটা জমা দিন",
      diseasePrediction: "রোগের পূর্বাভাস",
      community: "কমিউনিটি আউটরিচ",
      aiAssistant: "এআই সহায়ক",
      about: "আমাদের সম্পর্কে",
      language: "ভাষা",
      english: "ইংরেজি",
      hindi: "হিন্দি",
      assamese: "অসমিয়া",
      bengali: "বাংলা",
      heroTitle: "উত্তর-পূর্ব ভারত জলবাহিত রোগ মনিটর",
      heroSubtitle: "জল-বাহিত রোগের জন্য রিয়েল-টাইম নিরীক্ষণ এবং প্রতিক্রিয়া সিস্টেম",
      outbreakTitle: "ডায়রিয়ার প্রাদুর্ভাব",
      symptomsList: [ "জ্বর", "ডায়রিয়া", "বমি", "পেটে ব্যথা", "পানিশূন্যতা", "মাথাব্যথা", "ক্লান্তি", "বমি বমি ভাব", "জন্ডিস", "গাঢ় রঙের প্রস্রাব", "গোলাপি দাগ", "পেট ফাঁপা", "ওজন কমা" ],
      ai: {
        initialGreeting: "নমস্কার! আমি Healify AI। আজ জলবাহিত রোগ সম্পর্কে আমি আপনাকে কীভাবে সাহায্য করতে পারি?",
        fallback: "দুঃখিত, আমার কাছে এই তথ্য নেই। দয়া করে আপনার প্রশ্নটি ভিন্নভাবে জিজ্ঞাসা করার চেষ্টা করুন।",
      }
    }
  }), []);

  const t = useCallback((key) => {
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
  }, [language, translations]);
     
  useEffect(() => {
    setMessages([
        { 
            id: 1, 
            text: t('ai.initialGreeting'), 
            sender: 'ai', 
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        }
    ]);
  }, [language, t]);

  const diseaseInfoDatabase = useMemo(() => ({
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
  }), []);

  const getAIResponse = useCallback((message) => {
    const lowerCaseMessage = message.toLowerCase();

    const greetingKeywords = ["hello", "hi", "hey", "namaste"];
    const causesKeywords = ["cause", "from", "get", "origin", "reason", "why"];
    const symptomsKeywords = ["symptom", "sign", "feel", "effect", "identify"];
    const treatmentKeywords = ["treat", "cure", "remedy", "help", "solution", "manage"];
    const preventionKeywords = ["prevent", "avoid", "safe", "stop", "protect"];

    if (greetingKeywords.some(k => lowerCaseMessage.includes(k))) {
        return "Hello there! How can I help you learn about waterborne diseases today?";
    }

    for (const diseaseKey in diseaseInfoDatabase) {
        const disease = diseaseInfoDatabase[diseaseKey];
        if (disease.keywords.some(k => lowerCaseMessage.includes(k))) {
            if (symptomsKeywords.some(k => lowerCaseMessage.includes(k))) {
                return `Symptoms of ${disease.name}: ${disease.info.symptoms}`;
            }
            if (causesKeywords.some(k => lowerCaseMessage.includes(k))) {
                return `Causes of ${disease.name}: ${disease.info.causes}`;
            }
            if (treatmentKeywords.some(k => lowerCaseMessage.includes(k))) {
                return `Treatment for ${disease.name}: ${disease.info.treatment}`;
            }
            if (preventionKeywords.some(k => lowerCaseMessage.includes(k))) {
                return `Prevention of ${disease.name}: ${disease.info.prevention}`;
            }
            return `${disease.name}: ${t(`diseases.${diseaseKey}`).description} Would you like to know about its causes, symptoms, treatment, or prevention?`;
        }
    }

    if (preventionKeywords.some(k => lowerCaseMessage.includes(k))) {
      return "To prevent most waterborne diseases, always drink boiled or purified water, wash your hands thoroughly with soap, cook food properly, and avoid swallowing water from pools or lakes.";
    }
    if (symptomsKeywords.some(k => lowerCaseMessage.includes(k))) {
      return "Common symptoms for many waterborne diseases include diarrhea, vomiting, fever, and stomach cramps. For a more specific diagnosis, please use the 'Disease Prediction' tab or consult a doctor.";
    }

    return t('ai.fallback');
  }, [diseaseInfoDatabase, t]);

  const handleSendMessage = useCallback(() => {
    if (!userMessage.trim()) return;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newUserMessage = { id: Date.now(), text: userMessage, sender: 'user', timestamp };
    setMessages(prev => [...prev, newUserMessage]);
    const aiResponseText = getAIResponse(userMessage);
    setIsTyping(true);
    setTimeout(() => {
      const aiResponse = { id: Date.now() + 1, text: aiResponseText, sender: 'ai', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
    setUserMessage('');
  }, [userMessage, getAIResponse]);

  useEffect(() => {
      if (mainChatRef.current) {
          mainChatRef.current.scrollTop = mainChatRef.current.scrollHeight;
      }
      if (widgetChatRef.current) {
          widgetChatRef.current.scrollTop = widgetChatRef.current.scrollHeight;
      }
  }, [messages]);
 
  const diseaseDatabase = useMemo(() => ({
    hepatitisA: { keywords: ["Fatigue", "Nausea", "Jaundice", "Dark colored urine", "Abdominal Pain", "Vomiting", "Fever"], },
    cholera: { keywords: ["Diarrhea", "Vomiting", "Dehydration", "Nausea"], },
    gastroenteritis: { keywords: ["Diarrhea", "Vomiting", "Nausea", "Abdominal Pain", "Fever", "Dehydration", "Headache"], },
    typhoid: { keywords: ["Fever", "Headache", "Fatigue", "Abdominal Pain", "Rose spots", "Diarrhea"], },
    giardiasis: { keywords: ["Diarrhea", "Fatigue", "Abdominal Pain", "Nausea", "Dehydration", "Bloating", "Weight loss"], },
    crypto: { keywords: ["Diarrhea", "Dehydration", "Weight loss", "Abdominal Pain", "Fever", "Nausea", "Vomiting"], }
  }), []);

  const runAIAnalysis = useCallback((selectedSymptoms) => {
    const translatedSymptomsList = t('symptomsList');
    const englishSelectedSymptoms = selectedSymptoms.map(symptom => {
        const index = translatedSymptomsList.indexOf(symptom);
        return translations.en.symptomsList[index];
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
  }, [diseaseDatabase, t, translations.en.symptomsList]);

  const handleFormSubmit = useCallback((e) => {
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
  }, [formData.symptoms, runAIAnalysis]);
 
  const handleWaterFormSubmit = useCallback(async (e) => {
    e.preventDefault();
    setIsWaterAnalyzing(true);
    setWaterAnalysisResult(null);
    setWaterAnalysisError(null);

    const API_URL = 'https://karan0301-sih.hf.space/predict';

    const submissionData = {
    ph_level: parseFloat(waterFormData.ph),
    turbidity_ntu: parseFloat(waterFormData.turbidity),
    contaminant_level_ppm: parseFloat(waterFormData.contaminantLevel),
    temperature_celsius: parseFloat(waterFormData.temperature),
    water_source_type: waterFormData.water_source_type,
    bacteria_count_cfu_ml: parseFloat(waterFormData.bacteria_count_cfu_ml),
    nitrate_level_mg_l: parseFloat(waterFormData.nitrate_level_mg_l),
    dissolved_oxygen_mg_l: parseFloat(waterFormData.dissolved_oxygen_mg_l)
};
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(submissionData),
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.detail || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setWaterAnalysisResult(result);
        console.log("API Response:", result);

    } catch (error) {
        console.error("API call failed:", error);
        setWaterAnalysisError(`Failed to get analysis. ${error.message}`);
    } finally {
        setIsWaterAnalyzing(false);
    }
  }, [waterFormData]);

  const handleWaterInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setWaterFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleFileChange = useCallback((e) => {
    setWaterFormData(prev => ({ ...prev, file: e.target.files[0] }));
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSymptomChange = useCallback((symptom) => {
    setFormData(prev => {
      const symptoms = prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom];
      return { ...prev, symptoms };
    });
  }, []);

  const toggleChat = useCallback(() => setChatOpen(!chatOpen), [chatOpen]);
  const toggleDarkMode = useCallback(() => setDarkMode(!darkMode), [darkMode]);
  const toggleSidebar = useCallback(() => setSidebarOpen(!sidebarOpen), [sidebarOpen]);

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

  const diseaseOutbreaks = useMemo(() => [
    { id: 1, name: t('outbreakTitle'), state: 'Assam', cases: 45000, rate: 18.5, severity: 'critical', position: [26.2006, 92.9376], healthContact: "104", nearbyHospitals: 15, latestNews: "Govt. launches new initiative for clean drinking water in rural Assam." },
    { id: 2, name: 'Cholera Outbreak', state: 'Meghalaya', cases: 32000, rate: 16.2, severity: 'high', position: [25.4670, 91.3662], healthContact: "108", nearbyHospitals: 8, latestNews: "Health department issues high alert following flash floods in Garo Hills." },
    { id: 3, name: 'Typhoid Outbreak', state: 'Manipur', cases: 28000, rate: 15.8, severity: 'medium', position: [24.6637, 93.9063], healthContact: "102", nearbyHospitals: 11, latestNews: "Vaccination drive for Typhoid begins in Imphal and surrounding areas." },
    { id: 4, name: 'Hepatitis Outbreak', state: 'Nagaland', cases: 25000, rate: 14.7, severity: 'low', position: [26.1584, 94.5624], healthContact: "103", nearbyHospitals: 7, latestNews: "Awareness campaigns about contaminated water sources are underway." },
    { id: 5, name: 'Gastroenteritis', state: 'Arunachal Pradesh', cases: 18000, rate: 12.3, severity: 'medium', position: [28.2180, 94.7278], healthContact: "108", nearbyHospitals: 5, latestNews: "Mobile medical units dispatched to remote eastern districts." }
  ], [t]);

  const stateData = useMemo(() => [
    { state: 'Assam', cases: 45000, rate: 18.5 },
    { state: 'Meghalaya', cases: 32000, rate: 16.2 },
    { state: 'Manipur', cases: 28000, rate: 15.8 },
    { state: 'Nagaland', cases: 25000, rate: 14.7 },
    { state: 'Arunachal Pradesh', cases: 18000, rate: 12.3 },
    { state: 'Tripura', cases: 15000, rate: 11.2 },
    { state: 'Mizoram', cases: 12000, rate: 10.8 },
    { state: 'Sikkim', cases: 8000, rate: 9.5 }
  ], []);

  const trendsData = useMemo(() => [
    { month: 'Jan', cholera: 850, typhoid: 620, hepatitis: 430, gastro: 1200 },
    { month: 'Feb', cholera: 920, typhoid: 680, hepatitis: 510, gastro: 1350 },
    { month: 'Mar', cholera: 1100, typhoid: 750, hepatitis: 580, gastro: 1500 },
    { month: 'Apr', cholera: 1250, typhoid: 820, hepatitis: 650, gastro: 1680 },
    { month: 'May', cholera: 1450, typhoid: 920, hepatitis: 720, gastro: 1850 },
    { month: 'Jun', cholera: 1680, typhoid: 1050, hepatitis: 800, gastro: 2100 },
    { month: 'Jul', cholera: 1920, typhoid: 1200, hepatitis: 880, gastro: 2350 },
    { month: 'Aug', cholera: 2100, typhoid: 1350, hepatitis: 950, gastro: 2600 },
  ], []);

  const eventsData = useMemo(() => [
    {
      id: 1,
      title: "Water Safety Workshop - Guwahati",
      date: "October 15, 2024",
      location: "IIT Guwahati",
      type: "offline",
      registered: 120,
      capacity: 200,
      description: "Comprehensive training on water purification techniques and disease prevention methods for rural communities."
    },
    {
      id: 2,
      title: "AI-Powered Disease Monitoring Webinar",
      date: "October 22, 2024",
      location: "Online Platform",
      type: "online",
      registered: 450,
      capacity: 500,
      description: "Learn how artificial intelligence is revolutionizing disease surveillance and early warning systems in Northeast India."
    },
    {
      id: 3,
      title: "Community Health Fair - Shillong",
      date: "November 5, 2024",
      location: "Shillong Medical College",
      type: "offline",
      registered: 85,
      capacity: 150,
      description: "Free health screenings, water testing services, and educational programs for families in Meghalaya."
    }
  ], []);

  const emergencyData = useMemo(() => [
    { disease: "Cholera", state: "Meghalaya", severity: t('high'), team: "Team Alpha", lastUpdate: "2 hours ago" },
    { disease: "Typhoid", state: "Manipur", severity: t('medium'), team: "Team Beta", lastUpdate: "4 hours ago" },
    { disease: "Hepatitis A", state: "Nagaland", severity: t('low'), team: "Team Gamma", lastUpdate: "6 hours ago" },
    { disease: "Gastroenteritis", state: "Assam", severity: t('critical'), team: "Team Delta", lastUpdate: "1 hour ago" }
  ], [t]);

  return (
    <div className={`${darkMode ? 'bg-dark text-light' : 'bg-light'} min-vh-100`}>
      <nav className={`navbar navbar-expand-lg ${darkMode ? 'navbar-dark bg-dark' : 'navbar-light bg-white'} shadow-sm position-fixed w-100`} style={{ zIndex: 1030 }}>
        <div className="container-fluid">
          <button className="btn btn-outline-primary hamburger-btn d-lg-none me-3" onClick={toggleSidebar}>
            <FaBars />
          </button>
          
          <a className="navbar-brand fw-bold text-primary" href="#">
            <FaStethoscope className="me-2" />
            Healify
          </a>

          <div className="d-flex align-items-center">
            <div className="dropdown me-3">
              <button className={`btn btn-outline-secondary dropdown-toggle ${darkMode ? 'text-light' : ''}`} type="button" data-bs-toggle="dropdown">
                <FaGlobe className="me-2" />
                {t('language')}
              </button>
              <ul className="dropdown-menu">
                <li><button className="dropdown-item" onClick={() => setLanguage('en')}>{t('english')}</button></li>
                <li><button className="dropdown-item" onClick={() => setLanguage('hi')}>{t('hindi')}</button></li>
                <li><button className="dropdown-item" onClick={() => setLanguage('as')}>{t('assamese')}</button></li>
                <li><button className="dropdown-item" onClick={() => setLanguage('bn')}>{t('bengali')}</button></li>
              </ul>
            </div>
            
            <button className={`btn ${darkMode ? 'btn-outline-light' : 'btn-outline-dark'}`} onClick={toggleDarkMode}>
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>
          </div>
        </div>
      </nav>

      <div className="d-flex" style={{ paddingTop: '70px' }}>
        <motion.div 
          className={`sidebar bg-white shadow-lg ${darkMode ? 'bg-dark border-end' : ''} ${sidebarOpen ? 'sidebar-open' : ''}`}
          style={{ 
            width: '250px',
            minHeight: '100vh',
            position: 'fixed',
            left: sidebarOpen ? '0' : '-250px',
            top: '70px',
            zIndex: 1020,
            transition: 'left 0.3s ease-in-out'
          }}
          initial={{ x: -250 }}
          animate={{ x: sidebarOpen ? 0 : -250 }}
          transition={{ duration: 0.3 }}
        >
          <div className="p-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Navigation</h5>
              <button className="btn btn-sm btn-outline-secondary d-lg-none" onClick={toggleSidebar}>
                <FaTimes />
              </button>
            </div>
            
            <ul className="nav flex-column">
              <li className="nav-item mb-2">
                <button 
                  className={`nav-link btn w-100 text-start ${activeTab === 'home' ? 'btn-primary text-white' : `btn-outline-primary ${darkMode ? 'text-light' : ''}`}`}
                  onClick={() => { setActiveTab('home'); setSidebarOpen(false); }}
                >
                  <FaHome className="me-2" />
                  {t('home')}
                </button>
              </li>
              <li className="nav-item mb-2">
                <button 
                  className={`nav-link btn w-100 text-start ${activeTab === 'submit' ? 'btn-primary text-white' : `btn-outline-primary ${darkMode ? 'text-light' : ''}`}`}
                  onClick={() => { setActiveTab('submit'); setSidebarOpen(false); }}
                >
                  <FaDatabase className="me-2" />
                  {t('submitWaterData')}
                </button>
              </li>
              <li className="nav-item mb-2">
                <button 
                  className={`nav-link btn w-100 text-start ${activeTab === 'prediction' ? 'btn-primary text-white' : `btn-outline-primary ${darkMode ? 'text-light' : ''}`}`}
                  onClick={() => { setActiveTab('prediction'); setSidebarOpen(false); }}
                >
                  <FaUsers className="me-2" />
                  {t('diseasePrediction')}
                </button>
              </li>
              <li className="nav-item mb-2">
                <button 
                  className={`nav-link btn w-100 text-start ${activeTab === 'community' ? 'btn-primary text-white' : `btn-outline-primary ${darkMode ? 'text-light' : ''}`}`}
                  onClick={() => { setActiveTab('community'); setSidebarOpen(false); }}
                >
                  <FaUsers className="me-2" />
                  {t('community')}
                </button>
              </li>
              <li className="nav-item mb-2">
                <button 
                  className={`nav-link btn w-100 text-start ${activeTab === 'about' ? 'btn-primary text-white' : `btn-outline-primary ${darkMode ? 'text-light' : ''}`}`}
                  onClick={() => { setActiveTab('about'); setSidebarOpen(false); }}
                >
                  <FaInfoCircle className="me-2" />
                  {t('about')}
                </button>
              </li>
            </ul>
          </div>
        </motion.div>

        <div className="flex-grow-1" style={{ marginLeft: sidebarOpen ? '250px' : '0', transition: 'margin-left 0.3s ease-in-out' }}>
          <main className="container-fluid p-4">
            {activeTab === 'home' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="row mb-5">
                  <div className="col-12">
                    <div className={`hero-section p-5 rounded-4 text-center ${darkMode ? 'bg-gradient text-light' : 'bg-primary text-white'}`} style={{ background: darkMode ? 'linear-gradient(135deg, #1a1a1a 0%, #2d3436 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                      >
                        <h1 className="display-4 fw-bold mb-3">{t('heroTitle')}</h1>
                        <p className="lead mb-4">{t('heroSubtitle')}</p>
                        <div className="d-flex justify-content-center gap-3 flex-wrap">
                          <button 
                            className="btn btn-light btn-lg px-4"
                            onClick={() => setActiveTab('prediction')}
                          >
                            <FaRobot className="me-2" />
                            {t('diseasePrediction')}
                          </button>
                          <button 
                            className="btn btn-outline-light btn-lg px-4"
                            onClick={toggleChat}
                          >
                            <FaComments className="me-2" />
                            {t('aiAssistant')}
                          </button>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>

                <div className="row mb-5">
                  <div className="col-12">
                    <h2 className="mb-4 fw-bold text-center">{t('statistics')} - {t('statisticsTitle')}</h2>
                    <OutbreakMap outbreaks={diseaseOutbreaks} darkMode={darkMode} />
                  </div>
                </div>

                <div className="row mb-5">
                  <div className="col-lg-6 mb-4">
                    <div className={`card h-100 ${darkMode ? 'bg-dark border-secondary' : 'bg-white'}`} style={{ borderRadius: '1rem' }}>
                      <div className="card-header border-0 bg-transparent">
                        <h4 className="card-title fw-bold mb-0">{t('statisticsTitle')}</h4>
                      </div>
                      <div className="card-body">
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={stateData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#444' : '#e0e0e0'} />
                            <XAxis dataKey="state" tick={{ fontSize: 12 }} stroke={darkMode ? '#ccc' : '#666'} />
                            <YAxis tick={{ fontSize: 12 }} stroke={darkMode ? '#ccc' : '#666'} />
                            <Tooltip content={<HealthTooltip />} />
                            <Legend />
                            <Bar dataKey="cases" fill="#8884d8" name={t('reportedCases')} />
                            <Bar dataKey="rate" fill="#82ca9d" name={t('rate')} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-lg-6 mb-4">
                    <div className={`card h-100 ${darkMode ? 'bg-dark border-secondary' : 'bg-white'}`} style={{ borderRadius: '1rem' }}>
                      <div className="card-header border-0 bg-transparent">
                        <h4 className="card-title fw-bold mb-0">{t('trendsTitle')}</h4>
                      </div>
                      <div className="card-body">
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={trendsData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#444' : '#e0e0e0'} />
                            <XAxis dataKey="month" stroke={darkMode ? '#ccc' : '#666'} />
                            <YAxis stroke={darkMode ? '#ccc' : '#666'} />
                            <Tooltip content={<HealthTooltip />} />
                            <Legend />
                            <Line type="monotone" dataKey="cholera" stroke="#8884d8" strokeWidth={2} name="Cholera" />
                            <Line type="monotone" dataKey="typhoid" stroke="#82ca9d" strokeWidth={2} name="Typhoid" />
                            <Line type="monotone" dataKey="hepatitis" stroke="#ffc658" strokeWidth={2} name="Hepatitis" />
                            <Line type="monotone" dataKey="gastro" stroke="#ff7c7c" strokeWidth={2} name="Gastroenteritis" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-12">
                    <div className={`card ${darkMode ? 'bg-dark border-secondary' : 'bg-white'}`} style={{ borderRadius: '1rem' }}>
                      <div className="card-header border-0 bg-transparent">
                        <h4 className="card-title fw-bold mb-0">{t('emergencyTitle')}</h4>
                      </div>
                      <div className="card-body">
                        <div className="table-responsive">
                          <table className={`table table-hover ${darkMode ? 'table-dark' : ''}`}>
                            <thead>
                              <tr>
                                <th>{t('disease')}</th>
                                <th>{t('state')}</th>
                                <th>{t('severity')}</th>
                                <th>{t('responseTeam')}</th>
                                <th>{t('lastUpdate')}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {emergencyData.map((emergency, idx) => (
                                <tr key={idx}>
                                  <td className="fw-semibold">{emergency.disease}</td>
                                  <td>{emergency.state}</td>
                                  <td>
                                    <span className={`badge ${
                                      emergency.severity === t('critical') ? 'bg-danger' :
                                      emergency.severity === t('high') ? 'bg-warning text-dark' :
                                      emergency.severity === t('medium') ? 'bg-info' : 'bg-success'
                                    }`}>
                                      {emergency.severity}
                                    </span>
                                  </td>
                                  <td>{emergency.team}</td>
                                  <td className="text-muted">{emergency.lastUpdate}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'submit' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="row justify-content-center">
                  <div className="col-lg-8">
                    <div className={`card shadow-lg ${darkMode ? 'bg-dark border-secondary' : 'bg-white'}`} style={{ borderRadius: '1rem' }}>
                      <div className="card-header text-center py-4 border-0" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '1rem 1rem 0 0' }}>
                        <h3 className="text-white fw-bold mb-2">{t('submitWaterData')}</h3>
                        <p className="text-white mb-0">Submit water quality data for AI-powered analysis</p>
                      </div>
                      
                      <div className="card-body p-4">
                        <form onSubmit={handleWaterFormSubmit}>
                          <div className="mb-4">
                            <h5 className="fw-bold mb-3">{t('waterQuality')}</h5>
                            
                            <div className="row g-3">
                              <div className="col-md-6">
                                <label className="form-label fw-semibold">{t('pH')}</label>
                                <input
                                  type="number"
                                  step="0.1"
                                  name="ph"
                                  value={waterFormData.ph}
                                  onChange={handleWaterInputChange}
                                  className={`form-control ${darkMode ? 'bg-dark text-light border-secondary' : ''}`}
                                  required
                                />
                              </div>
                              
                              <div className="col-md-6">
                                <label className="form-label fw-semibold">{t('turbidity')}</label>
                                <input
                                  type="number"
                                  step="0.1"
                                  name="turbidity"
                                  value={waterFormData.turbidity}
                                  onChange={handleWaterInputChange}
                                  className={`form-control ${darkMode ? 'bg-dark text-light border-secondary' : ''}`}
                                  required
                                />
                              </div>
                              
                              <div className="col-md-6">
                                <label className="form-label fw-semibold">{t('contaminantLevelPpm')}</label>
                                <input
                                  type="number"
                                  step="0.1"
                                  name="contaminantLevel"
                                  value={waterFormData.contaminantLevel}
                                  onChange={handleWaterInputChange}
                                  className={`form-control ${darkMode ? 'bg-dark text-light border-secondary' : ''}`}
                                  required
                                />
                              </div>
                              
                              <div className="col-md-6">
                                <label className="form-label fw-semibold">{t('waterTemperatureC')}</label>
                                <input
                                  type="number"
                                  step="0.1"
                                  name="temperature"
                                  value={waterFormData.temperature}
                                  onChange={handleWaterInputChange}
                                  className={`form-control ${darkMode ? 'bg-dark text-light border-secondary' : ''}`}
                                  required
                                />
                              </div>
                              
                              <div className="col-md-6">
                                <label className="form-label fw-semibold">{t('waterSourceType')}</label>
                                <select
                                  name="water_source_type"
                                  value={waterFormData.water_source_type}
                                  onChange={handleWaterInputChange}
                                  className={`form-select ${darkMode ? 'bg-dark text-light border-secondary' : ''}`}
                                  required
                                >
                                  <option value="Groundwater">Groundwater</option>
                                  <option value="Surface_water">Surface Water</option>
                                  <option value="Tap_water">Tap Water</option>
                                </select>
                              </div>
                              
                              <div className="col-md-6">
                                <label className="form-label fw-semibold">Bacteria Count (CFU/ml)</label>
                                <input
                                  type="number"
                                  step="0.1"
                                  name="bacteria_count_cfu_ml"
                                  value={waterFormData.bacteria_count_cfu_ml}
                                  onChange={handleWaterInputChange}
                                  className={`form-control ${darkMode ? 'bg-dark text-light border-secondary' : ''}`}
                                  required
                                />
                              </div>
                              
                              <div className="col-md-6">
                                <label className="form-label fw-semibold">Nitrate Level (mg/L)</label>
                                <input
                                  type="number"
                                  step="0.1"
                                  name="nitrate_level_mg_l"
                                  value={waterFormData.nitrate_level_mg_l}
                                  onChange={handleWaterInputChange}
                                  className={`form-control ${darkMode ? 'bg-dark text-light border-secondary' : ''}`}
                                  required
                                />
                              </div>
                              
                              <div className="col-md-6">
                                <label className="form-label fw-semibold">Dissolved Oxygen (mg/L)</label>
                                <input
                                  type="number"
                                  step="0.1"
                                  name="dissolved_oxygen_mg_l"
                                  value={waterFormData.dissolved_oxygen_mg_l}
                                  onChange={handleWaterInputChange}
                                  className={`form-control ${darkMode ? 'bg-dark text-light border-secondary' : ''}`}
                                  required
                                />
                              </div>
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <label className="form-label fw-semibold">{t('upload')}</label>
                            <input
                              type="file"
                              onChange={handleFileChange}
                              className={`form-control ${darkMode ? 'bg-dark text-light border-secondary' : ''}`}
                              accept=".csv,.xlsx,.json"
                            />
                            <div className="form-text text-muted">
                              Optional: Upload additional data files (CSV, Excel, JSON)
                            </div>
                          </div>
                          
                          <div className="d-grid">
                            <button 
                              type="submit" 
                              className="btn btn-primary btn-lg fw-semibold"
                              disabled={isWaterAnalyzing}
                            >
                              {isWaterAnalyzing ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                  Analyzing...
                                </>
                              ) : (
                                <>{t('submitButton')}</>
                              )}
                            </button>
                          </div>
                        </form>
                        
                        {(waterAnalysisResult || waterAnalysisError || isWaterAnalyzing) && (
                          <div className="mt-4">
                            <h5 className="fw-bold mb-3">{t('analysisTitle')}</h5>
                            <div className={`p-4 rounded ${darkMode ? 'bg-secondary bg-opacity-25' : 'bg-light'}`}>
                              {isWaterAnalyzing && (
                                <div className="text-center">
                                  <div className="spinner-border text-primary mb-3" role="status"></div>
                                  <p className="mb-0">{t('analyzingPlaceholder')}</p>
                                </div>
                              )}
                              
                              {waterAnalysisError && (
                                <div className="alert alert-danger mb-0">
                                  <strong>Error:</strong> {waterAnalysisError}
                                </div>
                              )}
                              
                              {waterAnalysisResult && !isWaterAnalyzing && (
                                <div>
                                  <h6 className="fw-bold text-success mb-3">Analysis Complete</h6>
                                  <div className="row g-3">
                                    <div className="col-md-6">
                                      <div className={`p-3 rounded ${darkMode ? 'bg-dark' : 'bg-white'} border`}>
                                        <h6 className="mb-2">Water Quality Status</h6>
                                        <p className={`mb-0 fw-bold ${waterAnalysisResult.status === 'Safe' ? 'text-success' : 'text-danger'}`}>
                                          {waterAnalysisResult.status || 'Analysis Complete'}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="col-md-6">
                                      <div className={`p-3 rounded ${darkMode ? 'bg-dark' : 'bg-white'} border`}>
                                        <h6 className="mb-2">Risk Level</h6>
                                        <p className={`mb-0 fw-bold ${waterAnalysisResult.risk_level === 'Low' ? 'text-success' : waterAnalysisResult.risk_level === 'Medium' ? 'text-warning' : 'text-danger'}`}>
                                          {waterAnalysisResult.risk_level || 'Calculated'}
                                        </p>
                                      </div>
                                    </div>
                                    {waterAnalysisResult.recommendations && (
                                      <div className="col-12">
                                        <div className={`p-3 rounded ${darkMode ? 'bg-dark' : 'bg-white'} border`}>
                                          <h6 className="mb-2">Recommendations</h6>
                                          <p className="mb-0">{waterAnalysisResult.recommendations}</p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'prediction' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="row justify-content-center">
                  <div className="col-lg-8">
                    <div className={`card shadow-lg ${darkMode ? 'bg-dark border-secondary' : 'bg-white'}`} style={{ borderRadius: '1rem' }}>
                      <div className="card-header text-center py-4 border-0" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '1rem 1rem 0 0' }}>
                        <h3 className="text-white fw-bold mb-2">{t('predictionTitle')}</h3>
                        <p className="text-white mb-0">{t('predictionSubtitle')}</p>
                      </div>
                      
                      <div className="card-body p-4">
                        <form onSubmit={handleFormSubmit}>
                          <div className="mb-4">
                            <h5 className="fw-bold mb-3">{t('patientInfo')}</h5>
                            
                            <div className="row g-3">
                              <div className="col-md-6">
                                <label className="form-label fw-semibold">{t('fullName')}</label>
                                <input
                                  type="text"
                                  name="name"
                                  value={formData.name}
                                  onChange={handleInputChange}
                                  className={`form-control ${darkMode ? 'bg-dark text-light border-secondary' : ''}`}
                                  required
                                />
                              </div>
                              
                              <div className="col-md-3">
                                <label className="form-label fw-semibold">{t('age')}</label>
                                <input
                                  type="number"
                                  name="age"
                                  value={formData.age}
                                  onChange={handleInputChange}
                                  className={`form-control ${darkMode ? 'bg-dark text-light border-secondary' : ''}`}
                                  required
                                />
                              </div>
                              
                              <div className="col-md-3">
                                <label className="form-label fw-semibold">{t('gender')}</label>
                                <select
                                  name="gender"
                                  value={formData.gender}
                                  onChange={handleInputChange}
                                  className={`form-select ${darkMode ? 'bg-dark text-light border-secondary' : ''}`}
                                  required
                                >
                                  <option value="">Select...</option>
                                  <option value="male">{t('genderOptions.male')}</option>
                                  <option value="female">{t('genderOptions.female')}</option>
                                  <option value="other">{t('genderOptions.other')}</option>
                                </select>
                              </div>
                              
                              <div className="col-12">
                                <label className="form-label fw-semibold">{t('location')}</label>
                                <input
                                  type="text"
                                  name="location"
                                  value={formData.location}
                                  onChange={handleInputChange}
                                  className={`form-control ${darkMode ? 'bg-dark text-light border-secondary' : ''}`}
                                  placeholder="City, State"
                                  required
                                />
                              </div>
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <h5 className="fw-bold mb-3">{t('symptoms')}</h5>
                            <div className="row g-2">
                              {t('symptomsList').map((symptom, index) => (
                                <div key={index} className="col-md-4 col-6">
                                  <div className="form-check">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      id={`symptom-${index}`}
                                      checked={formData.symptoms.includes(symptom)}
                                      onChange={() => handleSymptomChange(symptom)}
                                    />
                                    <label className="form-check-label" htmlFor={`symptom-${index}`}>
                                      {symptom}
                                    </label>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="d-grid">
                            <button 
                              type="submit" 
                              className="btn btn-primary btn-lg fw-semibold"
                              disabled={isAnalyzing}
                            >
                              {isAnalyzing ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                  Analyzing...
                                </>
                              ) : (
                                <>{t('submitButton')}</>
                              )}
                            </button>
                          </div>
                        </form>
                        
                        {(analysisResult || isAnalyzing) && (
                          <div className="mt-4">
                            <h5 className="fw-bold mb-3">{t('analysisTitle')}</h5>
                            <div className={`p-4 rounded ${darkMode ? 'bg-secondary bg-opacity-25' : 'bg-light'}`}>
                              {isAnalyzing ? (
                                <div className="text-center">
                                  <div className="spinner-border text-primary mb-3" role="status"></div>
                                  <p className="mb-0">{t('analyzingPlaceholder')}</p>
                                </div>
                              ) : analysisResult && analysisResult.length > 0 ? (
                                <div>
                                  <h6 className="fw-bold text-success mb-3">Analysis Complete</h6>
                                  {analysisResult.map((disease, index) => (
                                    <div key={index} className={`card mb-3 ${darkMode ? 'bg-dark border-secondary' : 'bg-white'}`}>
                                      <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                          <h6 className="card-title fw-bold text-primary mb-1">{disease.name}</h6>
                                          <span className={`badge fs-6 ${
                                            disease.probability >= 70 ? 'bg-danger' :
                                            disease.probability >= 50 ? 'bg-warning text-dark' : 'bg-info'
                                          }`}>
                                            {disease.probability}% {t('probability')}
                                          </span>
                                        </div>
                                        <p className="card-text mb-3">{disease.description}</p>
                                        
                                        <div className="mb-3">
                                          <h6 className="fw-semibold text-success">{t('remediesTitle')}</h6>
                                          <ul className="mb-0">
                                            {disease.remedies.map((remedy, idx) => (
                                              <li key={idx} className="mb-1">{remedy}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div>
                                  <h6 className="fw-bold text-warning mb-3">{t('noDiseaseDetectedTitle')}</h6>
                                  <p className="mb-3">{t('noDiseaseDetectedDescription')}</p>
                                  <div className={`alert ${darkMode ? 'alert-dark' : 'alert-light'} mb-0`}>
                                    <strong>Recommendation:</strong> {t('noDiseaseDetectedRemedy')}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'community' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="row mb-5">
                  <div className="col-12 text-center">
                    <h2 className="fw-bold mb-3">{t('communityTitle')}</h2>
                    <p className="lead text-muted">{t('communitySubtitle')}</p>
                  </div>
                </div>

                <div className="row mb-5">
                  <div className="col-12">
                    <h3 className="fw-bold mb-4">{t('eventsTitle')}</h3>
                    <div className="row g-4">
                      {eventsData.map(event => (
                        <div key={event.id} className="col-lg-4 col-md-6">
                          <motion.div 
                            className={`card h-100 shadow-sm ${darkMode ? 'bg-dark border-secondary' : 'bg-white'}`}
                            style={{ borderRadius: '1rem' }}
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className={`card-header border-0 ${event.type === 'online' ? 'bg-primary' : 'bg-success'} text-white`}>
                              <div className="d-flex justify-content-between align-items-center">
                                <span className="badge bg-light text-dark">{event.type === 'online' ? t('onlinePrograms') : t('offlineEvents')}</span>
                                <small>{event.date}</small>
                              </div>
                            </div>
                            <div className="card-body">
                              <h5 className="card-title fw-bold mb-3">{event.title}</h5>
                              <p className="text-muted mb-2">
                                <strong>{t('location2')}:</strong> {event.location}
                              </p>
                              <p className="card-text mb-3">{event.description}</p>
                              
                              <div className="d-flex justify-content-between align-items-center mb-3">
                                <span className="text-success fw-semibold">
                                  {event.registered}/{event.capacity} {t('registered')}
                                </span>
                                <div className="progress" style={{ width: '40%', height: '8px' }}>
                                  <div 
                                    className="progress-bar bg-success" 
                                    style={{ width: `${(event.registered / event.capacity) * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                              
                              <button className={`btn ${event.registered >= event.capacity ? 'btn-secondary' : 'btn-primary'} w-100`} disabled={event.registered >= event.capacity}>
                                {event.registered >= event.capacity ? 'Full' : t('registerNow')}
                              </button>
                            </div>
                          </motion.div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-lg-6 mb-4">
                    <div className={`card h-100 ${darkMode ? 'bg-dark border-secondary' : 'bg-white'}`} style={{ borderRadius: '1rem' }}>
                      <div className="card-header border-0 bg-transparent">
                        <h4 className="fw-bold">{t('programHighlights')}</h4>
                      </div>
                      <div className="card-body">
                        <ul className="list-unstyled">
                          <li className="mb-3 d-flex align-items-start">
                            <FaStethoscope className="text-primary me-3 mt-1" />
                            <div>
                              <strong>Health Screenings</strong><br />
                              <small className="text-muted">Free health checkups and consultations</small>
                            </div>
                          </li>
                          <li className="mb-3 d-flex align-items-start">
                            <FaPhone className="text-success me-3 mt-1" />
                            <div>
                              <strong>24/7 Helpline</strong><br />
                              <small className="text-muted">Emergency medical assistance</small>
                            </div>
                          </li>
                          <li className="mb-3 d-flex align-items-start">
                            <FaHospital className="text-info me-3 mt-1" />
                            <div>
                              <strong>{t('waterTesting')}</strong><br />
                              <small className="text-muted">Community water quality analysis</small>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-lg-6 mb-4">
                    <div className={`card h-100 ${darkMode ? 'bg-dark border-secondary' : 'bg-white'}`} style={{ borderRadius: '1rem' }}>
                      <div className="card-header border-0 bg-transparent">
                        <h4 className="fw-bold">Contact Information</h4>
                      </div>
                      <div className="card-body">
                        <div className="mb-3">
                          <strong>Emergency Helpline:</strong><br />
                          <span className="fs-4 fw-bold text-primary">108</span>
                        </div>
                        <div className="mb-3">
                          <strong>Program Coordination:</strong><br />
                          <span className="text-muted">+91-9876543210</span>
                        </div>
                        <div className="mb-3">
                          <strong>Email:</strong><br />
                          <span className="text-muted">outreach@healify.org</span>
                        </div>
                        <div>
                          <strong>Regional Offices:</strong><br />
                          <small className="text-muted">Guwahati, Shillong, Imphal, Aizawl, Agartala, Gangtok, Kohima, Itanagar</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'about' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="row mb-5">
                  <div className="col-12 text-center">
                    <h2 className="fw-bold mb-4">{t('aboutTitle')}</h2>
                  </div>
                </div>

                <div className="row mb-5">
                  <div className="col-lg-6 mb-4">
                    <div className={`card h-100 ${darkMode ? 'bg-dark border-secondary' : 'bg-white'}`} style={{ borderRadius: '1rem' }}>
                      <div className="card-body p-4">
                        <h4 className="fw-bold text-primary mb-3">{t('missionTitle')}</h4>
                        <p className="text-muted">{t('missionText')}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-lg-6 mb-4">
                    <div className={`card h-100 ${darkMode ? 'bg-dark border-secondary' : 'bg-white'}`} style={{ borderRadius: '1rem' }}>
                      <div className="card-body p-4">
                        <h4 className="fw-bold text-success mb-3">{t('visionTitle')}</h4>
                        <p className="text-muted">{t('visionText')}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row mb-5">
                  <div className="col-12">
                    <div className={`card ${darkMode ? 'bg-dark border-secondary' : 'bg-white'}`} style={{ borderRadius: '1rem' }}>
                      <div className="card-body p-4">
                        <h4 className="fw-bold mb-4">{t('techStack')}</h4>
                        <div className="row g-4">
                          <div className="col-md-3 col-6 text-center">
                            <div className={`p-3 rounded ${darkMode ? 'bg-secondary bg-opacity-25' : 'bg-light'}`}>
                              <FaRobot className="fs-1 text-primary mb-2" />
                              <h6 className="fw-semibold">AI & ML</h6>
                              <small className="text-muted">TensorFlow, PyTorch</small>
                            </div>
                          </div>
                          <div className="col-md-3 col-6 text-center">
                            <div className={`p-3 rounded ${darkMode ? 'bg-secondary bg-opacity-25' : 'bg-light'}`}>
                              <FaDatabase className="fs-1 text-success mb-2" />
                              <h6 className="fw-semibold">Data Analytics</h6>
                              <small className="text-muted">Python, R, MongoDB</small>
                            </div>
                          </div>
                          <div className="col-md-3 col-6 text-center">
                            <div className={`p-3 rounded ${darkMode ? 'bg-secondary bg-opacity-25' : 'bg-light'}`}>
                              <FaGlobe className="fs-1 text-info mb-2" />
                              <h6 className="fw-semibold">Web Platform</h6>
                              <small className="text-muted">React, Node.js</small>
                            </div>
                          </div>
                          <div className="col-md-3 col-6 text-center">
                            <div className={`p-3 rounded ${darkMode ? 'bg-secondary bg-opacity-25' : 'bg-light'}`}>
                              <FaPhone className="fs-1 text-warning mb-2" />
                              <h6 className="fw-semibold">Mobile App</h6>
                              <small className="text-muted">Flutter, React Native</small>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-12">
                    <div className={`card ${darkMode ? 'bg-dark border-secondary' : 'bg-white'}`} style={{ borderRadius: '1rem' }}>
                      <div className="card-body p-4 text-center">
                        <h4 className="fw-bold mb-4">{t('teamTitle')}</h4>
                        <p className="lead text-muted mb-4">
                          Our multidisciplinary team combines expertise in public health, artificial intelligence, data science, and community development.
                        </p>
                        <div className="row g-4">
                          <div className="col-lg-3 col-md-6">
                            <div className={`p-3 rounded ${darkMode ? 'bg-secondary bg-opacity-25' : 'bg-light'}`}>
                              <h6 className="fw-semibold">Public Health Experts</h6>
                              <small className="text-muted">Epidemiologists & Medical Professionals</small>
                            </div>
                          </div>
                          <div className="col-lg-3 col-md-6">
                            <div className={`p-3 rounded ${darkMode ? 'bg-secondary bg-opacity-25' : 'bg-light'}`}>
                              <h6 className="fw-semibold">AI Researchers</h6>
                              <small className="text-muted">Machine Learning & Deep Learning</small>
                            </div>
                          </div>
                          <div className="col-lg-3 col-md-6">
                            <div className={`p-3 rounded ${darkMode ? 'bg-secondary bg-opacity-25' : 'bg-light'}`}>
                              <h6 className="fw-semibold">Software Engineers</h6>
                              <small className="text-muted">Full-Stack Development</small>
                            </div>
                          </div>
                          <div className="col-lg-3 col-md-6">
                            <div className={`p-3 rounded ${darkMode ? 'bg-secondary bg-opacity-25' : 'bg-light'}`}>
                              <h6 className="fw-semibold">Community Liaisons</h6>
                              <small className="text-muted">Regional Coordinators</small>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </main>
        </div>
      </div>

      {chatOpen && (
        <motion.div 
          className={`position-fixed ${darkMode ? 'bg-dark border-secondary' : 'bg-white'} shadow-lg`}
          style={{
            bottom: '20px',
            right: '20px',
            width: '350px',
            height: '500px',
            zIndex: 1040,
            borderRadius: '1rem',
            border: '1px solid #dee2e6'
          }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="d-flex flex-column h-100">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center" style={{ borderRadius: '1rem 1rem 0 0' }}>
              <h6 className="mb-0 fw-bold">
                <FaRobot className="me-2" />
                {t('chatTitle')}
              </h6>
              <button className="btn btn-sm btn-outline-light" onClick={toggleChat}>
                <FaTimes />
              </button>
            </div>
            
            <div className="flex-grow-1 p-3 overflow-auto" ref={widgetChatRef} style={{ maxHeight: '350px' }}>
              {messages.map(message => (
                <div key={message.id} className={`mb-3 ${message.sender === 'user' ? 'text-end' : 'text-start'}`}>
                  <div className={`d-inline-block p-2 rounded ${
                    message.sender === 'user' 
                      ? 'bg-primary text-white' 
                      : darkMode 
                        ? 'bg-secondary text-light' 
                        : 'bg-light text-dark'
                  }`} style={{ maxWidth: '80%' }}>
                    <small>{message.text}</small>
                    <div className={`text-${message.sender === 'user' ? 'light' : 'muted'} mt-1`} style={{ fontSize: '0.7rem' }}>
                      {message.timestamp}
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="mb-3 text-start">
                  <div className={`d-inline-block p-2 rounded ${darkMode ? 'bg-secondary text-light' : 'bg-light text-dark'}`}>
                    <small>
                      <span className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </span>
                    </small>
                  </div>
                </div>
              )}
            </div>
            
            <div className="card-footer border-0" style={{ borderRadius: '0 0 1rem 1rem' }}>
              <div className="input-group">
                <input
                  type="text"
                  className={`form-control ${darkMode ? 'bg-dark text-light border-secondary' : ''}`}
                  placeholder={t('chatPlaceholder')}
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button 
                  className="btn btn-primary" 
                  onClick={handleSendMessage}
                  disabled={!userMessage.trim()}
                >
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default App;
