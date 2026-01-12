import { useState } from "react";
import { ChevronLeft, TrendingUp, Users, DollarSign, Receipt, Crown, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import MobileFrame from "@/components/MobileFrame";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils";
import { reportService, ReportPeriod } from "@/services/reports.service";

// Revenue data will be fetched from API
const MetricCard = ({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color: string;
}) => {
  return (
    <div className="bg-card rounded-xl p-3 shadow-soft">
      <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center mb-1.5`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-lg font-bold text-foreground leading-tight">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
};

const Reports = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<ReportPeriod>("this-week");

  // Fetch report data from API
  const { data: reportData, isLoading } = useQuery({
    queryKey: ['reports', period],
    queryFn: () => reportService.getReport(period),
  });

  // Generate bar chart data from API dailyBreakdown
  const getRevenueData = () => {
    if (!reportData || !reportData.dailyBreakdown || reportData.dailyBreakdown.length === 0) {
      return [{ day: "載入中", revenue: 0 }];
    }
    return reportData.dailyBreakdown;
  };

  const metrics = {
    totalSales: reportData?.totalSales || 0,
    newCustomers: reportData?.newCustomers || 0,
    avgTicket: reportData?.avgTicket || 0,
  };

  const serviceBreakdown = reportData?.serviceBreakdown || [];
  const staffRanking = reportData?.staffRanking || [];

  return (
    <MobileFrame>
      <div className="flex flex-col h-full bg-background">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4">
          <button
            onClick={() => navigate("/menu")}
            className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground flex-1">報表分析</h1>
          <Select value={period} onValueChange={(v) => setPeriod(v as ReportPeriod)}>
            <SelectTrigger className="w-32 h-9 rounded-xl text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this-week">本週</SelectItem>
              <SelectItem value="this-month">本月</SelectItem>
              <SelectItem value="last-month">上月</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide px-5 pb-4 space-y-3">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-3 gap-2">
            <MetricCard
              icon={DollarSign}
              label="總銷售額"
              value={`$${(metrics.totalSales / 1000).toFixed(1)}k`}
              color="bg-primary/20 text-primary"
            />
            <MetricCard
              icon={Users}
              label="新增客戶"
              value={metrics.newCustomers.toString()}
              color="bg-accent/20 text-accent"
            />
            <MetricCard
              icon={Receipt}
              label="平均客單"
              value={`$${metrics.avgTicket}`}
              color="bg-pastel-pink text-pastel-pink-foreground"
            />
          </div>

          {/* Revenue Bar Chart */}
          <div className="bg-card rounded-xl p-3 shadow-soft">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h2 className="font-semibold text-sm">每日營收趨勢</h2>
            </div>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getRevenueData()} barCategoryGap="20%">
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "hsl(25, 15%, 50%)" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "hsl(25, 15%, 50%)" }}
                    tickFormatter={(value) => `$${value / 1000}k`}
                    width={35}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(40, 30%, 99%)",
                      border: "1px solid hsl(35, 25%, 88%)",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, "營收"]}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="hsl(34, 36%, 68%)"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Staff Ranking */}
          <div className="bg-card rounded-xl p-3 shadow-soft">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <h2 className="font-semibold text-sm">設計師業績排行</h2>
            </div>
            <div className="space-y-2">
              {staffRanking.map((staff, index) => (
                <div
                  key={staff.id}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-xl transition-all",
                    index === 0 && "bg-yellow-50 border border-yellow-200"
                  )}
                >
                  {/* Rank */}
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs",
                    index === 0 ? "bg-yellow-400 text-yellow-900" :
                      index === 1 ? "bg-slate-300 text-slate-700" :
                        index === 2 ? "bg-amber-600 text-white" :
                          "bg-muted text-muted-foreground"
                  )}>
                    {index + 1}
                  </div>

                  {/* Avatar */}
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs",
                    staff.color
                  )}>
                    {staff.avatar}
                  </div>

                  {/* Name */}
                  <span className="font-medium text-sm flex-1">{staff.name}</span>

                  {/* Revenue */}
                  <div className="text-right">
                    <span className="font-bold text-sm text-primary">
                      ${staff.revenue.toLocaleString()}
                    </span>
                    {index === 0 && (
                      <Crown className="w-4 h-4 text-yellow-500 inline ml-1" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Service Popularity Pie Chart */}
          <div className="bg-card rounded-xl p-3 shadow-soft">
            <h2 className="font-semibold text-sm mb-2">服務項目佔比</h2>
            <div className="flex items-center">
              <div className="w-28 h-28">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={serviceBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={25}
                      outerRadius={50}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {serviceBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2 ml-4">
                {serviceBreakdown.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-foreground font-medium">{item.name}</span>
                    </div>
                    <span className="text-sm font-bold text-muted-foreground">
                      {item.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MobileFrame>
  );
};

export default Reports;
