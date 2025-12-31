import { useEffect } from 'react';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useCompassAuth } from '@/contexts/CompassAuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Target,
  LayoutDashboard,
  FileText,
  Users,
  Brain,
  Coins,
  BookOpen,
  LogOut,
  Settings,
  ChevronLeft,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const CompassLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, role, loading, signOut, isCeo } = useCompassAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/strategic-compass');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-primary text-xl">در حال بارگذاری...</div>
      </div>
    );
  }

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    navigate('/strategic-compass');
  };

  const getRoleLabel = () => {
    switch (role) {
      case 'ceo': return 'مدیرعامل';
      case 'deputy': return 'معاون';
      case 'manager': return 'مدیرکل';
      default: return 'کاربر';
    }
  };

  const getRoleBadgeClass = () => {
    switch (role) {
      case 'ceo': return 'bg-primary text-primary-foreground';
      case 'deputy': return 'bg-chart-1 text-primary-foreground';
      case 'manager': return 'bg-chart-2 text-primary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const navigation = [
    { name: 'داشبورد', href: '/strategic-compass/dashboard', icon: LayoutDashboard, roles: ['ceo', 'deputy', 'manager'] },
    { name: 'دستورات استراتژیک', href: '/strategic-compass/dashboard/intents', icon: Target, roles: ['ceo'] },
    { name: 'گزارش عملکرد', href: '/strategic-compass/dashboard/behaviors', icon: FileText, roles: ['deputy', 'manager'] },
    { name: 'منشور ذهنی', href: '/strategic-compass/dashboard/scenarios', icon: Brain, roles: ['ceo', 'deputy', 'manager'] },
    { name: 'بازی استراتژیک', href: '/strategic-compass/dashboard/bets', icon: Coins, roles: ['ceo', 'deputy', 'manager'] },
    { name: 'ژورنال تصمیم', href: '/strategic-compass/dashboard/journal', icon: BookOpen, roles: ['deputy', 'manager'] },
    { name: 'مدیریت کاربران', href: '/strategic-compass/dashboard/users', icon: Users, roles: ['ceo'] },
  ];

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(role || '')
  );

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowRight className="w-4 h-4" />
              <span className="text-sm">بازگشت</span>
            </Link>
            <div className="w-px h-6 bg-border mx-2" />
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-foreground">قطب‌نمای استراتژی</h1>
              <p className="text-xs text-muted-foreground">سیستم پایش عملکرد</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className={cn("text-xs px-3 py-1 rounded-full", getRoleBadgeClass())}>
              {getRoleLabel()}
            </span>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {profile?.full_name?.charAt(0) || user.email?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{profile?.full_name || 'کاربر'}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/strategic-compass/dashboard/settings')}>
                  <Settings className="ml-2 h-4 w-4" />
                  تنظیمات
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="ml-2 h-4 w-4" />
                  خروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-l border-border bg-card min-h-[calc(100vh-4rem)] sticky top-16">
          <nav className="p-4 space-y-2">
            {filteredNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                  {isActive && <ChevronLeft className="w-4 h-4 mr-auto" />}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CompassLayout;
