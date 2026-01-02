export * from '../../types/avatar';
import { AvatarAsset } from '../../types/avatar';

// 펭귄 기본 이미지
export const PENGUIN_BASE_IMAGE = '/assets/avatar/penguin_base.png';

// 스킨 맵: 아이템 ID 조합 -> 완성된 펭귄 이미지
export const SKIN_MAP: Record<string, string> = {
    '': '/assets/avatar/penguin_base.png',
    'item_hat': '/assets/avatar/penguin_item_hat.png',
    'item_scarf': '/assets/avatar/penguin_item_scarf.png',
    'item_hat_item_scarf': '/assets/avatar/penguin_item_hat_item_scarf.png',
    'item_crown': '/assets/avatar/penguin_item_crown.png',
    'item_robe': '/assets/avatar/penguin_item_robe.png',
    'item_crown_item_robe': '/assets/avatar/penguin_item_crown_item_robe.png',
    'item_scarf_item_sunglass': '/assets/avatar/penguin_item_scarf_item_sunglass.png',
    'item_sunglass': '/assets/avatar/penguin_item_sunglass.png',
    'item_robe_item_sunglass': '/assets/avatar/penguin_item_sunglass_item_robe.png',
    'item_hat_item_robe': '/assets/avatar/penguin_item_hat_item_robe.png',
    'item_crown_item_scarf': '/assets/avatar/penguin_item_crown_item_scarf.png',
};

// ========== SVG 배경 에셋들 ==========


export const SvgSafe = () => (
    <svg viewBox="0 0 100 120" className="w-full h-full">
        <defs>
            <linearGradient id="safeBody" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#d4af37" />
                <stop offset="50%" stopColor="#ffd700" />
                <stop offset="100%" stopColor="#b8860b" />
            </linearGradient>
            <linearGradient id="safeInternal" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#444" />
                <stop offset="100%" stopColor="#222" />
            </linearGradient>
        </defs>
        {/* Shadow */}
        <ellipse cx="50" cy="112" rx="40" ry="6" fill="#000" opacity="0.15" />

        {/* Body */}
        <rect x="5" y="10" width="90" height="100" rx="8" fill="url(#safeBody)" stroke="#8b6508" strokeWidth="3" />
        <rect x="12" y="17" width="76" height="86" rx="4" fill="url(#safeInternal)" stroke="#000" strokeWidth="2" opacity="0.3" />

        {/* Door Panel */}
        <rect x="15" y="20" width="70" height="80" rx="4" fill="url(#safeBody)" stroke="#8b4513" strokeWidth="2" />

        {/* Dial */}
        <circle cx="50" cy="60" r="22" fill="#222" stroke="#b8860b" strokeWidth="3" />
        <circle cx="50" cy="60" r="18" fill="#333" stroke="#ffd700" strokeWidth="2.5" />
        {/* Dial Marks */}
        {[...Array(12)].map((_, i) => (
            <rect key={i} x="49.5" y="44" width="1" height="4" fill="#ffd700" transform={`rotate(${i * 30} 50 60)`} />
        ))}
        <circle cx="50" cy="60" r="5" fill="#ffd700" />
        <line x1="50" y1="60" x2="50" y2="46" stroke="#ffd700" strokeWidth="3" strokeLinecap="round" />

        {/* Handle */}
        <rect x="72" y="50" width="4" height="20" rx="2" fill="#ffd700" stroke="#8b6508" strokeWidth="2" />

        {/* Bolts */}
        <circle cx="12" cy="17" r="2" fill="#8b6508" />
        <circle cx="88" cy="17" r="2" fill="#8b6508" />
        <circle cx="12" cy="103" r="2" fill="#8b6508" />
        <circle cx="88" cy="103" r="2" fill="#8b6508" />
    </svg>
);

