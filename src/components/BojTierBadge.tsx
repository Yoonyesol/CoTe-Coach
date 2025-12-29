import React from 'react';

interface BojTierBadgeProps {
    level: number; // Solved.ac level (1~30+)
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const BojTierBadge: React.FC<BojTierBadgeProps> = ({ level, size = 'md', className = '' }) => {

    // Solved.ac Level -> Color Mapping
    const getTierColor = (lv: number) => {
        if (lv === 0) return '#2D2D2D'; // Unrated
        if (lv <= 5) return '#ad5600'; // Bronze
        if (lv <= 10) return '#435f7a'; // Silver
        if (lv <= 15) return '#ec9a00'; // Gold
        if (lv <= 20) return '#27e2a4'; // Platinum
        if (lv <= 25) return '#00b4fc'; // Diamond
        if (lv <= 30) return '#ff0062'; // Ruby
        return '#7f00ff'; // Master~ (Purple)
    };

    const color = getTierColor(level);

    // Size config
    const sizeMap = {
        sm: { w: 16, h: 20, fontSize: 10 },
        md: { w: 24, h: 30, fontSize: 14 },
        lg: { w: 40, h: 50, fontSize: 24 },
    };

    const { w, h } = sizeMap[size];

    // Calculate standard Solved.ac sub-tier (5, 4, 3, 2, 1)
    // Lev 1->5, Lev 5->1
    const subTier = level > 0 ? 5 - ((level - 1) % 5) : 0;
    // Master+ usually doesn't have sub-tier in the same way, but let's keep it simpler for now or just show level if master?
    // Actually Solved.ac Master is just "Master". Let's show subTier for regular tiers, and maybe nothing or 'M' for Master.
    const displayNum = level > 30 ? 'M' : (level === 0 ? '-' : subTier);

    // Define strokeWidth for the new paths
    const strokeWidth = 2;

    return (
        <div className={`relative inline-flex flex-col items-center justify-center select-none ${className}`} title={`Solved.ac Level ${level}`}>
            <svg
                width={w}
                height={h}
                viewBox="0 0 100 134"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-sm"
            >
                {/* Shield Shape */}
                <path
                    d="M0 12C0 5.37258 5.37258 0 12 0H88C94.6274 0 100 5.37258 100 12V100L50 134L0 100V12Z"
                    fill={color}
                />

                {/* Bottom Stripes (V-shape) - White stripes like Solved.ac */}
                <path
                    d="M0 90L50 124L100 90"
                    stroke="white"
                    strokeWidth={strokeWidth * 2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    opacity="0.9"
                />
                <path
                    d="M0 100L50 134L100 100"
                    stroke="white"
                    strokeWidth={strokeWidth * 2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    opacity="0.0"
                />
                {/* Solved.ac badges usually have just one thick white chevron at the bottom or flat.
            The user image shows one white chevron near bottom. 
            Updated paths to match closer to the provided image.
        */}

                {/* Rank Number */}
                <text
                    x="50"
                    y="65"
                    fontSize="64"
                    fontWeight="900"
                    fill="white"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{ fontFamily: 'Inter, sans-serif', filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.1))' }}
                >
                    {displayNum}
                </text>

            </svg>
        </div>
    );
};

export default BojTierBadge;
