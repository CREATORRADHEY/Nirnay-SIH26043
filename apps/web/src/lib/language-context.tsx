"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type LanguageCode = "en" | "hi" | "ta" | "te" | "mr" | "gu" | "bn" | "kn";

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: "en", label: "English", nativeLabel: "English", flag: "🇬🇧" },
  { code: "hi", label: "Hindi", nativeLabel: "हिंदी", flag: "🇮🇳" },
  { code: "ta", label: "Tamil", nativeLabel: "தமிழ்", flag: "🇮🇳" },
  { code: "te", label: "Telugu", nativeLabel: "తెలుగు", flag: "🇮🇳" },
  { code: "mr", label: "Marathi", nativeLabel: "मराठी", flag: "🇮🇳" },
  { code: "gu", label: "Gujarati", nativeLabel: "ગુજરાતી", flag: "🇮🇳" },
  { code: "bn", label: "Bengali", nativeLabel: "বাংলা", flag: "🇮🇳" },
  { code: "kn", label: "Kannada", nativeLabel: "ಕನ್ನಡ", flag: "🇮🇳" },
];

export const TRANSLATIONS: Record<string, Record<LanguageCode, string>> = {
  app_title: {
    en: "NIRNAY",
    hi: "निर्णय",
    ta: "நிர்ணய்",
    te: "నిర్ణయ్",
    mr: "निर्णय",
    gu: "નિર્ણય",
    bn: "নির্ণয়",
    kn: "ನಿರ್ಣಯ್",
  },
  civic_platform: {
    en: "Civic Platform",
    hi: "नागरिक मंच",
    ta: "குடிமக்கள் தளம்",
    te: "పౌర వేదిక",
    mr: "नागरी मंच",
    gu: "નાગરિક મંચ",
    bn: "নাগরিক প্ল্যাটফর্ম",
    kn: "ನಾಗರಿಕ ವೇದಿಕೆ",
  },
  dashboard: {
    en: "Dashboard",
    hi: "डैशबोर्ड",
    ta: "டாஷ்போர்டு",
    te: "డాష్‌బోర్డ్",
    mr: "डॅशबोर्ड",
    gu: "ડેશબોર્ડ",
    bn: "ড্যাশবোর্ড",
    kn: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
  },
  my_challenges: {
    en: "My Challenges",
    hi: "मेरी चुनौतियाँ",
    ta: "என் சவால்கள்",
    te: "నా సవాళ్లు",
    mr: "माझ्या आव्हाने",
    gu: "મારી પડકારો",
    bn: "আমার চ্যালেঞ্জ",
    kn: "ನನ್ನ ಸವಾಲುಗಳು",
  },
  report_challenge: {
    en: "Report Challenge",
    hi: "चुनौती दर्ज करें",
    ta: "சவாலைத் தெரிவி",
    te: "సవాలును నమోదు చేయండి",
    mr: "अहवाल आव्हान",
    gu: "રિપોર્ટ પડકાર",
    bn: "চ্যালেঞ্জ রিপোর্ট করুন",
    kn: "ಸವಾಲನ್ನು ವರದಿ ಮಾಡಿ",
  },
  review_challenges: {
    en: "Review Challenges",
    hi: "चुनौतियों की समीक्षा",
    ta: "சவால்களை ஆய்வு செய்",
    te: "సవాళ్లను సమీక్షించండి",
    mr: "आव्हान पुनरावलोकन",
    gu: "પડકારો સમીક્ષા",
    bn: "চ্যালেঞ্জ পর্যালোচনা",
    kn: "ಸವಾಲುಗಳನ್ನು ಪರಿಶೀಲಿಸಿ",
  },
  qualification: {
    en: "Qualification",
    hi: "योग्यता की जाँच",
    ta: "தகுதி",
    te: "అర్హత",
    mr: "पात्रता",
    gu: "લાયકાત",
    bn: "যোগ্যতা",
    kn: "ಅರ್ಹತೆ",
  },
  hei_matching: {
    en: "Institution Matching",
    hi: "संस्थान मिलान",
    ta: "நிறுவன பொருத்தம்",
    te: "సంస్థల పోలిక",
    mr: "संस्था जुळणी",
    gu: "સંસ્થા સરખામણી",
    bn: "প্রতিষ্ঠান মেলবন্ধন",
    kn: "ಸಂಸ್ಥೆ ಹೋಲಿಕೆ",
  },
  readiness: {
    en: "Pilot Readiness",
    hi: "पायलट तत्परता",
    ta: "பைலட் தயார்நிலை",
    te: "పైలట్ సిద్ధత",
    mr: "पायलट सज्जता",
    gu: "પાયલોટ તૈયારી",
    bn: "পাইলট প্রস্তুতি",
    kn: "ಪೈಲಟ್ ಸಿದ್ಧತೆ",
  },
  pilots: {
    en: "Pilots",
    hi: "पायलट परियोजनाएं",
    ta: "பைலட்டுகள்",
    te: "పైలట్లు",
    mr: "पायलट",
    gu: "પાયલોટ્સ",
    bn: "পাইলট",
    kn: "ಪೈಲಟ್‌ಗಳು",
  },
  outcomes: {
    en: "Outcomes",
    hi: "परिणाम एवं प्रभाव",
    ta: "முடிவுகள்",
    te: "ఫలితాలు",
    mr: "निकाल",
    gu: "પરિણામો",
    bn: "ফলাফল",
    kn: "ಫಲಿತಾಂಶಗಳು",
  },
  notifications: {
    en: "Notifications",
    hi: "सूचनाएं",
    ta: "அறிவிப்புகள்",
    te: "నోటిఫికేషన్లు",
    mr: "सूचना",
    gu: "સૂચનાઓ",
    bn: "বিজ্ঞপ্তি",
    kn: "ಅಧಿಸೂಚನೆಗಳು",
  },
  security: {
    en: "Security",
    hi: "सुरक्षा एवं खाते",
    ta: "பாதுகாப்பு",
    te: "రక్షణ",
    mr: "सुरक्षा",
    gu: "સુરક્ષા",
    bn: "সুরক্ষা",
    kn: "ಭದ್ರತೆ",
  },
  sign_in: {
    en: "Sign In",
    hi: "साइन इन करें",
    ta: "உள்நுழை",
    te: "సైన్ ఇన్",
    mr: "साइन इन",
    gu: "સાઇન ઇન",
    bn: "সাইন ইন",
    kn: "ಸೈನ್ ಇನ್",
  },
  sign_out: {
    en: "Sign Out",
    hi: "साइन आउट",
    ta: "வெளியேறு",
    te: "సైన్ అవుట్",
    mr: "साइन आउट",
    gu: "સાઇન આઉટ",
    bn: "সাইন আউট",
    kn: "ಸೈನ್ ಔಟ್",
  },
  demo_mode: {
    en: "DEMO MODE",
    hi: "डेमो मोड",
    ta: "டெமோ பயன்முறை",
    te: "డెమో మోడ్",
    mr: "डेमो मोड",
    gu: "ડેમો મોડ",
    bn: "ডেমো মোড",
    kn: "ಡೆಮೊ ಮೋಡ್",
  },
  guided_tour: {
    en: "Guided Tour",
    hi: "मार्गदर्शित दौरा",
    ta: "வழிகாட்டப்பட்ட சுற்றுலா",
    te: "గైడెడ్ టూర్",
    mr: "मार्गदर्शित टूर",
    gu: "માર્ગદર્શિત પ્રવાસ",
    bn: "গাইডেড ট্যুর",
    kn: "ಮಾರ್ಗದರ್ಶಿತ ಪ್ರವಾಸ",
  },
  view_page: {
    en: "View Page",
    hi: "पृष्ठ देखें",
    ta: "பக்கத்தைப் பார்",
    te: "పేజీ చూడండి",
    mr: "पृष्ठ पहा",
    gu: "પૃષ્ઠ જુઓ",
    bn: "পৃষ্ঠা দেখুন",
    kn: "ಪುಟವನ್ನು ವೀಕ್ಷಿಸಿ",
  },
  resume_tour: {
    en: "Resume Tour",
    hi: "दौरा पुनः शुरू करें",
    ta: "சுற்றுலாவை மீண்டும் தொடங்கு",
    te: "టూర్ పునఃప్రారంభించు",
    mr: "टूर पुन्हा सुरू करा",
    gu: "પ્રવાસ ફરી શરૂ કરો",
    bn: "ট্যুর পুনরায় শুরু করুন",
    kn: "ಪ್ರವಾಸವನ್ನು ಪುನರಾರಂಭಿಸಿ",
  },
  back_to_site: {
    en: "Back to Site",
    hi: "मुख्य साइट पर वापस",
    ta: "தளத்திற்குத் திரும்பு",
    te: "సైట్‌కి తిరిగి వెళ్లండి",
    mr: "साइटवर परत",
    gu: "સાઇટ પર પાછા",
    bn: "সাইটে ফিরে যান",
    kn: "ಸೈಟ್‌ಗೆ ಹಿಂತಿರುಗಿ",
  },
  explore_challenges: {
    en: "Challenge Explorer",
    hi: "चुनौती अन्वेषक",
    ta: "சவால் ஆய்வாளர்",
    te: "సవాలు అన్వేషకుడు",
    mr: "आव्हान शोधक",
    gu: "પડકાર સંશોધક",
    bn: "চ্যালেঞ্জ এক্সপ্লোরার",
    kn: "ಸವಾಲು ಅನ್ವೇಷಕ",
  },
  search_placeholder: {
    en: "Search challenges, IDs...",
    hi: "चुनौतियां और आईडी खोजें...",
    ta: "சவால்களைத் தேடுங்கள்...",
    te: "సవాళ్లను శోధించండి...",
    mr: "आव्हाने शोधा...",
    gu: "પડકારો શોધો...",
    bn: "চ্যালেঞ্জ খুঁজুন...",
    kn: "ಸವಾಲುಗಳನ್ನು ಹುಡುಕಿ...",
  },
  language: {
    en: "Language",
    hi: "भाषा",
    ta: "மொழி",
    te: "భాష",
    mr: "भाषा",
    gu: "ભાષા",
    bn: "ভাষা",
    kn: "ಭಾಷೆ",
  },
};

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, fallback?: string) => string;
  currentLanguageOption: LanguageOption;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key: string, fallback?: string) => fallback || key,
  currentLanguageOption: SUPPORTED_LANGUAGES[0],
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>("en");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("nirnay_language") as LanguageCode;
      if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) {
        setLanguageState(saved);
      }
    }
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("nirnay_language", lang);
    }
  };

  const t = (key: string, fallback?: string): string => {
    if (TRANSLATIONS[key] && TRANSLATIONS[key][language]) {
      return TRANSLATIONS[key][language];
    }
    return fallback || key;
  };

  const currentLanguageOption =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, currentLanguageOption }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