export const SvgMonitor = () => (
    <svg viewBox="0 0 120 100" className="w-full h-full">
        {/* Shadow */}
        <ellipse cx="60" cy="92" rx="35" ry="4" fill="#000" opacity="0.1" />

        {/* Base/Stand */}
        <path d="M45,90 L75,90 L70,75 L50,75 Z" fill="#333" />
        <rect x="56" y="70" width="8" height="15" fill="#444" />

        {/* Outer Frame */}
        <rect x="5" y="10" width="110" height="70" rx="6" fill="#1a1a1a" stroke="#000" strokeWidth="2" />
        <rect x="8" y="13" width="104" height="64" rx="4" fill="#2d2d2d" />

        {/* Screen Content */}
        <rect x="12" y="17" width="96" height="56" rx="2" fill="#0f172a" />

        {/* Code Lines */}
        <rect x="20" y="25" width="30" height="3" rx="1.5" fill="#4ade80" opacity="0.8" />
        <rect x="20" y="32" width="50" height="3" rx="1.5" fill="#60a5fa" opacity="0.8" />
        <rect x="20" y="39" width="40" height="3" rx="1.5" fill="#f472b6" opacity="0.8" />
        <rect x="35" y="46" width="45" height="3" rx="1.5" fill="#fbbf24" opacity="0.8" />
        <rect x="35" y="53" width="35" height="3" rx="1.5" fill="#a78bfa" opacity="0.8" />

        {/* Screen Glare */}
        <path d="M12,17 L60,17 L12,65 Z" fill="#fff" opacity="0.03" />

        {/* Power LED */}
        <circle cx="103" cy="72" r="1" fill="#4ade80">
            <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
        </circle>
    </svg>
);

export const SvgTreasure = () => (
    <svg viewBox="0 0 100 80" className="w-full h-full">
        <defs>
            <linearGradient id="chestWood" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#8b4513" />
                <stop offset="100%" stopColor="#5d2906" />
            </linearGradient>
            <radialGradient id="gemSparkle" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fff" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
        </defs>
        {/* Shadow */}
        <ellipse cx="50" cy="75" rx="45" ry="5" fill="#000" opacity="0.15" />

        {/* Chest Body */}
        <rect x="5" y="30" width="90" height="45" rx="4" fill="url(#chestWood)" stroke="#3e1d04" strokeWidth="3" />

        {/* Wood Texture Lines */}
        <line x1="10" y1="40" x2="90" y2="40" stroke="#3e1d04" strokeWidth="1.5" opacity="0.3" />
        <line x1="10" y1="50" x2="90" y2="50" stroke="#3e1d04" strokeWidth="1.5" opacity="0.3" />
        <line x1="10" y1="60" x2="90" y2="60" stroke="#3e1d04" strokeWidth="1.5" opacity="0.3" />

        {/* Chest Lid (Closed/Slightly Ajar) */}
        <path d="M5,30 Q5,5 50,5 Q95,5 95,30" fill="url(#chestWood)" stroke="#3e1d04" strokeWidth="3" />

        {/* Gold Bands */}
        <rect x="20" y="5" width="10" height="70" fill="#daa520" stroke="#8b6508" strokeWidth="2" opacity="0.9" />
        <rect x="70" y="5" width="10" height="70" fill="#daa520" stroke="#8b6508" strokeWidth="2" opacity="0.9" />
        <rect x="5" y="28" width="90" height="4" fill="#ffd700" stroke="#8b6508" strokeWidth="2" />

        {/* Lock Detail */}
        <rect x="42" y="25" width="16" height="12" rx="3" fill="#ffd700" stroke="#8b6508" strokeWidth="2" />
        <circle cx="50" cy="31" r="2" fill="#222" />

        {/* Glowing Gems in the gap */}
        <circle cx="35" cy="30" r="3" fill="#ff0000">
            <animate attributeName="opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="55" cy="27" r="2.5" fill="#00ff00">
            <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="75" cy="30" r="3" fill="#0000ff">
            <animate attributeName="opacity" values="0.6;1;0.6" dur="1.8s" repeatCount="indefinite" />
        </circle>
    </svg>
);

