import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { FaBars, FaTimes, FaRobot, FaHome, FaDatabase, FaUsers, FaInfoCircle, FaMoon, FaSun, FaComments, FaGlobe } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [userMessage, setUserMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm Healify AI. How can I help you with waterborne diseases today?", sender: 'ai', lang: 'en' },
    { id: 2, text: "पानी से फैलने वाली बीमारियों के बारे में जानकारी चाहते हैं?", sender: 'ai', lang: 'hi' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedOutbreak, setSelectedOutbreak] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    location: '',
    symptoms: [],
    waterQuality: {
      ph: '',
      turbidity: '',
      coliform: '',
      ecoli: ''
    }
  });
  const [language, setLanguage] = useState('en');

  // Language translations
  const translations = {
    en: {
      home: "Home",
      submitData: "Submit Data",
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
      outbreakState: "Assam",
      outbreakCases: "Cases",
      outbreakRate: "Rate",
      statisticsTitle: "Northeast States Comparison",
      trendsTitle: "Disease Trends (Yearly)",
      emergencyTitle: "Emergency Response Status",
      disease: "Disease",
      state: "State",
      severity: "Severity Level",
      responseTeam: "Response Team",
      lastUpdate: "Last Update",
      submitTitle: "Submit Health Data",
      submitSubtitle: "Upload your water quality reports, patient records, or community health data to get AI-powered analysis and recommendations.",
      patientInfo: "Patient Information",
      fullName: "Full Name",
      age: "Age",
      gender: "Gender",
      location: "Location",
      symptoms: "Symptoms Observed",
      waterQuality: "Water Quality Parameters",
      pH: "pH Level",
      turbidity: "Turbidity (NTU)",
      coliform: "Coliform Count (CFU/mL)",
      ecoli: "E. coli (CFU/mL)",
      upload: "Upload File",
      submitButton: "Submit Data & Get Analysis",
      analysisTitle: "AI Analysis Results",
      analysisPlaceholder: "Your analysis will appear here after submission",
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
      location2: "Location",
      cases: "Cases",
      send: "Send",
      aboutAI: "About Healify AI",
      aboutAIText: "Our AI assistant provides instant answers to your questions about waterborne diseases, prevention methods, and health resources in multiple languages.",
      symptomsTitle: "Symptoms:",
      preventionTitle: "Prevention Methods:",
      statistics: "Outbreak Statistics",
      popularQuestions: [
        "What are the common symptoms of waterborne diseases?",
        "How can we prevent water contamination?",
        "What should I do if I suspect waterborne illness?",
        "Are there any home remedies for waterborne diseases?",
        "How often should we test our water quality?",
        "What are the most effective water purification methods?"
      ],
      genderOptions: {
        male: "Male",
        female: "Female",
        other: "Other"
      },
      symptomsList: [
        "Fever", "Diarrhea", "Vomiting", "Abdominal Pain", 
        "Dehydration", "Headache", "Fatigue", "Nausea"
      ]
    },
    hi: {
      home: "होम",
      submitData: "डेटा सबमिट करें",
      community: "सामुदायिक आउटरीच",
      aiAssistant: "एआई सहायक",
      about: "हमारे बारे में",
      language: "भाषा",
      english: "अंग्रेज़ी",
      hindi: "हिंदी",
      assamese: "असमिया",
      bengali: "बंगाली",
      heroTitle: "उत्तर-पूर्व भारत जलजनित रोग निगरानी",
      heroSubtitle: "जलजनित रोगों के लिए वास्तविक समय निगरानी और प्रतिक्रिया प्रणाली",
      outbreakTitle: "दस्त का प्रकोप",
      outbreakState: "असम",
      outbreakCases: "मामले",
      outbreakRate: "दर",
      statisticsTitle: "उत्तर-पूर्व राज्यों की तुलना",
      trendsTitle: "रोग प्रवृत्तियाँ (वार्षिक)",
      emergencyTitle: "आपातकालीन प्रतिक्रिया स्थिति",
      disease: "रोग",
      state: "राज्य",
      severity: "गंभीरता स्तर",
      responseTeam: "प्रतिक्रिया टीम",
      lastUpdate: "अंतिम अपडेट",
      submitTitle: "स्वास्थ्य डेटा सबमिट करें",
      submitSubtitle: "एआई-संचालित विश्लेषण और अनुशंसाएं प्राप्त करने के लिए अपनी जल गुणवत्ता रिपोर्ट, रोगी रिकॉर्ड या सामुदायिक स्वास्थ्य डेटा अपलोड करें।",
      patientInfo: "रोगी की जानकारी",
      fullName: "पूरा नाम",
      age: "आयु",
      gender: "लिंग",
      location: "स्थान",
      symptoms: "देखे गए लक्षण",
      waterQuality: "जल गुणवत्ता मापदंड",
      pH: "पीएच स्तर",
      turbidity: "अशांति (एनटीयू)",
      coliform: "कोलिफॉर्म संख्या (सीएफयू/एमएल)",
      ecoli: "ई. कोलाई (सीएफयू/एमएल)",
      upload: "फ़ाइल अपलोड करें",
      submitButton: "डेटा सबमिट करें और विश्लेषण प्राप्त करें",
      analysisTitle: "एआई विश्लेषण परिणाम",
      analysisPlaceholder: "सबमिट करने के बाद आपका विश्लेषण यहां दिखाई देगा",
      communityTitle: "सामुदायिक आउटरीच कार्यक्रम",
      communitySubtitle: "जल सुरक्षा और रोग निवारण के बारे में जानने के लिए उत्तर-पूर्व भारत भर में हमारी स्वास्थ्य शिक्षा पहलों और सामुदायिक कार्यक्रमों में शामिल हों।",
      eventsTitle: "आगामी कार्यक्रम",
      programHighlights: "कार्यक्रम हाइलाइट्स",
      onlinePrograms: "ऑनलाइन कार्यक्रम",
      offlineEvents: "ऑफलाइन कार्यक्रम",
      waterTesting: "जल परीक्षण",
      chatTitle: "हीलिफाई एआई सहायक",
      chatPlaceholder: "जलजनित रोगों के बारे में पूछें...",
      chatFeatures: "एआई सहायक सुविधाएं",
      quickHelp: "त्वरित सहायता",
      diseaseSymptoms: "रोग लक्षण",
      preventionTips: "निवारण युक्तियाँ",
      waterTesting2: "जल परीक्षण",
      aboutTitle: "हीलिफाई के बारे में",
      missionTitle: "हमारा अभियान",
      missionText: "हीलिफाई उन्नत एआई और मशीन लर्निंग प्रौद्योगिकियों के माध्यम से सार्वजनिक स्वास्थ्य निगरानी को क्रांतिकारी बनाने के लिए समर्पित है। हमारा अभियान उत्तर-पूर्व भारत के ग्रामीण क्षेत्रों में जलजनित रोगों के प्रकोप का पता लगाने, निगरानी करने और उन्हें रोकने के लिए एक स्मार्ट स्वास्थ्य निगरानी प्रणाली बनाना है।",
      visionTitle: "हमारी दृष्टि",
      visionText: "एक व्यापक प्रारंभिक चेतावनी प्रणाली स्थापित करना जो समुदायों, स्वास्थ्य कार्यकर्ताओं और सरकारी अधिकारियों को जलजनित रोगों को प्रभावी ढंग से लड़ने के लिए वास्तविक समय की अंतर्दृष्टि और कार्यात्मक बुद्धिमत्ता प्रदान करे।",
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
      prevention: "निवारण विधियाँ",
      reportedCases: "रिपोर्ट किए गए मामले",
      rate: "दर",
      location2: "स्थान",
      cases: "मामले",
      send: "भेजें",
      aboutAI: "हीलिफाई एआई के बारे में",
      aboutAIText: "हमारा एआई सहायक जलजनित रोगों, निवारण विधियों और स्वास्थ्य संसाधनों के बारे में आपके प्रश्नों के त्वरित उत्तर प्रदान करता है, अनेक भाषाओं में।",
      symptomsTitle: "लक्षण:",
      preventionTitle: "निवारण विधियाँ:",
      statistics: "प्रकोप सांख्यिकी",
      popularQuestions: [
        "जलजनित रोगों के सामान्य लक्षण क्या हैं?",
        "हम जल संदूषण को कैसे रोक सकते हैं?",
        "अगर मुझे जलजनित बीमारी का संदेह हो तो मुझे क्या करना चाहिए?",
        "क्या जलजनित रोगों के लिए कोई घरेलू उपचार हैं?",
        "हमें अपनी जल गुणवत्ता का परीक्षण कितनी बार करना चाहिए?",
        "जल शुद्धिकरण की सबसे प्रभावी विधियाँ क्या हैं?"
      ],
      genderOptions: {
        male: "पुरुष",
        female: "महिला",
        other: "अन्य"
      },
      symptomsList: [
        "बुखार", "दस्त", "उल्टी", "पेट दर्द", 
        "निर्जलीकरण", "सिरदर्द", "थकान", "उल्टी"
      ]
    },
    as: {
      home: "ঘৰ",
      submitData: "তথ্য জমা দিয়ক",
      community: "সামাজিক প্ৰসাৰণ",
      aiAssistant: "এআই সহায়ক",
      about: "আমাৰ বিষয়ে",
      language: "ভাষা",
      english: "ইংৰাজী",
      hindi: "হিন্দী",
      assamese: "অসমীয়া",
      bengali: "বাংলা",
      heroTitle: "উত্তৰ-পূৱ ভাৰতৰ পানীজনিত ৰোগৰ নিৰীক্ষণ",
      heroSubtitle: "পানীজনিত ৰোগৰ বাস্তৱ-সময়ৰ নিৰীক্ষণ আৰু প্ৰতিক্ৰিয়া ব্যৱস্থা",
      outbreakTitle: "ডায়েৰিয়াৰ প্ৰকোপ",
      outbreakState: "অসম",
      outbreakCases: "মামলাবোৰ",
      outbreakRate: "হাৰ",
      statisticsTitle: "উত্তৰ-পূৱ ৰাজ্যসমূহৰ তুলনা",
      trendsTitle: "ৰোগৰ প্ৰৱণতা (বাৰ্ষিক)",
      emergencyTitle: "জৰুৰী প্ৰতিক্ৰিয়াৰ অৱস্থা",
      disease: "ৰোগ",
      state: "ৰাজ্য",
      severity: "গুৰুত্বৰ স্তৰ",
      responseTeam: "প্ৰতিক্ৰিয়া দল",
      lastUpdate: "শেষ আপডেট",
      submitTitle: "স্বাস্থ্য তথ্য জমা দিয়ক",
      submitSubtitle: "এআই-চালিত বিশ্লেষণ আৰু পৰামৰ্শ প্ৰাপ্ত কৰিবলৈ আপোনাৰ পানীৰ গুণ প্ৰতিবেদন, ৰোগীৰ তথ্য বা সামাজিক স্বাস্থ্য তথ্য আপলোড কৰক।",
      patientInfo: "ৰোগীৰ তথ্য",
      fullName: "সম্পূৰ্ণ নাম",
      age: "বয়স",
      gender: "লিংগ",
      location: "অৱস্থান",
      symptoms: "লক্ষণসমূহ",
      waterQuality: "পানীৰ গুণ প্ৰতিমান",
      pH: "পিএইচ স্তৰ",
      turbidity: "অস্পষ্টতা (এনটিইউ)",
      coliform: "কলিফৰ্ম গণনা (CFU/mL)",
      ecoli: "E. coli (CFU/mL)",
      upload: "ফাইল আপলোড কৰক",
      submitButton: "তথ্য জমা দিয়ক আৰু বিশ্লেষণ প্ৰাপ্ত কৰক",
      analysisTitle: "এআই বিশ্লেষণৰ ফলাফল",
      analysisPlaceholder: "জমা দিয়াৰ পিছত আপোনাৰ বিশ্লেষণ ইয়াত প্ৰদৰ্শন হ'ব",
      communityTitle: "সামাজিক প্ৰসাৰণ কাৰ্যসূচী",
      communitySubtitle: "পানীৰ সুৰক্ষা আৰু ৰোগ প্ৰতিৰোধৰ বিষয়ে জানিবলৈ উত্তৰ-পূৱ ভাৰতৰ আমাৰ স্বাস্থ্য শিক্ষা উদ্যোগ আৰু সামাজিক কাৰ্যসূচীত অংশ লওক।",
      eventsTitle: "আহি থকা কাৰ্যসূচী",
      programHighlights: "কাৰ্যসূচীৰ বৈশিষ্ট্য",
      onlinePrograms: "অনলাইন কাৰ্যসূচী",
      offlineEvents: "অফলাইন কাৰ্যসূচী",
      waterTesting: "পানী পৰীক্ষা",
      chatTitle: "হিলিফাই এআই সহায়ক",
      chatPlaceholder: "পানীজনিত ৰোগৰ বিষয়ে সুধৃঁ...",
      chatFeatures: "এআই সহায়কৰ বৈশিষ্ট্য",
      quickHelp: "দ্ৰুত সহায়",
      diseaseSymptoms: "ৰোগৰ লক্ষণ",
      preventionTips: "প্ৰতিৰোধৰ কৌশল",
      waterTesting2: "পানী পৰীক্ষা",
      aboutTitle: "হিলিফাইৰ বিষয়ে",
      missionTitle: "আমাৰ মিছন",
      missionText: "হিলিফাই উন্নত এআই আৰু মেচিন লাৰ্নিং প্ৰযুক্তিৰ জৰিয়তে জনস্বাস্থ্য নিৰীক্ষণক বিপ্লৱী কৰাৰ বাবে নিয়োজিত। আমাৰ মিছন হ'ল উত্তৰ-পূৱ ভাৰতৰ গ্ৰাম্য অঞ্চলত পানীজনিত ৰোগৰ প্ৰকোপ চিনাক্ত, নিৰীক্ষণ আৰু প্ৰতিৰোধ কৰাৰ বাবে এটা স্মাৰ্ট স্বাস্থ্য নিৰীক্ষণ ব্যৱস্থা গঢ়ি তোলা।",
      visionTitle: "আমাৰ দৃষ্টি",
      visionText: "এটা বিস্তৃত প্ৰাথমিক সতৰ্কবাৰ্তা ব্যৱস্থা স্থাপন কৰা যিয়ে সমাজ, স্বাস্থ্য কৰ্মী আৰু চৰকাৰী কৰ্মচাৰীসকলক পানীজনিত ৰোগ মোকাবিলাৰ বাবে বাস্তৱ-সময়ৰ অন্তৰ্দৃষ্টি আৰু কাৰ্যকৰ বুদ্ধিমত্তা প্ৰদান কৰে।",
      techStack: "প্ৰযুক্তি স্টেক",
      teamTitle: "আমাৰ দল",
      critical: "গুৰুতৰ",
      high: "উচ্চ",
      medium: "মধ্যম",
      low: "কম",
      upcoming: "আহি থকা",
      registered: "পঞ্জীভুক্ত",
      registerNow: "এতিয়া পঞ্জীভুক্ত কৰক",
      description: "বিৱৰণ",
      prevention: "প্ৰতিৰোধৰ পদ্ধতি",
      reportedCases: "প্ৰতিবেদিত মামলাবোৰ",
      rate: "হাৰ",
      location2: "অৱস্থান",
      cases: "মামলাবোৰ",
      send: "পঠিয়াওক",
      aboutAI: "হিলিফাই এআইৰ বিষয়ে",
      aboutAIText: "আমাৰ এআই সহায়কে পানীজনিত ৰোগ, প্ৰতিৰোধৰ পদ্ধতি আৰু স্বাস্থ্য সম্পদৰ বিষয়ে আপোনাৰ প্ৰশ্নৰ তৎক্ষণাৎ উত্তৰ প্ৰদান কৰে, বহু ভাষাত।",
      symptomsTitle: "লক্ষণসমূহ:",
      preventionTitle: "প্ৰতিৰোধৰ পদ্ধতি:",
      statistics: "প্ৰকোপৰ পৰিসংখ্যান",
      popularQuestions: [
        "পানীজনিত ৰোগৰ সাধাৰণ লক্ষণসমূহ কি?",
        "আমি পানীৰ দূষণ কেনেকৈ ৰোধ কৰিব পাৰো?",
        "যদি মই পানীজনিত ৰোগৰ সন্দেহ কৰোঁ তেন্তে মই কি কৰিব লাগে?",
        "পানীজনিত ৰোগৰ বাবে কোনো ঘৰৰ উপায় আছে নেকি?",
        "আমি কিমান সময় অন্তর আমাৰ পানীৰ গুণ পৰীক্ষা কৰিব লাগে?",
        "পানী বিশুদ্ধিকৰণৰ আটাইতকৈ প্ৰভাৱশালী পদ্ধতিসমূহ কি?"
      ],
      genderOptions: {
        male: "পুৰুষ",
        female: "মহিলা",
        other: "অন্য"
      },
      symptomsList: [
        "জ্বৰ", "ডায়েৰিয়া", "বমি", "পেট বেদনা", 
        "নিৰোধন", "মুণ্ড বেদনা", "দুৰ্বলতা", "বমি"
      ]
    },
    bn: {
      home: "হোম",
      submitData: "ডেটা জমা দিন",
      community: "সম্প্রদায় আউটরিচ",
      aiAssistant: "এআই সহকারী",
      about: "আমাদের সম্পর্কে",
      language: "ভাষা",
      english: "ইংরেজি",
      hindi: "হিন্দি",
      assamese: "অসমিয়া",
      bengali: "বাংলা",
      heroTitle: "উত্তর-পূর্ব ভারতের জলজ রোগ পর্যবেক্ষণ",
      heroSubtitle: "জলজ রোগের জন্য প্রকৃত-সময় পর্যবেক্ষণ এবং প্রতিক্রিয়া ব্যবস্থা",
      outbreakTitle: "ডায়রিয়ার প্রকোপ",
      outbreakState: "অসম",
      outbreakCases: "মামলা",
      outbreakRate: "হার",
      statisticsTitle: "উত্তর-পূর্ব রাজ্যগুলির তুলনা",
      trendsTitle: "রোগের প্রবণতা (বার্ষিক)",
      emergencyTitle: "জরুরি প্রতিক্রিয়ার অবস্থা",
      disease: "রোগ",
      state: "রাজ্য",
      severity: "গুরুত্বের স্তর",
      responseTeam: "প্রতিক্রিয়া দল",
      lastUpdate: "শেষ আপডেট",
      submitTitle: "স্বাস্থ্য ডেটা জমা দিন",
      submitSubtitle: "এআই-চালিত বিশ্লেষণ এবং সুপারিশ পেতে আপনার জলের গুণ প্রতিবেদন, রোগীর রেকর্ড বা সম্প্রদায়ের স্বাস্থ্য ডেটা আপলোড করুন।",
      patientInfo: "রোগীর তথ্য",
      fullName: "পূর্ণ নাম",
      age: "বয়স",
      gender: "লিঙ্গ",
      location: "অবস্থান",
      symptoms: "লক্ষণ পর্যবেক্ষিত",
      waterQuality: "জলের গুণ পরামিতি",
      pH: "পিএইচ স্তর",
      turbidity: "অস্পষ্টতা (এনটিইউ)",
      coliform: "কলিফর্ম গণনা (CFU/mL)",
      ecoli: "E. coli (CFU/mL)",
      upload: "ফাইল আপলোড করুন",
      submitButton: "ডেটা জমা দিন এবং বিশ্লেষণ পান",
      analysisTitle: "এআই বিশ্লেষণ ফলাফল",
      analysisPlaceholder: "জমা দেওয়ার পরে আপনার বিশ্লেষণ এখানে প্রদর্শিত হবে",
      communityTitle: "সম্প্রদায় আউটরিচ প্রোগ্রাম",
      communitySubtitle: "জল নিরাপত্তা এবং রোগ প্রতিরোধ সম্পর্কে জানতে উত্তর-পূর্ভ ভারতের আমাদের স্বাস্থ্য শিক্ষা উদ্যোগ এবং সম্প্রদায় ইভেন্টগুলিতে যোগ দিন।",
      eventsTitle: "আসন্ন ইভেন্টগুলি",
      programHighlights: "প্রোগ্রাম হাইলাইটস",
      onlinePrograms: "অনলাইন প্রোগ্রাম",
      offlineEvents: "অফলাইন ইভেন্ট",
      waterTesting: "জল পরীক্ষা",
      chatTitle: "হিলিফাই এআই সহকারী",
      chatPlaceholder: "জলজ রোগ সম্পর্কে জিজ্ঞাসা করুন...",
      chatFeatures: "এআই সহকারী বৈশিষ্ট্য",
      quickHelp: "দ্রুত সাহায্য",
      diseaseSymptoms: "রোগের লক্ষণ",
      preventionTips: "প্রতিরোধ টিপস",
      waterTesting2: "জল পরীক্ষা",
      aboutTitle: "হিলিফাই সম্পর্কে",
      missionTitle: "আমাদের মিশন",
      missionText: "হিলিফাই উন্নত এআই এবং মেশিন লার্নিং প্রযুক্তির মাধ্যমে পাবলিক স্বাস্থ্য পর্যবেক্ষণকে বিপ্লবায়নের জন্য নিয়োজিত। আমাদের মিশন হল উত্তর-পূর্ব ভারতের গ্রাম্য অঞ্চলে জলজ রোগের প্রকোপ সনাক্ত, পর্যবেক্ষণ এবং প্রতিরোধ করার জন্য একটি স্মার্ট স্বাস্থ্য পর্যবেক্ষণ ব্যবস্থা তৈরি করা।",
      visionTitle: "আমাদের ভিশন",
      visionText: "একটি বিস্তৃত প্রাথমিক সতর্কতা ব্যবস্থা প্রতিষ্ঠা করা যা সম্প্রদায়, স্বাস্থ্য কর্মী এবং সরকারি কর্মকর্তাদের জলজ রোগ মোকাবিলার জন্য প্রকৃত-সময়ের অন্তর্দৃষ্টি এবং কার্যকর বুদ্ধিমত্তা প্রদান করে।",
      techStack: "প্রযুক্তি স্ট্যাক",
      teamTitle: "আমাদের দল",
      critical: "গুরুতর",
      high: "উচ্চ",
      medium: "মাঝারি",
      low: "কম",
      upcoming: "আসন্ন",
      registered: "নিবন্ধিত",
      registerNow: "এখনই নিবন্ধন করুন",
      description: "বর্ণনা",
      prevention: "প্রতিরোধ পদ্ধতি",
      reportedCases: "প্রতিবেদিত মামলা",
      rate: "হার",
      location2: "অবস্থান",
      cases: "মামলা",
      send: "পাঠান",
      aboutAI: "হিলিফাই এআই সম্পর্কে",
      aboutAIText: "আমাদের এআই সহকারী জলজ রোগ, প্রতিরোধ পদ্ধতি এবং স্বাস্থ্য সম্পদ সম্পর্কে আপনার প্রশ্নের তাৎক্ষণিক উত্তর প্রদান করে, একাধিক ভাষায়।",
      symptomsTitle: "লক্ষণ:",
      preventionTitle: "প্রতিরোধ পদ্ধতি:",
      statistics: "প্রকোপ পরিসংখ্যান",
      popularQuestions: [
        "জলজ রোগের সাধারণ লক্ষণগুলি কী?",
        "আমরা জল দূষণ কীভাবে প্রতিরোধ করতে পারি?",
        "আমি যদি জলজ রোগের সন্দেহ করি তবে আমি কী করব?",
        "জলজ রোগের জন্য কোনও গৃহীয় উপায় আছে কি?",
        "আমাদের জলের গুণ কতক্ষণ অন্তর পরীক্ষা করা উচিত?",
        "জল বিশুদ্ধিকরণের সবচেয়ে কার্যকর পদ্ধতিগুলি কী?"
      ],
      genderOptions: {
        male: "পুরুষ",
        female: "মহিলা",
        other: "অন্যান্য"
      },
      symptomsList: [
        "জ্বর", "ডায়রিয়া", "বমি", "পেট ব্যথা", 
        "নির্জলীকরণ", "মাথা ব্যথা", "দুর্বলতা", "বমি"
      ]
    }
  };

  // Get translated text
  const t = (key) => translations[language][key] || key;

  // Disease outbreaks data with translations
  const diseaseOutbreaks = [
    {
      id: 1,
      name: t('outbreakTitle'),
      state: t('outbreakState'),
      cases: 45000,
      rate: 18.5,
      description: {
        en: 'Diarrhea is characterized by loose or watery stools occurring more than three times in a day. In Assam, this outbreak is primarily due to contaminated drinking water sources and poor sanitation infrastructure.',
        hi: 'दस्त की विशेषता ढीले या पानी जैसे मल की होती है जो एक दिन में तीन बार से अधिक होता है। असम में, यह प्रकोप मुख्य रूप से दूषित पेयजल स्रोतों और खराब स्वच्छता बुनियादी ढांचे के कारण है।',
        as: 'ডায়েৰিয়াৰ বৈশিষ্ট্য হ\'ল এটা দিনত তিনি বাৰতকৈ বেছি হোৱা ঢিলা বা পানীয় মল। অসমত, এই প্ৰকোপটো মূলত দূষিত পানীৰ উৎস আৰু খেয়াপৰ স্বাস্থ্য ব্যৱস্থাপ্ৰণালীৰ বাবে।',
        bn: 'ডায়রিয়া এক দিনে তিনবারের বেশী ঢিলা বা পানিময় মল হওয়ার মাধ্যমে চিহ্নিত হয়। অসমে, এই প্রকোপটি মূলত দূষিত পানির উৎস এবং খারাপ স্যানিটেশন অবকাঠামোর জন্য।'
      }[language],
      symptoms: {
        en: ['Frequent loose stools', 'Abdominal cramps', 'Dehydration', 'Nausea', 'Low-grade fever'],
        hi: ['बार-बार ढीले मल', 'पेट में क्रैम्प', 'निर्जलीकरण', 'उल्टी', 'कम बुखार'],
        as: ['বাৰে বাৰে ঢিলা মল', 'পেটত বেদনা', 'নিৰোধন', 'বমি', 'কম জ্বৰ'],
        bn: ['প্রায়ই ঢিলা মল', 'পেট ব্যথা', 'নির্জলীকরণ', 'বমি', 'কম জ্বর']
      }[language],
      prevention: {
        en: ['Boil water before consumption', 'Use water purification tablets', 'Practice good hand hygiene', 'Proper disposal of waste'],
        hi: ['उपभोग से पहले पानी उबालें', 'जल शुद्धिकरण गोलियों का उपयोग करें', 'अच्छी हाथ धोने की आदत डालें', 'कचरे का उचित निपटान करें'],
        as: ['উপভোগৰ আগত পানী উ boilলাওক', 'পানী বিশুদ্ধিকৰণৰ টেবলেট ব্যৱহাৰ কৰক', 'ভাল হাতৰ স্বাস্থ্যব্যৱস্থা অনুশীলন কৰক', 'আবৰ্জনাৰ যথাযথ বিলাস'],
        bn: ['খাওয়ার আগে পানি ফুটিয়ে নিন', 'জল বিশুদ্ধিকরণ ট্যাবলেট ব্যবহার করুন', 'ভালো হাতের স্বাচ্ছন্দ্য অনুশীলন করুন', 'আবর্জনা সঠিকভাবে বিলাস করুন']
      }[language],
      severity: 'critical'
    },
    {
      id: 2,
      name: 'Cholera Outbreak',
      state: 'Meghalaya',
      cases: 32000,
      rate: 16.2,
      description: {
        en: 'Cholera is an acute diarrheal infection caused by ingestion of food or water contaminated with the bacterium Vibrio cholerae. The outbreak in Meghalaya has been linked to floodwaters contaminating drinking sources.',
        hi: 'हैजा एक तीव्र दस्त रोग है जो वाइब्रियो कोलेरे जीवाणु से संक्रमित भोजन या पानी के सेवन से होता है। मेघालय में प्रकोप को बाढ़ के पानी से पीने के पानी के स्रोतों के संदूषित होने से जोड़ा गया है।',
        as: 'হেজা হৈছে এটা তীব্ৰ ডায়েৰিয়াৰ সংক্ৰমণ যি ভাইব্ৰিঅ\' কলেৰে বেক্টেৰিয়াৰ দ্বাৰা সংক্ৰমিত খাদ্য বা পানী গ্ৰহণ কৰোতে হয়। মেঘালয়ত প্ৰকোপটো বনাপানীয়ে পানীৰ উৎস দূষিত কৰাক সংযুক্ত কৰা হৈছে।',
        bn: 'হজা হল এক তীব্র ডায়রিয়া সংক্রমণ যা ভাইব্রিও কলেরে ব্যাকটেরিয়ায় দূষিত খাবার বা পানি খাওয়ায় হয়। মেঘালয়ের প্রকোপটি বন্যার জল দ্বারা পানির উৎস দূষিত হওয়ার সাথে সম্পর্কিত।'
      }[language],
      symptoms: {
        en: ['Watery diarrhea', 'Vomiting', 'Rapid dehydration', 'Muscle cramps', 'Low blood pressure'],
        hi: ['पानी जैसा दस्त', 'उल्टी', 'तेज़ निर्जलीकरण', 'मांसपेशियों में क्रैम्प', 'कम रक्तचाप'],
        as: ['পানীয় ডায়েৰিয়া', 'বমি', 'দ্ৰুত নিৰোধন', 'মাংসপেশীৰ বেদনা', 'কম ব্লাড প্ৰেছাৰ'],
        bn: ['পানিময় ডায়রিয়া', 'বমি', 'দ্রুত নির্জলীকরণ', 'পেশী ব্যথা', 'কম রক্তচাপ']
      }[language],
      prevention: {
        en: ['Drink only treated/boiled water', 'Avoid raw seafood', 'Maintain proper sanitation', 'Oral cholera vaccine'],
        hi: ['केवल उपचारित/उबला हुआ पानी पिएं', 'कच्चे समुद्री भोजन से बचें', 'उचित स्वच्छता बनाए रखें', 'मौखिक हैजा टीका'],
        as: ['কেৱল চিকিৎসিত/উ boilলাও পানী পান কৰক', 'কচ্চা সাগৰীয় খাদ্য এৰি দিয়ক', 'যথাযথ স্বাস্থ্যব্যৱস্থা বজাই ৰাখক', 'মৌখিক হেজা টিকা'],
        bn: ['শুধুমাত্র চিকিত্সাকৃত/ফুটানো পানি খান', 'কাঁচা সাগরীয় খাবার এড়িয়ে চলুন', 'সঠিক স্যানিটেশন বজায় রাখুন', 'মৌখিক হজা ভ্যাকসিন']
      }[language],
      severity: 'high'
    },
    {
      id: 3,
      name: 'Typhoid Outbreak',
      state: 'Manipur',
      cases: 28000,
      rate: 15.8,
      description: {
        en: 'Typhoid fever is a life-threatening illness caused by Salmonella Typhi bacteria. In Manipur, the outbreak is spreading through contaminated water and food handled by infected individuals.',
        hi: 'टाइफाइड बुखार एक जानलेवा बीमारी है जो सैल्मोनेला टाइफी बैक्टीरिया के कारण होती है। मणिपुर में, प्रकोप संक्रमित व्यक्तियों द्वारा संभाले गए दूषित पानी और भोजन के माध्यम से फैल रहा है।',
        as: 'টাইফয়েড জ্বৰ এটা জীৱন্ত বিপদজনক ৰোগ যি চালমোনেলা টাইফি বেক্টেৰিয়াৰ বাবে হয়। মণিপুৰত, প্ৰকোপটো সংক্ৰমিত ব্যক্তিসকলে সংভালি থকা দূষিত পানী আৰু খাদ্যৰ জৰিয়তে বিয়পি পৰিছে।',
        bn: 'টাইফয়েড জ্বর একটি জীবন বিপজ্জনক রোগ যা সালমোনেলা টাইফি ব্যাকটেরিয়ায় হয়। মণিপুরে, প্রকোপটি সংক্রামক ব্যক্তিদের দ্বারা পরিচালিত দূষিত পানি এবং খাবারের মাধ্যমে ছড়িয়ে পড়ছে।'
      }[language],
      symptoms: {
        en: ['High fever', 'Weakness', 'Stomach pain', 'Headache', 'Loss of appetite'],
        hi: ['उच्च बुखार', 'कमजोरी', 'पेट दर्द', 'सिरदर्द', 'भूख कम होना'],
        as: ['উচ্চ জ্বৰ', 'দুৰ্বলতা', 'পেট বেদনা', 'মুণ্ড বেদনা', 'ক্ষুধা কম'],
        bn: ['উচ্চ জ্বর', 'দুর্বলতা', 'পেট ব্যথা', 'মাথা ব্যথা', 'অ্যাপেটাইট কমে যাওয়া']
      }[language],
      prevention: {
        en: ['Vaccination', 'Drink safe water', 'Wash hands regularly', 'Eat thoroughly cooked food'],
        hi: ['टीकाकरण', 'सुरक्षित पानी पिएं', 'नियमित रूप से हाथ धोएं', 'अच्छी तरह से पकाए गए भोजन का सेवन करें'],
        as: ['টিকা', 'সুৰক্ষিত পানী পান কৰক', 'নিয়মীয়াকৈ হাত ধোৱা', 'ভালদৰে ৰান্ধা খাদ্য খোৱা'],
        bn: ['টিকা', 'নিরাপদ পানি খান', 'নিয়মিত হাত ধোন', 'ভালোভাবে রান্না করা খাবার খান']
      }[language],
      severity: 'medium'
    },
    {
      id: 4,
      name: 'Hepatitis Outbreak',
      state: 'Nagaland',
      cases: 25000,
      rate: 14.7,
      description: {
        en: 'Hepatitis A is an inflammation of the liver caused by the hepatitis A virus. The outbreak in Nagaland is due to fecal contamination of drinking water, particularly in rural communities.',
        hi: 'हेपेटाइटिस ए एक जिगर की सूजन है जो हेपेटाइटिस ए वायरस के कारण होती है। नागालैंड में प्रकोप पीने के पानी के मल के संदूषण के कारण है, विशेष रूप से ग्रामीण समुदायों में।',
        as: 'হেপাটাইটিচ A হৈছে হেপাটাইটিচ A ভাইৰাচৰ বাবে হোৱা যকৃতৰ প্ৰদাহ। নগালেণ্ডত প্ৰকোপটো পানীয় পানীৰ মল দ্বাৰা দূষিত হোৱাৰ বাবে, বিশেষকৈ গ্ৰাম্য সম্প্ৰদায়ত।',
        bn: 'হেপাটাইটিস এ হল হেপাটাইটিস এ ভাইরাসের কারণে হওয়া লিভারের প্রদাহ। নাগাল্যান্ডের প্রকোপটি পানির মল দ্বারা দূষিত হওয়ার কারণে, বিশেষত গ্রামীণ সম্প্রদায়ে।'
      }[language],
      symptoms: {
        en: ['Fatigue', 'Nausea', 'Abdominal pain', 'Jaundice', 'Dark urine'],
        hi: ['थकान', 'उल्टी', 'पेट दर्द', 'पीलिया', 'गहरा पीला मूत्र'],
        as: ['ক্লান্তি', 'বমি', 'পেট বেদনা', 'হালদীয়া ৰোগ', 'গাঢ় মূত্ৰ'],
        bn: ['ক্লান্তি', 'বমি', 'পেট ব্যথা', 'হলুদ রোগ', 'গাঢ় মূত্র']
      }[language],
      prevention: {
        en: ['Vaccination', 'Safe water sources', 'Proper handwashing', 'Sanitary food handling'],
        hi: ['टीकाकरण', 'सुरक्षित जल स्रोत', 'उचित हाथ धोना', 'स्वच्छ भोजन प्रबंधन'],
        as: ['টিকা', 'সুৰক্ষিত পানীৰ উৎস', 'যথাযথ হাত ধোৱা', 'স্বাস্থ্যবান খাদ্য ব্যৱস্থাপ্ৰণালী'],
        bn: ['টিকা', 'নিরাপদ পানির উৎস', 'সঠিক হাত ধোয়া', 'স্যানিটারি খাবার পরিচালনা']
      }[language],
      severity: 'low'
    }
  ];

  const communityEvents = [
    {
      id: 1,
      title: 'Online Health Webinar',
      type: 'online',
      platform: 'Zoom',
      date: 'March 20, 2024',
      time: '3:00 PM - 5:00 PM',
      description: {
        en: 'Interactive webinar on water safety practices for urban communities. Learn about home water testing and purification methods.',
        hi: 'शहरी समुदायों के लिए जल सुरक्षा प्रथाओं पर इंटरैक्टिव वेबिनार। घरेलू जल परीक्षण और शुद्धिकरण विधियों के बारे में जानें।',
        as: 'শহৰীয় সম্প্ৰদায়ৰ বাবে পানীৰ সুৰক্ষাৰ অভ্যাসৰ ওপৰত ইন্টাৰেক্টিভ ৱেবিনাৰ। ঘৰৰ পানী পৰীক্ষা আৰু বিশুদ্ধিকৰণ পদ্ধতিৰ বিষয়ে শিকক।',
        bn: 'শহরের সম্প্রদায়ের জন্য জল নিরাপত্তা অনুশীলনের উপর ইন্টারেক্টিভ ওয়েবিনার। গৃহ জল পরীক্ষা এবং বিশুদ্ধিকরণ পদ্ধতি সম্পর্কে জানুন।'
      }[language],
      attendees: 250,
      status: 'upcoming'
    },
    {
      id: 2,
      title: 'Rural Health Camp',
      type: 'offline',
      venue: 'Tura Community Center, Meghalaya',
      date: 'April 5, 2024',
      time: '9:00 AM - 3:00 PM',
      description: {
        en: 'Free health checkups and water quality testing in remote villages. Mobile health units will provide on-site services.',
        hi: 'दूरदराज के गांवों में नि: शुल्क स्वास्थ्य जांच और जल गुणवत्ता परीक्षण। मोबाइल स्वास्थ्य इकाइयां स्थल पर सेवाएं प्रदान करेंगी।',
        as: 'দূৰবৰ্তী গাঁওবোৰত বিনামূল্যে স্বাস্থ্য পৰীক্ষা আৰু পানীৰ গুণ পৰীক্ষা। মবাইল স্বাস্থ্য ইউনিটসমূহে স্থানীয় সেৱা প্ৰদান কৰিব।',
        bn: 'দূরের গ্রামে বিনামূল্যে স্বাস্থ্য পরীক্ষা এবং জল গুণ পরীক্ষা। মোবাইল স্বাস্থ্য ইউনিটগুলি স্থানীয় পরিষেবা প্রদান করবে।'
      }[language],
      attendees: 85,
      status: 'upcoming'
    },
    {
      id: 3,
      title: 'Water Quality Workshop',
      type: 'online',
      platform: 'Microsoft Teams',
      date: 'April 15, 2024',
      time: '11:00 AM - 1:00 PM',
      description: {
        en: 'Virtual training session on water purification techniques for urban households. Includes Q&A with water quality experts.',
        hi: 'शहरी घरेलू उपयोगकर्ताओं के लिए जल शुद्धिकरण तकनीकों पर आभासी प्रशिक्षण सत्र। जल गुणवत्ता विशेषज्ञों के साथ प्रश्नोत्तर सत्र शामिल है।',
        as: 'শহৰীয় পৰিয়ালৰ বাবে পানী বিশুদ্ধিকৰণ কৌশলৰ ওপৰত ভাৰচুৱেল প্ৰশিক্ষণ অধিবেশন। পানীৰ গুণ বিশেষজ্ঞসকলৰ সৈতে প্ৰশ্নোত্তৰ অধিবেশন অন্তৰ্ভুক্ত কৰে।',
        bn: 'শহরের পরিবারের জন্য জল বিশুদ্ধিকরণ কৌশলের উপর ভার্চুয়াল প্রশিক্ষণ অধিবেশন। জল গুণ বিশেষজ্ঞদের সাথে প্রশ্নোত্তর অধিবেশন অন্তর্ভুক্ত করে।'
      }[language],
      attendees: 180,
      status: 'upcoming'
    },
    {
      id: 4,
      title: 'Village Health Screening',
      type: 'offline',
      venue: 'Kohima School Complex, Nagaland',
      date: 'May 2, 2024',
      time: '8:00 AM - 2:00 PM',
      description: {
        en: 'Special health camp focusing on pediatric waterborne diseases and preventive care in rural areas.',
        hi: 'ग्रामीण क्षेत्रों में बाल जलजनित रोगों और निवारक देखभाल पर केंद्रित विशेष स्वास्थ्य शिविर।',
        as: 'গ্ৰাম্য অঞ্চলত শিশুৰ পানীজনিত ৰোগ আৰু প্ৰতিৰোধী চিকিৎসাৰ ওপৰত গুৰুত্ব দিয়া বিশেষ স্বাস্থ্য কেম্প।',
        bn: 'গ্রামীণ এলাকায় শিশুদের জলজ রোগ এবং প্রতিরোধী চিকিৎসার উপর নজরদারি করা বিশেষ স্বাস্থ্য ক্যাম্প।'
      }[language],
      attendees: 200,
      status: 'upcoming'
    }
  ];

  const northeastStats = [
    { state: 'Assam', cases: 45000, rate: 18.5 },
    { state: 'Meghalaya', cases: 32000, rate: 16.2 },
    { state: 'Manipur', cases: 28000, rate: 15.8 },
    { state: 'Nagaland', cases: 25000, rate: 14.7 },
    { state: 'Arunachal Pradesh', cases: 18000, rate: 12.3 }
  ];

  const diseaseTrends = [
    { month: 'Jan', diarrhea: 120, cholera: 85, typhoid: 65, hepatitis: 45 },
    { month: 'Feb', diarrhea: 150, cholera: 95, typhoid: 75, hepatitis: 55 },
    { month: 'Mar', diarrhea: 200, cholera: 120, typhoid: 100, hepatitis: 70 },
    { month: 'Apr', diarrhea: 280, cholera: 180, typhoid: 150, hepatitis: 110 },
    { month: 'May', diarrhea: 350, cholera: 220, typhoid: 180, hepatitis: 140 },
    { month: 'Jun', diarrhea: 420, cholera: 280, typhoid: 220, hepatitis: 180 },
    { month: 'Jul', diarrhea: 500, cholera: 350, typhoid: 280, hepatitis: 230 },
    { month: 'Aug', diarrhea: 480, cholera: 320, typhoid: 260, hepatitis: 210 },
    { month: 'Sep', diarrhea: 400, cholera: 280, typhoid: 220, hepatitis: 180 },
    { month: 'Oct', diarrhea: 320, cholera: 220, typhoid: 180, hepatitis: 150 },
    { month: 'Nov', diarrhea: 200, cholera: 150, typhoid: 120, hepatitis: 90 },
    { month: 'Dec', diarrhea: 150, cholera: 100, typhoid: 80, hepatitis: 60 }
  ];

  const teamMembers = [
    { name: "Abhimanyu" },
    { name: "Siddharth" },
    { name: "Rudra" },
    { name: "Karan" },
    { name: "Ananya" },
    { name: "Rohan" }
  ];

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('bg-dark', 'text-light');
    } else {
      document.body.classList.remove('bg-dark', 'text-light');
    }
  }, [darkMode]);

  const handleSendMessage = () => {
    if (!userMessage.trim()) return;
    const newUserMessage = { id: Date.now(), text: userMessage, sender: 'user', lang: language };
    setMessages(prev => [...prev, newUserMessage]);
    setUserMessage('');
    setIsTyping(true);
    setTimeout(() => {
      const aiResponses = {
        en: [
          "Waterborne diseases are caused by consuming contaminated water. Common ones include cholera, typhoid, and dysentery.",
          "To prevent waterborne diseases, ensure proper water treatment, use safe water sources, and maintain good hygiene practices.",
          "If you suspect a waterborne illness, seek medical attention immediately and avoid sharing food or drink with others.",
          "While some home remedies may provide relief, it's crucial to consult a healthcare professional for proper diagnosis and treatment.",
          "Regular water testing is recommended, especially during monsoon season when contamination risks increase."
        ],
        hi: [
          "जलजनित रोग दूषित जल के सेवन से होते हैं। सामान्य रोगों में हैजा, टाइफाइड और पेचिश शामिल हैं।",
          "जलजनित रोगों को रोकने के लिए, उचित जल उपचार सुनिश्चित करें, सुरक्षित जल स्रोतों का उपयोग करें और अच्छी स्वच्छता प्रथाओं को बनाए रखें।",
          "अगर आपको जलजनित बीमारी का संदेह है, तो तुरंत चिकित्सा सहायता लें और दूसरों के साथ भोजन या पेय पदार्थ साझा करने से बचें।",
          "हालांकि कुछ घरेलू उपचार राहत प्रदान कर सकते हैं, लेकिन उचित निदान और उपचार के लिए स्वास्थ्य देखभाल पेशेवर से परामर्श लेना महत्वपूर्ण है।",
          "नियमित जल परीक्षण की अनुशंसा की जाती है, विशेष रूप से मानसून के मौसम के दौरान जब संदूषण के जोखिम बढ़ जाते हैं।"
        ],
        as: [
          "পানীজনিত ৰোগ দূষিত পানী গ্ৰহণ কৰোতে হয়। সাধাৰণ ৰোগবোৰৰ ভিতৰত হেজা, টাইফয়েড আৰু ডিছেন্টেৰি অন্তৰ্ভুক্ত।",
          "পানীজনিত ৰোগ প্ৰতিৰোধ কৰিবলৈ, যথাযথ পানী চিকিৎসা সুনিশ্চিত কৰক, সুৰক্ষিত পানীৰ উৎস ব্যৱহাৰ কৰক আৰু ভাল স্বাস্থ্যব্যৱস্থা বজাই ৰাখক।",
          "আপুনি যদি পানীজনিত ৰোগৰ সন্দেহ কৰে তেন্তে তৎক্ষণাৎ চিকিৎসা সহায়তা লওক আৰু অন্যৰ সৈতে খাদ্য বা পানী ভাগ-বাটৰি কৰাৰ পৰা বাচি চলক।",
          "যদিও কিছু ঘৰৰ উপায়ে সাহায্য কৰিব পাৰে, কিন্তু যথাযথ নিৰ্ণয় আৰু চিকিৎসাৰ বাবে স্বাস্থ্য সেৱা পেছাৱতীৰ পৰামৰ্শ লোৱাটো অত্যন্ত প্ৰয়োজনীয়।",
          "নিয়মীয়াকৈ পানী পৰীক্ষা কৰাৰ পৰামৰ্শ দিয়া হয়, বিশেষকৈ মানসুনৰ মৌচুমত যেতিয়া দূষণৰ বিপদ বাঢ়ি যায়।"
        ],
        bn: [
          "জলজ রোগ দূষিত জল খাওয়ায় হয়। সাধারণ রোগগুলির মধ্যে রয়েছে হজা, টাইফয়েড এবং ডিসেন্টেরি।",
          "জলজ রোগ প্রতিরোধ করতে, প্রযুক্তিগত জল চিকিৎসা নিশ্চিত করুন, নিরাপদ জলের উৎস ব্যবহার করুন এবং ভালো স্বাচ্ছন্দ্য অনুশীলন করুন।",
          "আপনি যদি জলজ রোগের সন্দেহ করেন তবে তৎক্ষণাৎ চিকিৎসা সাহায্য নিন এবং অন্যদের সাথে খাবার বা পানীয় ভাগ করে নেওয়া এড়িয়ে চলুন।",
          "যদিও কিছু গৃহীয় উপায় সাহায্য করতে পারে, তবু সঠিক নির্ণয় এবং চিকিৎসার জন্য স্বাস্থ্য সেবা পেশাদারের পরামর্শ নেওয়া অপরিহার্য।",
          "নিয়মিত জল পরীক্ষা করার পরামর্শ দেওয়া হয়, বিশেষত মানসূন মৌসুমে যখন দূষণের ঝুঁকি বাড়ে।"
        ]
      };
      const responses = aiResponses[language];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setMessages(prev => [...prev, { id: Date.now() + 1, text: randomResponse, sender: 'ai', lang: language }]);
      setIsTyping(false);
    }, 1500);
  };

  const handlePopularQuestionClick = (question) => {
    const newUserMessage = { id: Date.now(), text: question, sender: 'user', lang: language };
    setMessages(prev => [...prev, newUserMessage]);
    setUserMessage('');
    setIsTyping(true);
    setTimeout(() => {
      const aiResponses = {
        en: [
          "Common symptoms include diarrhea, vomiting, abdominal cramps, fever, and dehydration. These symptoms typically appear within hours to days after exposure.",
          "Prevent contamination by treating water properly, avoiding disposal of waste near water sources, and using protected water storage containers.",
          "Seek immediate medical attention, stay hydrated, and inform local health authorities about potential outbreaks in your area.",
          "While some natural remedies like oral rehydration solutions can help, they shouldn't replace professional medical treatment.",
          "It's recommended to test water at least quarterly, or more frequently during monsoon seasons and after heavy rainfall.",
          "Effective methods include boiling, chlorination, UV treatment, and using water purification tablets or filters."
        ],
        hi: [
          "सामान्य लक्षणों में दस्त, उल्टी, पेट में क्रैम्प, बुखार और निर्जलीकरण शामिल हैं। ये लक्षण आमतौर पर प्रकाश के घंटों से दिनों के भीतर दिखाई देते हैं।",
          "पानी को ठीक से उपचारित करके, जल स्रोतों के पास कचरे का निपटान न करके और सुरक्षित जल भंडारण पात्रों का उपयोग करके संदूषण को रोकें।",
          "तुरंत चिकित्सा सहायता लें, जलयोजन बनाए रखें और अपने क्षेत्र में संभावित प्रकोप के बारे में स्थानीय स्वास्थ्य अधिकारियों को सूचित करें।",
          "हालांकि कुछ प्राकृतिक उपचार जैसे मौखिक पुनर्जलयोजन समाधान सहायक हो सकते हैं, लेकिन वे पेशेवर चिकित्सा उपचार की जगह नहीं ले सकते।",
          "पानी का परीक्षण कम से कम त्रैमासिक करने की सिफारिश की जाती है, या मानसून के मौसम और भारी वर्षा के बाद अधिक बार।",
          "प्रभावी विधियों में उबालना, क्लोरीनीकरण, यूवी उपचार और जल शुद्धिकरण गोलियों या फिल्टरों का उपयोग शामिल है।"
        ],
        as: [
          "সাধাৰণ লক্ষণসমূহৰ ভিতৰত ডায়েৰিয়া, বমি, পেটত বেদনা, জ্বৰ আৰু নিৰোধন অন্তৰ্ভুক্ত। এই লক্ষণসমূহ সাধাৰণত প্ৰকাশৰ ঘন্টাৰ পৰা দিনবোৰৰ ভিতৰত প্ৰদৰ্শন হয়।",
          "পানী যথাযথভাৱে চিকিৎসা কৰি, পানীৰ উৎসৰ ওচৰত আবৰ্জনা বিলাস নকৰি আৰু সুৰক্ষিত পানী ভঁৰাল ধৰণ ব্যৱহাৰ কৰি দূষণ ৰোধ কৰক।",
          "তৎক্ষণাৎ চিকিৎসা সহায়তা লওক, জলযোজন বজাই ৰাখক আৰু আপোনাৰ অঞ্চলত সম্ভাৱ্য প্ৰকোপৰ বিষয়ে স্থানীয় স্বাস্থ্য কৰ্তৃপক্ষক অৱগত কৰক।",
          "যদিও কিছু প্ৰাকৃতিক উপায় যেনে মৌখিক পুনৰ্জলযোজন সমাধানে সহায় কৰিব পাৰে, কিন্তু সিহতে পেছাৱতী চিকিৎসা চিকিৎসাৰ স্থান লব নোৱাৰে।",
          "পানী কমেও ত্ৰৈমাসিকভাৱে পৰীক্ষা কৰাৰ পৰামৰ্শ দিয়া হয়, বা মানসুনৰ মৌচুমত আৰু ভাৰী বৰষুণৰ পিছত অধিক বাৰ।",
          "প্ৰভাৱশালী পদ্ধতিসমূহৰ ভিতৰত উ boilলাও, ক্ল 'ৰিনেচন, ইউভি চিকিৎসা আৰু পানী বিশুদ্ধিকৰণ টেবলেট বা ফিল্টাৰ ব্যৱহাৰ কৰা অন্তৰ্ভুক্ত।"
        ],
        bn: [
          "সাধারণ লক্ষণগুলির মধ্যে রয়েছে ডায়রিয়া, বমি, পেট ব্যথা, জ্বর এবং নির্জলীকরণ। এই লক্ষণগুলি সাধারণত এক্সপোজারের ঘন্টার থেকে দিনের মধ্যে প্রদর্শিত হয়।",
          "জল সঠিকভাবে চিকিত্সা করে, জলের উৎসের কাছাকাছি আবর্জনা বিলাস না করে এবং সুরক্ষিত জল সংরক্ষণ ধারক ব্যবহার করে দূষণ প্রতিরোধ করুন।",
          "তৎক্ষণাৎ চিকিৎসা সাহায্য নিন, জলযোজন বজায় রাখুন এবং আপনার এলাকায় সম্ভাব্য প্রকোপের বিষয়ে স্থানীয় স্বাস্থ্য কর্তৃপক্ষকে অবগত করুন।",
          "যদিও কিছু প্রাকৃতিক উপায় যেমন মৌখিক পুনর্জলযোজন সমাধান সাহায্য করতে পারে, তবু তারা পেশাদার চিকিৎসা চিকিৎসার পরিবর্তে হওয়া উচিত নয়।",
          "জল কমপক্ষে ত্রৈমাসিকভাবে পরীক্ষা করার পরামর্শ দেওয়া হয়, বা মানসূন মৌসুমে এবং ভারী বৃষ্টির পরে বেশি ঘন ঘন।",
          "কার্যকর পদ্ধতিগুলির মধ্যে রয়েছে ফুটানো, ক্লোরিনেশন, ইউভি চিকিৎসা এবং জল বিশুদ্ধিকরণ ট্যাবলেট বা ফিল্টার ব্যবহার করা।"
        ]
      };
      const responses = aiResponses[language];
      const responseIndex = t('popularQuestions').indexOf(question);
      const randomResponse = responses[responseIndex] || responses[Math.floor(Math.random() * responses.length)];
      setMessages(prev => [...prev, { id: Date.now() + 1, text: randomResponse, sender: 'ai', lang: language }]);
      setIsTyping(false);
    }, 1500);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    alert('Data submitted successfully! AI analysis will be available shortly.');
    setFormData({
      name: '',
      age: '',
      gender: '',
      location: '',
      symptoms: [],
      waterQuality: {
        ph: '',
        turbidity: '',
        coliform: '',
        ecoli: ''
      }
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSymptomChange = (symptom) => {
    setFormData(prev => {
      const symptoms = prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom];
      return { ...prev, symptoms };
    });
  };

  const handleWaterQualityChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      waterQuality: {
        ...prev.waterQuality,
        [name]: value
      }
    }));
  };

  const toggleChat = () => {
    setChatOpen(!chatOpen);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'border-start border-danger border-4';
      case 'high': return 'border-start border-warning border-4';
      case 'medium': return 'border-start border-info border-4';
      case 'low': return 'border-start border-secondary border-4';
      default: return '';
    }
  };

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarOpen && !event.target.closest('.sidebar') && !event.target.closest('.hamburger-btn')) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sidebarOpen]);

  return (
    <div className={`${darkMode ? 'bg-dark text-light' : 'bg-light'} min-vh-100`}>
      {/* Header */}
      <header className={`shadow sticky-top ${darkMode ? 'bg-dark' : 'bg-white'}`}>
        <div className="container-fluid">
          <div className="d-flex justify-content-between align-items-center py-3">
            <div className="d-flex align-items-center">
              <button 
                className="hamburger-btn btn me-3" 
                onClick={toggleSidebar}
                style={{ color: darkMode ? 'white' : 'black' }}
              >
                {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
              </button>
              <div className="me-2" style={{ width: '40px', height: '40px', background: 'linear-gradient(to right, #0D6EFD, #198754)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg className="text-white" width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h1 className="h4 fw-bold mb-0">HEALIFY</h1>
            </div>
            <button 
              className="btn" 
              onClick={toggleDarkMode}
              style={{ color: darkMode ? 'white' : 'black' }}
            >
              {darkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
            </button>
          </div>
        </div>
      </header>
      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div 
          className="position-fixed w-100 h-100 bg-dark bg-opacity-50 d-lg-none"
          style={{ top: 0, left: 0, zIndex: 999 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className="d-flex">
        {/* Sidebar Navigation */}
        <aside 
          className="sidebar shadow position-fixed"
          style={{ 
            width: '256px', 
            height: '100vh', 
            top: '0',
            left: sidebarOpen ? '0' : '-256px',
            backgroundColor: darkMode ? '#2d2d2d' : 'white',
            transition: 'left 0.3s ease',
            zIndex: 1000,
            paddingTop: '70px'
          }}
        >
          <div className="p-3 border-bottom">
            <div className="d-flex align-items-center mb-3">
              <div className="me-2" style={{ width: '30px', height: '30px', background: 'linear-gradient(to right, #0D6EFD, #198754)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg className="text-white" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h2 className="h5 fw-bold mb-0">HEALIFY</h2>
            </div>
          </div>
          <nav className="p-3">
            <ul className="list-unstyled">
              <li>
                <button 
                  onClick={() => { setActiveTab('home'); setSidebarOpen(false); }} 
                  className={`w-100 text-start btn mb-2 ${activeTab === 'home' ? 'btn-primary' : darkMode ? 'btn-dark text-light' : 'btn-light'}`}
                >
                  <FaHome className="me-2" /> {t('home')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setActiveTab('submit'); setSidebarOpen(false); }} 
                  className={`w-100 text-start btn mb-2 ${activeTab === 'submit' ? 'btn-primary' : darkMode ? 'btn-dark text-light' : 'btn-light'}`}
                >
                  <FaDatabase className="me-2" /> {t('submitData')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setActiveTab('community'); setSidebarOpen(false); }} 
                  className={`w-100 text-start btn mb-2 ${activeTab === 'community' ? 'btn-primary' : darkMode ? 'btn-dark text-light' : 'btn-light'}`}
                >
                  <FaUsers className="me-2" /> {t('community')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setActiveTab('chat'); setSidebarOpen(false); }} 
                  className={`w-100 text-start btn mb-2 ${activeTab === 'chat' ? 'btn-primary' : darkMode ? 'btn-dark text-light' : 'btn-light'}`}
                >
                  <FaRobot className="me-2" /> {t('aiAssistant')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setActiveTab('about'); setSidebarOpen(false); }} 
                  className={`w-100 text-start btn mb-2 ${activeTab === 'about' ? 'btn-primary' : darkMode ? 'btn-dark text-light' : 'btn-light'}`}
                >
                  <FaInfoCircle className="me-2" /> {t('about')}
                </button>
              </li>
              {/* Language Selector */}
              <li className="mt-3">
                <div className="d-flex align-items-center mb-2">
                  <FaGlobe className="me-2" />
                  <span className="fw-bold">{t('language')}</span>
                </div>
                <div className="d-grid gap-2">
                  <button 
                    onClick={() => setLanguage('en')} 
                    className={`btn btn-sm w-100 ${language === 'en' ? 'btn-primary' : darkMode ? 'btn-outline-light' : 'btn-outline-primary'}`}
                  >
                    {t('english')}
                  </button>
                  <button 
                    onClick={() => setLanguage('hi')} 
                    className={`btn btn-sm w-100 ${language === 'hi' ? 'btn-primary' : darkMode ? 'btn-outline-light' : 'btn-outline-primary'}`}
                  >
                    {t('hindi')}
                  </button>
                  <button 
                    onClick={() => setLanguage('as')} 
                    className={`btn btn-sm w-100 ${language === 'as' ? 'btn-primary' : darkMode ? 'btn-outline-light' : 'btn-outline-primary'}`}
                  >
                    {t('assamese')}
                  </button>
                  <button 
                    onClick={() => setLanguage('bn')} 
                    className={`btn btn-sm w-100 ${language === 'bn' ? 'btn-primary' : darkMode ? 'btn-outline-light' : 'btn-outline-primary'}`}
                  >
                    {t('bengali')}
                  </button>
                </div>
              </li>
            </ul>
          </nav>
        </aside>
        {/* Main Content */}
        <main 
          style={{ 
            marginLeft: '0', 
            padding: '24px', 
            width: '100%',
            transition: 'margin-left 0.3s ease'
          }} 
          className={darkMode ? 'text-light' : ''}
        >
          {/* HOME TAB */}
          {activeTab === 'home' && (
            <div>
              {/* Hero Section */}
              <div className="card text-white mb-4" style={{ background: 'linear-gradient(to right, #0D6EFD, #198754)', borderRadius: '1rem' }}>
                <div className="card-body p-5">
                  <h2 className="card-title h1 fw-bold">{t('heroTitle')}</h2>
                  <p className="card-text fs-4 opacity-75 mb-4">
                    {t('heroSubtitle')}
                  </p>
                  <div className="d-flex flex-wrap gap-2">
                    <span className="badge bg-light text-dark bg-opacity-25">AI-Powered Detection</span>
                    <span className="badge bg-light text-dark bg-opacity-25">Real-Time Alerts</span>
                    <span className="badge bg-light text-dark bg-opacity-25">Northeast Focus</span>
                  </div>
                </div>
              </div>
              {/* Outbreak Summary */}
              <div className="row mb-4">
                {diseaseOutbreaks.map((outbreak) => (
                  <div key={outbreak.id} className="col-lg-3 col-md-6 mb-3">
                    <div 
                      className={`card h-100 ${getSeverityColor(outbreak.severity)} cursor-pointer`} 
                      onClick={() => setSelectedOutbreak(outbreak)}
                      style={{ borderRadius: '1rem', cursor: 'pointer' }}
                    >
                      <div className="card-body">
                        <h3 className="card-title h5 fw-bold mb-3">{outbreak.name}</h3>
                        <div className="mb-3">
                          <h4 className="h6 text-muted">{t('state')}</h4>
                          <p className="fw-bold mb-1">{outbreak.state}</p>
                        </div>
                        <div className="row">
                          <div className="col-6">
                            <h4 className="h6 text-muted">{t('outbreakCases')}</h4>
                            <p className="fw-bold">{outbreak.cases.toLocaleString()}</p>
                          </div>
                          <div className="col-6">
                            <h4 className="h6 text-muted">{t('outbreakRate')}</h4>
                            <p className="fw-bold">{outbreak.rate}/1000</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Statistics Dashboard */}
              <div className="row mb-4">
                <div className="col-lg-6 mb-3">
                  <div className={`card ${darkMode ? 'bg-dark text-light' : ''}`} style={{ borderRadius: '1rem' }}>
                    <div className="card-body">
                      <h3 className="card-title h5 fw-bold mb-3">{t('statisticsTitle')}</h3>
                      <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={northeastStats}>
                            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#444' : '#ccc'} />
                            <XAxis dataKey="state" stroke={darkMode ? 'white' : 'black'} />
                            <YAxis stroke={darkMode ? 'white' : 'black'} />
                            <Tooltip 
                              contentStyle={darkMode ? { backgroundColor: '#2d2d2d', border: '1px solid #444' } : {}} 
                              labelStyle={darkMode ? { color: 'white' } : {}} 
                            />
                            <Legend />
                            <Bar dataKey="cases" fill="#0D6EFD" name={t('cases')} />
                            <Bar dataKey="rate" fill="#198754" name={`${t('rate')} per 1000`} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-6 mb-3">
                  <div className={`card ${darkMode ? 'bg-dark text-light' : ''}`} style={{ borderRadius: '1rem' }}>
                    <div className="card-body">
                      <h3 className="card-title h5 fw-bold mb-3">{t('trendsTitle')}</h3>
                      <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={diseaseTrends}>
                            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#444' : '#ccc'} />
                            <XAxis dataKey="month" stroke={darkMode ? 'white' : 'black'} />
                            <YAxis stroke={darkMode ? 'white' : 'black'} />
                            <Tooltip 
                              contentStyle={darkMode ? { backgroundColor: '#2d2d2d', border: '1px solid #444' } : {}} 
                              labelStyle={darkMode ? { color: 'white' } : {}} 
                            />
                            <Legend />
                            <Line type="monotone" dataKey="diarrhea" stroke="#ef4444" name="Diarrhea" />
                            <Line type="monotone" dataKey="cholera" stroke="#f59e0b" name="Cholera" />
                            <Line type="monotone" dataKey="typhoid" stroke="#059669" name="Typhoid" />
                            <Line type="monotone" dataKey="hepatitis" stroke="#7c3aed" name="Hepatitis" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Emergency Response Status */}
              <div className={`card mb-4 ${darkMode ? 'bg-dark text-light' : ''}`} style={{ borderRadius: '1rem' }}>
                <div className="card-body">
                  <h3 className="card-title h4 fw-bold mb-4">{t('emergencyTitle')}</h3>
                  <div className="table-responsive">
                    <table className={`table ${darkMode ? 'table-dark' : 'table-hover'}`}>
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
                        <tr>
                          <td><span className="badge bg-danger">Diarrhea</span></td>
                          <td>Assam</td>
                          <td><span className="badge bg-danger">{t('critical')}</span></td>
                          <td>Deployed</td>
                          <td>2 hours ago</td>
                        </tr>
                        <tr>
                          <td><span className="badge bg-warning text-dark">Cholera</span></td>
                          <td>Meghalaya</td>
                          <td><span className="badge bg-warning text-dark">{t('high')}</span></td>
                          <td>En Route</td>
                          <td>4 hours ago</td>
                        </tr>
                        <tr>
                          <td><span className="badge bg-info text-dark">Typhoid</span></td>
                          <td>Manipur</td>
                          <td><span className="badge bg-info text-dark">{t('medium')}</span></td>
                          <td>Assessing</td>
                          <td>6 hours ago</td>
                        </tr>
                        <tr>
                          <td><span className="badge bg-secondary">Hepatitis</span></td>
                          <td>Nagaland</td>
                          <td><span className="badge bg-secondary">{t('low')}</span></td>
                          <td>Monitoring</td>
                          <td>8 hours ago</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* SUBMIT TAB */}
          {activeTab === 'submit' && (
            <div className={`card ${darkMode ? 'bg-dark text-light' : ''}`} style={{ borderRadius: '1rem' }}>
              <div className="card-body p-5">
                <h2 className="card-title h3 fw-bold mb-4">{t('submitTitle')}</h2>
                <p className={`mb-4 ${darkMode ? 'text-light' : ''}`}>
                  {t('submitSubtitle')}
                </p>
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
                            <option value="male">{t('genderOptions').male}</option>
                            <option value="female">{t('genderOptions').female}</option>
                            <option value="other">{t('genderOptions').other}</option>
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
                      <div className="mb-3">
                        <label className={`form-label ${darkMode ? 'text-light' : ''}`}>{t('symptoms')}</label>
                        <div className="row">
                          {t('symptomsList').map((symptom, index) => (
                            <div key={index} className="col-md-6 mb-2">
                              <div className="form-check">
                                <input 
                                  className="form-check-input" 
                                  type="checkbox" 
                                  checked={formData.symptoms.includes(symptom)}
                                  onChange={() => handleSymptomChange(symptom)}
                                />
                                <label className={`form-check-label ${darkMode ? 'text-light' : ''}`}>{symptom}</label>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className={`form-label ${darkMode ? 'text-light' : ''}`}>{t('waterQuality')}</label>
                        <div className="row">
                          <div className="col-6">
                            <label className={`form-label small ${darkMode ? 'text-light' : ''}`}>{t('pH')}</label>
                            <input 
                              type="number" 
                              className={`form-control ${darkMode ? 'bg-dark text-light' : ''}`} 
                              name="ph"
                              value={formData.waterQuality.ph}
                              onChange={handleWaterQualityChange}
                              placeholder="7.0" 
                            />
                          </div>
                          <div className="col-6">
                            <label className={`form-label small ${darkMode ? 'text-light' : ''}`}>{t('turbidity')}</label>
                            <input 
                              type="number" 
                              className={`form-control ${darkMode ? 'bg-dark text-light' : ''}`}
                              name="turbidity"
                              value={formData.waterQuality.turbidity}
                              onChange={handleWaterQualityChange}
                              placeholder="5 NTU" 
                            />
                          </div>
                          <div className="col-6">
                            <label className={`form-label small ${darkMode ? 'text-light' : ''}`}>{t('coliform')}</label>
                            <input 
                              type="number" 
                              className={`form-control ${darkMode ? 'bg-dark text-light' : ''}`} 
                              name="coliform"
                              value={formData.waterQuality.coliform}
                              onChange={handleWaterQualityChange}
                              placeholder="0 CFU/mL" 
                            />
                          </div>
                          <div className="col-6">
                            <label className={`form-label small ${darkMode ? 'text-light' : ''}`}>{t('ecoli')}</label>
                            <input 
                              type="number" 
                              className={`form-control ${darkMode ? 'bg-dark text-light' : ''}`} 
                              name="ecoli"
                              value={formData.waterQuality.ecoli}
                              onChange={handleWaterQualityChange}
                              placeholder="0 CFU/mL" 
                            />
                          </div>
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className={`form-label ${darkMode ? 'text-light' : ''}`}>{t('upload')}</label>
                        <input type="file" className="form-control" accept=".pdf,.jpg,.png,.xlsx" />
                      </div>
                      <button className="btn btn-primary w-100">{t('submitButton')}</button>
                    </form>
                  </div>
                  <div className="col-lg-6">
                    <h3 className="h5 fw-bold mb-3">{t('analysisTitle')}</h3>
                    <div className={`p-5 text-center ${darkMode ? 'bg-dark' : 'bg-light'}`} style={{ height: '384px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '0.5rem' }}>
                      <div>
                        <svg className="text-primary mb-3" width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <p className={darkMode ? 'text-light' : 'text-muted'}>{t('analysisPlaceholder')}</p>
                        <p className={`small ${darkMode ? 'text-light' : 'text-muted'}`}>AI model will generate comprehensive report with visualizations</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* COMMUNITY TAB */}
          {activeTab === 'community' && (
            <div>
              <div className={`card ${darkMode ? 'bg-dark text-light' : ''}`} style={{ borderRadius: '1rem' }}>
                <div className="card-body p-5">
                  <h2 className="card-title h3 fw-bold mb-4">{t('communityTitle')}</h2>
                  <p className={`mb-4 ${darkMode ? 'text-light' : ''}`}>
                    {t('communitySubtitle')}
                  </p>
                  <div className="row">
                    <div className="col-lg-8">
                      <h3 className="h5 fw-bold mb-3">{t('eventsTitle')}</h3>
                      {communityEvents.map(event => (
                        <div key={event.id} className={`card mb-3 ${darkMode ? 'bg-dark border-secondary' : ''}`}>
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <h4 className="card-title h5 fw-bold">{event.title}</h4>
                                <p className={`mb-2 ${darkMode ? 'text-light' : 'text-muted'}`}>
                                  <i className={`fas fa-${event.type === 'online' ? 'desktop' : 'map-marker-alt'} me-2`}></i>
                                  {event.type === 'online' ? event.platform : event.venue}
                                </p>
                                <p className={`mb-2 ${darkMode ? 'text-light' : ''}`}>
                                  <i className="fas fa-calendar me-2"></i>
                                  {event.date} at {event.time}
                                </p>
                                <p className={`mb-3 ${darkMode ? 'text-light' : ''}`}>{event.description}</p>
                              </div>
                              <span className={`badge ${event.status === 'upcoming' ? 'bg-success' : 'bg-secondary'}`}>
                                {t('upcoming')}
                              </span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                              <span className={darkMode ? 'text-light' : 'text-muted'}>
                                <i className="fas fa-users me-1"></i> {event.attendees} {t('registered')}
                              </span>
                              <button className={`btn ${darkMode ? 'btn-outline-light' : 'btn-outline-primary'} btn-sm`}>
                                {t('registerNow')}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="col-lg-4">
                      <h3 className="h5 fw-bold mb-3">{t('programHighlights')}</h3>
                      <div className="row g-3">
                        <div className="col-12">
                          <div className={`card h-100 ${darkMode ? 'bg-dark border-secondary' : 'bg-light'}`}>
                            <div className="card-body text-center">
                              <i className="fas fa-laptop-house fa-2x text-primary mb-2"></i>
                              <h5 className="card-title h6 fw-bold">{t('onlinePrograms')}</h5>
                              <p className={`small mb-0 ${darkMode ? 'text-light' : ''}`}>Webinars and virtual workshops for urban communities</p>
                            </div>
                          </div>
                        </div>
                        <div className="col-12">
                          <div className={`card h-100 ${darkMode ? 'bg-dark border-secondary' : 'bg-light'}`}>
                            <div className="card-body text-center">
                              <i className="fas fa-hands-helping fa-2x text-success mb-2"></i>
                              <h5 className="card-title h6 fw-bold">{t('offlineEvents')}</h5>
                              <p className={`small mb-0 ${darkMode ? 'text-light' : ''}`}>Health camps and field visits for rural areas</p>
                            </div>
                          </div>
                        </div>
                        <div className="col-12">
                          <div className={`card h-100 ${darkMode ? 'bg-dark border-secondary' : 'bg-light'}`}>
                            <div className="card-body text-center">
                              <i className="fas fa-tint fa-2x text-info mb-2"></i>
                              <h5 className="card-title h6 fw-bold">{t('waterTesting')}</h5>
                              <p className={`small mb-0 ${darkMode ? 'text-light' : ''}`}>Quality assessment and purification</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* CHAT TAB */}
          {activeTab === 'chat' && (
            <div className={`card ${darkMode ? 'bg-dark text-light' : ''}`} style={{ borderRadius: '1rem' }}>
              <div className="card-body p-4">
                <h2 className="card-title h3 fw-bold mb-4">{t('chatTitle')}</h2>
                <div className="row">
                  <div className="col-lg-8">
                    <div className={`card h-100 ${darkMode ? 'bg-dark' : 'bg-light'}`} style={{ height: '500px' }}>
                      <div className="card-body p-3" style={{ overflowY: 'auto', height: '400px' }}>
                        {messages.map((msg) => (
                          <div key={msg.id} className={`d-flex mb-3 ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                            <div 
                              className={`p-3 rounded ${msg.sender === 'user' ? 'bg-primary text-white' : darkMode ? 'bg-secondary text-light' : 'bg-light text-dark'}`} 
                              style={{ maxWidth: '70%' }}
                            >
                              <p className="mb-0">{msg.text}</p>
                            </div>
                          </div>
                        ))}
                        {isTyping && (
                          <div className="d-flex justify-content-start mb-3">
                            <div className={`p-3 rounded ${darkMode ? 'bg-secondary' : 'bg-light'}`}>
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
                        <div className="d-flex flex-wrap gap-1 mb-2">
                          {t('popularQuestions').slice(0, 3).map((question, index) => (
                            <button 
                              key={index} 
                              onClick={() => handlePopularQuestionClick(question)} 
                              className={`btn btn-sm ${darkMode ? 'btn-outline-light' : 'btn-outline-primary'}`}
                              style={{ fontSize: '0.7rem' }}
                            >
                              {question.split(' ').slice(0, 3).join(' ')}...
                            </button>
                          ))}
                        </div>
                        <div className="input-group">
                          <input
                            type="text"
                            value={userMessage}
                            onChange={(e) => setUserMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder={t('chatPlaceholder')}
                            className={`form-control ${darkMode ? 'bg-dark text-light' : ''}`}
                          />
                          <button onClick={handleSendMessage} disabled={!userMessage.trim()} className="btn btn-primary">
                            {t('send')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-4">
                    <h3 className="h5 fw-bold mb-3">{t('chatFeatures')}</h3>
                    <div className={`card mb-3 ${darkMode ? 'bg-dark border-secondary' : 'bg-light'}`}>
                      <div className="card-body">
                        <h5 className="card-title h6 fw-bold">{t('quickHelp')}</h5>
                        <ul className={`list-group list-group-flush ${darkMode ? 'bg-dark' : ''}`}>
                          <li className={`list-group-item ${darkMode ? 'bg-dark text-light border-secondary' : ''}`}>
                            <i className="fas fa-virus me-2 text-danger"></i> {t('diseaseSymptoms')}
                          </li>
                          <li className={`list-group-item ${darkMode ? 'bg-dark text-light border-secondary' : ''}`}>
                            <i className="fas fa-shield-alt me-2 text-success"></i> {t('preventionTips')}
                          </li>
                          <li className={`list-group-item ${darkMode ? 'bg-dark text-light border-secondary' : ''}`}>
                            <i className="fas fa-tint me-2 text-info"></i> {t('waterTesting2')}
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className={`card ${darkMode ? 'bg-dark border-secondary' : 'bg-light'}`}>
                      <div className="card-body">
                        <h5 className="card-title h6 fw-bold">{t('aboutAI')}</h5>
                        <p className={`small ${darkMode ? 'text-light' : 'text-muted'}`}>
                          {t('aboutAIText')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* ABOUT TAB */}
          {activeTab === 'about' && (
            <div className={`card ${darkMode ? 'bg-dark text-light' : ''}`} style={{ borderRadius: '1rem' }}>
              <div className="card-body p-5">
                <h2 className="card-title h3 fw-bold mb-4">{t('aboutTitle')}</h2>
                <div className="row">
                  <div className="col-lg-6">
                    <h3 className="h5 fw-bold mb-3">{t('missionTitle')}</h3>
                    <p className={`mb-4 ${darkMode ? 'text-light' : ''}`}>
                      {t('missionText')}
                    </p>
                    <h3 className="h5 fw-bold mb-3">{t('visionTitle')}</h3>
                    <p className={`mb-4 ${darkMode ? 'text-light' : ''}`}>
                      {t('visionText')}
                    </p>
                    <h3 className="h5 fw-bold mb-3">{t('techStack')}</h3>
                    <ul className="list-group list-group-flush">
                      <li className={`list-group-item d-flex align-items-start ${darkMode ? 'bg-dark text-light border-secondary' : ''}`}>
                        <span className="me-2 text-primary">⚡</span> AI/ML Models for pattern detection and outbreak prediction
                      </li>
                      <li className={`list-group-item d-flex align-items-start ${darkMode ? 'bg-dark text-light border-secondary' : ''}`}>
                        <span className="me-2 text-primary">⚡</span> IoT sensors for real-time water quality monitoring
                      </li>
                      <li className={`list-group-item d-flex align-items-start ${darkMode ? 'bg-dark text-light border-secondary' : ''}`}>
                        <span className="me-2 text-primary">⚡</span> Mobile applications for community reporting
                      </li>
                      <li className={`list-group-item d-flex align-items-start ${darkMode ? 'bg-dark text-light border-secondary' : ''}`}>
                        <span className="me-2 text-primary">⚡</span> Real-time alert system for health officials
                      </li>
                    </ul>
                  </div>
                  <div className="col-lg-6">
                    <h3 className="h5 fw-bold mb-3">{t('teamTitle')}</h3>
                    <div className="row g-3">
                      {teamMembers.map((member, index) => (
                        <div key={index} className="col-6 text-center">
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
          )}
        </main>
      </div>
      {/* Disease Outbreak Detail Modal */}
      {selectedOutbreak && (
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
                    <p><strong>{t('description')}:</strong> {selectedOutbreak.description}</p>
                    <div className="row mt-4">
                      <div className="col-md-6">
                        <h6>{t('symptomsTitle')}</h6>
                        <ul>
                          {selectedOutbreak.symptoms.map((symptom, index) => (
                            <li key={index} className={darkMode ? 'text-light' : ''}>{symptom}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="col-md-6">
                        <h6>{t('preventionTitle')}</h6>
                        <ul>
                          {selectedOutbreak.prevention.map((method, index) => (
                            <li key={index} className={darkMode ? 'text-light' : ''}>{method}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className={`p-3 rounded ${darkMode ? 'bg-secondary' : 'bg-light'}`}>
                      <h6>{t('statistics')}</h6>
                      <div className="text-center my-3">
                        <div className="display-6 fw-bold text-danger">{selectedOutbreak.cases.toLocaleString()}</div>
                        <div className={`small ${darkMode ? 'text-light' : 'text-muted'}`}>{t('reportedCases')}</div>
                      </div>
                      <div className="progress mb-3" style={{ height: '8px' }}>
                        <div 
                          className="progress-bar bg-danger" 
                          role="progressbar" 
                          style={{ width: `${(selectedOutbreak.rate / 20) * 100}%` }}
                        ></div>
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
      )}
      {/* Floating Chat Button */}
      <button
        onClick={toggleChat}
        className="position-fixed bottom-0 end-0 m-4 d-flex align-items-center justify-content-center"
        style={{
          width: '60px',
          height: '60px',
          backgroundColor: '#0D6EFD',
          borderRadius: '50%',
          border: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          zIndex: 50,
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
      >
        <FaComments size={24} color="white" />
      </button>
      {/* AI Chatbot */}
      {chatOpen && (
        <div className="position-fixed bottom-0 end-0 m-3" style={{ zIndex: 1000, width: '320px', height: '400px', backgroundColor: 'white', borderRadius: '1rem', boxShadow: '0 0 20px rgba(0,0,0,0.2)', borderLeft: '4px solid #0D6EFD', overflow: 'hidden' }}>
          <div className="bg-primary p-3 d-flex justify-content-between align-items-center text-white">
            <div className="d-flex align-items-center">
              <div className="bg-white rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '32px', height: '32px' }}>
                <FaRobot className="text-primary" />
              </div>
              <span className="fw-bold">Healify AI</span>
            </div>
            <button onClick={toggleChat} className="btn-close btn-close-white"></button>
          </div>
          <div style={{ height: '272px', overflowY: 'auto', padding: '16px' }}>
            {messages.map((msg) => (
              <div key={msg.id} className={`d-flex ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'} mb-2`}>
                <div className={`p-2 rounded ${msg.sender === 'user' ? 'bg-primary text-white' : 'bg-light text-dark'}`} style={{ maxWidth: '75%' }}>
                  <p className="mb-0 small">{msg.text}</p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="d-flex justify-content-start">
                <div className="bg-light p-2 rounded">
                  <div className="d-flex">
                    <div className="bg-secondary rounded-circle me-1" style={{ width: '8px', height: '8px', animation: 'bounce 1s infinite' }}></div>
                    <div className="bg-secondary rounded-circle me-1" style={{ width: '8px', height: '8px', animation: 'bounce 1s infinite 0.15s' }}></div>
                    <div className="bg-secondary rounded-circle" style={{ width: '8px', height: '8px', animation: 'bounce 1s infinite 0.3s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="p-3 border-top">
            <div className="d-flex flex-wrap gap-1 mb-2">
              {t('popularQuestions').map((question, index) => (
                <button 
                  key={index} 
                  onClick={() => handlePopularQuestionClick(question)} 
                  className="btn btn-sm btn-light"
                  style={{ fontSize: '0.7rem' }}
                >
                  {question.split(' ').slice(0, 3).join(' ')}...
                </button>
              ))}
            </div>
            <div className="input-group">
              <input
                type="text"
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={t('chatPlaceholder')}
                className="form-control"
              />
              <button onClick={handleSendMessage} disabled={!userMessage.trim()} className="btn btn-primary">
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
      <style jsx>{`
        .cursor-pointer {
          cursor: pointer;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .sidebar {
          overflow-y: auto;
        }
        .hamburger-btn:focus {
          outline: none;
          box-shadow: none;
        }
      `}</style>
    </div>
  );
};

export default App;
