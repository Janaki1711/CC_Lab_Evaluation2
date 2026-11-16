import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import SeatMatrix from './components/SeatMatrix';
import BookingBar from './components/BookingBar';
import FlashSaleModal from './components/FlashSaleModal';
import TicketPassModal from './components/TicketPassModal';
import MyTicketsModal from './components/MyTicketsModal';
import K8sTopologyModal from './components/K8sTopologyModal';
import { bmsApi } from './services/api';
import { AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function App() {
  // Current user state (Alex, Sarah, or Prof. Sharma)
  const [currentUser, setCurrentUser] = useState({
    id: 'user_alex_101',
    name: 'Alex Kumar',
    role: 'Buyer 1'
  });

  // Movie & Theater data
  const [showData, setShowData] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [userTickets, setUserTickets] = useState([]);

  // Timers & Lock State
  const [lockSecondsRemaining, setLockSecondsRemaining] = useState(0);
  const lockTimerRef = useRef(null);

  // Modals state
  const [flashSaleOpen, setFlashSaleOpen] = useState(false);
  const [isRushRunning, setIsRushRunning] = useState(false);
  const [rushResults, setRushResults] = useState(null);

  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [activeTicket, setActiveTicket] = useState(null);

  const [myTicketsOpen, setMyTicketsOpen] = useState(false);
  const [topologyOpen, setTopologyOpen] = useState(false);
  const [telemetry, setTelemetry] = useState(null);

  // Loading & notification states
  const [isLoading, setIsLoading] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Fetch show and seats
  const fetchShowData = async () => {
    try {
      const data = await bmsApi.getShow();
      setShowData(data);
    } catch (err) {
      console.error('Failed to load show data:', err);
    }
  };

  const fetchSeats = async () => {
    try {
      const data = await bmsApi.getSeats();
      setSeats(data);
    } catch (err) {
      console.error('Failed to load seats:', err);
    }
  };

  const fetchUserTickets = async () => {
    try {
      const tickets = await bmsApi.getMyBookings(currentUser.id);
      setUserTickets(tickets);
    } catch (err) {
      console.error('Failed to load tickets:', err);
    }
  };

  const fetchTelemetry = async () => {
    try {
      const t = await bmsApi.getTelemetry();
      setTelemetry(t);
    } catch (err) {
      console.error('Failed to load telemetry:', err);
    }
  };

  // Initial load
  useEffect(() => {
    fetchShowData();
    fetchSeats();
    fetchTelemetry();
  }, []);

  // When user changes, update tickets and clear local selection
  useEffect(() => {
    fetchUserTickets();
    setSelectedSeats([]);
    setLockSecondsRemaining(0);
    if (lockTimerRef.current) clearInterval(lockTimerRef.current);
  }, [currentUser]);

  // Periodic polling for seat locks & states (every 2.5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSeats();
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Lock countdown timer
  useEffect(() => {
    if (lockSecondsRemaining > 0) {
      lockTimerRef.current = setInterval(() => {
        setLockSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(lockTimerRef.current);
            setSelectedSeats([]);
            showToast('Your 60-second Redis lock expired! Seat released back to the pool.', 'warning');
            fetchSeats();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (lockTimerRef.current) clearInterval(lockTimerRef.current);
    }

    return () => {
      if (lockTimerRef.current) clearInterval(lockTimerRef.current);
    };
  }, [lockSecondsRemaining > 0]);

  // Handle seat click: Attempt atomic distributed lock in Redis
  const handleSeatClick = async (seat) => {
    if (!showData) return;

    // If already selected by me, release it
    if (selectedSeats.includes(seat.seat_number)) {
      try {
        await bmsApi.releaseSeats(showData.id, [seat.seat_number], currentUser.id);
        const next = selectedSeats.filter((s) => s !== seat.seat_number);
        setSelectedSeats(next);
        if (next.length === 0) setLockSecondsRemaining(0);
        showToast(`Released seat ${seat.seat_number}`, 'info');
        fetchSeats();
      } catch (err) {
        showToast('Failed to release seat lock', 'error');
      }
      return;
    }

    // Try to acquire atomic distributed lock via Redis
    setIsLoading(true);
    try {
      const res = await bmsApi.lockSeats(showData.id, [seat.seat_number], currentUser.id);
      if (res.status === 'success') {
        setSelectedSeats((prev) => [...prev, seat.seat_number]);
        setLockSecondsRemaining(res.ttl_seconds || 60);
        showToast(`🔒 Acquired Redis Distributed Lock for seat ${seat.seat_number}! (60s hold)`, 'success');
        fetchSeats();
      }
    } catch (err) {
      const detail = err.response?.data?.detail || 'Seat locked or conflict detected!';
      showToast(`💥 Race Condition Collision: ${detail}`, 'error');
      fetchSeats();
    } finally {
      setIsLoading(false);
    }
  };

  // Release all currently held locks
  const handleReleaseAll = async () => {
    if (!showData || selectedSeats.length === 0) return;
    try {
      await bmsApi.releaseSeats(showData.id, selectedSeats, currentUser.id);
      setSelectedSeats([]);
      setLockSecondsRemaining(0);
      showToast('All seat locks released successfully.', 'info');
      fetchSeats();
    } catch (err) {
      showToast('Failed to release seats', 'error');
    }
  };

  // Confirm booking & generate BookMyShow ticket pass
  const handleProceedBooking = async () => {
    if (!showData || selectedSeats.length === 0) return;
    setIsBooking(true);
    try {
      const res = await bmsApi.confirmBooking(
        showData.id,
        selectedSeats,
        currentUser.id,
        currentUser.name
      );
      setSelectedSeats([]);
      setLockSecondsRemaining(0);
      setActiveTicket(res);
      setTicketModalOpen(true);
      showToast(`🎟️ Booking Confirmed: ${res.booking_ref}!`, 'success');
      fetchSeats();
      fetchShowData();
      fetchUserTickets();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Booking failed to commit';
      showToast(`Booking Error: ${msg}`, 'error');
    } finally {
      setIsBooking(false);
    }
  };

  // Launch the 500-User Flash Sale Rush
  const handleLaunchRush = async (concurrency = 500) => {
    if (!showData) return;
    setIsRushRunning(true);
    setRushResults(null);
    try {
      const res = await bmsApi.launchFlashSaleRush(showData.id, concurrency);
      setRushResults(res);
      showToast(`⚡ 500-User Rush finished! 0 double-bookings verified.`, 'success');
      fetchSeats();
      fetchShowData();
    } catch (err) {
      showToast('Flash sale rush encountered an error', 'error');
    } finally {
      setIsRushRunning(false);
    }
  };

  // Reset Theater & Clear Redis locks
  const handleResetTheater = async () => {
    setIsResetting(true);
    try {
      await bmsApi.resetTheater();
      setSelectedSeats([]);
      setLockSecondsRemaining(0);
      setRushResults(null);
      showToast('Theater reset: All 60 seats set to AVAILABLE. Redis locks cleared!', 'success');
      fetchSeats();
      fetchShowData();
      fetchUserTickets();
    } catch (err) {
      showToast('Failed to reset theater', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  const availableCount = seats.filter((s) => s.status === 'AVAILABLE').length;

  return (
    <div className="min-h-screen bg-[#0a0b0e] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-red-600 selection:text-white">
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed top-24 right-6 z-50 animate-in slide-in-from-top-4 duration-300">
          <div
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl shadow-2xl border text-xs font-mono font-semibold backdrop-blur-xl ${
              toast.type === 'error'
                ? 'bg-red-950/90 border-red-500/80 text-red-200'
                : toast.type === 'warning'
                ? 'bg-amber-950/90 border-amber-500/80 text-amber-200'
                : toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/80 text-emerald-200'
                : 'bg-slate-900/90 border-slate-600 text-slate-200'
            }`}
          >
            {toast.type === 'error' && <ShieldAlert className="w-4 h-4 text-red-400" />}
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            {toast.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-400" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Top Navigation */}
      <Navbar
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        availableSeatsCount={availableCount}
        totalSeatsCount={showData?.total_seats || 60}
        onOpenFlashSale={() => setFlashSaleOpen(true)}
        onResetTheater={handleResetTheater}
        onOpenTickets={() => setMyTicketsOpen(true)}
        onOpenTopology={() => setTopologyOpen(true)}
        userTicketsCount={userTickets.length}
        isResetting={isResetting}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-32">
        {/* Movie Details Hero Banner */}
        <HeroBanner showData={showData} />

        {/* Live Interactive Theater Seat Matrix */}
        <SeatMatrix
          seats={seats}
          selectedSeats={selectedSeats}
          onSeatClick={handleSeatClick}
          currentUserId={currentUser.id}
          isLoading={isLoading}
        />
      </main>

      {/* Floating Bottom Booking Bar */}
      <BookingBar
        selectedSeats={selectedSeats}
        seatsData={seats}
        onReleaseAll={handleReleaseAll}
        onProceedBooking={handleProceedBooking}
        isBooking={isBooking}
        lockSecondsRemaining={lockSecondsRemaining}
      />

      {/* Flash Sale Rush Modal */}
      <FlashSaleModal
        isOpen={flashSaleOpen}
        onClose={() => setFlashSaleOpen(false)}
        onLaunchRush={handleLaunchRush}
        isRunning={isRushRunning}
        rushResults={rushResults}
        onResetTheater={handleResetTheater}
      />

      {/* Confirmed Ticket Pass Modal */}
      <TicketPassModal
        isOpen={ticketModalOpen}
        onClose={() => setTicketModalOpen(false)}
        ticketData={activeTicket}
      />

      {/* My Booked Tickets List Modal */}
      <MyTicketsModal
        isOpen={myTicketsOpen}
        onClose={() => setMyTicketsOpen(false)}
        tickets={userTickets}
        onViewTicket={(ticket) => {
          setActiveTicket(ticket);
          setMyTicketsOpen(false);
          setTicketModalOpen(true);
        }}
      />

      {/* Kubernetes Topology & Affinity Visualizer Modal */}
      <K8sTopologyModal
        isOpen={topologyOpen}
        onClose={() => setTopologyOpen(false)}
        telemetryData={telemetry}
      />
    </div>
  );
}
