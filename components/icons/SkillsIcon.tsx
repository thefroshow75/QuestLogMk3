import React from 'react';

export const SkillsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
    {/* Outer Circle */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    
    {/* Trunk */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-7" />
    
    {/* Roots */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18c-1.5 0-2.5.5-3.5 1.5M12 18c1.5 0 2.5.5 3.5 1.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 16.5l-2 2M14 16.5l2 2" />

    {/* Branches */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c-2 0-3-1.5-4-3M12 11c2 0 3-1.5 4-3" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 8c-1.5 0-2.5-.5-3-1.5M16 8c1.5 0 2.5-.5 3-1.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 5.5l-1-1.5M14.5 5.5l1-1.5" />
  </svg>
);
