import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FaBars, FaTimes, FaHome, FaDatabase, FaChartBar, FaUsers, FaRobot, FaPhone, FaUpload, FaMoon, FaSun } from 'react-icons/fa';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'react-loading-skeleton/dist/skeleton.css';
import './App.css';

// Mock data for disease outbreaks
const diseaseOutbreaks = [
  { id: 1, name: "Dibrugarh Outbreak", state: "Assam", position: [27.4728, 95.0167], cases: 1250, severity: "critical", healthContact: "1800-123-4567", rate: 42 },
  { id: 2, name: "Guwahati Water Crisis", state: "Assam", position: [26.1445, 91.7362], cases: 890, severity: "high", healthContact: "1800-234-5678", rate: 35 },
  { id: 3, name: "Imphal Contamination", state: "Manipur", position: [24.8170, 93.9368], cases: 620, severity: "high", healthContact: "1800-345-6789", rate: 28 },
  { id: 4, name: "Shillong Health Alert", state: "Meghalaya", position: [25.5788, 91.8933], cases: 410, severity: "medium", healthContact: "1800-456-7890", rate: 22 },
  { id: 5, name: "Agartala Water Issue", state: "Tripura", position: [23.8315, 91.2868], cases: 280, severity: "medium", healthContact: "1800-567-8901", rate: 18 },
  { id: 6, name: "Aizawl Health Concern", state: "Mizoram", position: [23.7271, 92.7176], cases: 190, severity: "low", healthContact: "1800-678-9012", rate: 12 },
  { id: 7, name: "Kohima Water Alert", state: "Nagaland", position: [25.6751, 94.1086], cases: 150, severity: "low", healthContact: "1800-789-0123", rate: 10 }
];

// Northeast India statistics data
const northeastStats = [
  { state: "Assam", diarrhea: 3200, cholera: 1800, typhoid: 1200, hepatitis: 800 },
  { state: "Meghalaya", diarrhea: 1500, cholera: 900, typhoid: 600, hepatitis: 400 },
  { state: "Manipur", diarrhea: 1800, cholera: 1100, typhoid: 750, hepatitis: 500 },
  { state: "Nagaland", diarrhea: 900, cholera: 500, typhoid: 350, hepatitis: 250 },
  { state: "Tripura", diarrhea: 1200, cholera: 700, typhoid: 450, hepatitis: 300 },
  { state: "Mizoram", diarrhea: 800, cholera: 400, typhoid: 300, hepatitis: 200 },
  { state: "Arunachal Pradesh", diarrhea: 600, cholera: 300, typhoid: 200, hepatitis: 150 }
];

// Disease trends data
const diseaseTrends = [
  { month: 'Jan', diarrhea: 200, cholera: 120, typhoid: 80, hepatitis: 60 },
  { month: 'Feb', diarrhea: 250, cholera: 150, typhoid: 100, hepatitis: 70 },
  { month: 'Mar', diarrhea: 300, cholera: 180, typhoid: 120, hepatitis: 90 },
  { month: 'Apr', diarrhea: 400, cholera: 220, typhoid: 150, hepatitis: 110 },
  { month: 'May', diarrhea: 550, cholera: 280, typhoid: 190, hepatitis: 140 },
  { month: 'Jun', diarrhea: 700, cholera: 380, typhoid: 240, hepatitis: 180 },
  { month: 'Jul', diarrhea: 650, cholera: 350, typhoid: 230, hepatitis: 170 },
  { month: 'Aug', diarrhea: 480, cholera: 320, typhoid: 260, hepatitis: 210 },
  { month: 'Sep', diarrhea: 400, cholera: 280, typhoid: 220, hepatitis: 180 },
  { month: 'Oct', diarrhea: 320, cholera: 220, typhoid: 180, hepatitis: 150 },
  { month: 'Nov', diarrhea: 200, cholera: 150, typhoid: 120, hepatitis: 90 },
  { month: 'Dec', diarrhea: 150, cholera: 100, typhoid: 80, hepatitis: 60 }
];

// Team members data
const teamMembers = [
  { name: "Abhimanyu" },
  { name: "Siddharth" },
  { name: "Rudra" },
  { name: "Karan" },
  { name: "Ananya" },
  { name: "Rohan" }
];

// Community events data
const communityEvents = [
  { id: 1, title: "Water Safety Workshop", date: "2023-11-15", attendees: 42, status: "upcoming" },
  { id: 2, title: "Health Camp in Rural Areas", date: "2023-11-22", attendees: 68, status: "upcoming" },
  { id: 3, title: "Awareness Drive in Schools", date: "2023-11-30", attendees: 35, status: "upcoming" }
];

