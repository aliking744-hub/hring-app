import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, FileText, BookOpen, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CategoryCount {
  category: string;
  count: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  labor_law: 'قانون کار',
  social_security: 'تامین اجتماعی',
  court_rulings: 'آرای دیوان',
};

const KnowledgeBaseStatus = () => {
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [categoryCounts, setCategoryCounts] = useState<CategoryCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Get total count
      const { count, error: countError } = await supabase
        .from('legal_docs')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;
      setTotalCount(count || 0);

      // Get category breakdown
      const { data, error: catError } = await supabase
        .from('legal_docs')
        .select('category');

      if (catError) throw catError;

      // Count by category
      const counts: Record<string, number> = {};
      data?.forEach((doc) => {
        counts[doc.category] = (counts[doc.category] || 0) + 1;
      });

      setCategoryCounts(
        Object.entries(counts).map(([category, count]) => ({ category, count }))
      );
    } catch (error) {
      console.error('Error fetching knowledge base stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5 text-primary" />
          وضعیت پایگاه دانش حقوقی
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Total Count */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-primary" />
                <span className="font-medium text-foreground">مجموع قوانین ایندکس شده</span>
              </div>
              <span className="text-3xl font-bold text-primary">
                {totalCount?.toLocaleString('fa-IR')}
              </span>
            </div>

            {/* Category Breakdown */}
            {categoryCounts.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {categoryCounts.map(({ category, count }) => (
                  <div
                    key={category}
                    className="p-4 rounded-lg bg-secondary/50 border border-border"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {CATEGORY_LABELS[category] || category}
                      </span>
                    </div>
                    <span className="text-2xl font-bold text-foreground">
                      {count.toLocaleString('fa-IR')}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {totalCount === 0 && (
              <p className="text-center text-muted-foreground py-4">
                هنوز قانونی وارد نشده است. از بخش "وارد کردن قوانین" استفاده کنید.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KnowledgeBaseStatus;
