import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import HomePage from './pages/HomePage';
import BookingPage from './pages/BookingPage';
import ConfirmationPage from './pages/ConfirmationPage';
import DashboardPage from './pages/admin/DashboardPage';
import EventTypesPage from './pages/admin/EventTypesPage';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/event-types/:id" element={<BookingPage />} />
        <Route path="/bookings/:id" element={<ConfirmationPage />} />
        <Route path="/admin" element={<DashboardPage />} />
        <Route path="/admin/event-types" element={<EventTypesPage />} />
      </Route>
    </Routes>
  );
}
