import { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Rooms from './pages/Rooms';
import Guests from './pages/Guests';
import Bookings from './pages/Bookings';
import Payments from './pages/Payments';
import Maintenance from './pages/Maintenance';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'rooms':
        return <Rooms />;
      case 'guests':
        return <Guests />;
      case 'bookings':
        return <Bookings />;
      case 'payments':
        return <Payments />;
      case 'maintenance':
        return <Maintenance />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div onClick={(e) => {
      const target = e.target as HTMLElement;
      const button = target.closest('button');
      if (button?.textContent) {
        const text = button.textContent.toLowerCase();
        if (text.includes('dashboard')) setCurrentPage('dashboard');
        else if (text.includes('rooms')) setCurrentPage('rooms');
        else if (text.includes('residents')) setCurrentPage('guests');
        else if (text.includes('bookings')) setCurrentPage('bookings');
        else if (text.includes('payments')) setCurrentPage('payments');
        else if (text.includes('maintenance')) setCurrentPage('maintenance');
      }
    }}>
      <Layout currentPage={currentPage}>
        {renderPage()}
      </Layout>
    </div>
  );
}

export default App;
