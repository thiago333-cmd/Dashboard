import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star } from "lucide-react";
import { 
  useFinancialData, 
  calculateNetWorth, 
  calculateFinancialDegree, 
  calculateProgress, 
  formatCurrency,
  getNextMilestone,
  useUserSettings
} from "@/hooks/use-financial-data";
import { useTranslation } from "@/lib/translations";

export function FinancialFreedomSection() {
  const { data: financialData, isLoading } = useFinancialData();
  const { data: settings } = useUserSettings();
  const { t } = useTranslation(settings?.language || 'English');

  if (isLoading) {
    return (
      <Card className="dashboard-card p-6 mb-8">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-600 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center">
                <div className="h-4 bg-slate-600 rounded mb-2"></div>
                <div className="h-8 bg-slate-600 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (!financialData) return null;

  const netWorth = calculateNetWorth(financialData.totalAssets, financialData.totalLiabilities);
  const currentDegree = calculateFinancialDegree(netWorth);
  const progressPercent = calculateProgress(netWorth, currentDegree);
  const nextMilestone = getNextMilestone(currentDegree);
  const currency = settings?.currency || 'USD Dollar';
  const isMaxLevel = currentDegree.level === 7 && netWorth >= currentDegree.max;

  const allDegrees = [
    { level: 0, min: 0, max: 500000, label: "DEGREE 0", range: "$0 to $500K" },
    { level: 1, min: 500000, max: 1000000, label: "DEGREE 1", range: "$500K to $1M" },
    { level: 2, min: 1000000, max: 5000000, label: "DEGREE 2", range: "$1M to $5M" },
    { level: 3, min: 5000000, max: 10000000, label: "DEGREE 3", range: "$5M to $10M" },
    { level: 4, min: 10000000, max: 20000000, label: "DEGREE 4", range: "$10M to $20M" },
    { level: 5, min: 20000000, max: 50000000, label: "DEGREE 5", range: "$20M to $50M" },
    { level: 6, min: 50000000, max: 100000000, label: "DEGREE 6", range: "$50M to $100M" },
    { level: 7, min: 100000000, max: 1000000000, label: "DEGREE 7", range: "$100M to $1B" }
  ];

  const getCardStatus = (degree: any) => {
    if (isMaxLevel) return "complete"; // All complete when max level reached
    if (degree.level < currentDegree.level) return "complete";
    if (degree.level === currentDegree.level) return "current";
    return "locked";
  };

  const getCardStyles = (status: string) => {
    switch (status) {
      case "complete":
        return "bg-emerald-600/30 border-2 border-emerald-500";
      case "current":
        return "bg-purple-600/30 border-2 border-purple-500";
      default:
        return "dashboard-card hover:bg-dashboard-card-hover/50";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "complete":
        return "Complete";
      case "current":
        return "In Progress";
      default:
        return "Locked";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "complete":
        return "text-emerald-300";
      case "current":
        return "text-purple-300";
      default:
        return "text-slate-400";
    }
  };

  return (
    <Card className="p-6 mb-8 min-h-[600px] bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 border-purple-200 dark:border-purple-800 shadow-lg hover:shadow-xl transition-all duration-300">
      {isMaxLevel && (
        <div className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/30 rounded-lg p-4 mb-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Star className="w-6 h-6 text-emerald-400" />
            <h3 className="text-xl font-bold text-emerald-400">{t('Congratulations! You have reached the maximum level of financial freedom!')}</h3>
            <Star className="w-6 h-6 text-emerald-400" />
          </div>
          <p className="text-emerald-300 text-sm">{t('You have achieved complete financial independence.')}</p>
        </div>
      )}
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <Trophy className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-purple-700 dark:text-purple-300">{t('Degrees of Financial Freedom')}</h2>
            <p className="text-purple-600 dark:text-purple-400 text-sm">{t('Your path to financial independence')}</p>
          </div>
        </div>

      </div>

      {/* Current Progress */}
      <div className={`grid grid-cols-1 ${isMaxLevel ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-6 mb-8`}>
        <div className="text-center">
          <h3 className="text-slate-400 dark:text-slate-400 text-slate-600 text-sm font-medium mb-2">{t('Current Stage')}</h3>
          <p className="text-2xl font-bold text-slate-100 dark:text-slate-100 text-slate-900">{t(currentDegree.label)}</p>
        </div>
        <div className="text-center">
          <h3 className="text-slate-400 dark:text-slate-400 text-slate-600 text-sm font-medium mb-2">{t('Progress')}</h3>
          <p className="text-2xl font-bold text-slate-100 dark:text-slate-100 text-slate-900">{Math.round(progressPercent)}%</p>
          <div className="relative mt-2 h-3 bg-slate-700 dark:bg-slate-700 bg-slate-300 rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 via-purple-400 to-purple-300 rounded-full shadow-lg transition-all duration-500 ease-out"
              style={{ 
                width: `${progressPercent}%`,
                boxShadow: '0 2px 8px rgba(168, 85, 247, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.3)'
              }}
            />
          </div>
          <p className="text-sm text-slate-400 dark:text-slate-400 text-slate-600 mt-1">{formatCurrency(netWorth, currency)} / {formatCurrency(currentDegree.max, currency)}</p>
          <p className="text-sm text-white dark:text-white mt-2 font-medium">{t('Net Equity')}</p>
        </div>
        {!isMaxLevel && (
          <div className="text-center">
            <h3 className="text-slate-400 dark:text-slate-400 text-slate-600 text-sm font-medium mb-2">{t('Next Milestone')}</h3>
            <p className="text-2xl font-bold text-slate-100 dark:text-slate-100 text-slate-900">{formatCurrency(currentDegree.max, currency)}</p>
          </div>
        )}
      </div>

      {/* Financial Freedom Stages */}
      <div>
        <h3 className="text-lg font-semibold text-slate-100 mb-6">{t('Financial Freedom Stages')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {allDegrees.map((degree) => {
            const status = getCardStatus(degree);
            return (
              <div
                key={degree.level}
                className={`${getCardStyles(status)} rounded-xl p-5 transition-all duration-300 border`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-lg text-slate-100 dark:text-slate-100 text-slate-900">{t(degree.label)}</h4>
                  {status === 'complete' && (
                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                  )}
                  {status === 'current' && (
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
                <p className={`text-sm font-medium mb-2 ${status === 'current' ? 'text-purple-300' : status === 'complete' ? 'text-emerald-300' : 'text-slate-400 dark:text-slate-400 text-slate-600'}`}>
                  {formatCurrency(degree.min, currency)} to {formatCurrency(degree.max, currency)}
                </p>
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    status === 'complete' ? 'bg-emerald-500/20 text-emerald-400' :
                    status === 'current' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-slate-500/20 text-slate-500'
                  }`}>
                    {getStatusText(status)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
