import React, { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

const GoogleAd: React.FC = () => {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.log('AdSense script not loaded yet or blocked.');
    }
  }, []);

  return (
    <div className="flex justify-center items-center w-full max-w-[468px] h-[50px] sm:h-[60px] bg-gray-50 dark:bg-stone-800/30 border border-dashed border-gray-200 dark:border-stone-800 rounded-lg overflow-hidden mx-auto relative group">
      <ins className="adsbygoogle"
           style={{ display: 'block', width: '100%', height: '100%' }}
           data-ad-client="ca-pub-0000000000000000" 
           data-ad-slot="0000000000"
           data-ad-format="horizontal"
           data-full-width-responsive="true"></ins>
      
      {/* Fallback Text for Demo/No ID */}
      <span className="absolute text-[10px] text-gray-300 dark:text-stone-700 pointer-events-none group-hover:opacity-0 transition-opacity">
        Google Ads Space
      </span>
    </div>
  );
};

export default GoogleAd;