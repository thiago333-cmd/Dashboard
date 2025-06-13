import { Button } from "@/components/ui/button";
import { Settings, BarChart3, Home, TrendingUp } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useUserSettings } from "@/hooks/use-financial-data";
import { useTranslation } from "@/lib/translations";

interface NavigationProps {
  onSettingsClick: () => void;
}

export function Navigation({ onSettingsClick }: NavigationProps) {
  const [location] = useLocation();
  const { data: settings } = useUserSettings();
  const { t } = useTranslation(settings?.language || 'English');

  return (
    <div className="flex items-center gap-4 mb-8">
      <div className="flex items-center gap-2">
        <Link href="/">
          <Button 
            variant={location === "/" ? "default" : "outline"} 
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Financial Dashboard
          </Button>
        </Link>
        
        <Link href="/investments">
          <Button 
            variant={location === "/investments" ? "default" : "outline"} 
            className="flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            Investment Dashboard
          </Button>
        </Link>
      </div>

      <div className="ml-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={onSettingsClick}
          className="flex items-center gap-2"
        >
          <Settings className="w-4 h-4" />
          {t('Settings')}
        </Button>
      </div>
    </div>
  );
}