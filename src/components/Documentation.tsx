import { Book } from 'lucide-react';
import { useState } from 'react';
import ApiDocumentation from './docs/ApiDocumentation';
import MigrationDocumentation from './docs/MigrationDocumentation';
import KofiWebhookDocumentation from './docs/KofiWebhookDocumentation';

type TabType = 'api' | 'migration' | 'kofi';

export default function Documentation() {
  const [activeTab, setActiveTab] = useState<TabType>('api');

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-8 mb-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Book className="w-8 h-8" />
            <h1 className="text-3xl font-bold">توثيق نظام التراخيص والاشتراكات</h1>
          </div>
          <p className="text-blue-100">
            دليل شامل لربط نظام التراخيص بتطبيقك باستخدام API مع دعم الوصول غير المتصل
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('api')}
              className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
                activeTab === 'api'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              توثيق API
            </button>
            <button
              onClick={() => setActiveTab('migration')}
              className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
                activeTab === 'migration'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              توثيق الترحيل
            </button>
            <button
              onClick={() => setActiveTab('kofi')}
              className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
                activeTab === 'kofi'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Ko-fi Webhook
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'api' && <ApiDocumentation />}
        {activeTab === 'migration' && <MigrationDocumentation />}
        {activeTab === 'kofi' && <KofiWebhookDocumentation />}
      </div>
    </div>
  );
}
