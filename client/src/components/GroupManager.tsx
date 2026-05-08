import React, { useState, useEffect } from 'react';
import { groupAPI, contactAPI } from '../services/api';

interface GroupManagerProps {
  onGroupSelect?: (groupId: string) => void;
}

export const GroupManager: React.FC<GroupManagerProps> = ({ onGroupSelect }) => {
  const [groups, setGroups] = useState<any[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const response = await groupAPI.list();
      setGroups(response.data);
    } catch (error) {
      console.error('Failed to load groups:', error);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    setLoading(true);
    try {
      await groupAPI.create({
        name: newGroupName,
        description: newGroupDesc,
      });
      setNewGroupName('');
      setNewGroupDesc('');
      await loadGroups();
    } catch (error) {
      console.error('Failed to create group:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Are you sure you want to delete this group?')) return;

    try {
      await groupAPI.delete(groupId);
      await loadGroups();
      setSelectedGroup(null);
    } catch (error) {
      console.error('Failed to delete group:', error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-xl p-8 border-t-4 border-purple-500">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">Contact Groups</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Create New Group */}
        <div className="border-r md:border-r md:pr-8">
          <h3 className="text-xl font-bold mb-6 text-gray-800">Create New Group</h3>
          <form onSubmit={handleCreateGroup}>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                Group Name
              </label>
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                placeholder="e.g., VIP Customers"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                Description (optional)
              </label>
              <textarea
                value={newGroupDesc}
                onChange={(e) => setNewGroupDesc(e.target.value)}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none hover:border-gray-400"
                rows={3}
                placeholder="Group description"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 rounded-lg hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 font-bold transition-all duration-200 transform hover:shadow-lg hover:scale-105 disabled:hover:scale-100 uppercase tracking-wide"
            >
              Create Group
            </button>
          </form>
        </div>

        {/* Groups List */}
        <div>
          <h3 className="text-xl font-bold mb-6 text-gray-800">Your Groups</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {groups.length === 0 ? (
              <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">No groups yet. Create one to get started!</p>
            ) : (
              groups.map((group) => (
                <div
                  key={group.id}
                  className="p-4 rounded-lg border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 transform hover:shadow-lg hover:scale-105 cursor-pointer"
                  onClick={() => {
                    setSelectedGroup(group.id);
                    onGroupSelect?.(group.id);
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-bold text-gray-800">{group.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{group.description}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteGroup(group.id);
                      }}
                      className="text-red-500 hover:text-red-700 hover:bg-red-100 px-3 py-1 rounded-lg transition-all duration-200 font-semibold text-sm ml-2"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
