import { motion } from "framer-motion";
import { ExternalLink, Database, FileText, Globe, Building2 } from "lucide-react";
import { CompanyProfile } from "@/pages/StrategicRadar";

interface DataSourcesProps {
  profile: CompanyProfile;
}

const DataSources = ({ profile }: DataSourcesProps) => {
  const citations = profile.citations || [];

  // Categorize sources
  const getSourceInfo = (url: string) => {
    const lower = url.toLowerCase();
    if (lower.includes("codal.ir")) {
      return { icon: FileText, label: "کدال", color: "text-purple-400 bg-purple-500/20" };
    }
    if (lower.includes("tsetmc.com")) {
      return { icon: Building2, label: "بورس تهران", color: "text-blue-400 bg-blue-500/20" };
    }
    if (lower.includes("irna.ir") || lower.includes("isna.ir") || lower.includes("tasnim")) {
      return { icon: FileText, label: "خبرگزاری", color: "text-emerald-400 bg-emerald-500/20" };
    }
    return { icon: Globe, label: "وب", color: "text-cyan-400 bg-cyan-500/20" };
  };

  const getDomainFromUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname.replace("www.", "");
      return domain;
    } catch {
      return url.slice(0, 30);
    }
  };

  if (citations.length === 0) {
    return (
      <div className="h-full bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-500/20 flex items-center justify-center">
              <Database className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">منابع داده</h3>
              <p className="text-slate-400 text-sm">Data Sources & Citations</p>
            </div>
          </div>
        </div>
        <div className="p-6 text-center">
          <Database className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">هنوز منبعی ثبت نشده</p>
          <p className="text-slate-600 text-xs mt-1">با اسکن شرکت، منابع داده نمایش داده می‌شوند</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50 bg-gradient-to-r from-indigo-950/50 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <Database className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">منابع داده ({citations.length})</h3>
              <p className="text-slate-400 text-sm">Data Sources & Citations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sources List */}
      <div className="p-4 max-h-[300px] overflow-y-auto">
        <div className="space-y-2">
          {citations.map((url, i) => {
            const sourceInfo = getSourceInfo(url);
            const Icon = sourceInfo.icon;
            
            return (
              <motion.a
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl border border-slate-700/50 hover:border-indigo-500/30 transition-all group cursor-pointer"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${sourceInfo.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-300 text-sm truncate">{getDomainFromUrl(url)}</p>
                  <p className="text-slate-500 text-xs">{sourceInfo.label}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors flex-shrink-0" />
              </motion.a>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <div className="p-3 border-t border-slate-700/50 bg-slate-800/30">
        <div className="flex flex-wrap gap-2 justify-center">
          {Object.entries(
            citations.reduce((acc, url) => {
              const info = getSourceInfo(url);
              acc[info.label] = (acc[info.label] || 0) + 1;
              return acc;
            }, {} as Record<string, number>)
          ).map(([label, count]) => (
            <span key={label} className="px-2 py-1 bg-slate-700/50 text-slate-400 text-xs rounded-full">
              {label}: {count}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DataSources;