export const SvgAura = () => (
    <svg viewBox="0 0 200 200" className="w-full h-full">
        <circle cx="100" cy="100" r="95" fill="none" stroke="url(#auraGradient1)" strokeWidth="2" strokeDasharray="15 8" opacity="0.4">
            <animateTransform attributeName="transform" type="rotate" from="0 100 100" to="360 100 100" dur="12s" repeatCount="indefinite" />
        </circle>
        <circle cx="100" cy="100" r="80" fill="none" stroke="url(#auraGradient2)" strokeWidth="3" strokeDasharray="10 5" opacity="0.3">
            <animateTransform attributeName="transform" type="rotate" from="360 100 100" to="0 100 100" dur="8s" repeatCount="indefinite" />
        </circle>
        <defs>
            <linearGradient id="auraGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFD700" />
                <stop offset="100%" stopColor="#FF6347" />
            </linearGradient>
            <linearGradient id="auraGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
        </defs>
    </svg>
);

export const SvgHalo = () => (
    <svg viewBox="0 0 200 200" className="w-full h-full">
        <defs>
            <radialGradient id="haloRadial" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFD700" stopOpacity="0.6" />
                <stop offset="70%" stopColor="#FFD700" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
            </radialGradient>
        </defs>
        {/* Pulsing light behind */}
        <circle cx="100" cy="100" r="80" fill="url(#haloRadial)">
            <animate attributeName="r" values="70;95;70" dur="4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0.8;0.4" dur="4s" repeatCount="indefinite" />
        </circle>
        {/* Rotating rays */}
        <g transform="translate(100, 100)">
            <g>
                <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="30s" repeatCount="indefinite" />
                {[...Array(12)].map((_, i) => (
                    <path
                        key={i}
                        d="M-5,0 L5,0 L15,-120 L-15,-120 Z"
                        fill="#FFD700"
                        opacity="0.15"
                        transform={`rotate(${i * 30})`}
                    >
                        <animate attributeName="opacity" values="0.1;0.3;0.1" dur={`${2 + (i % 3)}s`} repeatCount="indefinite" />
                    </path>
                ))}
            </g>
        </g>
    </svg>
);

export const SvgWallpaperSky = () => (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
        <defs>
            <linearGradient id="deepSkyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#60a5fa" />
            </linearGradient>
        </defs>
        <rect width="100" height="100" fill="url(#deepSkyGrad)" />
        <path d="M0,85 Q25,75 50,85 T100,85 L100,100 L0,100 Z" fill="#fff" opacity="0.15" />
        <path d="M0,92 Q35,88 70,95 T100,92 L100,100 L0,100 Z" fill="#fff" opacity="0.1" />
        {/* Stylized Clouds */}
        <circle cx="20" cy="25" r="12" fill="#fff" opacity="0.2" />
        <circle cx="28" cy="28" r="8" fill="#fff" opacity="0.2" />
        <circle cx="75" cy="15" r="15" fill="#fff" opacity="0.1" />
        <circle cx="85" cy="22" r="10" fill="#fff" opacity="0.1" />
    </svg>
);

export const SvgWallpaperSunset = () => (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
        <rect width="100" height="100" fill="#fff7ed" />
        <linearGradient id="sunGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffedd5" />
            <stop offset="100%" stopColor="#fed7aa" />
        </linearGradient>
        <rect width="100" height="100" fill="url(#sunGrad)" opacity="0.5" />
        <circle cx="50" cy="100" r="40" fill="#fb923c" opacity="0.2" />
    </svg>
);

export const SvgWallpaperNight = () => (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
        <rect width="100" height="100" fill="#0f172a" />
        {[...Array(20)].map((_, i) => (
            <circle key={i} cx={(i * 13) % 100} cy={(i * 7) % 100} r="0.5" fill="white" opacity="0.5">
                <animate attributeName="opacity" values="0.2;0.8;0.2" dur={`${2 + (i % 3)}s`} repeatCount="indefinite" />
            </circle>
        ))}
    </svg>
);

