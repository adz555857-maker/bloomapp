
import React, { useState } from 'react';
import { Heart, Coffee, Star, Gift, Check, Sparkles } from 'lucide-react';

const DonationView: React.FC = () => {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleDonate = (tierId: string) => {
    setSelectedTier(tierId);
    setProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
        setProcessing(false);
        setSuccess(true);
        setTimeout(() => {
            setSuccess(false);
            setSelectedTier(null);
        }, 3000);
    }, 1500);
  };

  const tiers = [
    { id: 'seed', name: 'Plant a Seed', price: '$1.00', icon: <Heart size={24} className="text-pink-500" />, desc: 'A small token of appreciation.' },
    { id: 'water', name: 'Watering Can', price: '$5.00', icon: <Coffee size={24} className="text-blue-500" />, desc: 'Buy the developer a coffee.' },
    { id: 'sun', name: 'Bag of Fertilizer', price: '$10.00', icon: <Star size={24} className="text-yellow-500" />, desc: 'Supercharge future updates!' },
    { id: 'greenhouse', name: 'Greenhouse', price: '$20.00', icon: <Gift size={24} className="text-purple-500" />, desc: 'Become a legendary supporter.' },
  ];

  if (success) {
      return (
          <div className="w-full max-w-md mx-auto animate-grow min-h-[50vh] flex flex-col items-center justify-center text-center p-6">
              <div className="w-24 h-24 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-6">
                  <Sparkles size={48} className="text-green-600 dark:text-green-400 animate-pulse" />
              </div>
              <h2 className="text-3xl font-bold text-nature-800 dark:text-nature-200 mb-2">Thank You!</h2>
              <p className="text-stone-600 dark:text-stone-400">Your support helps the garden grow.</p>
          </div>
      );
  }

  return (
    <div className="w-full max-w-md mx-auto animate-grow space-y-6 pb-24">
      
      {/* Header */}
      <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-earth-200 dark:border-stone-800 text-center">
         <div className="w-16 h-16 bg-pink-50 dark:bg-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart size={32} className="text-pink-500" fill="currentColor" />
         </div>
         <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2">Support Bloom</h2>
         <p className="text-stone-500 dark:text-stone-400">
             Bloom is an indie project built with love. If you enjoy growing your habits, consider supporting the development!
         </p>
      </div>

      {/* Donation Tiers */}
      <div className="grid grid-cols-1 gap-4">
         {tiers.map((tier) => (
             <button
                key={tier.id}
                onClick={() => handleDonate(tier.id)}
                disabled={processing}
                className={`relative bg-white dark:bg-stone-900 p-4 rounded-2xl border transition-all duration-300 flex items-center gap-4 text-left group
                    ${selectedTier === tier.id 
                        ? 'border-nature-500 ring-2 ring-nature-200 dark:ring-nature-900 scale-[1.02]' 
                        : 'border-earth-100 dark:border-stone-800 hover:border-nature-300 dark:hover:border-nature-700 hover:shadow-lg'
                    }
                `}
             >
                <div className="w-12 h-12 rounded-xl bg-earth-50 dark:bg-stone-800 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    {tier.icon}
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-stone-800 dark:text-stone-200">{tier.name}</h3>
                        <span className="font-mono font-bold text-nature-600 dark:text-nature-400 bg-nature-50 dark:bg-nature-900/30 px-2 py-1 rounded-lg text-xs">
                            {tier.price}
                        </span>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">{tier.desc}</p>
                </div>
                {processing && selectedTier === tier.id && (
                    <div className="absolute inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-[1px] rounded-2xl flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-nature-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
             </button>
         ))}
      </div>

      <div className="text-center">
          <p className="text-xs text-stone-400 dark:text-stone-600">
              Payments are simulated for this demo version. No real money will be charged.
          </p>
      </div>

    </div>
  );
};

export default DonationView;
