import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { 
  Search, 
  Crosshair, 
  Linkedin, 
  Github, 
  Dribbble,
  Sparkles,
  UserPlus,
  Filter,
  ArrowLeft,
  Users,
  Phone,
  UserCheck
} from "lucide-react";
import { Link } from "react-router-dom";
import AuroraBackground from "@/components/AuroraBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

// Mock candidate data
const mockCandidates = [
  {
    id: 1,
    name: "سارا احمدی",
    title: "Senior Frontend Developer",
    avatar: "https://i.pravatar.cc/150?img=1",
    skills: ["React", "TypeScript", "Node.js"],
    source: "linkedin",
    cultureMatch: 92,
  },
  {
    id: 2,
    name: "محمد رضایی",
    title: "Full Stack Engineer",
    avatar: "https://i.pravatar.cc/150?img=3",
    skills: ["React", "Python", "AWS"],
    source: "github",
    cultureMatch: 87,
  },
  {
    id: 3,
    name: "زهرا کریمی",
    title: "UI/UX Designer & Developer",
    avatar: "https://i.pravatar.cc/150?img=5",
    skills: ["React", "Figma", "CSS"],
    source: "dribbble",
    cultureMatch: 95,
  },
  {
    id: 4,
    name: "علی محمدی",
    title: "Backend Developer",
    avatar: "https://i.pravatar.cc/150?img=8",
    skills: ["Node.js", "PostgreSQL", "Docker"],
    source: "linkedin",
    cultureMatch: 78,
  },
];

const sourceIcons: Record<string, React.ReactNode> = {
  linkedin: <Linkedin className="w-4 h-4" />,
  github: <Github className="w-4 h-4" />,
  dribbble: <Dribbble className="w-4 h-4" />,
};

const sourceColors: Record<string, string> = {
  linkedin: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  github: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  dribbble: "bg-pink-500/20 text-pink-400 border-pink-500/30",
};

