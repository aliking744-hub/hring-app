import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LegalImporter from '@/components/admin/LegalImporter';

const AdminLegalImporter = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">وارد کردن اسناد حقوقی</h1>
          <Button 
            variant="ghost" 
            onClick={() => navigate('/admin')}
            className="gap-2"
          >
            <span>بازگشت به پنل ادمین</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <LegalImporter />
      </main>
    </div>
  );
};

export default AdminLegalImporter;
