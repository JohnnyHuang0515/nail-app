import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import SelectStylist from "./pages/SelectStylist";
import Booking from "./pages/Booking";
import DateTimeSelection from "./pages/DateTimeSelection";
import BookingDetails from "./pages/BookingDetails";
import BookingConfirm from "./pages/BookingConfirm";
import Member from "./pages/Member";
import ProfileSetup from "./pages/ProfileSetup";
import MyBookings from "./pages/MyBookings";
import MyCoupons from "./pages/MyCoupons";
import EditProfile from "./pages/EditProfile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/select-stylist" element={<SelectStylist />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/booking/datetime" element={<DateTimeSelection />} />
          <Route path="/booking/details" element={<BookingDetails />} />
          <Route path="/booking/confirm" element={<BookingConfirm />} />
          <Route path="/member" element={<Member />} />
          <Route path="/member/bookings" element={<MyBookings />} />
          <Route path="/member/coupons" element={<MyCoupons />} />
          <Route path="/member/profile" element={<EditProfile />} />
          <Route path="/profile-setup" element={<ProfileSetup />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
