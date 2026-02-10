import { Outlet, Link, useNavigate } from '@tanstack/react-router';
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
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { log, country } = useEventLogger();
  const hasLoggedAppOpened = useRef(false);

  useEffect(() => {
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-foreground hover:text-primary transition-colors">
              <Calculator className="h-6 w-6" />
              <span>{APP_META.displayName}</span>
            </Link>
            <nav className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate({ to: '/calculator' })}
                className="hidden sm:flex"
              >
                <Calculator className="h-4 w-4 mr-2" />
                Calculate
              </Button>
              {isAuthenticated && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate({ to: '/invoices' })}
                  className="hidden sm:flex"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Invoices
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate({ to: '/upgrade' })}
                className="hidden sm:flex"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Pricing
              </Button>
              <LoginButton />
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border bg-card/30 py-8 mt-16">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>
              © {new Date().getFullYear()}. Built with ❤️ using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:text-primary transition-colors font-medium"
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
