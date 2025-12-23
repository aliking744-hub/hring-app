import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="py-12 px-4 border-t border-border" dir="rtl">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <Link to="/" className="text-xl font-bold gradient-text-primary">
            hring
          </Link>

          {/* Links */}
          <div className="flex items-center gap-8 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">
              خانه
            </Link>
            <Link to="/shop" className="hover:text-foreground transition-colors">
              فروشگاه
            </Link>
            <Link to="/dashboard" className="hover:text-foreground transition-colors">
              داشبورد
            </Link>
          </div>

          {/* Credit */}
          <p className="text-sm text-muted-foreground text-center md:text-right">
            Architected by{" "}
            <span className="text-foreground">Ali Dehghani</span>
            {" "}&{" "}
            <span className="gradient-text-primary">Gemini</span>
          </p>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} hring. تمامی حقوق محفوظ است.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