const SmartHeadhunting = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSources, setSelectedSources] = useState<string[]>(["linkedin", "github", "dribbble"]);
  const [huntList, setHuntList] = useState<number[]>([]);
  const { toast } = useToast();

  const toggleSource = (source: string) => {
    setSelectedSources(prev => 
      prev.includes(source) 
        ? prev.filter(s => s !== source)
        : [...prev, source]
    );
  };

  const handleGenerateMessage = (candidateName: string) => {
    toast({
      title: "در حال تولید پیام...",
      description: `پیام دعوت برای ${candidateName} با هوش مصنوعی تولید می‌شود.`,
    });
  };

  const handleAddToHuntList = (candidateId: number, candidateName: string) => {
    if (huntList.includes(candidateId)) {
      setHuntList(prev => prev.filter(id => id !== candidateId));
      toast({
        title: "حذف از لیست",
        description: `${candidateName} از لیست شکار حذف شد.`,
      });
    } else {
      setHuntList(prev => [...prev, candidateId]);
      toast({
        title: "افزوده شد",
        description: `${candidateName} به لیست شکار اضافه شد.`,
      });
    }
  };

  // Funnel data
  const funnelData = [
    { label: "شناسایی شده", count: 156, color: "from-violet-500 to-purple-600" },
    { label: "تماس گرفته", count: 42, color: "from-purple-500 to-fuchsia-600" },
    { label: "جذب شده", count: 8, color: "from-fuchsia-500 to-pink-600" },
  ];

  const filteredCandidates = mockCandidates.filter(c => 
    selectedSources.includes(c.source)
  );

  return (
    <>
      <Helmet>
        <title>هدهانتینگ هوشمند | HRing</title>
        <meta 
          name="description" 
          content="جستجوی پیشرفته کاندیداها با هوش مصنوعی - لینکدین، گیت‌هاب، دریبل" 
        />
      </Helmet>

      <div className="relative min-h-screen" dir="rtl">
        <AuroraBackground />

        <div className="relative z-10 container mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-8"
          >
            <Link to="/dashboard">
              <Button variant="outline" size="icon" className="border-border bg-secondary/50">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Crosshair className="w-8 h-8 text-primary" />
                هدهانتینگ هوشمند
              </h1>
              <p className="text-muted-foreground mt-1">جستجوی پیشرفته کاندیداها با قدرت هوش مصنوعی</p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* AI Search Panel */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">جستجوی هوشمند</h2>
                </div>

                {/* Search Bar */}
                <div className="relative mb-4">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="مهارت‌ها را وارد کنید (مثلا: React, Node.js, Python)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-12 py-6 text-lg bg-secondary/50 border-border placeholder:text-muted-foreground"
                  />
                  <Button 
                    className="absolute left-2 top-1/2 -translate-y-1/2 glow-button"
                    size="sm"
                  >
                    <Sparkles className="w-4 h-4 ml-2" />
                    جستجو
                  </Button>
                </div>

                {/* Source Filters */}
                <div className="flex items-center gap-3">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">فیلتر منبع:</span>
                  <div className="flex gap-2">
                    {[
                      { id: "linkedin", icon: <Linkedin className="w-4 h-4" />, label: "لینکدین" },
                      { id: "github", icon: <Github className="w-4 h-4" />, label: "گیت‌هاب" },
                      { id: "dribbble", icon: <Dribbble className="w-4 h-4" />, label: "دریبل" },
                    ].map((source) => (
                      <Button
                        key={source.id}
                        variant="outline"
                        size="sm"
                        onClick={() => toggleSource(source.id)}
                        className={`gap-2 transition-all ${
                          selectedSources.includes(source.id)
                            ? "bg-primary/20 border-primary text-primary"
                            : "bg-secondary/50 border-border text-muted-foreground"
                        }`}
                      >
                        {source.icon}
                        {source.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Candidates List */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
              >
                <h2 className="text-lg font-semibold text-foreground">کاندیداهای پیشنهادی</h2>
                
                {filteredCandidates.map((candidate, index) => (
                  <motion.div
                    key={candidate.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="glass-card p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
                  >
                    {/* Avatar & Info */}
                    <div className="flex items-center gap-4 flex-1">
                      <div className="relative">
                        <img
                          src={candidate.avatar}
                          alt={candidate.name}
                          className="w-14 h-14 rounded-full border-2 border-border"
                        />
                        <div className={`absolute -bottom-1 -right-1 p-1 rounded-full border ${sourceColors[candidate.source]}`}>
                          {sourceIcons[candidate.source]}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{candidate.name}</h3>
                        <p className="text-sm text-muted-foreground">{candidate.title}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {candidate.skills.map((skill) => (
                            <Badge
                              key={skill}
                              variant="secondary"
                              className="text-xs bg-secondary/80 text-foreground"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Culture Match Score */}
                    <div className="flex flex-col items-center px-4">
                      <div className="relative w-16 h-16">
                        <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-secondary"
                            strokeWidth="3"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="text-green-500"
                            strokeWidth="3"
                            strokeDasharray={`${candidate.cultureMatch}, 100`}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-sm font-bold text-green-500">٪{candidate.cultureMatch}</span>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground mt-1">انطباق فرهنگی</span>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 w-full sm:w-auto">
                      <Button
                        size="sm"
                        className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25"
                        onClick={() => handleGenerateMessage(candidate.name)}
                      >
                        <Sparkles className="w-4 h-4" />
                        تولید پیام با AI
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className={`gap-2 transition-all ${
                          huntList.includes(candidate.id)
                            ? "bg-primary/20 border-primary text-primary"
                            : "bg-secondary/50 border-border"
                        }`}
                        onClick={() => handleAddToHuntList(candidate.id, candidate.name)}
                      >
                        <UserPlus className="w-4 h-4" />
                        {huntList.includes(candidate.id) ? "در لیست شکار" : "افزودن به لیست"}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Sidebar - Funnel Chart */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-card p-6 sticky top-8"
              >
                <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                  <Crosshair className="w-5 h-5 text-primary" />
                  پایپ‌لاین شکار
                </h2>

                {/* Funnel Visualization */}
                <div className="space-y-4">
                  {funnelData.map((item, index) => (
                    <div key={item.label} className="relative">
                      <div
                        className={`h-16 rounded-xl bg-gradient-to-r ${item.color} flex items-center justify-between px-4 transition-all hover:scale-105`}
                        style={{
                          width: `${100 - index * 20}%`,
                          marginRight: `${index * 10}%`,
                        }}
                      >
                        <span className="text-white font-medium text-sm">{item.label}</span>
                        <span className="text-white font-bold text-lg">{item.count}</span>
                      </div>
                      {index < funnelData.length - 1 && (
                        <div className="flex justify-center my-2">
                          <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Stats */}
                <div className="mt-8 pt-6 border-t border-border space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      در لیست شکار
                    </span>
                    <span className="font-bold text-foreground">{huntList.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      تماس‌های امروز
                    </span>
                    <span className="font-bold text-foreground">۵</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm flex items-center gap-2">
                      <UserCheck className="w-4 h-4" />
                      نرخ تبدیل
                    </span>
                    <span className="font-bold text-green-500">٪۱۹</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SmartHeadhunting;
