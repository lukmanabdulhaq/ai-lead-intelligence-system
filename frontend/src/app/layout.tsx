import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Lead Intelligence System',
  description: 'AI-powered lead capture, scoring and sales automation',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <aside className="w-56 bg-white border-r border-gray-200 flex flex-col fixed h-full z-10">
            {/* Logo */}
            <div className="px-5 py-5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold">AI</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900 leading-tight">Lead Intelligence</div>
                  <div className="text-[10px] text-gray-400">Powered by GPT-4o</div>
                </div>
              </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-1">
              <a href="/"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <span>📊</span> Dashboard
              </a>
              <a href="/leads"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <span>👥</span> All Leads
              </a>
              <a href="/leads?priority=HIGH"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <span>🔴</span> High Priority
              </a>
              <a href="/leads?source=whatsapp"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <span>💬</span> WhatsApp
              </a>
              <a href="/leads?source=telegram"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <span>✈️</span> Telegram
              </a>
            </nav>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-gray-100">
              <div className="text-[11px] text-gray-400">Built by Lukman Abdul Haq</div>
              <div className="text-[11px] text-gray-400">n8n · Supabase · OpenAI</div>
            </div>
          </aside>

          {/* Main content */}
          <main className="ml-56 flex-1 p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
