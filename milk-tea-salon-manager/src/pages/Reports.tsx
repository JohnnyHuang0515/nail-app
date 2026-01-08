import { useState } from "react";
import { ChevronLeft, TrendingUp, Users, DollarSign, Receipt, Crown, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
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

// Mock data for different periods
const revenueDataThisWeek = [
  { day: "Mon", revenue: 2400 },
  { day: "Tue", revenue: 1800 },
  { day: "Wed", revenue: 3200 },
  { day: "Thu", revenue: 2800 },
  { day: "Fri", revenue: 4200 },
  { day: "Sat", revenue: 5100 },
  { day: "Sun", revenue: 3800 },
];

const revenueDataThisMonth = [
  { day: "W1", revenue: 15000 },
  { day: "W2", revenue: 18500 },
  { day: "W3", revenue: 22000 },
  { day: "W4", revenue: 19800 },
];

const revenueDataLastMonth = [
  { day: "W1", revenue: 12000 },
  { day: "W2", revenue: 16000 },
  { day: "W3", revenue: 14500 },
  { day: "W4", revenue: 17200 },
];

const serviceBreakdown = [
  { name: "Hand", value: 45, color: "hsl(34, 36%, 68%)" },
  { name: "Foot", value: 30, color: "hsl(340, 75%, 85%)" },
  { name: "Care", value: 25, color: "hsl(210, 70%, 85%)" },
];

const staffRanking = [
  { id: "1", name: "Mika", revenue: 52000, avatar: "MI", color: "bg-primary/30 text-primary" },
  { id: "2", name: "Yuki", revenue: 45000, avatar: "YU", color: "bg-accent/30 text-accent" },
  { id: "3", name: "Luna", revenue: 38000, avatar: "LU", color: "bg-pink-200 text-pink-600" },
  { id: "4", name: "Hana", revenue: 32000, avatar: "HA", color: "bg-purple-200 text-purple-600" },
  { id: "5", name: "Sakura", revenue: 28000, avatar: "SA", color: "bg-blue-200 text-blue-600" },
];

const metricsData: Record<string, { 
  totalSales: number; 
  newCustomers: number; 
  avgTicket: number;
}> = {
  "this-week": { totalSales: 23300, newCustomers: 12, avgTicket: 850 },
  "this-month": { totalSales: 75300, newCustomers: 48, avgTicket: 920 },
  "last-month": { totalSales: 59700, newCustomers: 35, avgTicket: 780 },
};

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
  const [period, setPeriod] = useState("this-week");

  const getRevenueData = () => {
    switch (period) {
      case "this-month":
        return revenueDataThisMonth;
      case "last-month":
        return revenueDataLastMonth;
      default:
        return revenueDataThisWeek;
    }
  };

  const metrics = metricsData[period];

  return (
    <MobileFrame>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4">
          <button
            onClick={() => navigate("/menu")}
            className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground flex-1">Reports</h1>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32 h-9 rounded-xl text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-3">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-3 gap-2">
            <MetricCard
              icon={DollarSign}
              label="Total Sales"
              value={`$${(metrics.totalSales / 1000).toFixed(1)}k`}
              color="bg-primary/20 text-primary"
            />
            <MetricCard
              icon={Users}
              label="New Clients"
              value={metrics.newCustomers.toString()}
              color="bg-accent/20 text-accent"
            />
            <MetricCard
              icon={Receipt}
              label="Avg. Ticket"
              value={`$${metrics.avgTicket}`}
              color="bg-pastel-pink text-pastel-pink-foreground"
            />
          </div>

          {/* Revenue Bar Chart */}
          <div className="bg-card rounded-xl p-3 shadow-soft">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h2 className="font-semibold text-sm">Daily Revenue</h2>
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
                    formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
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
              <h2 className="font-semibold text-sm">Top Stylists by Revenue</h2>
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
            <h2 className="font-semibold text-sm mb-2">Service Popularity</h2>
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