// This new component will render our interactive map
const OutbreakMap = ({ outbreaks, darkMode }) => {
  const mapCenter = [26.2006, 92.9376]; // Centered on Assam

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
      radius: 5 + (outbreak.cases / 3000), // Dynamic radius based on cases
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
              <div className="mb-2"><strong className="text-capitalize">Severity:</strong> <span style={{ color: getMarkerOptions(outbreak).fillColor }}>{outbreak.severity}</span></div>
              <hr className="my-2" />
              <div className="small mb-1"><FaPhone className="me-2 text-primary" /><strong>Helpline:</strong> {outbreak.healthContact}</div>
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
  const [darkMode, setDarkMode] = useState(false);
  const [selectedOutbreak, setSelectedOutbreak] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    location: '',
    symptoms: []
  });
  const [waterFormData, setWaterFormData] = useState({
    location: '',
    water_source_type: 'well',
    ph_level: '',
    turbidity: '',
    contaminantLevel: '',
    temperature: '',
    bacteria_count_cfu_ml: '',
    nitrate_level_mg_l: '',
    dissolved_oxygen_mg_l: ''
  });
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [language, setLanguage] = useState('en');
  const [waterAnalysisResult, setWaterAnalysisResult] = useState(null);
  const [waterAnalysisError, setWaterAnalysisError] = useState(null);
  const mainChatRef = useRef(null);
  const widgetChatRef = useRef(null);

  // FIX: Wrap the translations object in useMemo to prevent re-creation on every render.
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
      heroSubtitle: "Real-time surveillance and response system for waterborne diseases",
      outbreakTitle: "Diarrhea Outbreaks",
      statisticsTitle: "Comparison of Northeast States",
      trendsTitle: "Disease Trends (Monthly)",
      emergencyTitle: "Emergency Response Status",
      disease: "Disease",
      state: "State",
      severity: "Severity Level",
      responseTeam: "Response Team",
      lastUpdate: "Last Update",
      predictionTitle: "Submit Health Data for AI Disease Prediction",
      predictionSubtitle: "Select symptoms and patient data, and our AI will provide an initial analysis of potential waterborne diseases.",
      patientInfo: "Patient Information",
      fullName: "Full Name",
      age: "Age",
      gender: "Gender",
      location: "Location",
      symptoms: "Observed Symptoms",
      waterQuality: "Water Quality Parameters",
      waterSourceType: "Water Source Type",
      pH: "pH Level",
      turbidity: "Turbidity (NTU)",
      contaminantLevelPpm: "Contaminant Level (ppm)",
      waterTemperatureC: "Water Temperature (°C)",
      upload: "Upload File",
      submitButton: "Submit Data and Get Analysis",
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
      visionText: "To establish a comprehensive early warning system that empowers communities, healthcare workers, and government officials with real-time insights and actionable intelligence to effectively combat waterborne diseases.",
      techStack: "Technology Stack",
      teamTitle: "Our Team",
      critical: "Critical",
      high: "High",
      medium: "Medium",
      low: "Low",
      upcoming: "Upcoming",
      registered: "Registered",
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
      noDiseaseDetectedRemedy: "Please consult with a healthcare professional for an accurate diagnosis. Ensure you stay hydrated and monitor your symptoms.",
      genderOptions: {
        male: "Male",
        female: "Female",
        other: "Other"
      },
      symptomsList: [
        "Fever", "Diarrhea", "Vomiting", "Stomach Cramps", "Dehydration", 
        "Headache", "Fatigue", "Nausea", "Jaundice", "Dark Urine", 
        "Pale Stools", "Bloating", "Weight Loss"
      ],
      diseases: {
        cholera: {
          name: "Cholera",
          description: "A bacterial infection that causes severe diarrhea and dehydration. It is often transmitted through contaminated water.",
          remedies: [
            "Oral rehydration solution (ORS) is the primary treatment.",
            "Intravenous fluids for severe dehydration.",
            "Antibiotics may be prescribed in severe cases."
          ]
        },
        typhoid: {
          name: "Typhoid Fever",
          description: "A bacterial infection that can spread throughout the body, causing high fever, weakness, and gastrointestinal symptoms.",
          remedies: [
            "Antibiotics are the primary treatment.",
            "Complete the full course of antibiotics even if feeling better.",
            "Stay hydrated and get plenty of rest."
          ]
        },
        hepatitisA: {
          name: "Hepatitis A",
          description: "A viral liver disease that can cause mild to severe illness. It is transmitted through contaminated food or water.",
          remedies: [
            "Rest is essential for recovery.",
            "Avoid alcohol completely during recovery.",
            "Maintain a healthy diet to support liver function."
          ]
        },
        crypto: {
          name: "Cryptosporidiosis",
          description: "A diarrheal disease caused by the microscopic parasite Cryptosporidium. It can cause watery diarrhea and is a common cause of waterborne disease.",
          remedies: [
            "Most people recover without treatment.",
            "Drink plenty of fluids to prevent dehydration.",
            "Anti-diarrheal medications may help, but consult a doctor first."
          ]
        }
      },
      ai: {
        initialGreeting: "Hello! I'm Healify AI. How can I assist you with waterborne diseases today? You can ask me 'What causes cholera?' or 'How to prevent typhoid?'",
        fallback: "I'm sorry, I didn't understand that. Please ask about waterborne diseases, their symptoms, prevention methods, or cures."
      }
    },
    hi: {
      home: "होम",
      submitWaterData: "डेटा सबमिट करें",
      diseasePrediction: "रोग पूर्वानुमान",
      community: "सामुदायिक आउटरीच",
      aiAssistant: "एआई सहायक",
      about: "हमारे बारे में",
      language: "भाषा",
      english: "अंग्रेज़ी",
      hindi: "हिंदी",
      assamese: "असमिया",
      bengali: "बंगाली",
      heroTitle: "उत्तर-पूर्व भारत जलजनित रोग मॉनिटर",
      heroSubtitle: "जलजनित रोगों के लिए वास्तविक समय पर निगरानी और प्रतिक्रिया प्रणाली",
      outbreakTitle: "दस्त के प्रकोप",
      statisticsTitle: "उत्तर-पूर्वी राज्यों की तुलना",
      trendsTitle: "रोग प्रवृत्ति (मासिक)",
      emergencyTitle: "आपातकालीन प्रतिक्रिया स्थिति",
      disease: "रोग",
      state: "राज्य",
      severity: "गंभीरता स्तर",
      responseTeam: "प्रतिक्रिया टीम",
      lastUpdate: "अंतिम अद्यतन",
      predictionTitle: "एआई रोग पूर्वानुमान के लिए स्वास्थ्य डेटा सबमिट करें",
      predictionSubtitle: "लक्षण और रोगी डेटा चुनें, और हमारा एआई संभावित जलजनित बीमारियों का प्रारंभिक विश्लेषण प्रदान करेगा।",
      patientInfo: "रोगी की जानकारी",
      fullName: "पूरा नाम",
      age: "आयु",
      gender: "लिंग",
      location: "स्थान",
      symptoms: "देखे गए लक्षण",
      waterQuality: "जल गुणवत्ता मापदंड",
      waterSourceType: "जल स्रोत का प्रकार",
      pH: "पीएच स्तर",
      turbidity: "गंदलापन (NTU)",
      contaminantLevelPpm: "संदूषक स्तर (ppm)",
      waterTemperatureC: "पानी का तापमान (°C)",
      upload: "फ़ाइल अपलोड करें",
      submitButton: "डेटा सबमिट करें और विश्लेषण प्राप्त करें",
      analysisTitle: "एआई विश्लेषण परिणाम",
      analysisPlaceholder: "आपका विश्लेषण सबमिशन के बाद यहां दिखाई देगा।",
      analyzingPlaceholder: "हमारा एआई डेटा का विश्लेषण कर रहा है... कृपया प्रतीक्षा करें।",
      communityTitle: "सामुदायिक आउटरीच कार्यक्रम",
      communitySubtitle: "जल सुरक्षा और रोग की रोकथाम के बारे में जानने के लिए पूर्वोत्तर भारत में हमारी स्वास्थ्य शिक्षा पहलों और सामुदायिक कार्यक्रमों में शामिल हों।",
      eventsTitle: "आगामी कार्यक्रम",
      programHighlights: "कार्यक्रम की मुख्य विशेषताएं",
      onlinePrograms: "ऑनलाइन कार्यक्रम",
      offlineEvents: "ऑफलाइन कार्यक्रम",
      waterTesting: "जल परीक्षण",
      chatTitle: "हीलिफाई एआई सहायक",
      chatPlaceholder: "जलजनित रोगों के बारे में पूछें...",
      chatFeatures: "एआई सहायक की विशेषताएं",
      quickHelp: "त्वरित मदद",
      diseaseSymptoms: "रोग के लक्षण",
      preventionTips: "रोकथाम के उपाय",
      waterTesting2: "जल परीक्षण",
      aboutTitle: "हीलिफाई के बारे में",
      missionTitle: "हमारा मिशन",
      missionText: "हीलिफाई उन्नत एआई और मशीन लर्निंग तकनीकों के माध्यम से सार्वजनिक स्वास्थ्य निगरानी में क्रांति लाने के लिए समर्पित है। हमारा मिशन एक स्मार्ट स्वास्थ्य निगरानी प्रणाली बनाना है जो ग्रामीण पूर्वोत्तर भारत में कमजोर समुदायों में जलजनित बीमारियों के प्रकोप का पता लगाता है, निगरानी करता है और रोकता है।",
      visionTitle: "हमारा दृष्टिकोण",
      visionText: "एक व्यापक प्रारंभिक चेतावनी प्रणाली स्थापित करना जो समुदायों, स्वास्थ्य देखभाल कर्मचारियों और सरकारी अधिकारियों को वास्तविक समय की अंतर्दृष्टि और कार्रवाई योग्य बुद्धिमत्ता प्रदान करके जलजनित रोगों के प्रभावी रूप से मुकाबला करने में सक्षम बनाता है।",
      techStack: "प्रौद्योगिकी स्टैक",
      teamTitle: "हमारी टीम",
      critical: "गंभीर",
      high: "उच्च",
      medium: "मध्यम",
      low: "कम",
      upcoming: "आगामी",
      registered: "पंजीकृत",
      registerNow: "अभी पंजीकरण करें",
      description: "विवरण",
      prevention: "रोकथाम के तरीके",
      reportedCases: "रिपोर्ट किए गए मामले",
      rate: "दर",
      cases: "मामले",
      location2: "स्थान",
      send: "भेजें",
      aboutAI: "हीलिफाई एआई के बारे में",
      aboutAIText: "हमारा एआई सहायक कई भाषाओं में जलजनित रोगों, रोकथाम के तरीकों और स्वास्थ्य संसाधनों के बारे में आपके सवालों के तुरंत जवाब देता है।",
      symptomsTitle: "लक्षण:",
      preventionTitle: "रोकथाम के तरीके:",
      remediesTitle: "इलाज और उपचार",
      statistics: "प्रकोप के आँकड़े",
      probability: "मिलान स्कोर",
      noDiseaseDetectedTitle: "कोई विशेष रोग नहीं मिला",
      noDiseaseDetectedDescription: "लक्षणों का संयोजन हमारे डेटाबेस में किसी एक जलजनित रोग से दृढ़ता से मेल नहीं खाता है। यह किसी बीमारी को खारिज नहीं करता है।",
      noDiseaseDetectedRemedy: "सटीक निदान के लिए कृपया स्वास्थ्य देखभाल पेशेवर से परामर्श लें। सुनिश्चित करें कि आप पर्याप्त तरल पदार्थ लें और अपने लक्षणों पर नज़र रखें।",
      genderOptions: {
        male: "पुरुष",
        female: "महिला",
        other: "अन्य"
      },
      symptomsList: [
        "बुखार", "दस्त", "उल्टी", "पेट दर्द", "निर्जलीकरण", 
        "सिरदर्द", "थकान", "उबकारा", "पीलिया", "गहरे रंग का पेशाब", 
        "हल्के रंग के मल", "पेट फूलना", "वजन घटना"
      ],
      diseases: {
        cholera: {
          name: "हैज़ा",
          description: "एक बैक्टीरियोलॉजिकल संक्रमण जो गंभीर दस्त और निर्जलीकरण का कारण बनता है। यह अक्सर संदूषित पानी के माध्यम से संचारित होता है।",
          remedies: [
            "मौखिक पुनर्जलीकरण समाधान (ओआरएस) प्राथमिक उपचार है।",
            "गंभीर निर्जलीकरण के लिए इंट्रावेनस तरल पदार्थ।",
            "गंभीर मामलों में एंटीबायोटिक्स निर्धारित किया जा सकता है।"
          ]
        },
        typhoid: {
          name: "टाइफाइड बुखार",
          description: "एक बैक्टीरियोलॉजिकल संक्रमण जो पूरे शरीर में फैल सकता है, जिससे उच्च बुखार, कमजोरी और पाचन संबंधी लक्षण होते हैं।",
          remedies: [
            "एंटीबायोटिक्स प्राथमिक उपचार हैं।",
            "अच्छा महसूस करने पर भी एंटीबायोटिक्स का पूरा कोर्स पूरा करें।",
            "पर्याप्त तरल पदार्थ लें और बहुत आराम करें।"
          ]
        },
        hepatitisA: {
          name: "हेपेटाइटिस ए",
          description: "एक वायरल जिगर की बीमारी जो हल्की से गंभीर बीमारी का कारण बन सकती है। यह संदूषित भोजन या पानी के माध्यम से संचारित होती है।",
          remedies: [
            "रिकवरी के लिए आराम आवश्यक है।",
            "रिकवरी के दौरान पूरी तरह से शराब से बचें।",
            "जिगर के कार्य को समर्थित करने के लिए स्वस्थ आहार बनाए रखें।"
          ]
        },
        crypto: {
          name: "क्रिप्टोस्पोरिडियोसिस",
          description: "सूक्ष्मजीवी क्रिप्टोस्पोरिडियम द्वारा उत्पन्न एक दस्त रोग। यह पानी के दस्त का कारण बन सकता है और जलजनित रोगों का एक सामान्य कारण है।",
          remedies: [
            "अधिकांश लोग उपचार के बिना ठीक हो जाते हैं।",
            "निर्जलीकरण को रोकने के लिए पर्याप्त मात्रा में तरल पदार्थ पीएं।",
            "एंटी-डायरियल दवाएं मदद कर सकती हैं, लेकिन पहले डॉक्टर से परामर्श करें।"
          ]
        }
      },
      ai: {
        initialGreeting: "नमस्ते! मैं हीलिफाई एआई हूँ। मैं आज आपकी जलजनित बीमारियों के बारे में कैसे सहायता कर सकता हूँ? आप मुझसे 'हैज़ा का कारण क्या है?' या 'टाइफाइड कैसे रोकें?' पूछ सकते हैं।",
        fallback: "क्षमा करें, मुझे वह समझ नहीं आया। कृपया जलजनित रोगों, उनके लक्षणों, रोकथाम के तरीकों या उपचार के बारे में पूछें।"
      }
    },
    as: {
      home: "ঘৰ",
      submitWaterData: "তথ্য জমা দিয়ক",
      diseasePrediction: "ৰোগৰ পূৰ্বানুমান",
      community: "সামাজিক প্ৰসাৰণ",
      aiAssistant: "এআই সহায়ক",
      about: "আমাৰ বিষয়ে",
      language: "ভাষা",
      english: "ইংৰাজী",
      hindi: "হিন্দী",
      assamese: "অসমীয়া",
      bengali: "বাংলা",
      heroTitle: "উত্তৰ-পূৱ ভাৰত জলবাহিত ৰোগ মনিটৰ",
      heroSubtitle: "জল-বাহিত ৰোগৰ বাবে ৰিয়েল-টাইম নজৰদাৰি আৰু প্ৰতিক্ৰিয়া ব্যৱস্থা",
      outbreakTitle: "ডায়ৰিয়াৰ প্ৰাদুৰ্ভাৱ",
      statisticsTitle: "উত্তৰ-পূৱ ৰাজ্যসমূহৰ তুলনা",
      trendsTitle: "ৰোগৰ প্ৰৱণতা (মাহিক)",
      emergencyTitle: "জৰুৰী প্ৰতিক্ৰিয়া স্থিতি",
      disease: "ৰোগ",
      state: "ৰাজ্য",
      severity: "গুৰুত্বৰ স্তৰ",
      responseTeam: "প্ৰতিক্ৰিয়া দল",
      lastUpdate: "সৰ্বশেষ আপডেট",
      predictionTitle: "এআই ৰোগ পূৰ্বাভাসৰ বাবে স্বাস্থ্য তথ্য জমা দিয়ক",
      predictionSubtitle: "লক্ষণ আৰু ৰোগীৰ তথ্য বাছনি কৰক, আৰু আমাৰ এআইয়ে সম্ভাৱ্য জলবাহিত ৰোগৰ প্ৰাৰম্ভিক বিশ্লেষণ প্ৰদান কৰিব।",
      patientInfo: "ৰোগীৰ তথ্য",
      fullName: "সম্পূৰ্ণ নাম",
      age: "বয়স",
      gender: "লিংগ",
      location: "অৱস্থান",
      symptoms: "পৰ্যবেক্ষিত লক্ষণ",
      waterQuality: "পানীৰ গুণ মাপদণ্ড",
      waterSourceType: "পানীৰ উৎসৰ ধৰণ",
      pH: "পিএইচ স্তৰ",
      turbidity: "গন্ধলাপন (NTU)",
      contaminantLevelPpm: "দূষকৰ স্তৰ (ppm)",
      waterTemperatureC: "পানীৰ তাপমাত্ৰা (°C)",
      upload: "ফাইল আপলোড কৰক",
      submitButton: "তথ্য জমা দিয়ক আৰু বিশ্লেষণ প্ৰাপ্ত কৰক",
      analysisTitle: "এআই বিশ্লেষণৰ ফলাফল",
      analysisPlaceholder: "আপোনাৰ বিশ্লেষণ দাখিলৰ পিছত ইয়াত দেখা যাব।",
      analyzingPlaceholder: "আমাৰ এআই-এ তথ্য বিশ্লেষণ কৰি আছে... অনুগ্ৰহ কৰি অপেক্ষা কৰক।",
      communityTitle: "সামাজিক প্ৰসাৰণ কাৰ্যসূচী",
      communitySubtitle: "পানীৰ সুৰক্ষা আৰু ৰোগ প্ৰতিৰোধৰ বিষয়ে জানিবলৈ উত্তৰ-পূব ভাৰতত আমাৰ স্বাস্থ্য শিক্ষাৰ পদক্ষেপ আৰু সামাজিক কাৰ্যসূচীত যোগদান কৰক।",
      eventsTitle: "আগন্তুক কাৰ্যসূচী",
      programHighlights: "কাৰ্যসূচীৰ মুখ্য অংশ",
      onlinePrograms: "অনলাইন কাৰ্যসূচী",
      offlineEvents: "অফলাইন কাৰ্যসূচী",
      waterTesting: "পানী পৰীক্ষা",
      chatTitle: "হিলিফাই এআই সহায়ক",
      chatPlaceholder: "জলবাহিত ৰোগৰ বিষয়ে সোধক...",
      chatFeatures: "এআই সহায়কৰ বৈশিষ্ট্য",
      quickHelp: "দ্ৰুত সহায়",
      diseaseSymptoms: "ৰোগৰ লক্ষণ",
      preventionTips: "প্ৰতিৰোধৰ উপায়",
      waterTesting2: "পানী পৰীক্ষা",
      aboutTitle: "হিলিফাইৰ বিষয়ে",
      missionTitle: "আমাৰ উদ্দেশ্য",
      missionText: "হিলিফাই উন্নত এআই আৰু মেচিন লাৰ্নিং প্ৰযুক্তিৰ জৰিয়তে জনস্বাস্থ্য নিৰীক্ষণত বৈপ্লৱিক পৰিৱৰ্তন আনিবলৈ সমৰ্পিত। আমাৰ উদ্দেশ্য হৈছে গ্ৰাম্য উত্তৰ-পূব ভাৰতৰ দুৰ্বল সম্প্ৰদায়সমূহত জলবাহিত ৰোগৰ প্ৰাদুৰ্ভাৱ চিনাক্ত, নিৰীক্ষণ আৰু প্ৰতিৰোধ কৰা এক স্মাৰ্ট স্বাস্থ্য নিৰীক্ষণ প্ৰণালী সৃষ্টি কৰা।",
      visionTitle: "আমাৰ দৃষ্টিভংগী",
      visionText: "সম্প্ৰদায়, স্বাস্থ্যকৰ্মী আৰু চৰকাৰী কৰ্মচাৰীসকলক ৰিয়েল-টাইম অন্তৰ্দৃষ্টি আৰু কাৰ্যকৰ বুদ্ধিমত্তাৰ সৈতে জলবাহিত ৰোগৰ বিৰুদ্ধে কাৰ্যকৰভাৱে লড়াই কৰাৰ বাবে এক ব্যাপক প্ৰাথমিক সতৰ্কতা ব্যৱস্থা স্থাপন কৰা।",
      techStack: "প্ৰযুক্তি স্ট্যাক",
      teamTitle: "আমাৰ দল",
      critical: "সংকটজনক",
      high: "উচ্চ",
      medium: "মাজাৰি",
      low: "নিম্ন",
      upcoming: "আহন্তুক",
      registered: "পঞ্জীকৃত",
      registerNow: "এতিয়া পঞ্জীকৰণ কৰক",
      description: "বিৱৰণ",
      prevention: "প্ৰতিৰোধৰ উপায়",
      reportedCases: "প্ৰতিবেদন কৰা মামলাসমূহ",
      rate: "হাৰ",
      cases: "মামলাসমূহ",
      location2: "অৱস্থান",
      send: "পঠিয়াওক",
      aboutAI: "হিলিফাই এআইৰ বিষয়ে",
      aboutAIText: "আমাৰ এআই সহায়কে বহু ভাষাত জলবাহিত ৰোগ, প্ৰতিৰোধ পদ্ধতি আৰু স্বাস্থ্য সম্পদৰ বিষয়ে আপোনাৰ প্ৰশ্নৰ তৎকালীন উত্তৰ দিয়ে।",
      symptomsTitle: "লক্ষণসমূহ:",
      preventionTitle: "প্ৰতিৰোধ পদ্ধতি:",
      remediesTitle: "নিৰাময় আৰু প্ৰতিকাৰ",
      statistics: "প্ৰাদুৰ্ভাৱৰ পৰিসংখ্যা",
      probability: "মিল স্কোৰ",
      noDiseaseDetectedTitle: "কোনো নিৰ্দিষ্ট ৰোগ ধৰা পৰা নাই",
      noDiseaseDetectedDescription: "লক্ষণসমূহৰ সংমিশ্ৰণে আমাৰ ডাটাবেছত কোনো এটা জলবাহিত ৰোগৰ সৈতে শক্তিশালীভাৱে মিল নাখায়। ই কোনো ৰোগ নুই নকৰে।",
      noDiseaseDetectedRemedy: "সঠিক ৰোগ নিৰ্ণয়ৰ বাবে অনুগ্ৰহ কৰি এজন স্বাস্থ্যসেৱা পেছাদাৰীৰ সৈতে পৰামৰ্শ কৰক। আপুনি হাইড্ৰেটেড থকাটো নিশ্চিত কৰক আৰু আপোনাৰ লক্ষণসমূহ নিৰীক্ষণ কৰক।",
      genderOptions: {
        male: "পুৰুষ",
        female: "মহিলা",
        other: "অন্য"
      },
      symptomsList: [
        "জ্বৰ", "ডায়েৰিয়া", "বমি", "পেটৰ বিষ", "ডিহাইড্ৰেচন", 
        "মূৰৰ বিষ", "ভাগৰ", "বমি ভাব", "জণ্ডিচ", "গাঢ় ৰঙৰ প্ৰস্ৰাৱ", 
        "গোলাপী দাগ", "পেট ফুলা", "ওজন হ্ৰাস"
      ],
      diseases: {
        cholera: {
          name: "হলেৰা",
          description: "এক বেক্টেৰিয়াল সংক্ৰমণ যি গুৰুতৰ ডায়ৰিয়া আৰু ডিহাইড্ৰেচনৰ কাৰণ হয়। ই প্ৰায়ে দূষিত পানীৰ জৰিয়তে সংক্ৰমিত হয়।",
          remedies: [
            "মৌখিক পুনৰ্জলীকৰণ সমাধান (ওআৰএছ) হৈছে প্ৰাথমিক চিকিৎসা।",
            "গুৰুতৰ ডিহাইড্ৰেচনৰ বাবে ইন্ট্ৰাভেনাছ তৰল।",
            "গুৰুতৰ মামলাত এন্টিবায়টিক নিৰ্ধাৰিত কৰা হ'ব পাৰে।"
          ]
        },
        typhoid: {
          name: "টাইফয়েড জ্বৰ",
          description: "এক বেক্টেৰিয়াল সংক্ৰমণ যি সমগ্ৰ শৰীৰত প্ৰসাৰিত হ'ব পাৰে, যাৰ ফলত উচ্চ জ্বৰ, দুৰ্বলতা আৰু পাচন সংক্ৰান্ত লক্ষণ হয়।",
          remedies: [
            "এন্টিবায়টিক হৈছে প্ৰাথমিক চিকিৎসা।",
            "ভাল অনুভৱ কৰিলেও এন্টিবায়টিকৰ সম্পূৰ্ণ কোৰ্চ সম্পূৰ্ণ কৰক।",
            "পৰ্যাপ্ত তৰল পদাৰ্থ গ্ৰহণ কৰক আৰু বেছি আৰাম কৰক।"
          ]
        },
        hepatitisA: {
          name: "হেপেটাইটিচ এ",
          description: "এক ভাইৰাল যকৃত ৰোগ যি হালকৈ পৰা গুৰুতৰ অসুস্থতাৰ কাৰণ হ'ব পাৰে। ই দূষিত খাদ্য বা পানীৰ জৰিয়তে সংক্ৰমিত হয়।",
          remedies: [
            "ৰিকভাৰীৰ বাবে আৰাম অত্যন্ত প্ৰয়োজনীয়।",
            "ৰিকভাৰীৰ সময়ত এলকহলৰ পৰা সম্পূৰ্ণভাৱে বিৰত থাকক।",
            "যকৃতৰ কাৰ্য সমৰ্থন কৰিবলৈ এটা স্বাস্থ্যকৰ আহাৰ অনুসৰণ কৰক।"
          ]
        },
        crypto: {
          name: "ক্ৰিপ্টোস্প'ৰিডিওচিছ",
          description: "অণুবীক্ষণিক পৰজীৱী ক্ৰিপ্টোস্প'ৰিডিয়ামৰ ফলত হোৱা এক ডায়েৰিয়া ৰোগ। ই পনীয়া ডায়েৰিয়াৰ সৃষ্টি কৰিব পাৰে আৰু ই জলবাহিত ৰোগৰ এক সাধাৰণ কাৰণ।",
          remedies: [
            "বেছিভাগ লোক চিকিৎসা অবিহনে আৰোগ্য হয়।",
            "ডিহাইড্ৰেচন প্ৰতিৰোধ কৰিবলৈ যথেষ্ট তৰল পদাৰ্থ পান কৰক।",
            "ডায়েৰিয়া-প্ৰতিৰোধী ঔষধে সহায় কৰিব পাৰে, কিন্তু প্ৰথমে চিকিৎসকৰ পৰামৰ্শ লওক।"
          ]
        }
      },
      ai: {
        initialGreeting: "নমস্কাৰ! মই হিলিফাই এআই। মই আজি আপোনাক জলবাহিত ৰোগৰ বিষয়ে কেনেদৰে সহায় কৰিব পাৰোঁ? আপুনি মোক 'কলেৰাৰ কাৰণ কি?' বা 'টাইফয়েড কেনেকৈ প্ৰতিৰোধ কৰিব?' আদি প্ৰশ্ন সুধিব পাৰে।",
        fallback: "ক্ষমা কৰিব, মই তেওঁৰ বুজি পোৱা নাই। জলবাহিত ৰোগ, সিহঁতৰ লক্ষণ, প্ৰতিৰোধৰ উপায় বা চিকিৎসাৰ বিষয়ে প্ৰশ্ন কৰক।"
      }
    },
    bn: {
      home: "হোম",
      submitWaterData: "ডেটা জমা দিন",
      diseasePrediction: "রোগ পূর্বাভাস",
      community: "সম্প্রদায় আউটরিচ",
      aiAssistant: "এআই সহকারী",
      about: "আমাদের সম্পর্কে",
      language: "ভাষা",
      english: "ইংরেজি",
      hindi: "হিন্দি",
      assamese: "অসমিয়া",
      bengali: "বাংলা",
      heroTitle: "উত্তর-পূর্ব ভারত জলবাহিত রোগ মনিটর",
      heroSubtitle: "জল-বাহিত রোগের জন্য রিয়েল-টাইম নজরদারি এবং প্রতিক্রিয়া ব্যবস্থা",
      outbreakTitle: "ডায়রিয়ার প্রাদুর্ভাব",
      statisticsTitle: "উত্তর-পূর্ব রাজ্যগুলির তুলনা",
      trendsTitle: "রোগের প্রবণতা (মাসিক)",
      emergencyTitle: "জরুরী প্রতিক্রিয়া স্থিতি",
      disease: "রোগ",
      state: "রাজ্য",
      severity: "গুরুতরতার স্তর",
      responseTeam: "প্রতিক্রিয়া দল",
      lastUpdate: "শেষ আপডেট",
      predictionTitle: "এআই রোগ পূর্বাভাসের জন্য স্বাস্থ্য ডেটা জমা দিন",
      predictionSubtitle: "লক্ষণ এবং রোগীর ডেটা নির্বাচন করুন, এবং আমাদের এআই সম্ভাব্য জলবাহিত রোগের প্রাথমিক বিশ্লেষণ প্রদান করবে।",
      patientInfo: "রোগীর তথ্য",
      fullName: "পুরো নাম",
      age: "বয়স",
      gender: "লিঙ্গ",
      location: "অবস্থান",
      symptoms: "পর্যবেক্ষিত লক্ষণ",
      waterQuality: "জল গুণমান পরামিতি",
      waterSourceType: "জল উৎসের ধরন",
      pH: "পিএইচ স্তর",
      turbidity: "গন্ধলাপন (NTU)",
      contaminantLevelPpm: "দূষকের স্তর (ppm)",
      waterTemperatureC: "জলের তাপমাত্রা (°C)",
      upload: "ফাইল আপলোড করুন",
      submitButton: "ডেটা জমা দিন এবং বিশ্লেষণ পান",
      analysisTitle: "এআই বিশ্লেষণ ফলাফল",
      analysisPlaceholder: "আপনার বিশ্লেষণ জমা দেওয়ার পরে এখানে উপস্থিত হবে।",
      analyzingPlaceholder: "আমাদের এআই ডেটা বিশ্লেষণ করছে... অনুগ্রহ করে অপেক্ষা করুন।",
      communityTitle: "সম্প্রদায় আউটরিচ প্রোগ্রাম",
      communitySubtitle: "জল নিরাপত্তা এবং রোগ প্রতিরোধ সম্পর্কে জানতে উত্তর-পূর্ব ভারত জুড়ে আমাদের স্বাস্থ্য শিক্ষা উদ্যোগ এবং সম্প্রদায় ইভেন্টগুলিতে যোগ দিন।",
      eventsTitle: "আসন্ন ঘটনাবলী",
      programHighlights: "প্রোগ্রামের হাইলাইটস",
      onlinePrograms: "অনলাইন প্রোগ্রাম",
      offlineEvents: "অফলাইন ইভেন্টস",
      waterTesting: "জল পরীক্ষা",
      chatTitle: "হিলিফাই এআই সহকারী",
      chatPlaceholder: "জলবাহিত রোগের বিষয়ে জিজ্ঞাসা করুন...",
      chatFeatures: "এআই সহকারীর বৈশিষ্ট্য",
      quickHelp: "দ্রুত সাহায্য",
      diseaseSymptoms: "রোগের লক্ষণ",
      preventionTips: "প্রতিরোধ পদ্ধতি",
      waterTesting2: "জল পরীক্ষা",
      aboutTitle: "হিলিফাই সম্পর্কে",
      missionTitle: "আমাদের মিশন",
      missionText: "হিলিফাই উন্নত এআই এবং মেশিন লার্নিং প্রযুক্তির মাধ্যমে জনস্বাস্থ্য নিরীক্ষণে বিপ্লব আনতে নিবেদিত। আমাদের মিশন হল একটি স্মার্ট স্বাস্থ্য নিরীক্ষণ সিস্টেম তৈরি করা যা গ্রামীণ উত্তর-পূর্ব ভারতের দুর্বল সম্প্রদায়গুলিতে জলবাহিত রোগের প্রাদুর্ভাব সনাক্ত করবে, নিরীক্ষণ করবে এবং প্রতিরোধ করবে।",
      visionTitle: "আমাদের দৃষ্টি",
      visionText: "একটি ব্যাপক প্রারম্ভিক সতর্কতা ব্যবস্থা প্রতিষ্ঠা করা যা সম্প্রদায়, স্বাস্থ্যকর্মী এবং সরকারী কর্মকর্তাদেরকে জলবাহিত রোগের বিরুদ্ধে কার্যকরভাবে লড়াই করার জন্য রিয়েল-টাইম অন্তর্দৃষ্টি এবং কার্যকরী বুদ্ধিমত্তা দিয়ে শক্তিশালী করে।",
      techStack: "প্রযুক্তি স্ট্যাক",
      teamTitle: "আমাদের দল",
      critical: "সংকটজনক",
      high: "উচ্চ",
      medium: "মাঝারি",
      low: "নিম্ন",
      upcoming: "আসন্ন",
      registered: "নিবন্ধিত",
      registerNow: "এখন নিবন্ধন করুন",
      description: "বিবরণ",
      prevention: "প্রতিরোধ পদ্ধতি",
      reportedCases: "রিপোর্ট করা কেস",
      rate: "হার",
      cases: "কেস",
      location2: "অবস্থান",
      send: "প্রেরণ",
      aboutAI: "হিলিফাই এআই সম্পর্কে",
      aboutAIText: "আমাদের এআই সহকারী একাধিক ভাষায় জলবাহিত রোগ, প্রতিরোধ পদ্ধতি এবং স্বাস্থ্য সম্পদ সম্পর্কে আপনার প্রশ্নের তাত্ক্ষণিক উত্তর প্রদান করে।",
      symptomsTitle: "লক্ষণ:",
      preventionTitle: "প্রতিরোধ পদ্ধতি:",
      remediesTitle: "নিরাময় ও প্রতিকার",
      statistics: "প্রাদুর্ভাবের পরিসংখ্যান",
      probability: "ম্যাচ স্কোর",
      noDiseaseDetectedTitle: "কোনো নির্দিষ্ট রোগ সনাক্ত করা যায়নি",
      noDiseaseDetectedDescription: "লক্ষণগুলির সংমিশ্রণ আমাদের ডাটাবেসের কোনো একক জলবাহিত রোগের সাথে দৃঢ়ভাবে মেলে না। এটি কোনো অসুস্থতা বাতিল করে না।",
      noDiseaseDetectedRemedy: "সঠিক নির্ণয়ের জন্য অনুগ্রহ করে একজন স্বাস্থ্যসেবা পেশাদারের সাথে পরামর্শ করুন। আপনি হাইড্রেটেড আছেন তা নিশ্চিত করুন এবং আপনার লক্ষণগুলি পর্যবেক্ষণ করুন।",
      genderOptions: {
        male: "পুরুষ",
        female: "মহিলা",
        other: "অন্যান্য"
      },
      symptomsList: [
        "জ্বর", "ডায়রিয়া", "বমি", "পেটে ব্যথা", "ডিহাইড্রেশন", 
        "মাথাব্যথা", "ক্লান্তি", "বমি বমি ভাব", "জন্ডিস", "গাঢ় রঙের প্রস্রাব", 
        "গোলাপী দাগ", "পেট ফাঁপা", "ওজন হ্রাস"
      ],
      diseases: {
        cholera: {
          name: "হলেরা",
          description: "একটি ব্যাকটেরিয়াল সংক্রমণ যা গুরুতর ডায়রিয়া এবং ডিহাইড্রেশন সৃষ্টি করে। এটি প্রায়শই দূষিত জলের মাধ্যমে সংক্রমিত হয়।",
          remedies: [
            "মৌখিক পুনর্জলায়ন সমাধান (ওআরএস) হল প্রাথমিক চিকিত্সা।",
            "গুরুতর ডিহাইড্রেশনের জন্য ইন্ট্রাভেনাস তরল।",
            "গুরুতর ক্ষেত্রে অ্যান্টিবায়োটিক নির্ধারিত করা হতে পারে।"
          ]
        },
        typhoid: {
          name: "টাইফয়েড জ্বর",
          description: "একটি ব্যাকটেরিয়াল সংক্রমণ যা সমগ্র শরীরে ছড়িয়ে পড়তে পারে, যা উচ্চ জ্বর, দুর্বলতা এবং পাচন সংক্রান্ত লক্ষণ সৃষ্টি করে।",
          remedies: [
            "অ্যান্টিবায়োটিক হল প্রাথমিক চিকিত্সা।",
            "ভাল অনুভব করলেও অ্যান্টিবায়োটিকের সম্পূর্ণ কোর্স শেষ করুন।",
            "পর্যাপ্ত তরল পান করুন এবং প্রচুর বিশ্রাম নিন।"
          ]
        },
        hepatitisA: {
          name: "হেপাটাইটিস এ",
          description: "একটি ভাইরাল যকৃত রোগ যা হালকা থেকে গুরুতর অসুস্থতা সৃষ্টি করতে পারে। এটি দূষিত খাবার বা জলের মাধ্যমে সংক্রমিত হয়।",
          remedies: [
            "রিকভারির জন্য বিশ্রাম অপরিহার্য।",
            "রিকভারির সময় সম্পূর্ণভাবে অ্যালকোহল থেকে বিরত থাকুন।",
            "যকৃতের কাজকে সমর্থন করতে স্বাস্থ্যকর ডায়েট বজায় রাখুন।"
          ]
        },
        crypto: {
          name: "ক্রিপ্টোস্পোরিডিওসিস",
          description: "অণুবীক্ষণিক পরজীবী ক্রিপ্টোস্পোরিডিয়াম দ্বারা সৃষ্ট একটি ডায়রিয়ার রোগ। এটি জলীয় ডায়রিয়ার কারণ হতে পারে এবং এটি জলবাহিত রোগের একটি সাধারণ কারণ।",
          remedies: [
            "বেশিরভাগ লোক চিকিৎসা ছাড়াই সুস্থ হয়ে ওঠে।",
            "ডিহাইড্রেশন প্রতিরোধ করতে প্রচুর পরিমাণে তরল পান করুন।",
            "অ্যান্টি-ডায়রিয়াল ওষুধ সাহায্য করতে পারে, তবে প্রথমে একজন ডাক্তারের সাথে পরামর্শ করুন।"
          ]
        }
      },
      ai: {
        initialGreeting: "নমস্কার! আমি হিলিফাই এআই। আমি আজ আপনাকে জলবাহিত রোগ সম্পর্কে কীভাবে সহায়তা করতে পারি? আপনি আমাকে জিজ্ঞাসা করতে পারেন 'কলেরার কারণ কী?' বা 'টাইফয়েড কীভাবে প্রতিরোধ করবেন?'",
        fallback: "দুঃখিত, আমি বুঝতে পারিনি। জলবাহিত রোগ, তাদের লক্ষণ, প্রতিরোধ পদ্ধতি বা চিকিত্সা সম্পর্কে জিজ্ঞাসা করুন।"
      }
    }
  }), []); // Empty dependency array means it won't recompute unless needed

  // FIX: Wrap the 't' function in useCallback to prevent re-creation on every render.
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
  }, [language, translations]); // Dependency array includes 'language' and 'translations' so 't' updates when they change.

  useEffect(() => {
    setMessages([{
      id: 1,
      text: t('ai.initialGreeting'),
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
  }, [language, t]); // Now 't' is stable and won't cause unnecessary re-renders.

  // ✨ NEW: Enhanced AI Knowledge Base
  const diseaseInfoDatabase = {
    hepatitisA: {
      name: "Hepatitis A",
      keywords: ["hepatitis", "jaundice", "hav"],
      info: {
        symptoms: "Fatigue, nausea, abdominal pain, loss of appetite, low-grade fever, dark urine, clay-colored bowel movements, joint pain, yellowing of the skin and eyes (jaundice).",
        causes: "Hepatitis A is caused by the hepatitis A virus (HAV). It's spread when a person ingests fecal matter — even in microscopic amounts — from contact with objects, food or drinks contaminated by the feces of an infected person.",
        treatment: "There is no specific antiviral treatment for hepatitis A. Treatment focuses on keeping comfortable and controlling signs and symptoms of the disease. This includes resting, eating small meals, avoiding alcohol, and managing nausea.",
        prevention: "The best way to prevent hepatitis A is vaccination. Other preventive measures include good hygiene, safe food practices, and avoiding contaminated water."
      }
    },
    cholera: {
      name: "Cholera",
      keywords: ["cholera", "vibrio", "rice-water stool"],
      info: {
        symptoms: "Cholera infection is often mild or without symptoms, but can sometimes be severe. Approximately 1 in 10 infected persons will have severe disease characterized by profuse watery diarrhea, vomiting, and leg cramps. Rapid loss of body fluids leads to dehydration and shock.",
        causes: "Cholera is caused by the bacterium Vibrio cholerae. The infection is often mild or without symptoms, but can sometimes be severe. People contract cholera by drinking water or eating food contaminated with cholera bacteria.",
        treatment: "Cholera can be simply and successfully treated by immediate replacement of the fluid and salts lost through diarrhea. Patients can be treated with oral rehydration solution (ORS), a prepackaged mixture of sugar and salts to be mixed with water. Severe cases also need intravenous fluid replacement.",
        prevention: "Three oral cholera vaccines are prequalified by the World Health Organization. Preventive measures include access to safe water and sanitation, proper hygiene practices, and health education."
      }
    },
    typhoid: {
      name: "Typhoid Fever",
      keywords: ["typhoid", "salmonella", "enteric fever"],
      info: {
        symptoms: "Typhoid fever is characterized by poor appetite, headache, generalized aches and pains, fever, and lethargy. Intestinal bleeding or perforation can occur in the third week of illness. Some patients develop a rash of flat, rose-colored spots.",
        causes: "Typhoid fever is caused by the bacterium Salmonella typhi. People with acute illness can contaminate the water supply through their stool, which contains a lot of the bacteria. Contamination of the water supply can lead to outbreaks of typhoid fever.",
        treatment: "Antibiotics such as ciprofloxacin, azithromycin, and ceftriaxone are used to treat typhoid fever. With appropriate antibiotic therapy, symptoms usually begin to improve within 2 to 3 days. Without treatment, typhoid fever can be fatal.",
        prevention: "Vaccines are available to prevent typhoid fever. Preventive measures include access to safe water and sanitation, proper hygiene practices, and avoiding raw or undercooked foods."
      }
    },
    crypto: {
      name: "Cryptosporidiosis",
      keywords: ["Diarrhea", "Dehydration", "Weight loss", "Abdominal Pain", "Fever", "Nausea", "Vomiting"],
      info: {
        symptoms: "The main symptom is watery diarrhea. Other symptoms may include stomach cramps or pain, dehydration, nausea, vomiting, fever, and weight loss. Symptoms usually begin 2 to 10 days after infection and can last 1 to 2 weeks.",
        causes: "Cryptosporidiosis is caused by microscopic parasites called Cryptosporidium. These parasites live in the intestines of infected humans and animals and are passed through stool. People can become infected by swallowing contaminated water or food.",
        treatment: "Most people with healthy immune systems recover without treatment. For people with compromised immune systems, treatment may include anti-parasitic drugs. Staying hydrated is important during recovery.",
        prevention: "Preventive measures include washing hands frequently, avoiding swallowing water while swimming, drinking safe water, and avoiding contact with infected individuals or animals."
      }
    }
  };

  const symptomsKeywords = ["symptoms", "signs", "what are the symptoms", "what are the signs", "কোন লক্ষণ", "লক্ষণ", "লক্ষণসমূহ", "কি লক্ষণ", "কি চিহ্ন", "কোন লক্ষন", "লক্ষন", "লক্ষনসমূহ", "क्या लक्षण", "लक्षण", "लक्षणों", "लक्षण क्या हैं", "लक्षण क्या है", "symptom", "sign"];
  const causesKeywords = ["cause", "causes", "reason", "reasons", "কাৰণ", "কাৰণসমূহ", "কিয়", "কিয় হয়", "কারণ", "কারণসমূহ", "কেন", "কেন হয়", "कारण", "कारणों", "क्यों", "क्यों होता है", "क्यों होती है", "why"];
  const treatmentKeywords = ["treatment", "treatments", "cure", "therapy", "medication", "medicine", "চিকিৎসা", "চিকিৎসাসমূহ", "নিৰাময়", "নিৰাময়সমূহ", "উপচার", "উপচারসমূহ", "इलाज", "उपचार", "दवा", "दवाएं", "चिकित्सा", "चिकित्साएं"];
  const preventionKeywords = ["prevention", "prevent", "avoid", "avoidance", "protection", "safety", "precaution", "precautions", "প্ৰতিৰোধ", "প্ৰতিৰোধসমূহ", "বিৰোধ", "বিৰোধসমূহ", "প্রতিরোধ", "প্রতিরোধসমূহ", "রক্ষা", "রক্ষাসমূহ", "रोकथाम", "रोकना", "बचाव", "सुरक्षा", "सावधानी"];

  const getAIResponse = (message) => {
    const lowerCaseMessage = message.toLowerCase();
    
    // Handle greetings
    if (lowerCaseMessage.includes('hello') || lowerCaseMessage.includes('hi') || lowerCaseMessage.includes('hey') || 
        lowerCaseMessage.includes('নমস্কাৰ') || lowerCaseMessage.includes('হেলো') || lowerCaseMessage.includes('হাই') || 
        lowerCaseMessage.includes('নমস্কার') || lowerCaseMessage.includes('হ্যালো') || lowerCaseMessage.includes('হাই') || 
        lowerCaseMessage.includes('नमस्ते') || lowerCaseMessage.includes('हैलो') || lowerCaseMessage.includes('हाय')) {
      return t('ai.initialGreeting');
    }
    
    // Handle specific disease queries
    for (const diseaseKey in diseaseInfoDatabase) {
      const disease = diseaseInfoDatabase[diseaseKey];
      const diseaseName = disease.name.toLowerCase();
      
      if (lowerCaseMessage.includes(diseaseName) || disease.keywords.some(k => lowerCaseMessage.includes(k))) {
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
        // If just the disease name is mentioned, give a summary
        return `${disease.name}: ${disease.info.symptoms} ${disease.info.causes} ${disease.info.treatment} ${disease.info.prevention}`;
      }
    }
    
    // Handle general symptom queries
    if (symptomsKeywords.some(k => lowerCaseMessage.includes(k))) {
      return "Common symptoms for many waterborne diseases include diarrhea, vomiting, fever, and stomach cramps. For a more specific diagnosis, please use the 'Disease Prediction' tab or consult a doctor.";
    }
    
    // 4. Fallback response
    return t('ai.fallback');
  };

  const handleSendMessage = () => {
    if (!userMessage.trim()) return;
    
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newUserMessage = { id: Date.now(), text: userMessage, sender: 'user', timestamp };
    setMessages(prev => [...prev, newUserMessage]);
    
    const aiResponseText = getAIResponse(userMessage);
    setIsTyping(true);
    
    setTimeout(() => {
      const aiResponse = { 
        id: Date.now() + 1, 
        text: aiResponseText, 
        sender: 'ai', 
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
    
    setUserMessage('');
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
    cholera: {
      keywords: ["fever", "diarrhea", "vomiting", "dehydration", "cramps", "cholera", "rice-water stool"],
    },
    typhoid: {
      keywords: ["fever", "headache", "weakness", "stomach pain", "loss of appetite", "typhoid", "rose spots"],
    },
    hepatitisA: {
      keywords: ["fatigue", "nausea", "abdominal pain", "appetite loss", "low-grade fever", "dark urine", "jaundice", "hepatitis"],
    },
    crypto: {
      keywords: ["Diarrhea", "Dehydration", "Weight loss", "Abdominal Pain", "Fever", "Nausea", "Vomiting"],
    }
  };

  const runAIAnalysis = (selectedSymptoms) => {
    const translatedSymptomsList = t('symptomsList');
    
    // Important: Always compare against the English keywords in the database
    const englishSelectedSymptoms = selectedSymptoms.map(symptom => {
      const index = translatedSymptomsList.indexOf(symptom);
      return translations['en'].symptomsList[index];
    });
    
    let scores = [];
    
    for (const diseaseKey in diseaseDatabase) {
      const disease = diseaseDatabase[diseaseKey];
      const matchingSymptoms = disease.keywords.filter(keyword => 
        englishSelectedSymptoms.includes(keyword)
      );
      
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
    
    // Simulate API call delay
    setTimeout(() => {
      const results = runAIAnalysis(formData.symptoms);
      setAnalysisResult(results);
      setIsAnalyzing(false);
    }, 2000);
  };

  const handleWaterFormSubmit = async (e) => {
    e.preventDefault();
    setWaterAnalysisError(null);
    
    // Prepare data for submission
    const submissionData = {
      location: waterFormData.location,
      water_source_type: waterFormData.water_source_type,
      ph_level: parseFloat(waterFormData.ph_level),
      turbidity: parseFloat(waterFormData.turbidity),
      contaminant_level_ppm: parseFloat(waterFormData.contaminantLevel),
      temperature_celsius: parseFloat(waterFormData.temperature),
      bacteria_count_cfu_ml: parseFloat(waterFormData.bacteria_count_cfu_ml), // NEW
      nitrate_level_mg_l: parseFloat(waterFormData.nitrate_level_mg_l), // NEW
      dissolved_oxygen_mg_l: parseFloat(waterFormData.dissolved_oxygen_mg_l) // NEW
    };
    
    try {
      // In a real app, you would send this to your backend API
      // const response = await fetch('/api/water-analysis', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(submissionData)
      // });
      
      // For demo purposes, we'll simulate a response
      setTimeout(() => {
        setWaterAnalysisResult({
          quality: "Poor",
          contaminants: ["E. Coli", "Lead"],
          recommendations: [
            "Do not drink this water without boiling",
            "Install a water filtration system",
            "Contact local health authorities"
          ]
        });
      }, 1500);
    } catch (error) {
      setWaterAnalysisError("Failed to analyze water quality. Please try again.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleWaterInputChange = (e) => {
    const { name, value } = e.target;
    setWaterFormData(prev => ({ ...prev, [name]: value }));
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

  return (
    <div className={`${darkMode ? 'bg-dark text-light' : 'bg-light'} min-vh-100`}>
      <header className={`shadow sticky-top ${darkMode ? 'bg-dark' : 'bg-white'}`}>
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
              <h1 className="h4 mb-0 fw-bold">Healify</h1>
            </div>
            
            <div className="d-flex align-items-center">
              <div className="dropdown me-3">
                <button 
                  className={`btn ${darkMode ? 'btn-outline-light' : 'btn-outline-dark'} dropdown-toggle`}
                  type="button"
                  id="languageDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  {t('language')}
                </button>
                <ul className="dropdown-menu" aria-labelledby="languageDropdown">
                  <li><button className="dropdown-item" onClick={() => setLanguage('en')}>{t('english')}</button></li>
                  <li><button className="dropdown-item" onClick={() => setLanguage('hi')}>{t('hindi')}</button></li>
                  <li><button className="dropdown-item" onClick={() => setLanguage('as')}>{t('assamese')}</button></li>
                  <li><button className="dropdown-item" onClick={() => setLanguage('bn')}>{t('bengali')}</button></li>
                </ul>
              </div>
              
              <button 
                className="btn me-3"
                onClick={toggleDarkMode}
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {darkMode ? <FaSun className="text-warning" /> : <FaMoon className="text-dark" />}
              </button>
              
              <button 
                className={`btn position-relative ${chatOpen ? 'btn-primary' : darkMode ? 'btn-outline-light' : 'btn-outline-dark'}`}
                onClick={toggleChat}
              >
                <FaRobot />
                {messages.filter(m => m.sender === 'ai' && !m.read).length > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {messages.filter(m => m.sender === 'ai' && !m.read).length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container-fluid">
        <div className="row">
          {/* Sidebar */}
          <div className={`col-lg-2 col-md-3 d-lg-block ${sidebarOpen ? 'd-block' : 'd-none'} sidebar ${darkMode ? 'bg-dark' : 'bg-light'} min-vh-100 shadow`}>
            <div className="py-4">
              <ul className="nav flex-column">
                <li>
                  <button
                    onClick={() => { setActiveTab('home'); setSidebarOpen(false); }}
                    aria-label="Go to Home tab"
                    className={`w-100 text-start btn mb-2 ${activeTab === 'home' ? 'btn-primary' : darkMode ? 'btn-dark text-light' : 'btn-light'}`}
                  >
                    <FaHome className="me-2" aria-hidden="true" /> {t('home')}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => { setActiveTab('waterData'); setSidebarOpen(false); }}
                    aria-label="Go to Submit Data tab"
                    className={`w-100 text-start btn mb-2 ${activeTab === 'waterData' ? 'btn-primary' : darkMode ? 'btn-dark text-light' : 'btn-light'}`}
                  >
                    <FaDatabase className="me-2" aria-hidden="true" /> {t('submitWaterData')}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => { setActiveTab('prediction'); setSidebarOpen(false); }}
                    aria-label="Go to Disease Prediction tab"
                    className={`w-100 text-start btn mb-2 ${activeTab === 'prediction' ? 'btn-primary' : darkMode ? 'btn-dark text-light' : 'btn-light'}`}
                  >
                    <FaChartBar className="me-2" aria-hidden="true" /> {t('diseasePrediction')}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => { setActiveTab('community'); setSidebarOpen(false); }}
                    aria-label="Go to Community Outreach tab"
                    className={`w-100 text-start btn mb-2 ${activeTab === 'community' ? 'btn-primary' : darkMode ? 'btn-dark text-light' : 'btn-light'}`}
                  >
                    <FaUsers className="me-2" aria-hidden="true" /> {t('community')}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => { setActiveTab('about'); setSidebarOpen(false); }}
                    aria-label="Go to About Us tab"
                    className={`w-100 text-start btn mb-2 ${activeTab === 'about' ? 'btn-primary' : darkMode ? 'btn-dark text-light' : 'btn-light'}`}
                  >
                    <FaUsers className="me-2" aria-hidden="true" /> {t('about')}
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Main Content */}
          <main className={`col-lg-10 col-md-9 ${sidebarOpen ? 'd-none' : 'd-block'} py-4`}>
            {/* Home Tab */}
            {activeTab === 'home' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="row mb-4">
                  <div className="col-12">
                    <div className={`card ${darkMode ? 'bg-dark text-light' : ''}`} style={{ borderRadius: '1rem' }}>
                      <div className="card-body p-5 text-center">
                        <h1 className="display-4 fw-bold mb-3">{t('heroTitle')}</h1>
                        <p className="lead mb-4">{t('heroSubtitle')}</p>
                        <div className="d-flex justify-content-center gap-3">
                          <button 
                            className="btn btn-primary btn-lg"
                            onClick={() => setActiveTab('prediction')}
                          >
                            {t('diseasePrediction')}
                          </button>
                          <button 
                            className="btn btn-outline-primary btn-lg"
                            onClick={() => setActiveTab('waterData')}
                          >
                            {t('submitWaterData')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row mb-4">
                  <div className="col-12">
                    <h2 className="h4 fw-bold mb-3">{t('outbreakTitle')}</h2>
                    <OutbreakMap outbreaks={diseaseOutbreaks} darkMode={darkMode} />
                  </div>
                </div>

                <div className="row mb-4">
                  <div className="col-lg-6 mb-3">
                    <div className={`card ${darkMode ? 'bg-dark text-light' : ''}`} style={{ borderRadius: '1rem' }}>
                      <div className="card-body">
                        <h3 className="card-title h5 fw-bold mb-3">{t('statisticsTitle')}</h3>
                        <div style={{ width: "100%", minHeight: "400px" }}>
                          {/* Chart would go here */}
                          <div className="text-center py-5">
                            <p>Chart visualization would appear here</p>
                            <em className="text-muted">💡 Did you know? Clean water prevents 80% of diarrheal diseases.</em>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-lg-6 mb-3">
                    <div className={`card ${darkMode ? 'bg-dark text-light' : ''}`} style={{ borderRadius: '1rem' }}>
                      <div className="card-body">
                        <h3 className="card-title h5 fw-bold mb-3">{t('trendsTitle')}</h3>
                        <div style={{ width: "100%", minHeight: "400px" }}>
                          {/* Chart would go here */}
                          <div className="text-center py-5">
                            <p>Chart visualization would appear here</p>
                            <em className="text-muted">📊 Disease trends show seasonal patterns in waterborne illnesses.</em>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-12">
                    <div className={`card ${darkMode ? 'bg-dark text-light' : ''}`} style={{ borderRadius: '1rem' }}>
                      <div className="card-body">
                        <h3 className="card-title h5 fw-bold mb-3">{t('emergencyTitle')}</h3>
                        <div className="table-responsive">
                          <table className="table table-borderless mb-0">
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
                              {diseaseOutbreaks.slice(0, 3).map(outbreak => (
                                <tr key={outbreak.id} className="align-middle">
                                  <td>
                                    <button 
                                      className="btn btn-link p-0 text-decoration-none text-start"
                                      onClick={() => setSelectedOutbreak(outbreak)}
                                    >
                                      {outbreak.name}
                                    </button>
                                  </td>
                                  <td>{outbreak.state}</td>
                                  <td>
                                    <span className={`badge ${
                                      outbreak.severity === 'critical' ? 'bg-danger' : 
                                      outbreak.severity === 'high' ? 'bg-warning text-dark' : 
                                      outbreak.severity === 'medium' ? 'bg-info text-dark' : 
                                      'bg-secondary'
                                    }`}>
                                      {t(outbreak.severity)}
                                    </span>
                                  </td>
                                  <td>Team Alpha</td>
                                  <td>2 hours ago</td>
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

            {/* Submit Water Data Tab */}
            {activeTab === 'waterData' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="row">
                  <div className="col-12">
                    <div className={`card ${darkMode ? 'bg-dark text-light' : ''}`} style={{ borderRadius: '1rem' }}>
                      <div className="card-body p-4">
                        <h2 className="card-title h3 fw-bold mb-4">{t('submitWaterData')}</h2>
                        
                        <form onSubmit={handleWaterFormSubmit}>
                          <div className="row">
                            <div className="col-md-6 mb-3">
                              <label htmlFor="location" className={`form-label ${darkMode ? 'text-light' : ''}`}>{t('location')}</label>
                              <input
                                type="text"
                                className={`form-control ${darkMode ? 'bg-dark text-light' : ''}`}
                                id="location"
                                name="location"
                                value={waterFormData.location}
                                onChange={handleWaterInputChange}
                                placeholder={t('location')}
                              />
                            </div>
                            
                            <div className="col-md-6 mb-3">
                              <label htmlFor="water_source_type" className={`form-label ${darkMode ? 'text-light' : ''}`}>{t('waterSourceType')}</label>
                              <select
                                className={`form-select ${darkMode ? 'bg-dark text-light' : ''}`}
                                id="water_source_type"
                                name="water_source_type"
                                value={waterFormData.water_source_type}
                                onChange={handleWaterInputChange}
                              >
                                <option value="well">Well</option>
                                <option value="river">River</option>
                                <option value="lake">Lake</option>
                                <option value="tap">Tap Water</option>
                                <option value="bottled">Bottled Water</option>
                              </select>
                            </div>
                            
                            <div className="col-md-6 mb-3">
                              <label htmlFor="ph_level" className="form-label">pH Level</label>
                              <input
                                type="number"
                                step="0.1"
                                className={`form-control ${darkMode ? 'bg-dark text-light' : ''}`}
                                id="ph_level"
                                name="ph_level"
                                value={waterFormData.ph_level}
                                onChange={handleWaterInputChange}
                              />
                            </div>
                            
                            <div className="col-md-6 mb-3">
                              <label htmlFor="turbidity" className="form-label">{t('turbidity')}</label>
                              <input
                                type="number"
                                step="0.1"
                                className={`form-control ${darkMode ? 'bg-dark text-light' : ''}`}
                                id="turbidity"
                                name="turbidity"
                                value={waterFormData.turbidity}
                                onChange={handleWaterInputChange}
                              />
                            </div>
                            
                            <div className="col-md-6 mb-3">
                              <label htmlFor="contaminantLevel" className="form-label">{t('contaminantLevelPpm')}</label>
                              <input
                                type="number"
                                step="0.1"
                                className={`form-control ${darkMode ? 'bg-dark text-light' : ''}`}
                                id="contaminantLevel"
                                name="contaminantLevel"
                                value={waterFormData.contaminantLevel}
                                onChange={handleWaterInputChange}
                              />
                            </div>
                            
                            <div className="col-md-6 mb-3">
                              <label htmlFor="temperature" className="form-label">{t('waterTemperatureC')}</label>
                              <input
                                type="number"
                                step="0.1"
                                className={`form-control ${darkMode ? 'bg-dark text-light' : ''}`}
                                id="temperature"
                                name="temperature"
                                value={waterFormData.temperature}
                                onChange={handleWaterInputChange}
                              />
                            </div>
                            
                            {/* NEW FIELDS */}
                            <div className="col-md-6 mb-3">
                              <label htmlFor="bacteria_count_cfu_ml" className="form-label">Bacteria Count (CFU/mL)</label>
                              <input
                                type="number"
                                className={`form-control ${darkMode ? 'bg-dark text-light' : ''}`}
                                id="bacteria_count_cfu_ml"
                                name="bacteria_count_cfu_ml"
                                value={waterFormData.bacteria_count_cfu_ml}
                                onChange={handleWaterInputChange}
                              />
                            </div>
                            
                            <div className="col-md-6 mb-3">
                              <label htmlFor="nitrate_level_mg_l" className="form-label">Nitrate Level (mg/L)</label>
                              <input
                                type="number"
                                className={`form-control ${darkMode ? 'bg-dark text-light' : ''}`}
                                id="nitrate_level_mg_l"
                                name="nitrate_level_mg_l"
                                value={waterFormData.nitrate_level_mg_l}
                                onChange={handleWaterInputChange}
                              />
                            </div>
                            
                            <div className="col-md-6 mb-3">
                              <label htmlFor="dissolved_oxygen_mg_l" className="form-label">Dissolved Oxygen (mg/L)</label>
                              <input
                                type="number"
                                className={`form-control ${darkMode ? 'bg-dark text-light' : ''}`}
                                id="dissolved_oxygen_mg_l"
                                name="dissolved_oxygen_mg_l"
                                value={waterFormData.dissolved_oxygen_mg_l}
                                onChange={handleWaterInputChange}
                              />
                            </div>
                          </div>
                          
                          <div className="mb-3">
                            <label className="form-label">{t('upload')}</label>
                            <input 
                              type="file" 
                              className={`form-control ${darkMode ? 'bg-dark text-light' : ''}`}
                            />
                          </div>
                          
                          <button type="submit" className="btn btn-primary">
                            {t('submitButton')}
                          </button>
                        </form>
                        
                        {waterAnalysisError && (
                          <div className="alert alert-danger mt-3 mb-0">{waterAnalysisError}</div>
                        )}
                        
                        {waterAnalysisResult && (
                          <div className={`card mt-4 ${darkMode ? 'bg-dark' : 'bg-light'}`}>
                            <div className="card-body">
                              <h3 className="card-title h5 fw-bold">{t('analysisTitle')}</h3>
                              <div className="mb-3">
                                <h4 className="h6">Water Quality: <span className="badge bg-danger">Poor</span></h4>
                              </div>
                              <div className="mb-3">
                                <h4 className="h6">Detected Contaminants:</h4>
                                <ul>
                                  <li>E. Coli</li>
                                  <li>Lead</li>
                                </ul>
                              </div>
                              <div>
                                <h4 className="h6">Recommendations:</h4>
                                <ul>
                                  <li>Do not drink this water without boiling</li>
                                  <li>Install a water filtration system</li>
                                  <li>Contact local health authorities</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Disease Prediction Tab */}
            {activeTab === 'prediction' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="row">
                  <div className="col-12">
                    <div className={`card ${darkMode ? 'bg-dark text-light' : ''}`} style={{ borderRadius: '1rem' }}>
                      <div className="card-body p-4">
                        <h2 className="card-title h3 fw-bold mb-4">{t('predictionTitle')}</h2>
                        <p className={`mb-4 ${darkMode ? 'text-light' : ''}`}>{t('predictionSubtitle')}</p>
                        
                        <div className="row">
                          <div className="col-lg-6">
                            <h3 className="h5 fw-bold mb-3">{t('patientInfo')}</h3>
                            <form onSubmit={handleFormSubmit}>
                              <div className="mb-3">
                                <label className={`form-label ${darkMode ? 'text-light' : ''}`}>{t('fullName')}</label>
                                <input
                                  type="text"
                                  className={`form-control ${darkMode ? 'bg-dark text-light' : ''}`}
                                  name="name"
                                  value={formData.name}
                                  onChange={handleInputChange}
                                  placeholder={t('fullName')}
                                />
                              </div>
                              
                              <div className="row">
                                <div className="col-md-6 mb-3">
                                  <label className={`form-label ${darkMode ? 'text-light' : ''}`}>{t('age')}</label>
                                  <input
                                    type="number"
                                    className={`form-control ${darkMode ? 'bg-dark text-light' : ''}`}
                                    name="age"
                                    value={formData.age}
                                    onChange={handleInputChange}
                                    placeholder={t('age')}
                                  />
                                </div>
                                
                                <div className="col-md-6 mb-3">
                                  <label className={`form-label ${darkMode ? 'text-light' : ''}`}>{t('gender')}</label>
                                  <select
                                    className={`form-select ${darkMode ? 'bg-dark text-light' : ''}`}
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleInputChange}
                                  >
                                    <option value="">{t('gender')}</option>
                                    <option value="male">{t('genderOptions.male')}</option>
                                    <option value="female">{t('genderOptions.female')}</option>
                                    <option value="other">{t('genderOptions.other')}</option>
                                  </select>
                                </div>
                              </div>
                              
                              <div className="mb-3">
                                <label className={`form-label ${darkMode ? 'text-light' : ''}`}>{t('location')}</label>
                                <input
                                  type="text"
                                  className={`form-control ${darkMode ? 'bg-dark text-light' : ''}`}
                                  name="location"
                                  value={formData.location}
                                  onChange={handleInputChange}
                                  placeholder={t('location')}
                                />
                              </div>
                              
                              <div className="mb-4">
                                <label className={`form-label ${darkMode ? 'text-light' : ''}`}>{t('symptoms')}</label>
                                <div className="row">
                                  {t('symptomsList').map((symptom, index) => (
                                    <div className="col-md-6 mb-2" key={index}>
                                      <div className="form-check">
                                        <input
                                          className="form-check-input"
                                          type="checkbox"
                                          id={`symptom-${index}`}
                                          checked={formData.symptoms.includes(symptom)}
                                          onChange={() => handleSymptomChange(symptom)}
                                        />
                                        <label className={`form-check-label ${darkMode ? 'text-light' : ''}`} htmlFor={`symptom-${index}`}>
                                          {symptom}
                                        </label>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              <button type="submit" className="btn btn-primary" disabled={isAnalyzing}>
                                {isAnalyzing ? (
                                  <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Analyzing...
                                  </>
                                ) : (
                                  t('submitButton')
                                )}
                              </button>
                            </form>
                          </div>
                          
                          <div className="col-lg-6">
                            <h3 className="h5 fw-bold mb-3">{t('analysisTitle')}</h3>
                            <div className={`card ${darkMode ? 'bg-dark' : ''}`} style={{ minHeight: '400px' }}>
                              <div className="card-body">
                                {isAnalyzing ? (
                                  <div className="text-center py-5">
                                    <div className="spinner-border text-primary" role="status">
                                      <span className="visually-hidden">Loading...</span>
                                    </div>
                                    <p className="mt-3">{t('analyzingPlaceholder')}</p>
                                  </div>
                                ) : analysisResult ? (
                                  <div>
                                    <h4 className="h6 mb-3">Top Predictions:</h4>
                                    {analysisResult.map((disease, index) => (
                                      <div key={index} className="mb-3 pb-3 border-bottom">
                                        <div className="d-flex justify-content-between">
                                          <h5 className="h6 mb-1">{disease.name}</h5>
                                          <span className="badge bg-primary">{disease.probability}% {t('probability')}</span>
                                        </div>
                                        <p className="small mb-2">{disease.description}</p>
                                        <div>
                                          <h6 className="h6 mb-1">{t('remediesTitle')}:</h6>
                                          <ul className="small mb-0">
                                            {disease.remedies.map((remedy, i) => (
                                              <li key={i}>{remedy}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      </div>
                                    ))}
                                    {analysisResult.length === 0 && (
                                      <div className="text-center py-5">
                                        <h5 className="h6 mb-3">{t('noDiseaseDetectedTitle')}</h5>
                                        <p className="small">{t('noDiseaseDetectedDescription')}</p>
                                        <p className="small text-muted">{t('noDiseaseDetectedRemedy')}</p>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="text-center py-5">
                                    <p className="mb-0">{t('analysisPlaceholder')}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Community Outreach Tab */}
            {activeTab === 'community' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="row mb-4">
                  <div className="col-12">
                    <div className={`card ${darkMode ? 'bg-dark text-light' : ''}`} style={{ borderRadius: '1rem' }}>
                      <div className="card-body p-5 text-center">
                        <h1 className="display-5 fw-bold mb-3">{t('communityTitle')}</h1>
                        <p className="lead mb-4">{t('communitySubtitle')}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-lg-8 mb-4">
                    <h3 className="h5 fw-bold mb-3">{t('eventsTitle')}</h3>
                    <div className="row g-4">
                      {communityEvents.map(event => (
                        <div className="col-md-6 col-lg-4" key={event.id}>
                          <div className={`card h-100 ${darkMode ? 'bg-dark border-secondary' : ''}`}>
                            <div className="card-body d-flex flex-column">
                              <h4 className="card-title h6 fw-bold">{event.title}</h4>
                              <p className="small text-muted mb-3">{event.date}</p>
                              <div className="mt-auto">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                  <span className={`badge ${
                                    event.status === 'upcoming' ? 'bg-success' : 'bg-secondary'
                                  }`}>
                                    {t('upcoming')}
                                  </span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                  <span className={darkMode ? 'text-light' : 'text-muted'}>
                                    {event.attendees} {t('registered')}
                                  </span>
                                  <button className={`btn ${darkMode ? 'btn-outline-light' : 'btn-outline-primary'} btn-sm`}>
                                    {t('registerNow')}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="col-lg-4">
                    <h3 className="h5 fw-bold mb-3">{t('programHighlights')}</h3>
                    <div className="row g-3">
                      <div className="col-12">
                        <div className={`card h-100 ${darkMode ? 'bg-dark border-secondary' : 'bg-light'}`}>
                          <div className="card-body">
                            <h4 className="card-title h6 fw-bold">{t('onlinePrograms')}</h4>
                            <p className="small mb-0">Join our virtual workshops and webinars to learn about water safety and disease prevention.</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="col-12">
                        <div className={`card h-100 ${darkMode ? 'bg-dark border-secondary' : 'bg-light'}`}>
                          <div className="card-body">
                            <h4 className="card-title h6 fw-bold">{t('offlineEvents')}</h4>
                            <p className="small mb-0">Participate in community health camps and awareness drives in your locality.</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="col-12">
                        <div className={`card h-100 ${darkMode ? 'bg-dark border-secondary' : 'bg-light'}`}>
                          <div className="card-body">
                            <h4 className="card-title h6 fw-bold">{t('waterTesting')}</h4>
                            <p className="small mb-0">Get your water sources tested by our team of experts for quality and safety.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* About Us Tab */}
            {activeTab === 'about' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="row mb-4">
                  <div className="col-12">
                    <div className={`card ${darkMode ? 'bg-dark text-light' : ''}`} style={{ borderRadius: '1rem' }}>
                      <div className="card-body p-5 text-center">
                        <h1 className="display-5 fw-bold mb-3">{t('aboutTitle')}</h1>
                        <p className="lead">{t('missionText')}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row mb-4">
                  <div className="col-lg-6 mb-4">
                    <div className={`card ${darkMode ? 'bg-dark' : ''}`} style={{ borderRadius: '1rem' }}>
                      <div className="card-body">
                        <h3 className="card-title h5 fw-bold mb-3">{t('missionTitle')}</h3>
                        <p>{t('missionText')}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-lg-6 mb-4">
                    <div className={`card ${darkMode ? 'bg-dark' : ''}`} style={{ borderRadius: '1rem' }}>
                      <div className="card-body">
                        <h3 className="card-title h5 fw-bold mb-3">{t('visionTitle')}</h3>
                        <p>{t('visionText')}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row mb-4">
                  <div className="col-12">
                    <div className={`card ${darkMode ? 'bg-dark' : ''}`} style={{ borderRadius: '1rem' }}>
                      <div className="card-body">
                        <h3 className="card-title h5 fw-bold mb-3">{t('techStack')}</h3>
                        <div className="d-flex flex-wrap gap-3">
                          <span className="badge bg-primary">React</span>
                          <span className="badge bg-success">Node.js</span>
                          <span className="badge bg-info">MongoDB</span>
                          <span className="badge bg-warning text-dark">Python</span>
                          <span className="badge bg-danger">TensorFlow</span>
                          <span className="badge bg-secondary">Docker</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-12">
                    <div className={`card ${darkMode ? 'bg-dark' : ''}`} style={{ borderRadius: '1rem' }}>
                      <div className="card-body">
                        <h3 className="card-title h5 fw-bold mb-4">{t('teamTitle')}</h3>
                        <div className="row g-4">
                          {teamMembers.map((member, index) => (
                            <div className="col-md-2 col-6 text-center" key={index}>
                              <img 
                                src={`https://placehold.co/80x80/${['4ade80', '60a5fa', 'f59e0b', 'ef4444', '8b5cf6', '10b981'][index]}/ffffff?text=${member.name.charAt(0)}`}
                                alt={member.name}
                                className="rounded-circle mb-2"
                                style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                              />
                              <div className={`fw-bold small ${darkMode ? 'text-light' : ''}`}>{member.name}</div>
                            </div>
                          ))}
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

      {/* Chat Widget */}
      {chatOpen && (
        <div className="position-fixed bottom-0 end-0 m-4" style={{ width: '400px', zIndex: 1000 }}>
          <div className={`card ${darkMode ? 'bg-dark text-light' : 'bg-white'} shadow`} style={{ borderRadius: '1rem', height: '500px', display: 'flex', flexDirection: 'column' }}>
            <div className="card-header d-flex justify-content-between align-items-center" style={{ borderRadius: '1rem 1rem 0 0' }}>
              <h5 className="mb-0">{t('chatTitle')}</h5>
              <button className="btn p-0" onClick={toggleChat} aria-label="Close chat">
                <FaTimes />
              </button>
            </div>
            
            <div className="card-body p-0" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div ref={widgetChatRef} style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                {messages.map((msg) => (
                  <div key={msg.id} className={`d-flex mb-3 ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                    {msg.sender === 'ai' && <FaRobot className={`me-2 flex-shrink-0 align-self-end text-primary ${darkMode ? 'bg-light' : ''} p-1 rounded-circle`} size={25} />}
                    <div style={{ maxWidth: '75%' }}>
                      <div className={`p-2 rounded ${msg.sender === 'user' ? 'bg-primary text-white' : darkMode ? 'bg-secondary text-light' : 'bg-light text-dark'}`}>
                        <p className="mb-0 small">{msg.text}</p>
                      </div>
                      <div className={`text-muted small mt-1 ${msg.sender === 'user' ? 'text-end' : 'text-start'}`}>
                        {msg.timestamp}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="d-flex justify-content-start mb-3">
                    <FaRobot className={`me-2 flex-shrink-0 align-self-end text-primary ${darkMode ? 'bg-light' : ''} p-1 rounded-circle`} size={25} />
                    <div className={`p-2 rounded ${darkMode ? 'bg-secondary' : 'bg-light'}`}>
                      <div className="d-flex">
                        <div className="bg-secondary rounded-circle me-1" style={{ width: '8px', height: '8px', animation: 'bounce 1s infinite' }}></div>
                        <div className="bg-secondary rounded-circle me-1" style={{ width: '8px', height: '8px', animation: 'bounce 1s infinite 0.15s' }}></div>
                        <div className="bg-secondary rounded-circle" style={{ width: '8px', height: '8px', animation: 'bounce 1s infinite 0.3s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="card-footer p-3">
                <div className="input-group">
                  <input
                    type="text"
                    value={userMessage}
                    onChange={(e) => setUserMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={t('chatPlaceholder')}
                    className={`form-control ${darkMode ? 'bg-dark text-light' : ''}`}
                  />
                  <button 
                    className="btn btn-primary" 
                    type="button" 
                    onClick={handleSendMessage}
                    disabled={!userMessage.trim()}
                  >
                    {t('send')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Outbreak Detail Modal */}
      {selectedOutbreak && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setSelectedOutbreak(null)}>
          <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
            <div className={`modal-content ${darkMode ? 'bg-dark text-light' : ''}`}>
              <div className="modal-header">
                <h5 className="modal-title">{selectedOutbreak.name}</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedOutbreak(null)} aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-8">
                    <p><strong>{t('state')}:</strong> {selectedOutbreak.state}</p>
                    <p><strong>{t('severity')}:</strong> 
                      <span className={`badge ms-2 ${
                        selectedOutbreak.severity === 'critical' ? 'bg-danger' : 
                        selectedOutbreak.severity === 'high' ? 'bg-warning text-dark' : 
                        selectedOutbreak.severity === 'medium' ? 'bg-info text-dark' : 
                        'bg-secondary'
                      }`}>
                        {t(selectedOutbreak.severity)}
                      </span>
                    </p>
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
                      <div className="text-center">
                        <div className="fw-bold text-warning">{selectedOutbreak.rate}/1000</div>
                        <div className={`small ${darkMode ? 'text-light' : 'text-muted'}`}>{t('rate')}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedOutbreak(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;