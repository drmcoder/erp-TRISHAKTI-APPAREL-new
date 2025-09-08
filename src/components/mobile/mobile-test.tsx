// Simple mobile responsiveness test component
import React from 'react';

export const MobileTest = () => {
  return (
    <div className="p-4">
      <div className="bg-blue-500 text-white p-4 rounded-lg mb-4">
        <h1 className="text-xl font-bold">Mobile Test Component</h1>
        <p className="text-sm">Testing mobile responsiveness</p>
      </div>
      
      {/* Responsive Grid Test */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <div className="bg-green-400 p-4 rounded text-white">
          <h3 className="font-bold">Mobile (1 col)</h3>
          <p className="text-xs">This should stack on mobile</p>
        </div>
        <div className="bg-yellow-400 p-4 rounded text-black">
          <h3 className="font-bold">Tablet (2 col)</h3>
          <p className="text-xs">2 columns on tablet</p>
        </div>
        <div className="bg-purple-400 p-4 rounded text-white">
          <h3 className="font-bold">Desktop (3 col)</h3>
          <p className="text-xs">3 columns on desktop</p>
        </div>
      </div>

      {/* Touch Target Test */}
      <div className="space-y-2">
        <button className="w-full bg-red-500 text-white p-3 rounded-lg text-lg font-medium min-h-[44px]">
          Large Touch Target (44px min)
        </button>
        <button className="w-full bg-indigo-500 text-white p-4 rounded-lg text-base min-h-[48px]">
          Even Larger Touch Target
        </button>
      </div>

      {/* Screen Size Indicator */}
      <div className="mt-4 p-3 bg-gray-200 rounded text-center">
        <div className="block sm:hidden text-red-600 font-bold">📱 Mobile View (&lt; 640px)</div>
        <div className="hidden sm:block md:hidden text-yellow-600 font-bold">📱 Small Tablet (640px - 768px)</div>
        <div className="hidden md:block lg:hidden text-green-600 font-bold">💻 Tablet (768px - 1024px)</div>
        <div className="hidden lg:block xl:hidden text-blue-600 font-bold">🖥️ Desktop (1024px - 1280px)</div>
        <div className="hidden xl:block text-purple-600 font-bold">🖥️ Large Desktop (&gt; 1280px)</div>
      </div>
    </div>
  );
};

export default MobileTest;