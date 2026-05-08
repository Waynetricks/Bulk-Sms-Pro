import React, { useState, useEffect } from 'react';
import { campaignAPI } from '../services/api';

interface CampaignHistoryProps {
  onCampaignSelect?: (id: string) => void;
}

export const CampaignHistory: React.FC<CampaignHistoryProps> = ({ onCampaignSelect }) => {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const response = await campaignAPI.list(50, 0);
      setCampaigns(response.data.rows);
    } catch (error) {
      console.error('Failed to load campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCampaign = async (campaign: any) => {
    setSelectedCampaign(campaign);
    try {
      const response = await campaignAPI.get(campaign.id);
      setSelectedCampaign(response.data);
      onCampaignSelect?.(campaign.id);
    } catch (error) {
      console.error('Failed to load campaign details:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'sending':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Campaigns List */}
      <div className="md:col-span-1 bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-500">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Campaign History</h2>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {loading ? (
            <p className="text-gray-500 text-center py-8">Loading...</p>
          ) : campaigns.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No campaigns yet</p>
          ) : (
            campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 transform hover:shadow-lg hover:scale-105 ${
                  selectedCampaign?.id === campaign.id
                    ? 'bg-blue-50 border-blue-500 shadow-lg'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
                onClick={() => handleSelectCampaign(campaign)}
              >
                <p className="font-bold text-gray-800 truncate">{campaign.name}</p>
                <span
                  className={`text-xs px-3 py-1 rounded-full inline-block mt-2 font-semibold ${getStatusColor(
                    campaign.status
                  )}`}
                >
                  {campaign.status.toUpperCase()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Campaign Details */}
      {selectedCampaign && (
        <div className="md:col-span-2 bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-500 animate-fadeIn">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">{selectedCampaign.name}</h2>

          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
              <p className="text-sm text-gray-600 font-semibold uppercase tracking-wide">Message</p>
              <p className="text-gray-900 mt-2 text-lg">{selectedCampaign.message}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border-2 border-blue-200">
                <p className="text-sm text-gray-600 font-semibold uppercase tracking-wide">Total Recipients</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{selectedCampaign.totalRecipients}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border-2 border-purple-200">
                <p className="text-sm text-gray-600 font-semibold uppercase tracking-wide">Status</p>
                <p className={`text-lg font-bold mt-2 ${getStatusColor(selectedCampaign.status)}`}>
                  {selectedCampaign.status.toUpperCase()}
                </p>
              </div>
            </div>

            {/* Status Breakdown */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border-2 border-green-300 hover:shadow-lg transition-all duration-200 transform hover:scale-105">
                <p className="text-sm text-gray-600 font-semibold uppercase tracking-wide">Delivered</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {selectedCampaign.deliveredCount}
                </p>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border-2 border-red-300 hover:shadow-lg transition-all duration-200 transform hover:scale-105">
                <p className="text-sm text-gray-600 font-semibold uppercase tracking-wide">Failed</p>
                <p className="text-3xl font-bold text-red-600 mt-2">
                  {selectedCampaign.failedCount}
                </p>
              </div>
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg border-2 border-indigo-300 hover:shadow-lg transition-all duration-200 transform hover:scale-105">
                <p className="text-sm text-gray-600 font-semibold uppercase tracking-wide">Sent</p>
                <p className="text-3xl font-bold text-indigo-600 mt-2">{selectedCampaign.sentCount}</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border-2 border-yellow-300 hover:shadow-lg transition-all duration-200 transform hover:scale-105">
                <p className="text-sm text-gray-600 font-semibold uppercase tracking-wide">Pending</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">
                  {selectedCampaign.totalRecipients -
                    selectedCampaign.sentCount -
                    selectedCampaign.deliveredCount -
                    selectedCampaign.failedCount}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <p className="text-sm text-gray-600 font-semibold uppercase tracking-wide mb-3">Progress</p>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden border-2 border-gray-300">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${((selectedCampaign.sentCount + selectedCampaign.deliveredCount + selectedCampaign.failedCount) / selectedCampaign.totalRecipients) * 100}%`,
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 font-semibold">
                {Math.round(((selectedCampaign.sentCount + selectedCampaign.deliveredCount + selectedCampaign.failedCount) / selectedCampaign.totalRecipients) * 100)}% Complete
              </p>
            </div>

            <p className="text-xs text-gray-500 border-t pt-4 font-semibold">
              Created: {new Date(selectedCampaign.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
