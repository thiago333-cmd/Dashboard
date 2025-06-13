import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Settings, ChartLine } from "lucide-react";
import { FinancialMetrics } from "@/components/financial-metrics";
import { FinancialFreedomSection } from "@/components/financial-freedom-section";
import { OpportunityReserve } from "@/components/opportunity-reserve";
import { SettingsPanel } from "@/components/settings-panel";

import { useUserSettings } from "@/hooks/use-financial-data";
import { useTranslation } from "@/lib/translations";

export default function Dashboard() {
  const [settingsPanelOpen, setSettingsPanelOpen] = useState(false);
  const { data: settings } = useUserSettings();
  const { t, formatDate } = useTranslation(settings?.language || 'English');

  const currentDate = formatDate(new Date());

  return (
    <div className="min-h-screen dashboard-gradient">
      <div className="flex">
        {/* Main Dashboard Content */}
        <div className="flex-1 p-6">
          {/* Dashboard Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <ChartLine className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-slate-100 dark:text-slate-100 text-slate-900">{t('Financial Dashboard')}</h1>
                  <p className="text-slate-400 dark:text-slate-400 text-slate-600 text-sm">{currentDate}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSettingsPanelOpen(true)}
                className="bg-dashboard-card/50 border-slate-600/30 text-slate-200 hover:bg-dashboard-card-hover/50"
              >
                <Settings className="w-4 h-4 mr-2" />
                {t('Settings')}
              </Button>
            </div>
          </div>

          {/* Financial Metrics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <FinancialMetrics />
            </div>
            <div>
              <OpportunityReserve />
            </div>
          </div>

          {/* Financial Freedom Section */}
          <FinancialFreedomSection />
        </div>
      </div>

      {/* Settings Panel */}
      <SettingsPanel 
        isOpen={settingsPanelOpen} 
        onClose={() => setSettingsPanelOpen(false)} 
      />
    </div>
  );
}
