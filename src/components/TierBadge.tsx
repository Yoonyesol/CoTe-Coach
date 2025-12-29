import React from 'react';

interface TierBadgeProps {
    tier: string; // e.g., "Novice 3", "Challenger 10"
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

const TierBadge: React.FC<TierBadgeProps> = ({ tier, size = 'md', className = '' }) => {
    const [rankName, rankLevel] = tier.split(' ');
    const levelNum = parseInt(rankLevel) || 1;

    // Define colors for each rank
    const getRankColor = (name: string) => {
        switch (name.toLowerCase()) {
            case 'novice': return '#71717A'; // Zinc 500 (Neutral Gray / Silver-ish)
            case 'challenger': return '#EAB308'; // Yellow (Gold)
            case 'expert': return '#10B981'; // Emerald (Platinum/Green) - New!
            case 'solver': return '#3B82F6'; // Blue (Diamond)
            case 'master': return '#EF4444'; // Red (Ruby)
            case 'legend': return '#A855F7'; // Purple (Master)
            default: return '#94A3B8'; // Slate
        }
    };

    const color = getRankColor(rankName);

    // Size mapping
    const sizeMap = {
        sm: { w: 24, h: 32, fontSize: 14, strokeWidth: 2 },
        md: { w: 40, h: 54, fontSize: 24, strokeWidth: 3 },
        lg: { w: 60, h: 80, fontSize: 36, strokeWidth: 4 },
        xl: { w: 100, h: 134, fontSize: 60, strokeWidth: 6 },
    };

    const { w, h, strokeWidth } = sizeMap[size];

    return (
        <div className={`relative inline-flex flex-col items-center justify-center select-none ${className}`} title={tier}>
            <svg
                width={w}
                height={h}
                viewBox="0 0 100 134"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-sm"
            >
                {/* Main Badge Body */}
                <path
                    d="M0 12C0 5.37258 5.37258 0 12 0H88C94.6274 0 100 5.37258 100 12V100L50 134L0 100V12Z"
                    fill={color}
                />

                {/* Bottom Stripes (V-shape) */}
                <path
                    d="M0 90L50 124L100 90"
                    stroke="white"
                    strokeWidth={strokeWidth * 2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    opacity="0.3"
                />
                <path
                    d="M0 100L50 134L100 100"
                    stroke="white"
                    strokeWidth={strokeWidth * 2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    opacity="0.5"
                />

                {/* Rank Number */}
                <text
                    x="50"
                    y="60"
                    fontSize="64"
                    fontWeight="900"
                    fill="white"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{ fontFamily: 'Inter, sans-serif', filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.1))' }}
                >
                    {levelNum}
                </text>
            </svg>
        </div>
    );
};

export default TierBadge;
