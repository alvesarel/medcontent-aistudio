import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path 
        d="M4 24H12L16 14L20 34L24 20L28 30L32 4H36" 
        stroke="currentColor" 
        strokeWidth="4" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M40 24L38 22L40 20L42 22L40 24Z" 
        fill="currentColor"
      />
       <path 
        d="M44 28L42 26L44 24L46 26L44 28Z" 
        fill="currentColor"
      />
       <path 
        d="M44 20L42 18L44 16L46 18L44 20Z" 
        fill="currentColor"
      />
    </svg>
  );
};

export default Logo;