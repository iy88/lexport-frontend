import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const navItems = [
  { label: '首页', href: '#hero', type: 'anchor' },
  { label: '法规库', href: '#laws', type: 'anchor' },
  { label: '资讯库', href: '#news', type: 'anchor' },
  { label: '机构推荐', href: '#agencies', type: 'anchor' },
  { label: '合规报告', href: '/report', type: 'route' },
  { label: '关于我们', href: '#about', type: 'anchor' },
];

const NAV_OFFSET = 80;

function scrollToHash(id: string) {
  const el = document.getElementById(id);
  if (el) {
    const y = el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
}

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent, item: (typeof navItems)[number]) => {
    if (item.type === 'route') {
      e.preventDefault();
      navigate(item.href);
      setMobileOpen(false);
      return;
    }
    e.preventDefault();
    const id = item.href.replace('#', '');
    window.history.pushState(null, '', `#${id}`);
    scrollToHash(id);
    setMobileOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-background/95 backdrop-blur-md shadow-sm border-b border-border'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <Scale className="w-7 h-7 text-primary" />
            <span className="text-lg md:text-xl font-bold text-foreground whitespace-nowrap">
              律航出海
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavClick(e, item)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Desktop Login */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="ghost"
              className="text-sm font-medium"
              onClick={() => navigate('/login')}
            >
              登录
            </Button>
            <Button
              className="text-sm font-medium bg-primary hover:bg-primary/90"
              onClick={() => {
                window.history.pushState(null, '', '#laws');
                scrollToHash('laws');
              }}
            >
              立即体验
            </Button>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-sm"
              onClick={() => navigate('/login')}
            >
              登录
            </Button>
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] p-0">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between p-4 border-b border-border">
                    <Link to="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                      <Scale className="w-6 h-6 text-primary" />
                      <span className="text-lg font-bold">律航出海</span>
                    </Link>
                  </div>
                  <nav className="flex flex-col p-4 gap-1">
                    {navItems.map((item) => (
                      <a
                        key={item.href}
                        href={item.href}
                        onClick={(e) => handleNavClick(e, item)}
                        className="px-4 py-3 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                      >
                        {item.label}
                      </a>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
