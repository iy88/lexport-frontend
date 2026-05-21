import {useEffect, useState} from 'react';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import {useSelector} from 'react-redux';
import {Menu, Scale, User} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Sheet, SheetContent, SheetTrigger} from '@/components/ui/sheet';
import type {RootState} from '@/store';

const navItems = [
    {label: '首页', href: '#hero', type: 'anchor' as const},
    {label: '法规库', href: '/laws', type: 'route' as const},
    {label: '资讯库', href: '/news', type: 'route' as const},
    {label: '机构推荐', href: '/agencies', type: 'route' as const},
    {label: '合规报告', href: '#report-section', type: 'anchor' as const},
    {label: '关于我们', href: '#about', type: 'anchor' as const},
];

function scrollToAnchor(id: string) {
    requestAnimationFrame(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({behavior: 'smooth'});
    });
}

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const navigate = useNavigate();
    const {pathname} = useLocation();
    const user = useSelector((s: RootState) => s.auth.user);
    const isHome = pathname === '/';

    useEffect(() => {
        if (!isHome) return;
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isHome]);

    const handleAnchorClick = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        if (pathname === '/') {
            window.history.replaceState(null, '', `#${id}`);
            scrollToAnchor(id);
        } else {
            navigate(`/#${id}`);
        }
        setMobileOpen(false);
    };

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                !isHome || scrolled
                    ? 'bg-background/95 backdrop-blur-md shadow-sm border-b border-border'
                    : 'bg-transparent'
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                <div className="flex items-center justify-between h-16 md:h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 shrink-0">
                        <Scale className="w-7 h-7 text-primary"/>
                        <span className="text-lg md:text-xl font-bold text-foreground whitespace-nowrap">
              律航出海
            </span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navItems.map((item) =>
                            item.type === 'route' ? (
                                <Link
                                    key={item.href}
                                    to={item.href}
                                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent"
                                >
                                    {item.label}
                                </Link>
                            ) : (
                                <a
                                    key={item.href}
                                    href={`/${item.href}`}
                                    onClick={(e) => handleAnchorClick(e, item.href.slice(1))}
                                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent"
                                >
                                    {item.label}
                                </a>
                            )
                        )}
                    </nav>

                    {/* Desktop Auth Button */}
                    <div className="hidden md:flex items-center gap-3">
                        {user ? (
                            <Button
                                variant="ghost"
                                className="text-sm font-medium"
                                onClick={() => navigate('/user')}
                            >
                                <User className="w-4 h-4 mr-2"/>
                                {user.username}
                            </Button>
                        ) : (
                            <Button
                                className="text-sm font-medium bg-primary hover:bg-primary/90"
                                onClick={() => navigate('/login')}
                            >
                                登录
                            </Button>
                        )}
                    </div>

                    {/* Mobile Menu */}
                    <div className="md:hidden flex items-center gap-2">
                        {user ? (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-sm"
                                onClick={() => navigate('/user')}
                            >
                                <User className="w-4 h-4 mr-1"/>
                                {user.username}
                            </Button>
                        ) : (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-sm"
                                onClick={() => navigate('/login')}
                            >
                                登录
                            </Button>
                        )}
                        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-9 w-9">
                                    <Menu className="w-5 h-5"/>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[280px] p-0">
                                <div className="flex flex-col h-full">
                                    <div className="flex items-center justify-between p-4 border-b border-border">
                                        <Link to="/" className="flex items-center gap-2"
                                              onClick={() => setMobileOpen(false)}>
                                            <Scale className="w-6 h-6 text-primary"/>
                                            <span className="text-lg font-bold">律航出海</span>
                                        </Link>
                                    </div>
                                    <nav className="flex flex-col p-4 gap-1">
                                        {navItems.map((item) =>
                                            item.type === 'route' ? (
                                                <Link
                                                    key={item.href}
                                                    to={item.href}
                                                    onClick={() => setMobileOpen(false)}
                                                    className="px-4 py-3 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                                                >
                                                    {item.label}
                                                </Link>
                                            ) : (
                                                <a
                                                    key={item.href}
                                                    href={`/${item.href}`}
                                                    onClick={(e) => handleAnchorClick(e, item.href.slice(1))}
                                                    className="px-4 py-3 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                                                >
                                                    {item.label}
                                                </a>
                                            )
                                        )}
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
