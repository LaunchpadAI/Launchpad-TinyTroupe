'use client';

import Link from 'next/link';

export default function ContentPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Content Enhancement</h1>
              <p className="mt-2 text-gray-600">Coming soon - AI-powered content enrichment</p>
            </div>
            <Link href="/" className="text-blue-600 hover:text-blue-500">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <h2 className="text-xl font-medium text-gray-900 mb-4">Content Enhancement Coming Soon</h2>
          <p className="text-gray-600">
            This page will feature AI-powered content enrichment and professional styling tools.
          </p>
        </div>
      </main>
    </div>
  );
}