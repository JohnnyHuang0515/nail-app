import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  Phone,
  MessageCircle,
  Pencil,
  Star,
  Calendar,
  Clock,
  Bell,
  RotateCcw,
  Check,
} from "lucide-react";
import MobileFrame from "@/components/MobileFrame";
import BottomNavBar from "@/components/BottomNavBar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { clientService, ClientDetails } from "@/services/clients.service";

// Use ClientDetails type from service

const tierColors = {
  Bronze: "from-amber-600 to-amber-400",
  Silver: "from-slate-400 to-slate-300",
  Gold: "from-yellow-500 to-amber-300",
  Platinum: "from-slate-600 to-slate-400",
} as const;

const tierBgColors = {
  Bronze: "bg-amber-100",
  Silver: "bg-slate-100",
  Gold: "bg-yellow-50",
  Platinum: "bg-slate-200",
  undefined: "bg-muted",
} as const;

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

const ClientProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("history");

  // Fetch client data from API
  const { data: client, isLoading, error } = useQuery({
    queryKey: ['client', id],
    queryFn: () => clientService.getById(id || ''),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <MobileFrame>
        <div className="flex items-center justify-center h-full">
          <span className="text-muted-foreground">載入中...</span>
        </div>
      </MobileFrame>
    );
  }

  if (error || !client) {
    return (
      <MobileFrame>
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <span className="text-muted-foreground">找不到客戶資料</span>
          <Button variant="outline" onClick={() => navigate("/clients")}>返回</Button>
        </div>
      </MobileFrame>
    );
  }

  const handleCall = () => {
    toast.success(`Calling ${client.phone}...`);
  };

  const handleMessage = () => {
    toast.success("Opening LINE...");
  };

  const handleEdit = () => {
    toast.info("Edit profile");
  };

  const handleBookAgain = (service: string) => {
    toast.success(`Booking "${service}" again...`);
    navigate("/schedule");
  };

  const handleSendReminder = (bookingId: string) => {
    toast.success("Reminder sent via LINE!");
  };

  const progressPercent = ((2000 - client.pointsToNext) / 2000) * 100;

  return (
    <MobileFrame>
      <div className="flex flex-col h-full bg-background">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50">
          <button
            onClick={() => navigate("/clients")}
            className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold flex-1">Client Profile</h1>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Profile Header */}
          <div className="px-5 py-4">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xl">
                {getInitials(client.name)}
              </div>

              {/* Info */}
              <div className="flex-1">
                <h2 className="text-xl font-bold text-foreground">{client.name}</h2>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" />
                  {client.phone}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-10 rounded-xl gap-2"
                onClick={handleCall}
              >
                <Phone className="w-4 h-4" />
                Call
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-10 rounded-xl gap-2 text-green-600 border-green-200 hover:bg-green-50"
                onClick={handleMessage}
              >
                <MessageCircle className="w-4 h-4" />
                LINE
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-10 rounded-xl px-3"
                onClick={handleEdit}
              >
                <Pencil className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* VIP Card */}
          <div className="px-5 pb-4">
            <div
              className={cn(
                "relative overflow-hidden rounded-2xl p-4",
                "bg-gradient-to-br",
                tierColors[client.memberTier]
              )}
            >
              {/* Decorative circles */}
              <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/10" />
              <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/10" />

              <div className="relative z-10">
                {/* Tier Badge */}
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-5 h-5 text-white fill-white" />
                  <span className="text-white font-bold text-lg">
                    {client.memberTier} Member
                  </span>
                </div>

                {/* Points */}
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-4xl font-bold text-white">
                    {client.points.toLocaleString()}
                  </span>
                  <span className="text-white/80 text-sm">pts</span>
                </div>

                {/* Progress to next tier */}
                <div className="space-y-1.5">
                  <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <p className="text-white/90 text-xs">
                    {client.pointsToNext} pts to {client.nextTier}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-5">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full h-11 p-1 bg-muted/50 rounded-xl">
                <TabsTrigger
                  value="history"
                  className="flex-1 h-9 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2"
                >
                  <Clock className="w-4 h-4" />
                  History
                </TabsTrigger>
                <TabsTrigger
                  value="upcoming"
                  className="flex-1 h-9 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Upcoming
                </TabsTrigger>
              </TabsList>

              {/* History Tab */}
              <TabsContent value="history" className="mt-4 space-y-2 pb-24">
                {client.history.length > 0 ? (
                  client.history.map((visit) => (
                    <div
                      key={visit.id}
                      className="flex items-center gap-3 p-3 bg-card rounded-xl shadow-soft"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{visit.service}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          <span>{visit.date}</span>
                          <span>•</span>
                          <span>{visit.staff}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">${visit.price}</p>
                        <button
                          onClick={() => handleBookAgain(visit.service)}
                          className="flex items-center gap-1 text-xs text-accent hover:underline mt-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Book Again
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No visit history yet</p>
                  </div>
                )}
              </TabsContent>

              {/* Upcoming Tab */}
              <TabsContent value="upcoming" className="mt-4 space-y-2 pb-24">
                {client.upcoming.length > 0 ? (
                  client.upcoming.map((booking) => (
                    <div
                      key={booking.id}
                      className="p-3 bg-card rounded-xl shadow-soft"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">{booking.service}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                            <Calendar className="w-3 h-3" />
                            <span>{booking.date}</span>
                            <span>•</span>
                            <Clock className="w-3 h-3" />
                            <span>{booking.time}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            with {booking.staff}
                          </p>
                        </div>

                        {/* Reminder Status */}
                        <div className="flex flex-col items-end gap-2">
                          {booking.reminderSent ? (
                            <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                              <Check className="w-3 h-3" />
                              Sent
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-medium bg-muted text-muted-foreground rounded-full">
                              Not Sent
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Send Reminder Button */}
                      {!booking.reminderSent && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-3 h-9 rounded-lg gap-2 text-green-600 border-green-200 hover:bg-green-50"
                          onClick={() => handleSendReminder(booking.id)}
                        >
                          <Bell className="w-4 h-4" />
                          Send LINE Reminder
                        </Button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No upcoming bookings</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <BottomNavBar />
      </div>
    </MobileFrame>
  );
};

export default ClientProfile;
