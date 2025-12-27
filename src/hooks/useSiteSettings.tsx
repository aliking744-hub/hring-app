import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SiteSettings {
  [key: string]: string;
}

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('key, value');

      if (error) {
        console.error('Error fetching site settings:', error);
      } else {
        const settingsMap: SiteSettings = {};
        (data || []).forEach(item => {
          if (item.key && item.value) {
            settingsMap[item.key] = item.value;
          }
        });
        setSettings(settingsMap);
      }
      setLoading(false);
    };

    fetchSettings();
  }, []);

  const getSetting = (key: string, fallback: string = ''): string => {
    return settings[key] || fallback;
  };

  return { settings, loading, getSetting };
};
