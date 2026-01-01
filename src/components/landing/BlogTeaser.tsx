import { BookOpen, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const BlogTeaser = () => {
  const { getSetting } = useSiteSettings();
  
  const blogTitle = getSetting('blog_title', 'بلاگ و مقالات');
  const blogSubtitle = getSetting('blog_subtitle', 'آخرین مطالب و مقالات تخصصی منابع انسانی');

  const { data: posts = [] } = useQuery({
    queryKey: ['blog-teaser'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('id, title, slug, image_url, created_at')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(6);
      
      if (error) throw error;
      return data || [];
    },
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  // If no posts, don't render the section
  if (posts.length === 0) return null;

  return (
    <section className="py-24 px-4" dir="rtl">
      <div className="container mx-auto">
        <ScrollReveal>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                {blogTitle}
              </h2>
              <p className="text-muted-foreground text-lg">
                {blogSubtitle}
              </p>
            </div>
            <Link to="/blog">
              <Button variant="outline" className="border-border bg-secondary/50 hover:bg-secondary">
                مشاهده همه
              </Button>
            </Link>
          </div>
        </ScrollReveal>

        <div className="horizontal-scroll pb-4">
          {posts.map((post, index) => (
            <ScrollReveal key={post.id} delay={index * 0.05}>
              <Link to={`/blog/${post.slug}`}>
                <motion.div
                  whileHover={{ y: -5 }}
                  className="glass-card p-0 w-80 cursor-pointer group overflow-hidden"
                >
                  {post.image_url ? (
                    <div className="h-40 overflow-hidden">
                      <img 
                        src={post.image_url} 
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="h-40 bg-primary/10 flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-primary/50" />
                    </div>
                  )}
                  
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    
                    <div className="flex items-center gap-1 text-muted-foreground text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(post.created_at)}</span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogTeaser;
