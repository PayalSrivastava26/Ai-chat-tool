import React, { useState } from 'react';
import {
  Share2, Copy, Link, QrCode, X, Check,
  Eye, EyeOff, Calendar, Users
} from 'lucide-react';

import * as shareUtils from '../utils/shareUtils'; // ✅ FIXED import

const ChatShare = ({ chat, isOpen, onClose }) => {
  const [shareLink, setShareLink] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareSettings, setShareSettings] = useState({
    includeTimestamps: true,
    includeMetadata: true,
    allowPublicAccess: false,
    expirationDays: 7,
  });
  const [qrCode, setQrCode] = useState('');

  const generateShareLink = async () => {
    if (!chat) return;

    setIsGenerating(true);
    try {
      const link = await shareUtils.generateShareLink(chat, shareSettings);
      setShareLink(link);

      const qr = await shareUtils.generateQRCode(link);
      setQrCode(qr);
    } catch (error) {
      console.error('Failed to generate share link:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleSettingChange = (key, value) => {
    setShareSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
    setShareLink('');
    setQrCode('');
  };

  if (!isOpen || !chat) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <Share2 className="w-5 h-5 mr-2" />
            Share Chat
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Chat Info */}
        <div className="mb-6 p-4 bg-gray-700 rounded-lg">
          <h3 className="font-medium text-white mb-2">{chat.title}</h3>
          <div className="text-sm text-gray-300 space-y-1">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Created: {new Date(chat.createdAt).toLocaleDateString()}
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              {chat.messages.length} messages
            </div>
          </div>
        </div>

        {/* Share Settings */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-white mb-4">Share Settings</h3>

          <div className="space-y-4">
            {[
              {
                label: 'Include Timestamps',
                desc: 'Show when messages were sent',
                key: 'includeTimestamps',
              },
              {
                label: 'Include Metadata',
                desc: 'Show chat creation date and stats',
                key: 'includeMetadata',
              },
              {
                label: 'Public Access',
                desc: 'Allow anyone with link to view',
                key: 'allowPublicAccess',
              },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-300">{item.label}</label>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
                <button
                  onClick={() => handleSettingChange(item.key, !shareSettings[item.key])}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    shareSettings[item.key] ? 'bg-blue-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      shareSettings[item.key] ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}

            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Link Expiration
              </label>
              <select
                value={shareSettings.expirationDays}
                onChange={(e) =>
                  handleSettingChange('expirationDays', parseInt(e.target.value))
                }
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value={1}>1 day</option>
                <option value={7}>1 week</option>
                <option value={30}>1 month</option>
                <option value={90}>3 months</option>
                <option value={365}>1 year</option>
                <option value={0}>Never expires</option>
              </select>
            </div>
          </div>
        </div>

        {/* Generate or Display Link */}
        {!shareLink ? (
          <button
            onClick={generateShareLink}
            disabled={isGenerating}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <Link className="w-4 h-4 mr-2" />
                Generate Share Link
              </>
            )}
          </button>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">Share Link</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none"
                />
                <button
                  onClick={() => copyToClipboard(shareLink)}
                  className="px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors flex items-center"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {qrCode && (
              <div className="text-center">
                <label className="text-sm font-medium text-gray-300 mb-2 block">QR Code</label>
                <div className="bg-white p-4 rounded-lg inline-block">
                  <img src={qrCode} alt="QR Code" className="w-32 h-32" />
                </div>
              </div>
            )}

            <div className="bg-yellow-900 bg-opacity-30 border border-yellow-600 rounded-lg p-3">
              <div className="flex items-start">
                <div className="flex items-center">
                  {shareSettings.allowPublicAccess ? (
                    <Eye className="w-4 h-4 text-yellow-400 mr-2 mt-0.5" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-green-400 mr-2 mt-0.5" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-yellow-200">
                    {shareSettings.allowPublicAccess
                      ? 'This chat will be publicly accessible to anyone with the link.'
                      : 'This chat requires authentication to view.'}
                  </p>
                  {shareSettings.expirationDays > 0 && (
                    <p className="text-xs text-yellow-300 mt-1">
                      Link expires in {shareSettings.expirationDays} day
                      {shareSettings.expirationDays !== 1 ? 's' : ''}.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setShareLink('');
                setQrCode('');
              }}
              className="w-full bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded-lg transition-colors text-sm"
            >
              Generate New Link
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatShare;
