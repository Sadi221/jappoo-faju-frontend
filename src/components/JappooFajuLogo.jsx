import React from 'react';

const JappooFajuLogo = ({ size = 48 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Gradient Definitions */}
      <defs>
        <linearGradient id="mainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#2563EB', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#7C3AED', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#06B6D4', stopOpacity: 1 }} />
        </linearGradient>
        
        <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#10B981', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#06B6D4', stopOpacity: 1 }} />
        </linearGradient>
      </defs>

      {/* Cercle de solidarité (mains jointes formant un cercle) */}
      <circle 
        cx="50" 
        cy="50" 
        r="45" 
        stroke="url(#mainGradient)" 
        strokeWidth="3" 
        fill="none"
        opacity="0.3"
      />
      
      {/* Trois personnes stylisées formant une chaîne humaine */}
      {/* Personne de gauche */}
      <g opacity="0.9">
        <circle cx="30" cy="35" r="7" fill="url(#mainGradient)" />
        <path 
          d="M 20 50 Q 30 45 40 50 L 40 65 Q 30 70 20 65 Z" 
          fill="url(#mainGradient)"
        />
      </g>

      {/* Personne du centre (plus grande - symbole d'aide) */}
      <g opacity="1">
        <circle cx="50" cy="30" r="8" fill="url(#accentGradient)" />
        <path 
          d="M 38 48 Q 50 42 62 48 L 62 68 Q 50 74 38 68 Z" 
          fill="url(#accentGradient)"
        />
      </g>

      {/* Personne de droite */}
      <g opacity="0.9">
        <circle cx="70" cy="35" r="7" fill="url(#mainGradient)" />
        <path 
          d="M 60 50 Q 70 45 80 50 L 80 65 Q 70 70 60 65 Z" 
          fill="url(#mainGradient)"
        />
      </g>

      {/* Cœur central (solidarité) */}
      <g transform="translate(50, 55)">
        <path
          d="M 0 5 C -3 -2, -8 -4, -10 -2 C -12 0, -12 3, -10 6 L 0 15 L 10 6 C 12 3, 12 0, 10 -2 C 8 -4, 3 -2, 0 5 Z"
          fill="#EF4444"
          opacity="0.9"
        />
        {/* Croix médicale dans le cœur */}
        <rect x="-1" y="2" width="2" height="6" fill="white" />
        <rect x="-3" y="4" width="6" height="2" fill="white" />
      </g>

      {/* Lignes de connexion (partage) */}
      <path 
        d="M 30 42 Q 40 50 50 48" 
        stroke="url(#mainGradient)" 
        strokeWidth="2" 
        fill="none"
        opacity="0.6"
        strokeLinecap="round"
      />
      <path 
        d="M 70 42 Q 60 50 50 48" 
        stroke="url(#mainGradient)" 
        strokeWidth="2" 
        fill="none"
        opacity="0.6"
        strokeLinecap="round"
      />

      {/* Étoiles de solidarité (effet de rayonnement) */}
      <circle cx="25" cy="20" r="2" fill="#10B981" opacity="0.6" />
      <circle cx="75" cy="20" r="2" fill="#10B981" opacity="0.6" />
      <circle cx="15" cy="50" r="2" fill="#06B6D4" opacity="0.6" />
      <circle cx="85" cy="50" r="2" fill="#06B6D4" opacity="0.6" />
    </svg>
  );
};

export default JappooFajuLogo;
