
import React from 'react';
import { PlantStage, PlantHealth } from '../types';

interface PlantProps {
  stage: PlantStage;
  health: PlantHealth;
  className?: string; // Allow overriding size/position styles
  showText?: boolean; // Option to hide text for thumbnail views
}

const Plant: React.FC<PlantProps> = ({ stage, health, className, showText = true }) => {
  
  // Color modifications based on health
  const getColors = () => {
    switch (health) {
      case PlantHealth.DEAD:
        return { primary: '#78716c', secondary: '#57534e', leaf: '#a8a29e' };
      case PlantHealth.WITHERED:
        return { primary: '#a16207', secondary: '#854d0e', leaf: '#ca8a04' };
      case PlantHealth.WILTING:
        return { primary: '#65a30d', secondary: '#4d7c0f', leaf: '#84cc16' };
      default: // THRIVING
        return { primary: '#16a34a', secondary: '#15803d', leaf: '#22c55e' };
    }
  };

  const c = getColors();

  // Animations class
  const animClass = health === PlantHealth.THRIVING ? 'animate-wiggle' : '';
  const sizeClass = className || "w-48 h-48"; // Default size if not provided

  const renderSeed = () => (
    <svg viewBox="0 0 100 100" className={`${sizeClass} drop-shadow-lg ${animClass}`}>
      <circle cx="50" cy="80" r="10" fill={c.secondary} />
      <path d="M50 80 Q50 60 60 55 Q70 50 60 40 Q50 30 40 40 Q30 50 40 55 Q50 60 50 80" fill={c.primary} />
    </svg>
  );

  const renderSprout = () => (
    <svg viewBox="0 0 100 100" className={`${sizeClass} drop-shadow-lg ${animClass}`}>
      <path d="M50 90 L50 60" stroke={c.secondary} strokeWidth="4" strokeLinecap="round" />
      <path d="M50 60 Q30 40 20 50 Q30 70 50 60" fill={c.leaf} />
      <path d="M50 60 Q70 40 80 50 Q70 70 50 60" fill={c.leaf} />
    </svg>
  );

  const renderSapling = () => (
    <svg viewBox="0 0 100 100" className={`${sizeClass} drop-shadow-lg ${animClass}`}>
      <path d="M50 90 L50 40" stroke={c.secondary} strokeWidth="6" strokeLinecap="round" />
      <path d="M50 70 Q30 60 20 70 Q30 90 50 70" fill={c.leaf} />
      <path d="M50 50 Q70 30 80 40 Q70 60 50 50" fill={c.leaf} />
      <path d="M50 40 Q30 20 20 30 Q30 50 50 40" fill={c.leaf} />
    </svg>
  );

  const renderTree = () => (
    <svg viewBox="0 0 100 100" className={`${sizeClass} drop-shadow-lg ${animClass}`}>
      <path d="M50 90 L50 30" stroke={c.secondary} strokeWidth="8" strokeLinecap="round" />
      
      {/* Branches */}
      <path d="M50 70 L20 50" stroke={c.secondary} strokeWidth="4" strokeLinecap="round" />
      <path d="M50 60 L80 40" stroke={c.secondary} strokeWidth="4" strokeLinecap="round" />

      {/* Foliage bunches */}
      <circle cx="20" cy="50" r="15" fill={c.leaf} opacity="0.9" />
      <circle cx="80" cy="40" r="18" fill={c.leaf} opacity="0.9" />
      <circle cx="50" cy="20" r="25" fill={c.leaf} opacity="0.9" />
      <circle cx="40" cy="35" r="20" fill={c.primary} opacity="0.8" />
      <circle cx="60" cy="30" r="20" fill={c.primary} opacity="0.8" />
    </svg>
  );

  const renderFlowering = () => (
    <svg viewBox="0 0 100 100" className={`${sizeClass} drop-shadow-lg ${animClass}`}>
      <path d="M50 90 Q40 60 50 30" stroke={c.secondary} strokeWidth="6" fill="none" />
      
      <path d="M50 70 Q20 60 10 40 Q30 50 50 70" fill={c.leaf} />
      <path d="M50 50 Q80 40 90 20 Q70 30 50 50" fill={c.leaf} />

      {/* Flowers */}
      <g transform="translate(50, 30)">
        <circle r="15" fill="#f472b6" />
        <circle r="10" fill="#db2777" />
        <circle r="5" fill="#fce7f3" />
      </g>
      <g transform="translate(20, 50) scale(0.6)">
        <circle r="15" fill="#f472b6" />
        <circle r="10" fill="#db2777" />
      </g>
      <g transform="translate(80, 40) scale(0.7)">
        <circle r="15" fill="#f472b6" />
        <circle r="10" fill="#db2777" />
      </g>
    </svg>
  );

   const renderMythical = () => (
    <svg viewBox="0 0 100 100" className={`${sizeClass} drop-shadow-xl ${animClass}`}>
      <defs>
        <radialGradient id="grad1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" style={{stopColor:'rgb(255,255,255)', stopOpacity:0.8}} />
          <stop offset="100%" style={{stopColor:'rgb(255,0,255)', stopOpacity:0}} />
        </radialGradient>
      </defs>
      
      <path d="M50 95 Q40 60 50 20" stroke={c.secondary} strokeWidth="4" fill="none" />
      
      {/* Glowing Aura */}
      <circle cx="50" cy="50" r="45" fill="url(#grad1)" opacity="0.3" />

      {/* Exotic Leaves */}
      <path d="M50 80 Q20 80 10 50 Q40 60 50 80" fill="#06b6d4" opacity="0.8" />
      <path d="M50 60 Q80 60 90 30 Q60 40 50 60" fill="#8b5cf6" opacity="0.8" />
      <path d="M50 40 Q20 30 15 10 Q40 20 50 40" fill="#ec4899" opacity="0.8" />

      {/* Crystal Flower */}
      <path d="M50 20 L40 10 L50 0 L60 10 Z" fill="#e879f9" />
      <path d="M50 20 L60 30 L70 20 L60 10 Z" fill="#d8b4fe" />
      <path d="M50 20 L40 30 L30 20 L40 10 Z" fill="#d8b4fe" />
    </svg>
  );

  return (
    <div className="flex flex-col items-center justify-center transition-all duration-500">
      {stage === PlantStage.SEED && renderSeed()}
      {stage === PlantStage.SPROUT && renderSprout()}
      {stage === PlantStage.SAPLING && renderSapling()}
      {stage === PlantStage.TREE && renderTree()}
      {stage === PlantStage.FLOWERING && renderFlowering()}
      {stage === PlantStage.MYTHICAL && renderMythical()}
      
      {showText && (
        <div className="mt-4 text-center">
          <h2 className={`text-xl font-bold ${health === PlantHealth.DEAD ? 'text-gray-500' : 'text-nature-900 dark:text-stone-100'}`}>
            {health === PlantHealth.DEAD ? 'Withered Away...' : 'Your Companion'}
          </h2>
          <p className="text-sm text-gray-500 dark:text-stone-400 uppercase tracking-wider font-semibold">{stage} • {health}</p>
        </div>
      )}
    </div>
  );
};

export default Plant;
