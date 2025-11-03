import React from 'react';

type Level = 'xsmall' | 'small' | 'medium' | 'large';

interface Props {
    level: Level;
    size?: number;
    color?: string;
}

const GridDensityIcon: React.FC<Props> = ({ level, size = 20, color = 'currentColor' }) => {
    const common: React.SVGProps<SVGSVGElement> = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', xmlns: 'http://www.w3.org/2000/svg', style: { display: 'block' } };

    if (level === 'xsmall') {
        // dense tiny grid (4x4), tightly packed
        return (
            <svg {...common}>
                <rect x="3" y="3" width="3" height="3" rx="0.6" fill={color} />
                <rect x="8" y="3" width="3" height="3" rx="0.6" fill={color} />
                <rect x="13" y="3" width="3" height="3" rx="0.6" fill={color} />
                <rect x="18" y="3" width="3" height="3" rx="0.6" fill={color} />

                <rect x="3" y="8" width="3" height="3" rx="0.6" fill={color} />
                <rect x="8" y="8" width="3" height="3" rx="0.6" fill={color} />
                <rect x="13" y="8" width="3" height="3" rx="0.6" fill={color} />
                <rect x="18" y="8" width="3" height="3" rx="0.6" fill={color} />

                <rect x="3" y="13" width="3" height="3" rx="0.6" fill={color} />
                <rect x="8" y="13" width="3" height="3" rx="0.6" fill={color} />
                <rect x="13" y="13" width="3" height="3" rx="0.6" fill={color} />
                <rect x="18" y="13" width="3" height="3" rx="0.6" fill={color} />

                <rect x="3" y="18" width="3" height="3" rx="0.6" fill={color} />
                <rect x="8" y="18" width="3" height="3" rx="0.6" fill={color} />
                <rect x="13" y="18" width="3" height="3" rx="0.6" fill={color} />
                <rect x="18" y="18" width="3" height="3" rx="0.6" fill={color} />
            </svg>
        );
    }

    if (level === 'small') {
        // 3x3 grid — medium spacing and bigger tiles than xsmall
        return (
            <svg {...common}>
                <rect x="2" y="2" width="6" height="6" rx="1" fill={color} />
                <rect x="9" y="2" width="6" height="6" rx="1" fill={color} />
                <rect x="16" y="2" width="6" height="6" rx="1" fill={color} />

                <rect x="2" y="9" width="6" height="6" rx="1" fill={color} />
                <rect x="9" y="9" width="6" height="6" rx="1" fill={color} />
                <rect x="16" y="9" width="6" height="6" rx="1" fill={color} />

                <rect x="2" y="16" width="6" height="6" rx="1" fill={color} />
                <rect x="9" y="16" width="6" height="6" rx="1" fill={color} />
                <rect x="16" y="16" width="6" height="6" rx="1" fill={color} />
            </svg>
        );
    }

    if (level === 'medium') {
        // 2x2 grid — larger blocks
        return (
            <svg {...common}>
                <rect x="3" y="3" width="8.5" height="8.5" rx="1" fill={color} />
                <rect x="12.5" y="3" width="8.5" height="8.5" rx="1" fill={color} />
                <rect x="3" y="12.5" width="8.5" height="8.5" rx="1" fill={color} />
                <rect x="12.5" y="12.5" width="8.5" height="8.5" rx="1" fill={color} />
            </svg>
        );
    }

    // large - single block
    return (
        <svg {...common}>
            <rect x="3" y="3" width="18" height="18" rx="2" fill={color} />
        </svg>
    );
};

export default GridDensityIcon;
