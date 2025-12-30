-- Create table for digital products/assets
CREATE TABLE public.digital_products (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL DEFAULT 0,
    payment_link TEXT,
    file_path TEXT,
    category TEXT DEFAULT 'عمومی',
    download_count INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.digital_products ENABLE ROW LEVEL SECURITY;

-- Anyone can view active products
CREATE POLICY "Anyone can view active products" 
ON public.digital_products 
FOR SELECT 
USING (is_active = true);

-- Admin can view all products (including inactive)
CREATE POLICY "Admin can view all products" 
ON public.digital_products 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admin can manage products
CREATE POLICY "Admin can manage products" 
ON public.digital_products 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create user purchases table to track who bought what
CREATE TABLE public.user_purchases (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    product_id UUID NOT NULL REFERENCES public.digital_products(id) ON DELETE CASCADE,
    purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, product_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_purchases ENABLE ROW LEVEL SECURITY;

-- Users can view their own purchases
CREATE POLICY "Users can view their own purchases" 
ON public.user_purchases 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own purchases
CREATE POLICY "Users can insert their own purchases" 
ON public.user_purchases 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Admin can view all purchases
CREATE POLICY "Admin can view all purchases" 
ON public.user_purchases 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admin can manage all purchases
CREATE POLICY "Admin can manage purchases" 
ON public.user_purchases 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates on digital_products
CREATE TRIGGER update_digital_products_updated_at
BEFORE UPDATE ON public.digital_products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();