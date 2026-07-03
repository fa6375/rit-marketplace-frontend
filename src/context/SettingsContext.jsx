import { createContext, useContext, useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";

export const DEFAULT_SETTINGS = {
  websiteName: "RIT Marketplace",
  homepageHeroText: "Discover student listings.",
  announcement: "",
  supportEmail: "",
  maximumUploadSize: 5, // MB
  maximumListingsPerUser: 20,
};

const SettingsContext = createContext(DEFAULT_SETTINGS);

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    return onSnapshot(
      doc(db, "settings", "website"),
      (snap) => {
        const data = snap.exists() ? snap.data() : {};
        setSettings({
          ...DEFAULT_SETTINGS,
          ...data,
          maximumUploadSize:
            Number(data.maximumUploadSize) > 0
              ? Number(data.maximumUploadSize)
              : DEFAULT_SETTINGS.maximumUploadSize,
          maximumListingsPerUser:
            Number(data.maximumListingsPerUser) > 0
              ? Number(data.maximumListingsPerUser)
              : DEFAULT_SETTINGS.maximumListingsPerUser,
        });
      },
      () => setSettings(DEFAULT_SETTINGS)
    );
  }, []);

  // Keep the browser tab title in sync with the configured website name
  useEffect(() => {
    if (settings.websiteName) document.title = settings.websiteName;
  }, [settings.websiteName]);

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
};
