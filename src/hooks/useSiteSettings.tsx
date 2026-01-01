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

interface CustomFont {
  name: string;
  url: string;
}

interface SiteSettingsContextType {
  settings: SiteSettings;
  loading: boolean;
  getSetting: (key: string, fallback?: string) => string;
  fonts: FontSettings;
  logos: LogoSettings;
  customFonts: CustomFont[];
  siteName: string;
  refetch: () => Promise<void>;
}

const DEFAULT_FONTS: FontSettings = {
  heading: 'Afarin',
  body: 'IRANSans',
  button: 'IRANSans',
  nav: 'IRANSans',
};

// Note: These are empty strings because we use ES6 imports for fallbacks in components
// This allows Vite to properly bundle the assets
// Default favicon is a neutral briefcase icon (data URI) instead of Lovable heart
const DEFAULT_FAVICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236366f1' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='2' y='7' width='20' height='14' rx='2' ry='2'/%3E%3Cpath d='M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16'/%3E%3C/svg%3E";

const DEFAULT_LOGOS: LogoSettings = {
  main: '',
  footer: '',
  auth: '',
  favicon: DEFAULT_FAVICON,
};

const DEFAULT_SITE_NAME = 'hring';

const SiteSettingsContext = createContext<SiteSettingsContextType | null>(null);

// Load custom font dynamically
const loadFontFace = (name: string, url: string) => {
  // If font already exists, refresh it (URL may have changed)
  const existingStyle = document.querySelector(`style[data-font="${name}"]`);
  if (existingStyle) existingStyle.remove();

  const cleanUrl = url.split('#')[0];
  const ext = cleanUrl.split('?')[0]?.split('.').pop()?.toLowerCase();
  const format =
    ext === 'woff2'
      ? 'woff2'
      : ext === 'woff'
        ? 'woff'
        : ext === 'otf'
          ? 'opentype'
          : ext === 'ttf'
            ? 'truetype'
            : undefined;

  const style = document.createElement('style');
  style.setAttribute('data-font', name);
  style.textContent = `
    @font-face {
      font-family: '${name}';
      src: url('${url}')${format ? ` format('${format}')` : ''};
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }
  `;
  document.head.appendChild(style);
};
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
  link.type = faviconUrl.startsWith('data:') ? 'image/svg+xml' : 'image/x-icon';
  link.href = faviconUrl;
};

export const SiteSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<SiteSettings>({});
  const [loading, setLoading] = useState(true);
  const [fonts, setFonts] = useState<FontSettings>(DEFAULT_FONTS);
  const [logos, setLogos] = useState<LogoSettings>(DEFAULT_LOGOS);
  const [customFonts, setCustomFonts] = useState<CustomFont[]>([]);
  const [siteName, setSiteName] = useState<string>(DEFAULT_SITE_NAME);

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

    // Load custom fonts first
    if (settingsMap['custom_fonts']) {
      try {
        const fonts = JSON.parse(settingsMap['custom_fonts']) as CustomFont[];
        setCustomFonts(fonts);
        fonts.forEach(font => loadFontFace(font.name, font.url));
      } catch {
        setCustomFonts([]);
      }
    }

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
    
    // Always update favicon - use custom if set, otherwise use default
    updateFavicon(settingsMap['logo_favicon'] || DEFAULT_FAVICON);

    // Extract site name
    setSiteName(settingsMap['site_name'] || DEFAULT_SITE_NAME);

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
      customFonts,
      siteName,
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
      customFonts: [],
      siteName: DEFAULT_SITE_NAME,
      refetch: async () => {},
    };
  }
  
  return context;
};

// Utility hook for site name
export const useSiteName = () => {
  const { siteName } = useSiteSettings();
  return siteName;
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