export const SvgWallpaperCheckered = () => (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
        <defs>
            <pattern id="checkPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <rect width="10" height="10" fill="#fecaca" />
                <rect x="10" y="10" width="10" height="10" fill="#fecaca" />
                <rect x="10" y="0" width="10" height="10" fill="#f87171" />
                <rect x="0" y="10" width="10" height="10" fill="#f87171" />
            </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#checkPattern)" />
    </svg>
);

export const SvgWallpaperModern = () => (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
        <defs>
            <linearGradient id="modernGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4c1d95" />
                <stop offset="100%" stopColor="#1e1b4b" />
            </linearGradient>
        </defs>
        <rect width="100" height="100" fill="url(#modernGrad)" />
        <path d="M0,0 L100,0 L100,20 L0,80 Z" fill="#ffffff" opacity="0.05" />
        <path d="M0,40 L100,20 L100,100 L0,100 Z" fill="#ffffff" opacity="0.03" />
        <circle cx="90" cy="10" r="30" fill="#a78bfa" opacity="0.1" />
    </svg>
);

export const SvgWallpaperNordic = () => (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
        <rect width="100" height="100" fill="#ecfdf5" />
        <defs>
            <pattern id="nordicPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M20,10 L30,30 L10,30 Z" fill="#10b981" opacity="0.4" />
                <path d="M10,25 L15,35 L5,35 Z" fill="#059669" opacity="0.3" />
                <circle cx="30" cy="15" r="2" fill="#34d399" opacity="0.5" />
            </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#nordicPattern)" />
    </svg>
);

export const SvgHearts = () => (
    <svg viewBox="0 0 200 200" className="w-full h-full">
        <defs>
            <path id="heartShape" d="M0,0 C-5,-5 -10,0 -10,5 C-10,10 0,15 0,15 C0,15 10,10 10,5 C10,0 5,-5 0,0 Z" />
        </defs>
        {[
            { x: 50, y: 160, tx: -20, delay: 0, s: 0.8 },
            { x: 150, y: 150, tx: 20, delay: 0.5, s: 1.2 },
            { x: 80, y: 170, tx: 10, delay: 1.2, s: 0.6 },
            { x: 120, y: 165, tx: -15, delay: 1.8, s: 0.9 },
            { x: 60, y: 140, tx: -10, delay: 2.2, s: 0.7 },
            { x: 140, y: 130, tx: 15, delay: 2.8, s: 1.1 }
        ].map((h, i) => (
            <g key={i} transform={`translate(${h.x}, ${h.y})`}>
                <use href="#heartShape" fill="#FF4B2B" opacity="0">
                    <animate attributeName="opacity" values="0;0.8;0" dur="3s" begin={`${h.delay}s`} repeatCount="indefinite" />
                    <animateTransform attributeName="transform" type="translate" values={`0 0; ${h.tx} -100`} dur="3s" begin={`${h.delay}s`} repeatCount="indefinite" additive="sum" />
                    <animateTransform attributeName="transform" type="scale" values={`0; ${h.s}; 0`} dur="3s" begin={`${h.delay}s`} repeatCount="indefinite" additive="sum" />
                </use>
            </g>
        ))}
    </svg>
);

export const SvgSnow = () => (
    <svg viewBox="0 0 200 200" className="w-full h-full">
        {[...Array(15)].map((_, i) => (
            <circle key={i} cx={(i * 37) % 200} cy="-10" r={1 + (i % 3)} fill="white" opacity="0.6">
                <animate attributeName="cy" values="-10;210" dur={`${4 + (i % 5)}s`} begin={`${i * 0.4}s`} repeatCount="indefinite" />
                <animate attributeName="cx" values={`${(i * 37) % 200}; ${(i * 37 + (i % 2 === 0 ? 20 : -20)) % 200}`} dur={`${4 + (i % 5)}s`} begin={`${i * 0.4}s`} repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.2;0.8;0.2" dur={`${4 + (i % 5)}s`} begin={`${i * 0.4}s`} repeatCount="indefinite" />
            </circle>
        ))}
    </svg>
);

