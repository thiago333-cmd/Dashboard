import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useUserSettings } from "@/hooks/use-financial-data";
import { useTranslation } from "@/lib/translations";
import { SettingsPanel } from "@/components/settings-panel";
import { TotalIncomePanel } from "@/components/total-income-panel";
import { MonthlyExpensesPanel } from "@/components/monthly-expenses-panel";
import { CashFlowPieChart } from "@/components/cash-flow-pie-chart";
import { PriorityDivisionPanel } from "@/components/priority-division-panel";

export default function Investments() {
  const [settingsPanelOpen, setSettingsPanelOpen] = useState(false);
  const { data: settings } = useUserSettings();
  const { t } = useTranslation(settings?.language || 'English');

  return (
    <div className="min-h-screen bg-dashboard-dark text-white p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-slate-100 dark:text-slate-100 text-slate-900">
            {t('Cash Flow Dashboard')}
          </h1>
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

        {/* Top row: Total Income, Monthly Expenses/Costs, and Pie Chart side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <TotalIncomePanel />
          <MonthlyExpensesPanel />
          <CashFlowPieChart />
        </div>

        {/* Bottom row: Priority Division panel */}
        <div className="mb-8">
          <PriorityDivisionPanel />
        </div>

      </div>
      
      <SettingsPanel 
        isOpen={settingsPanelOpen} 
        onClose={() => setSettingsPanelOpen(false)} 
      />
    </div>
  );
}