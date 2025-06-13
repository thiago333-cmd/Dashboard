import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useFinancialData, useUpdateFinancialData, formatCurrency } from "@/hooks/use-financial-data";

export function QuickActions() {
  const { data: financialData, isLoading } = useFinancialData();
  const updateFinancialData = useUpdateFinancialData();
  const { toast } = useToast();
  
  const [assets, setAssets] = useState("");
  const [liabilities, setLiabilities] = useState("");

  const handleUpdateData = async () => {
    if (!assets && !liabilities) {
      toast({
        title: "Error",
        description: "Please enter at least one value to update",
        variant: "destructive",
      });
      return;
    }

    const updateData: any = {};
    if (assets) updateData.totalAssets = assets;
    if (liabilities) updateData.totalLiabilities = liabilities;

    try {
      await updateFinancialData.mutateAsync(updateData);
      toast({
        title: "Success",
        description: "Financial data updated successfully",
      });
      setAssets("");
      setLiabilities("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update financial data",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Card key={i} className="dashboard-card p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-slate-600 rounded mb-4"></div>
              <div className="space-y-4">
                <div className="h-4 bg-slate-600 rounded"></div>
                <div className="h-10 bg-slate-600 rounded"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!financialData) return null;

  const emergencyFundProgress = (parseFloat(financialData.emergencyFundCurrent) / parseFloat(financialData.emergencyFundGoal)) * 100;
  const investmentProgress = (parseFloat(financialData.investmentCurrent) / parseFloat(financialData.investmentGoal)) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="dashboard-card p-6">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">Update Financial Data</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="assets" className="block text-sm font-medium text-slate-300 mb-2">
              Assets
            </Label>
            <Input
              id="assets"
              type="number"
              value={assets}
              onChange={(e) => setAssets(e.target.value)}
              placeholder={formatCurrency(financialData.totalAssets).replace('$', '').replace(',', '')}
              className="w-full bg-slate-700/50 border-slate-600 text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <Label htmlFor="liabilities" className="block text-sm font-medium text-slate-300 mb-2">
              Liabilities
            </Label>
            <Input
              id="liabilities"
              type="number"
              value={liabilities}
              onChange={(e) => setLiabilities(e.target.value)}
              placeholder={formatCurrency(financialData.totalLiabilities).replace('$', '').replace(',', '')}
              className="w-full bg-slate-700/50 border-slate-600 text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <Button
            onClick={handleUpdateData}
            disabled={updateFinancialData.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            {updateFinancialData.isPending ? "Updating..." : "Update Data"}
          </Button>
        </div>
      </Card>

      <Card className="dashboard-card p-6">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">Goal Tracking</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-300">Emergency Fund</span>
              <span className="text-emerald-400">{Math.round(emergencyFundProgress)}%</span>
            </div>
            <Progress value={emergencyFundProgress} className="h-2 bg-slate-700" />
            <div className="text-xs text-slate-400 mt-1">
              {formatCurrency(financialData.emergencyFundCurrent)} / {formatCurrency(financialData.emergencyFundGoal)}
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-300">Investment Goal</span>
              <span className="text-blue-400">{Math.round(investmentProgress)}%</span>
            </div>
            <Progress value={investmentProgress} className="h-2 bg-slate-700" />
            <div className="text-xs text-slate-400 mt-1">
              {formatCurrency(financialData.investmentCurrent)} / {formatCurrency(financialData.investmentGoal)}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