export const SvgNotes = () => (
    <svg viewBox="0 0 200 200" className="w-full h-full">
        <defs>
            <filter id="noteShadow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
                <feOffset dx="0" dy="0" result="offsetblur" />
                <feComponentTransfer>
                    <feFuncA type="linear" slope="0.5" />
                </feComponentTransfer>
                <feMerge>
                    <feMergeNode />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
            {/* 8분 음표 */}
            <g id="note_eighth">
                <path d="M0,0 C2,0 4,-2 4,-5 L4,-25 C4,-28 6,-30 10,-30 L10,-20 C10,-20 4,-20 4,-15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <ellipse cx="0" cy="0" rx="5" ry="4" fill="currentColor" transform="rotate(-20)" />
            </g>
            {/* 16분 음표 */}
            <g id="note_sixteenth">
                <path d="M0,0 L0,-25 C0,-28 2,-30 8,-30 M0,-18 C0,-21 2,-23 8,-23" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M0,0 L0,-25" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <ellipse cx="0" cy="0" rx="5" ry="4" fill="currentColor" transform="rotate(-20)" />
            </g>
            {/* 높은음자리표 */}
            <g id="note_clef">
                <path d="M10,10 C15,10 15,0 10,-5 C5,-10 0,-5 0,5 C0,15 15,20 15,5 C15,-10 5,-20 5,-35 L5,15 C5,20 0,20 0,15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </g>
        </defs>
        {[
            { id: 'note_eighth', x: 40, y: 160, c: '#a855f7', d: 0, scale: 1 },
            { id: 'note_sixteenth', x: 160, y: 150, c: '#ec4899', d: 0.8, scale: 1.2 },
            { id: 'note_clef', x: 100, y: 170, c: '#3b82f6', d: 1.5, scale: 0.8 },
            { id: 'note_eighth', x: 60, y: 130, c: '#10b981', d: 2.2, scale: 0.9 },
            { id: 'note_sixteenth', x: 140, y: 110, c: '#f59e0b', d: 3.0, scale: 1.1 }
        ].map((n, i) => (
            <g key={i} transform={`translate(${n.x}, ${n.y}) scale(${n.scale})`} color={n.c} filter="url(#noteShadow)">
                <use href={`#${n.id}`} opacity="0">
                    <animate attributeName="opacity" values="0;1;0" dur="5s" begin={`${n.d}s`} repeatCount="indefinite" />
                    <animateTransform
                        attributeName="transform"
                        type="translate"
                        values={`0 0; ${Math.sin(i) * 30} -120`}
                        dur="5s"
                        begin={`${n.d}s`}
                        repeatCount="indefinite"
                    />
                    <animateTransform
                        attributeName="transform"
                        type="rotate"
                        values="-10; 10; -10"
                        dur="3s"
                        begin={`${n.d}s`}
                        repeatCount="indefinite"
                        additive="sum"
                    />
                </use>
            </g>
        ))}
    </svg>
);

