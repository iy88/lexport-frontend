import React from 'react';
import { Scale } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-secondary/50 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-foreground">律航出海</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span>© 2026 律航出海</span>
            <span className="hidden md:inline">|</span>
            <span>浙ICP备XXXXXXXX号</span>
            <span className="hidden md:inline">|</span>
            <button className="hover:text-foreground transition-colors">隐私政策</button>
            <span className="hidden md:inline">|</span>
            <button className="hover:text-foreground transition-colors">使用条款</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
