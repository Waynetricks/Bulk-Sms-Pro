import React, { useState } from 'react';
import { DashboardStats } from './components/DashboardStats';
import { ComposeScreen } from './components/ComposeScreen';
import { CampaignHistory } from './components/CampaignHistory';
import { GroupManager } from './components/GroupManager';
import { useAppStore } from './store/appStore';
import { campaignAPI } from './services/api';
import { Menu, X } from 'lucide-react';

type Page = 'dashboard' | 'compose' | 'history' | 'groups';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { stats, updateStats } = useAppStore();

  const handleComposeSend = async (message: string, recipients: string[]) => {
    setIsLoading(true);
    try {
      const response = await campaignAPI.create({
        name: `Campaign ${new Date().toLocaleString()}`,
        message,
        recipients,
      });

      // Send the campaign
      await campaignAPI.send(response.data.id);

      // Update stats
      updateStats({
        totalSent: stats.totalSent + recipients.length,
        totalDelivered: stats.totalDelivered,
        totalFailed: stats.totalFailed,
        totalPending: stats.totalPending + recipients.length,
      });

      alert('Campaign sent successfully!');
      setCurrentPage('history');
    } catch (error: any) {
      alert('Failed to send campaign: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const navigationItems: Array<{ id: Page; label: string }> = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'compose', label: 'Compose' },
    { id: 'history', label: 'History' },
    { id: 'groups', label: 'Groups' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg border-b-4 border-blue-900">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center font-bold text-blue-600">
              SMS
            </div>
            <h1 className="text-3xl font-bold">Bulk SMS Pro</h1>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 hover:bg-blue-700 rounded-lg transition-all duration-200"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-2">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  setMenuOpen(false);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  currentPage === item.id
                    ? 'bg-white text-blue-600 shadow-md'
                    : 'bg-white text-blue-600 hover:bg-blue-50 hover:shadow-md hover:scale-105'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <nav className="md:hidden bg-blue-700 px-4 py-4 space-y-2 border-t border-blue-600">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  setMenuOpen(false);
                }}
                className={`block w-full text-left px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  currentPage === item.id
                    ? 'bg-white text-blue-600'
                    : 'hover:bg-blue-800 text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {currentPage === 'dashboard' && (
          <div className="animate-fadeIn">
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-gray-800 mb-2">Dashboard</h2>
              <p className="text-gray-600">Real-time SMS campaign statistics</p>
            </div>
            <DashboardStats
              totalSent={stats.totalSent}
              delivered={stats.totalDelivered}
              failed={stats.totalFailed}
              pending={stats.totalPending}
            />
          </div>
        )}

        {currentPage === 'compose' && (
          <div className="animate-fadeIn">
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-gray-800 mb-2">New Campaign</h2>
              <p className="text-gray-600">Create and send bulk SMS messages</p>
            </div>
            <ComposeScreen onSubmit={handleComposeSend} isLoading={isLoading} />
          </div>
        )}

        {currentPage === 'history' && (
          <div className="animate-fadeIn">
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-gray-800 mb-2">Campaign History</h2>
              <p className="text-gray-600">View all your sent campaigns</p>
            </div>
            <CampaignHistory />
          </div>
        )}

        {currentPage === 'groups' && (
          <div className="animate-fadeIn">
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-gray-800 mb-2">Contact Groups</h2>
              <p className="text-gray-600">Organize and manage your contacts</p>
            </div>
            <GroupManager />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
