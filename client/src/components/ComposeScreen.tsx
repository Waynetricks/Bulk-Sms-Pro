import React, { useState } from 'react';
import { Upload } from 'lucide-react';

interface ComposeProps {
  onSubmit: (message: string, recipients: string[]) => void;
  isLoading: boolean;
}

export const ComposeScreen: React.FC<ComposeProps> = ({ onSubmit, isLoading }) => {
  const [message, setMessage] = useState('');
  const [recipients, setRecipients] = useState<string[]>([]);
  const [inputMode, setInputMode] = useState<'manual' | 'csv'>('manual');
  const [textInput, setTextInput] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const lines = content.split('\n');
        const phones = lines
          .map((line) => line.trim())
          .filter((line) => line && line.length > 0);
        setRecipients(phones);
      };
      reader.readAsText(file);
    }
  };

  const handleManualEntry = () => {
    const phones = textInput
      .split(/[\n,;]/)
      .map((phone) => phone.trim())
      .filter((phone) => phone && phone.length > 0);
    setRecipients(phones);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || recipients.length === 0) {
      alert('Please enter a message and add recipients');
      return;
    }
    onSubmit(message, recipients);
  };

  return (
    <div className="bg-white rounded-xl shadow-xl p-8 max-w-2xl mx-auto border-t-4 border-blue-500">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">Compose Message</h2>

      <form onSubmit={handleSubmit}>
        {/* Message Input */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
            Message Content
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={160}
            className="w-full p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none hover:border-gray-400"
            rows={4}
            placeholder="Enter your message (max 160 characters)"
          />
          <p className="text-xs text-gray-500 mt-2 font-medium">
            {message.length}/160 characters
          </p>
        </div>

        {/* Recipients Input */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
            Add Recipients
          </label>

          <div className="flex gap-3 mb-4">
            <button
              type="button"
              onClick={() => setInputMode('manual')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform ${
                inputMode === 'manual'
                  ? 'bg-blue-500 text-white shadow-lg scale-105'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-md hover:scale-105'
              }`}
            >
              Manual Entry
            </button>
            <button
              type="button"
              onClick={() => setInputMode('csv')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform ${
                inputMode === 'csv'
                  ? 'bg-blue-500 text-white shadow-lg scale-105'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-md hover:scale-105'
              }`}
            >
              Upload CSV
            </button>
          </div>

          {inputMode === 'manual' ? (
            <div>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Enter phone numbers (one per line, or comma/semicolon separated)"
                className="w-full p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none hover:border-gray-400"
                rows={4}
              />
              <button
                type="button"
                onClick={handleManualEntry}
                className="mt-3 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 hover:shadow-md transition-all duration-200 font-semibold transform hover:scale-105"
              >
                Parse Numbers
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-40 border-3 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-blue-50 transition-all duration-200 hover:border-blue-400">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-10 h-10 text-gray-500 mb-2" />
                  <p className="text-sm text-gray-600 font-semibold">Click to upload CSV file</p>
                  <p className="text-xs text-gray-500 mt-1">or drag and drop</p>
                </div>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>

        {/* Recipients List */}
        {recipients.length > 0 && (
          <div className="mb-8">
            <p className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
              Recipients ({recipients.length})
            </p>
            <div className="max-h-40 overflow-y-auto bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border-2 border-blue-200">
              {recipients.map((phone, idx) => (
                <span
                  key={idx}
                  className="inline-block bg-gradient-to-r from-blue-400 to-blue-600 text-white text-xs px-3 py-2 rounded-full mr-2 mb-2 shadow-md font-semibold"
                >
                  {phone}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || recipients.length === 0 || !message.trim()}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg transition-all duration-200 transform hover:shadow-lg hover:scale-105 disabled:hover:scale-100 uppercase tracking-wide"
        >
          {isLoading ? 'Sending...' : 'Send Campaign'}
        </button>
      </form>
    </div>
  );
};
