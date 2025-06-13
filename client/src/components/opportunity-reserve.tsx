import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Vault, Wallet, DollarSign, Sparkles, Edit3, TrendingUp, Banknote } from "lucide-react";
import { SiBitcoin } from "react-icons/si";
import { useFinancialData, formatCurrency, useUpdateFinancialData, useUserSettings, calculatePercentageChange } from "@/hooks/use-financial-data";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/translations";

export function OpportunityReserve() {
  const { data: financialData, isLoading } = useFinancialData();
  const { data: settings } = useUserSettings();
  const updateFinancialData = useUpdateFinancialData();
  const { toast } = useToast();
  const { t } = useTranslation(settings?.language || 'English');
  
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({
    liquidMoney: "",
    physicalMoney: "",
    cryptocurrencies: ""
  });

  const handleEdit = (field: string, currentValue: string) => {
    setEditingField(field);
    setEditValues(prev => ({
      ...prev,
      [field]: currentValue
    }));
  };

  const handleSave = async (field: string) => {
    const value = editValues[field as keyof typeof editValues];
    if (!value) return;

    try {
      await updateFinancialData.mutateAsync({ [field]: value });
      setEditingField(null);
      toast({
        title: "Updated",
        description: "Opportunity reserve updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update opportunity reserve",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setEditingField(null);
    setEditValues({
      liquidMoney: "",
      physicalMoney: "",
      cryptocurrencies: ""
    });
  };

  if (isLoading) {
    return (
      <Card className="dashboard-card p-6">
        <div className="animate-pulse">
          <div className="h-10 w-10 bg-slate-600 rounded-lg mb-4"></div>
          <div className="h-4 bg-slate-600 rounded mb-2"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 bg-slate-600 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (!financialData) return null;

  const liquidValue = parseFloat(financialData.liquidMoney || "0");
  const physicalValue = parseFloat(financialData.physicalMoney || "0");
  const cryptoValue = parseFloat(financialData.cryptocurrencies || "0");
  const totalReserve = liquidValue + physicalValue + cryptoValue;
  const currency = settings?.currency || 'USD Dollar';

  // Calculate real growth percentages
  const liquidGrowth = calculatePercentageChange(financialData.liquidMoney || "0", financialData.previousLiquidMoney || "0");
  const physicalGrowth = calculatePercentageChange(financialData.physicalMoney || "0", financialData.previousPhysicalMoney || "0");
  const cryptoGrowth = calculatePercentageChange(financialData.cryptocurrencies || "0", financialData.previousCryptocurrencies || "0");

  const reserves = [
    {
      key: "liquidMoney",
      label: t("Liquid Money"),
      value: liquidValue,
      icon: Wallet,
      color: "blue"
    },
    {
      key: "physicalMoney",
      label: t("Physical Money"),
      value: physicalValue,
      icon: Banknote,
      color: "green"
    },
    {
      key: "cryptocurrencies",
      label: t("Cryptocurrencies"),
      value: cryptoValue,
      icon: SiBitcoin,
      color: "orange"
    }
  ];

  return (
    <Card className="p-6 bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950 dark:to-blue-950 border-sky-200 dark:border-sky-800 shadow-lg hover:shadow-xl transition-all duration-300 min-h-[380px]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-sky-500/20 rounded-lg flex items-center justify-center">
            <Vault className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-sky-700 dark:text-sky-300">{t('Opportunity Reserve')}</h3>
            <p className="text-sky-600 dark:text-sky-400 text-sm">{t('Total Reserve')}: {formatCurrency(totalReserve, currency)}</p>
          </div>
        </div>

      </div>

      <div className="space-y-4">
        {reserves.map((reserve) => {
          const Icon = reserve.icon;
          const isEditing = editingField === reserve.key;
          
          return (
            <div key={reserve.key} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 dark:bg-slate-800/30 bg-slate-100/50 border border-slate-700/30 dark:border-slate-700/30 border-slate-200">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 bg-${reserve.color}-500/20 rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 text-${reserve.color}-400`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200 dark:text-slate-200 text-slate-800">{reserve.label}</p>
                  {isEditing ? (
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        type="number"
                        value={editValues[reserve.key as keyof typeof editValues]}
                        onChange={(e) => setEditValues(prev => ({ ...prev, [reserve.key]: e.target.value }))}
                        className="h-7 w-24 text-xs bg-slate-700/50 dark:bg-slate-700/50 bg-white border-slate-600 dark:border-slate-600 border-slate-300"
                        placeholder="Amount"
                      />
                      <Button size="sm" className="h-6 text-xs px-2" onClick={() => handleSave(reserve.key)} disabled={updateFinancialData.isPending}>
                        Save
                      </Button>
                      <Button size="sm" variant="outline" className="h-6 text-xs px-2" onClick={handleCancel}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 dark:text-slate-400 text-slate-600">{formatCurrency(reserve.value, currency)}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center">
                {!isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(reserve.key, reserve.value.toString())}
                    className="h-6 w-6 p-0 text-slate-400 dark:text-slate-400 text-slate-600 hover:text-slate-200 dark:hover:text-slate-200 hover:text-slate-800"
                  >
                    <Edit3 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}