import React from 'react';

import { TierBadgeProps } from '../../types/components';

const TierBadge: React.FC<TierBadgeProps> = ({ tier, size = 'md', className = '' }) => {
    const [rankName, rankLevel] = tier.split(' ');
    const levelNum = parseInt(rankLevel) || 1;

    // LOL-Style Rank -> Color Mapping (Metallic Gradients)
    const getRankColor = (name: string) => {
        switch (name.toLowerCase()) {
            case 'iron': return { from: '#52525B', to: '#3F3F46' }; // Dark Gray Metal
            case 'bronze': return { from: '#CD7F32', to: '#8B4513' }; // Bronze Metal
            case 'silver': return { from: '#C0C0C0', to: '#808080' }; // Silver Metal
            case 'gold': return { from: '#FFD700', to: '#DAA520' }; // Gold Metal
            case 'platinum': return { from: '#00CED1', to: '#008B8B' }; // Turquoise (Platinum)
            case 'diamond': return { from: '#4169E1', to: '#1E3A8A' }; // Royal Blue (Diamond)
            case 'master': return { from: '#9370DB', to: '#4B0082' }; // Purple/Indigo (Master)
            case 'grandmaster': return { from: '#DC143C', to: '#8B0000' }; // Crimson Red (Grandmaster) ⭐
            case 'challenger': return { from: '#FFD700', to: '#00CED1' }; // Gold->Cyan (Challenger) 🔥
            default: return { from: '#94A3B8', to: '#64748B' }; // Slate
        }
    };

    const colors = getRankColor(rankName);

    // Size mapping
    const sizeMap = {
        sm: { w: 32, h: 32, fontSize: 8 },
        md: { w: 48, h: 48, fontSize: 10 },
        lg: { w: 80, h: 80, fontSize: 14 },
        xl: { w: 120, h: 120, fontSize: 20 },
    };

    const { w, h } = sizeMap[size];

    // LOL-Style Icons: Wings, Gems, Crown (ALL CENTERED)
    const getIcon = (name: string) => {
        switch (name.toLowerCase()) {
            case 'iron': // Sharp Triangle/Arrow
                return <path d="M50 25L35 70h30L50 25z M32 75L28 82h44l-4-7H32z" fill="white" fillOpacity="0.9" filter="drop-shadow(0px 2px 2px rgba(0,0,0,0.3))" />;
            case 'bronze': // Small Wings
                return <path d="M50 32c-4-4-12-6-16-4 0 8 4 16 8 20l8 12 8-12c4-4 8-12 8-20-4-2-12 0-16 4z M35 77l-4 8h38l-4-8H35z" fill="white" fillOpacity="0.9" filter="drop-shadow(0px 2px 2px rgba(0,0,0,0.3))" />;
            case 'silver': // Silver Wings
                return <path d="M28 38c-2-6-8-8-12-6 1 10 5 18 10 23l6 12 16-8-16-4c-2-4-3-10-4-17zm44 0c2-6 8-8 12-6-1 10-5 18-10 23l-6 12-16-8 16-4c2-4 3-10 4-17zM35 77l-4 6h38l-4-6H35z" fill="white" fillOpacity="0.9" filter="drop-shadow(0px 2px 2px rgba(0,0,0,0.3))" />;
            case 'gold': // Golden Wings
                return <path d="M24 33c-4-8-10-10-14-8 2 12 6 22 12 28l6 10 20-6-20-6c-2-6-3-12-4-18zm52 0c4-8 10-10 14-8-2 12-6 22-12 28l-6 10-20-6 20-6c2-6 3-12 4-18zM32 75l-3 8h42l-3-8H32z" fill="white" fillOpacity="0.9" filter="drop-shadow(0px 2px 2px rgba(0,0,0,0.3))" />;
            case 'platinum': // Gem/Crystal
                return <path d="M50 25L38 38 34 50 50 72 66 50 62 38 50 25z M42 42l8-12 8 12-8 4-8-4z M35 77l-4 6h38l-4-6H35z" fill="white" fillOpacity="0.9" filter="drop-shadow(0px 2px 2px rgba(0,0,0,0.3))" />;
            case 'diamond': // Diamond Cut
                return <path d="M50 22L66 38h-32L50 22z M32 38L50 72 68 38H32z M35 75l-4 8h38l-4-8H35z" fill="white" fillOpacity="0.9" filter="drop-shadow(0px 2px 2px rgba(0,0,0,0.3))" />;
            case 'master': // Crown
                return <path d="M20 45l8-15 12 8 10-15 10 15 12-8 8 15v18H20V45z M22 66l-2 6h60l-2-6H22z M42 28a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z M50 24a3 3 0 1 1 0 6 3 3 0 0 1 0-6z M58 28a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z" fill="white" fillOpacity="0.9" filter="drop-shadow(0px 2px 2px rgba(0,0,0,0.3))" />;
            case 'grandmaster': // Phoenix Crest
                return <path d="M50 15 l-5 10 -15-5 5 20 -15 15 20 5 10 20 10-20 20-5 -15-15 5-20 -15 5 z M50 35 l-4 8 h8 z" fill="white" fillOpacity="0.95" filter="drop-shadow(0px 3px 3px rgba(0,0,0,0.4))" />;
            case 'challenger': // Cosmic Crown
                return <path d="M50 18L46 26 38 22 40 33 32 36 42 41 38 50 50 44 62 50 58 41 68 36 60 33 62 22 54 26 50 18z M25 56l4 12h42l4-12H25z M34 72l-2 6h36l-2-6H34z" fill="white" fillOpacity="1" filter="drop-shadow(0px 4px 4px rgba(0,0,0,0.5))" />;
            default: // Iron (fallback)
                return <path d="M50 25L35 70h30L50 25z M32 75L28 82h44l-4-7H32z" fill="white" fillOpacity="0.9" filter="drop-shadow(0px 2px 2px rgba(0,0,0,0.3))" />;
        }
    }

    const uniqueId = `hex-${tier.replace(/\s/g, '-')}-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <div className={`relative inline-flex flex-col items-center justify-center select-none ${className}`} title={tier}>
            <svg
                width={w}
                height={h}
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="transform transition-transform hover:scale-105 filter drop-shadow-md"
                style={{ overflow: 'visible' }}
            >
                <defs>
                    <linearGradient id={uniqueId} x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                        <stop stopColor={colors.from} />
                        <stop offset="1" stopColor={colors.to} />
                    </linearGradient>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="2" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                {/* Hexagon Background */}
                <path
                    d="M50 0 L95 25 L95 75 L50 100 L5 75 L5 25 Z"
                    fill={`url(#${uniqueId})`}
                    stroke="white"
                    strokeWidth="2"
                    strokeOpacity="0.5"
                />

                {/* Internal Glow/Highlight (Top) */}
                <path
                    d="M50 2 L93 26 L93 50 L50 25 L7 50 L7 26 Z"
                    fill="white"
                    fillOpacity="0.15"
                />

                {/* Chess Icon */}
                {getIcon(rankName)}

            </svg>


            {/* Level Badge - Full Width Bottom Bar (100% Width) */}
            <div
                className="absolute bottom-0 translate-y-1/4 bg-base-900 text-white rounded-lg flex items-center justify-center shadow-lg border border-white/20"
                style={{
                    width: w,  // 100% width to occupy entire base
                    height: w * 0.25,
                    padding: '0 4px',
                }}
            >
                <span
                    className="font-black leading-none tracking-tighter"
                    style={{ fontSize: sizeMap[size].fontSize }}
                >
                    Lv.{levelNum}
                </span>
            </div>
        </div>
    );
};

export default TierBadge;
