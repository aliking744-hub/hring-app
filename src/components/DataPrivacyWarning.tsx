import { AlertTriangle, Cloud, Lock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '@/hooks/useUserContext';

interface DataPrivacyWarningProps {
  className?: string;
}

/**
 * Shows a warning banner for users who cannot save data (Free/Pro individual users).
 * Only Plus individual users and Corporate users can save data to cloud.
 */
const DataPrivacyWarning = ({ className }: DataPrivacyWarningProps) => {
  const navigate = useNavigate();
  const { context } = useUserContext();

  // Don't show for Plus users or corporate users
  const canSaveData = 
    context?.subscriptionTier === 'individual_plus' ||
    context?.userType === 'corporate';

  if (canSaveData) {
    return null;
  }

  return (
    <Alert 
      variant="default" 
      className={`border-amber-500/50 bg-amber-500/10 ${className}`}
    >
      <AlertTriangle className="h-4 w-4 text-amber-500" />
      <AlertTitle className="text-amber-500 flex items-center gap-2">
        <Lock className="h-4 w-4" />
        حریم خصوصی داده‌ها
      </AlertTitle>
      <AlertDescription className="text-muted-foreground mt-2">
        <p className="mb-3">
          داده‌های شما به صورت محلی پردازش می‌شوند و پس از خروج از دست خواهند رفت.
          برای ذخیره‌سازی ابری، به پلن <strong className="text-primary">پلاس</strong> ارتقا دهید.
        </p>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/upgrade')}
          className="gap-2"
        >
          <Cloud className="h-4 w-4" />
          ارتقا به پلاس
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default DataPrivacyWarning;
