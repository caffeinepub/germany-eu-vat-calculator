import { Outlet, Link, useNavigate, useLocation } from '@tanstack/react-router';
import { Calculator, CreditCard, FileText } from 'lucide-react';
import LoginButton from '../auth/LoginButton';
import { Button } from '@/components/ui/button';
import { APP_META } from '@/config/appMeta';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useEventLogger } from '../../hooks/useEventLogger';
import { CORE_EVENTS } from '../../lib/analytics/coreEvents';
import { useEffect, useRef } from 'react';

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { log, country } = useEventLogger();
  const hasLoggedAppOpened = useRef(false);

  useEffect(() => {
    // Ensure document title stays consistent across route transitions
    document.title = APP_META.displayName;

    // Log app_opened once per page load
    if (!hasLoggedAppOpened.current) {
      hasLoggedAppOpened.current = true;
      log(CORE_EVENTS.APP_OPENED);
      
      // Log country_detected when available
      if (country) {
        log(CORE_EVENTS.COUNTRY_DETECTED, country);
      }
    }
  }, [log, country]);

  // Helper to check if a route is active
  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  // Professional tab styling with light grey background for inactive tabs
  const getTabClassName = (path: string) => {
    const isActive = isActiveRoute(path);
    
    if (isActive) {
      // Active state: muted background with border accent and darker text
      return "border-2 border-border bg-muted/60 text-foreground font-medium shadow-xs";
    }
    
    // Inactive state: light grey background with lighter text and border
    return "border border-border/40 bg-[var(--header-tab-bg)] text-muted-foreground hover:bg-muted/40 hover:text-foreground hover:border-border/60 transition-all";
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border backdrop-blur-sm sticky top-0" style={{ zIndex: 40 }}>
        {/* Brand area with light blue background */}
        <div className="bg-[var(--header-brand-bg)] border-b border-border/50">
          <div className="container mx-auto px-4 py-4">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-foreground hover:text-primary transition-colors">
              <Calculator className="h-6 w-6" />
              <span>{APP_META.displayName}</span>
            </Link>
          </div>
        </div>
        
        {/* Navigation tabs area */}
        <div className="bg-card/50">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate({ to: '/calculator', search: {} })}
                  className={`hidden sm:flex ${getTabClassName('/calculator')}`}
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculator
                </Button>

                {isAuthenticated && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate({ to: '/invoices' })}
                    className={`hidden sm:flex ${getTabClassName('/invoices')}`}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Invoices
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate({ to: '/upgrade' })}
                  className={`hidden sm:flex ${getTabClassName('/upgrade')}`}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pricing
                </Button>
              </div>

              <LoginButton />
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1" style={{ overflow: 'visible' }}>
        <Outlet />
      </main>

      <footer className="border-t border-border bg-card/30 py-6 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} {APP_META.displayName}. All rights reserved.</p>
            <p>
              Built with love using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                  typeof window !== 'undefined' ? window.location.hostname : 'unknown-app'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
