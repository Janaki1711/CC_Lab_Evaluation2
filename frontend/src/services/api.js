import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 45000,
});

export const bmsApi = {
  getShow: async () => {
    const res = await api.get('/bms/show');
    return res.data;
  },

  getSeats: async () => {
    const res = await api.get('/bms/seats');
    return res.data;
  },

  lockSeats: async (showId, seatNumbers, userId) => {
    const res = await api.post('/bms/seats/lock', {
      show_id: showId,
      seat_numbers: seatNumbers,
      user_id: userId,
    });
    return res.data;
  },

  releaseSeats: async (showId, seatNumbers, userId) => {
    const res = await api.post('/bms/seats/release', {
      show_id: showId,
      seat_numbers: seatNumbers,
      user_id: userId,
    });
    return res.data;
  },

  confirmBooking: async (showId, seatNumbers, userId, userName) => {
    const res = await api.post('/bms/bookings/confirm', {
      show_id: showId,
      seat_numbers: seatNumbers,
      user_id: userId,
      user_name: userName,
    });
    return res.data;
  },

  getMyBookings: async (userId) => {
    const res = await api.get('/bms/bookings/my-tickets', {
      params: { user_id: userId },
    });
    return res.data;
  },

  launchFlashSaleRush: async (showId, concurrency = 500) => {
    const res = await api.post('/bms/flash-sale/rush', {
      show_id: showId,
      concurrency: concurrency,
    });
    return res.data;
  },

  resetTheater: async () => {
    const res = await api.post('/bms/reset');
    return res.data;
  },

  getTelemetry: async () => {
    const res = await api.get('/bms/telemetry');
    return res.data;
  },
};

export default api;