// 상점 아이템 정보
export const AVATAR_ASSETS: Record<string, AvatarAsset> = {
    'item_hat': {
        id: 'item_hat',
        name: '알록달록 모자',
        slot: 'head',
        iconPath: '/assets/avatar/icon_hat.png',
    },
    'item_scarf': {
        id: 'item_scarf',
        name: '빨간 목도리',
        slot: 'clothes',
        iconPath: '/assets/avatar/icon_scarf.png',
    },
    'item_sofa': {
        id: 'item_sofa',
        name: '편안한 소파',
        slot: 'ground',
        iconPath: '/assets/avatar/icon_sofa.png',
    },
    'item_monitor': {
        id: 'item_monitor',
        name: '코딩용 모니터',
        slot: 'ground',
        svgIcon: SvgMonitor,
    },
    'item_safe': {
        id: 'item_safe',
        name: '황금 금고',
        slot: 'ground',
        svgIcon: SvgSafe,
    },
    'item_treasure': {
        id: 'item_treasure',
        name: '보물 상자',
        slot: 'ground',
        svgIcon: SvgTreasure,
    },
    'item_aura': {
        id: 'item_aura',
        name: '반짝이는 오라',
        slot: 'effect',
        svgIcon: SvgAura,
    },
    'item_halo': {
        id: 'item_halo',
        name: '성스러운 후광',
        slot: 'effect',
        svgIcon: SvgHalo,
    },
    'item_hearts': {
        id: 'item_hearts',
        name: '두근두근 하트',
        slot: 'effect',
        svgIcon: SvgHearts,
    },
    'item_snow': {
        id: 'item_snow',
        name: '눈 내리는 풍경',
        slot: 'effect',
        svgIcon: SvgSnow,
    },
    'item_wallpaper_sky': {
        id: 'item_wallpaper_sky',
        name: '푸른 하늘 벽지',
        slot: 'wallpaper',
        svgIcon: SvgWallpaperSky,
    },
    'item_wallpaper_sunset': {
        id: 'item_wallpaper_sunset',
        name: '노을 빛 벽지',
        slot: 'wallpaper',
        svgIcon: SvgWallpaperSunset,
    },
    'item_wallpaper_night': {
        id: 'item_wallpaper_night',
        name: '별 헤는 밤 벽지',
        slot: 'wallpaper',
        svgIcon: SvgWallpaperNight,
    },
    'item_wallpaper_checkered': {
        id: 'item_wallpaper_checkered',
        name: '빨간 체크 벽지',
        slot: 'wallpaper',
        svgIcon: SvgWallpaperCheckered,
    },
    'item_wallpaper_modern': {
        id: 'item_wallpaper_modern',
        name: '모던 퍼플 벽지',
        slot: 'wallpaper',
        svgIcon: SvgWallpaperModern,
    },
    'item_wallpaper_nordic': {
        id: 'item_wallpaper_nordic',
        name: '노르딕 숲 벽지',
        slot: 'wallpaper',
        svgIcon: SvgWallpaperNordic,
    },
    'item_notes': {
        id: 'item_notes',
        name: '즐거운 음표',
        slot: 'effect',
        svgIcon: SvgNotes,
    },
    'item_crown': {
        id: 'item_crown',
        name: '임금님의 왕관',
        slot: 'head',
    },
    'item_robe': {
        id: 'item_robe',
        name: '신비로운 로브',
        slot: 'clothes',
    },
    'item_sunglass': {
        id: 'item_sunglass',
        name: '멋쟁이 선글라스',
        slot: 'head',
    },
};

export function resolveSkin(equippedItemIds: string[]): string {
    const skinAffectingItems = equippedItemIds
        .filter(id => {
            const asset = AVATAR_ASSETS[id];
            return asset && ['head', 'clothes'].includes(asset.slot);
        })
        .sort();

    const comboKey = skinAffectingItems.join('_');
    if (SKIN_MAP[comboKey]) return SKIN_MAP[comboKey];

    for (let i = skinAffectingItems.length - 1; i >= 0; i--) {
        if (SKIN_MAP[skinAffectingItems[i]]) return SKIN_MAP[skinAffectingItems[i]];
    }

    return PENGUIN_BASE_IMAGE;
}

export function getBackgroundItems(equippedItemIds: string[]): AvatarAsset[] {
    return equippedItemIds
        .map(id => AVATAR_ASSETS[id])
        .filter((asset): asset is AvatarAsset => !!asset && ['ground', 'background', 'wallpaper'].includes(asset.slot));
}

export function getEffectItems(equippedItemIds: string[]): AvatarAsset[] {
    return equippedItemIds
        .map(id => AVATAR_ASSETS[id])
        .filter((asset): asset is AvatarAsset => !!asset && asset.slot === 'effect');
}
