import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SiteSettings {
  [key: string]: string;
}

interface FontSettings {
  heading: string;
  body: string;
  button: string;
  nav: string;
}

interface LogoSettings {
  main: string;
  footer: string;
  auth: string;
  favicon: string;
}

interface SiteSettingsContextType {
  settings: SiteSettings;
  loading: boolean;
  getSetting: (key: string, fallback?: string) => string;
  fonts: FontSettings;
  logos: LogoSettings;
  refetch: () => Promise<void>;
}

const DEFAULT_FONTS: FontSettings = {
  heading: 'Afarin',
  body: 'IRANSans',
  button: 'IRANSans',
  nav: 'IRANSans',
};

const DEFAULT_LOGOS: LogoSettings = {
  main: '/assets/logo.png',
  footer: '/assets/logo_zir_white.png',
  auth: '/assets/logo.png',
  favicon: '/favicon.ico',
};

const SiteSettingsContext = createContext<SiteSettingsContextType | null>(null);

// Apply fonts to CSS variables dynamically
const applyFontsToDocument = (fonts: FontSettings) => {
  const root = document.documentElement;
  
  // Set CSS custom properties for fonts
  root.style.setProperty('--font-heading', fonts.heading);
  root.style.setProperty('--font-body', fonts.body);
  root.style.setProperty('--font-button', fonts.button);
  root.style.setProperty('--font-nav', fonts.nav);
  
  // Update body font
  document.body.style.fontFamily = `${fonts.body}, 'BNazanin', 'Inter', system-ui, sans-serif`;
};

// Update favicon dynamically
const updateFavicon = (faviconUrl: string) => {
  if (!faviconUrl) return;
  
  let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = faviconUrl;
};

export const SiteSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<SiteSettings>({});
  const [loading, setLoading] = useState(true);
  const [fonts, setFonts] = useState<FontSettings>(DEFAULT_FONTS);
  const [logos, setLogos] = useState<LogoSettings>(DEFAULT_LOGOS);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from('site_settings')
      .select('key, value');

    if (error) {
      console.error('Error fetching site settings:', error);
      setLoading(false);
      return;
    }

    const settingsMap: SiteSettings = {};
    (data || []).forEach(item => {
      if (item.key && item.value) {
        settingsMap[item.key] = item.value;
      }
    });
    setSettings(settingsMap);

    // Extract font settings
    const newFonts: FontSettings = {
      heading: settingsMap['font_heading'] || DEFAULT_FONTS.heading,
      body: settingsMap['font_body'] || DEFAULT_FONTS.body,
      button: settingsMap['font_button'] || DEFAULT_FONTS.button,
      nav: settingsMap['font_nav'] || DEFAULT_FONTS.nav,
    };
    setFonts(newFonts);
    applyFontsToDocument(newFonts);

    // Extract logo settings
    const newLogos: LogoSettings = {
      main: settingsMap['logo_main'] || DEFAULT_LOGOS.main,
      footer: settingsMap['logo_footer'] || DEFAULT_LOGOS.footer,
      auth: settingsMap['logo_auth'] || DEFAULT_LOGOS.auth,
      favicon: settingsMap['logo_favicon'] || DEFAULT_LOGOS.favicon,
    };
    setLogos(newLogos);
    
    // Update favicon if set
    if (settingsMap['logo_favicon']) {
      updateFavicon(settingsMap['logo_favicon']);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const getSetting = (key: string, fallback: string = ''): string => {
    return settings[key] || fallback;
  };

  return (
    <SiteSettingsContext.Provider value={{ 
      settings, 
      loading, 
      getSetting, 
      fonts, 
      logos,
      refetch: fetchSettings 
    }}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

// Hook to use site settings
export const useSiteSettings = (): SiteSettingsContextType => {
  const context = useContext(SiteSettingsContext);
  
  // Fallback for components not wrapped in provider
  if (!context) {
    return {
      settings: {},
      loading: false,
      getSetting: (key: string, fallback: string = '') => fallback,
      fonts: DEFAULT_FONTS,
      logos: DEFAULT_LOGOS,
      refetch: async () => {},
    };
  }
  
  return context;
};

// Utility hook for just fonts
export const useFonts = () => {
  const { fonts } = useSiteSettings();
  return fonts;
};

// Utility hook for just logos  
export const useLogos = () => {
  const { logos } = useSiteSettings();
  return logos;
};
