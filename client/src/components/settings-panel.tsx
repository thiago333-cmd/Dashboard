import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { X, Moon, Sun, Globe, DollarSign, Home, TrendingUp } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/theme-context";
import { 
  useUserSettings, 
  useUpdateUserSettings
} from "@/hooks/use-financial-data";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { data: settings } = useUserSettings();
  const updateSettings = useUpdateUserSettings();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();

  const [localSettings, setLocalSettings] = useState({
    language: "English",
    currency: "USD Dollar",
  });

  // Update local settings when data loads
  useEffect(() => {
    if (settings) {
      setLocalSettings({
        language: settings.language,
        currency: settings.currency,
      });
    }
  }, [settings]);

  const handleSettingChange = async (key: string, value: any) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    
    try {
      await updateSettings.mutateAsync({ [key]: value });
      toast({
        title: "Settings Updated",
        description: "Your preferences have been saved",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end">
      <Card className="w-80 h-full rounded-none bg-dashboard-card/90 backdrop-blur-sm border-l border-slate-600/30 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-100">Dashboard Settings</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-6">
          {/* Navigation */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-slate-300 mb-3">Navigation</h3>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/" onClick={onClose}>
                <Button variant="outline" size="sm" className="w-full bg-dashboard-card/50 border-slate-600/30 text-slate-200 hover:bg-dashboard-card-hover/50">
                  <Home className="w-4 h-4 mr-2" />
                  Main
                </Button>
              </Link>
              <Link href="/investments" onClick={onClose}>
                <Button variant="outline" size="sm" className="w-full bg-dashboard-card/50 border-slate-600/30 text-slate-200 hover:bg-dashboard-card-hover/50">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Cash Flow
                </Button>
              </Link>
            </div>
          </div>

          {/* Theme Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {theme === 'dark' ? (
                <Moon className="h-4 w-4 text-slate-400" />
              ) : (
                <Sun className="h-4 w-4 text-slate-600" />
              )}
              <Label className="text-slate-200 dark:text-slate-200 text-slate-800">Theme</Label>
            </div>
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={toggleTheme}
            />
          </div>

          {/* Language */}
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Globe className="h-4 w-4 text-slate-400 dark:text-slate-400 text-slate-600" />
              <Label className="text-slate-200 dark:text-slate-200 text-slate-800">Language</Label>
            </div>
            <Select
              value={localSettings.language}
              onValueChange={(value) => handleSettingChange('language', value)}
              disabled={updateSettings.isPending}
            >
              <SelectTrigger className="w-full bg-slate-700/50 dark:bg-slate-700/50 bg-slate-100 border-slate-600 dark:border-slate-600 border-slate-300 text-slate-100 dark:text-slate-100 text-slate-900 focus:ring-2 focus:ring-blue-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Spanish">Español</SelectItem>
                <SelectItem value="French">Français</SelectItem>
                <SelectItem value="Portuguese BR">Português (BR)</SelectItem>
                <SelectItem value="German">Deutsch</SelectItem>
                <SelectItem value="Italian">Italiano</SelectItem>
                <SelectItem value="Japanese">日本語</SelectItem>
                <SelectItem value="Chinese">中文</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Currency */}
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <DollarSign className="h-4 w-4 text-slate-400 dark:text-slate-400 text-slate-600" />
              <Label className="text-slate-200 dark:text-slate-200 text-slate-800">Currency</Label>
            </div>
            <Select
              value={localSettings.currency}
              onValueChange={(value) => handleSettingChange('currency', value)}
              disabled={updateSettings.isPending}
            >
              <SelectTrigger className="w-full bg-slate-700/50 dark:bg-slate-700/50 bg-slate-100 border-slate-600 dark:border-slate-600 border-slate-300 text-slate-100 dark:text-slate-100 text-slate-900 focus:ring-2 focus:ring-blue-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD Dollar">USD Dollar ($)</SelectItem>
                <SelectItem value="EUR Euro">EUR Euro (€)</SelectItem>
                <SelectItem value="GBP Pound">GBP Pound (£)</SelectItem>
                <SelectItem value="BRL Real">BRL Real (R$)</SelectItem>
                <SelectItem value="JPY Yen">JPY Yen (¥)</SelectItem>
                <SelectItem value="CAD Dollar">CAD Dollar (C$)</SelectItem>
                <SelectItem value="AUD Dollar">AUD Dollar (A$)</SelectItem>
                <SelectItem value="CHF Franc">CHF Franc (CHF)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>
    </div>
  );
}
