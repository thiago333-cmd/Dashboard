import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrendingUp, CreditCard, Edit3, Save, X } from "lucide-react";
import { useFinancialData, calculateNetWorth, formatCurrency, useUpdateFinancialData, useUserSettings, calculatePercentageChange } from "@/hooks/use-financial-data";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/translations";

export function FinancialMetrics() {
  const { data: financialData, isLoading } = useFinancialData();
  const { data: settings } = useUserSettings();
  const updateFinancialData = useUpdateFinancialData();
  const { toast } = useToast();
  const { t } = useTranslation(settings?.language || 'English');
  
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({
    totalAssets: "",
    totalLiabilities: ""
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
        description: "Financial data updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update financial data",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setEditingField(null);
    setEditValues({
      totalAssets: "",
      totalLiabilities: ""
    });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {[1, 2].map((i) => (
          <Card key={i} className="dashboard-card p-6">
            <div className="animate-pulse">
              <div className="h-10 w-10 bg-slate-600 rounded-lg mb-4"></div>
              <div className="h-4 bg-slate-600 rounded mb-2"></div>
              <div className="h-8 bg-slate-600 rounded"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!financialData) return null;

  const netWorth = calculateNetWorth(financialData.totalAssets, financialData.totalLiabilities);
  const assetsValue = parseFloat(financialData.totalAssets);
  const liabilitiesValue = parseFloat(financialData.totalLiabilities);
  const currency = settings?.currency || 'USD Dollar';

  // Calculate real growth percentages
  const assetsGrowth = calculatePercentageChange(financialData.totalAssets, financialData.previousAssets || "0");
  const liabilitiesGrowth = calculatePercentageChange(financialData.totalLiabilities, financialData.previousLiabilities || "0");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Net Equity Card */}
      <Card className="p-8 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800 shadow-lg hover:shadow-xl transition-all duration-300 min-h-[380px] flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit('totalAssets', financialData.totalAssets)}
            className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200 dark:text-slate-400 dark:hover:text-slate-200 text-slate-600 hover:text-slate-800"
          >
            <Edit3 className="h-4 w-4" />
          </Button>
        </div>
        <h3 className="text-green-600 dark:text-green-400 text-sm font-medium mb-1">{t('Liquid Assets')}</h3>
        {editingField === 'totalAssets' ? (
          <div className="space-y-3">
            <div className="relative">
              <Input
                type="number"
                value={editValues.totalAssets}
                onChange={(e) => setEditValues(prev => ({ ...prev, totalAssets: e.target.value }))}
                className="text-xl font-bold bg-slate-700/50 dark:bg-slate-700/50 bg-white border-slate-600 dark:border-slate-600 border-slate-300 text-slate-100 dark:text-slate-100 text-slate-900 pr-20"
                placeholder="Enter amount"
                autoFocus
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-400 text-slate-600">
                {currency.split(' ')[0]}
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={() => handleSave('totalAssets')} 
                disabled={updateFinancialData.isPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1"
              >
                <Save className="w-3 h-3" />
                {t('Save')}
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleCancel}
                className="border-slate-600 dark:border-slate-600 border-slate-300 text-slate-300 dark:text-slate-300 text-slate-700 hover:bg-slate-700/50 dark:hover:bg-slate-700/50 hover:bg-slate-100 flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                {t('Cancel')}
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-2xl font-bold text-slate-100 dark:text-slate-100 text-slate-900">
            {formatCurrency(assetsValue, currency)}
          </p>
        )}
      </Card>

      {/* Debts Card */}
      <Card className="p-8 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950 dark:to-rose-950 border-red-200 dark:border-red-800 shadow-lg hover:shadow-xl transition-all duration-300 min-h-[380px] flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-red-400" />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit('totalLiabilities', financialData.totalLiabilities)}
            className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200 dark:text-slate-400 dark:hover:text-slate-200 text-slate-600 hover:text-slate-800"
          >
            <Edit3 className="h-4 w-4" />
          </Button>
        </div>
        <h3 className="text-red-600 dark:text-red-400 text-sm font-medium mb-1">{t('Debts')}</h3>
        {editingField === 'totalLiabilities' ? (
          <div className="space-y-3">
            <div className="relative">
              <Input
                type="number"
                value={editValues.totalLiabilities}
                onChange={(e) => setEditValues(prev => ({ ...prev, totalLiabilities: e.target.value }))}
                className="text-xl font-bold bg-slate-700/50 dark:bg-slate-700/50 bg-white border-slate-600 dark:border-slate-600 border-slate-300 text-slate-100 dark:text-slate-100 text-slate-900 pr-20"
                placeholder="Enter amount"
                autoFocus
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-400 text-slate-600">
                {currency.split(' ')[0]}
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={() => handleSave('totalLiabilities')} 
                disabled={updateFinancialData.isPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1"
              >
                <Save className="w-3 h-3" />
                {t('Save')}
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleCancel}
                className="border-slate-600 dark:border-slate-600 border-slate-300 text-slate-300 dark:text-slate-300 text-slate-700 hover:bg-slate-700/50 dark:hover:bg-slate-700/50 hover:bg-slate-100 flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                {t('Cancel')}
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-2xl font-bold text-slate-100">
            {formatCurrency(liabilitiesValue, currency)}
          </p>
        )}
      </Card>
    </div>
  );
}
