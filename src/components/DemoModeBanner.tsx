import { Eye, Lock, Crown } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '@/hooks/useUserContext';

interface DemoModeBannerProps {
  featureName: string;
  className?: string;
}

/**
 * Shows a banner indicating the user is in demo/read-only mode.
 * Used for Plus users viewing Strategic Compass and Onboarding demos.
 */
const DemoModeBanner = ({ featureName, className }: DemoModeBannerProps) => {
  const navigate = useNavigate();
  const { context } = useUserContext();

  // Only show for Plus individual users
  const isPlus = context?.subscriptionTier === 'individual_plus';
  const isIndividual = context?.userType === 'individual';

  if (!isPlus || !isIndividual) {
    return null;
  }

  return (
    <Alert 
      variant="default" 
      className={`border-primary/50 bg-primary/10 ${className}`}
    >
      <Eye className="h-4 w-4 text-primary" />
      <AlertTitle className="text-primary flex items-center gap-2">
        <Lock className="h-4 w-4" />
        حالت دمو - فقط خواندنی
      </AlertTitle>
      <AlertDescription className="text-muted-foreground mt-2">
        <p className="mb-3">
          شما در حال مشاهده نسخه دموی <strong>{featureName}</strong> هستید.
          برای تعامل کامل و ذخیره‌سازی، به پلن <strong className="text-primary">شرکتی</strong> ارتقا دهید.
        </p>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/upgrade')}
          className="gap-2"
        >
          <Crown className="h-4 w-4" />
          مشاهده پلن‌های شرکتی
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default DemoModeBanner;
