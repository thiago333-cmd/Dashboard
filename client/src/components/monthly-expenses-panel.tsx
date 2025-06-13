import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit3, Save, X, TrendingDown, Plus, Trash2 } from "lucide-react";
import { useCashFlowData, useUpdateCashFlowData, formatCashFlowCurrency, calculateTotalExpensesCosts } from "@/hooks/use-cash-flow-data";
import { useUserSettings } from "@/hooks/use-financial-data";
import { useTranslation } from "@/lib/translations";

export function MonthlyExpensesPanel() {
  const { data: cashFlowData, isLoading } = useCashFlowData();
  const { data: userSettings } = useUserSettings();
  const updateCashFlowMutation = useUpdateCashFlowData();
  const { t } = useTranslation(userSettings?.language || 'English');
  
  const [isEditing, setIsEditing] = useState(false);
  const [expenses, setExpenses] = useState<Record<string, string>>({});
  const [costs, setCosts] = useState<Record<string, string>>({});
  const [newExpenseCategory, setNewExpenseCategory] = useState("");
  const [newCostCategory, setNewCostCategory] = useState("");

  const handleEdit = () => {
    try {
      const expensesData = JSON.parse(cashFlowData?.expensesData || '{}');
      const costsData = JSON.parse(cashFlowData?.costsData || '{}');
      setExpenses(expensesData);
      setCosts(costsData);
    } catch {
      setExpenses({});
      setCosts({});
    }
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await updateCashFlowMutation.mutateAsync({
        expensesData: JSON.stringify(expenses),
        costsData: JSON.stringify(costs)
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update expenses/costs:", error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setExpenses({});
    setCosts({});
    setNewExpenseCategory("");
    setNewCostCategory("");
  };

  const addExpenseCategory = () => {
    if (newExpenseCategory.trim()) {
      setExpenses(prev => ({ ...prev, [newExpenseCategory]: "0" }));
      setNewExpenseCategory("");
    }
  };

  const addCostCategory = () => {
    if (newCostCategory.trim()) {
      setCosts(prev => ({ ...prev, [newCostCategory]: "0" }));
      setNewCostCategory("");
    }
  };

  const removeExpenseCategory = (category: string) => {
    setExpenses(prev => {
      const newExpenses = { ...prev };
      delete newExpenses[category];
      return newExpenses;
    });
  };

  const removeCostCategory = (category: string) => {
    setCosts(prev => {
      const newCosts = { ...prev };
      delete newCosts[category];
      return newCosts;
    });
  };

  if (isLoading) {
    return (
      <Card className="h-[380px] bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950 border-red-200 dark:border-red-800 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
            <TrendingDown className="h-5 w-5" />
            {t('monthlyExpensesCosts')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-8 bg-red-200 dark:bg-red-800 rounded mb-4"></div>
            <div className="h-4 bg-red-200 dark:bg-red-800 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalExpensesCosts = calculateTotalExpensesCosts(
    cashFlowData?.expensesData || '{}',
    cashFlowData?.costsData || '{}'
  );
  const formattedAmount = formatCashFlowCurrency(totalExpensesCosts, userSettings?.currency);

  return (
    <Card className="h-[420px] bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950 dark:to-rose-950 border-red-200 dark:border-red-800 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-8">
        <CardTitle className="flex items-center justify-between text-red-700 dark:text-red-300 mb-2">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            <span className="font-semibold">{t('Monthly Expenses')}</span>
          </div>
          {!isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isEditing ? (
          <div className="space-y-4">
            <Tabs defaultValue="expenses" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="expenses">{t('Expenses')}</TabsTrigger>
                <TabsTrigger value="costs">{t('Costs')}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="expenses" className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder={t('Add Expense Category')}
                    value={newExpenseCategory}
                    onChange={(e) => setNewExpenseCategory(e.target.value)}
                    className="text-sm"
                  />
                  <Button size="sm" onClick={addExpenseCategory}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="max-h-24 overflow-y-auto space-y-2">
                  {Object.entries(expenses).map(([category, value]) => (
                    <div key={category} className="flex gap-2 items-center">
                      <Input
                        placeholder={category}
                        value={category}
                        className="text-xs flex-1"
                        readOnly
                      />
                      <Input
                        type="number"
                        value={value}
                        onChange={(e) => setExpenses(prev => ({ ...prev, [category]: e.target.value }))}
                        className="text-xs w-20"
                        step="0.01"
                        min="0"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeExpenseCategory(category)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="costs" className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder={t('Add Cost Category')}
                    value={newCostCategory}
                    onChange={(e) => setNewCostCategory(e.target.value)}
                    className="text-sm"
                  />
                  <Button size="sm" onClick={addCostCategory}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="max-h-24 overflow-y-auto space-y-2">
                  {Object.entries(costs).map(([category, value]) => (
                    <div key={category} className="flex gap-2 items-center">
                      <Input
                        placeholder={category}
                        value={category}
                        className="text-xs flex-1"
                        readOnly
                      />
                      <Input
                        type="number"
                        value={value}
                        onChange={(e) => setCosts(prev => ({ ...prev, [category]: e.target.value }))}
                        className="text-xs w-20"
                        step="0.01"
                        min="0"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeCostCategory(category)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={updateCashFlowMutation.isPending}
                className="flex-1 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
              >
                <Save className="h-4 w-4 mr-2" />
                {t('Save')}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={updateCashFlowMutation.isPending}
                className="flex-1 border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-950"
              >
                <X className="h-4 w-4 mr-2" />
                {t('Cancel')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-800 dark:text-red-200 mb-2">
                {formattedAmount}
              </div>

            </div>
            
            <div className="bg-red-100 dark:bg-red-900 rounded-lg p-4">
              <p className="text-sm text-red-700 dark:text-red-300 text-center">
                {t('Expenses/Costs Description')}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}