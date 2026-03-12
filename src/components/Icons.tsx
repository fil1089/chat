// Minimalist line icons (Perplexity / Apple style)
// All icons are 24x24 by default with 1.5px stroke
import type { IconProps } from '../types';
import type { FC } from 'react';

export const SPACE_ICON_MAP: Record<string, FC<IconProps>> = {
    'folder': IconFolder,
    'brain': IconBrain,
    'lightbulb': IconLightbulb,
    'microscope': IconMicroscope,
    'file-text': IconFileText,
    'target': IconTarget,
    'rocket': IconRocket,
    'chart-bar': IconChartBar,
    'palette': IconPalette,
    'book': IconBook,
    'settings': IconSettings,
    'robot': IconRobot,
    'briefcase': IconBriefcase,
    'globe': IconGlobe,
    'crystal-ball': IconCrystalBall,
    'star': IconStar,
    'heart': IconHeart,
    'compass': IconCompass,
    'flag': IconFlag,
    'code': IconCode,
    'gift': IconGift,
    'headphones': IconHeadphones,
    'camera': IconCamera,
    'sun': IconSun,
    'shield': IconShield,
    'clock': IconClock,
    'chat-bubble': IconChatBubble,
    'house': IconHouse,
    'link': IconLink,
    'terminal': IconTerminal,
};

export function SpaceIcon({ icon, size = 20, className = "" }: { icon: string; size?: number; className?: string }) {
    const IconComponent = SPACE_ICON_MAP[icon];
    if (IconComponent) {
        return <IconComponent size={size} className={className} />;
    }
    return <span className={className} style={{ fontSize: `${size}px`, lineHeight: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size, height: size }}>{icon}</span>;
}

// --- New coolicons-based icons ---

export function IconStar({ size = 20 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2.33496 10.3368C2.02171 10.0471 2.19187 9.52339 2.61557 9.47316L8.61914 8.76107C8.79182 8.74059 8.94181 8.63215 9.01465 8.47425L11.5469 2.98446C11.7256 2.59703 12.2764 2.59695 12.4551 2.98439L14.9873 8.47413C15.0601 8.63204 15.2092 8.74077 15.3818 8.76124L21.3857 9.47316C21.8094 9.52339 21.9791 10.0472 21.6659 10.3369L17.2278 14.4419C17.1001 14.56 17.0433 14.7357 17.0771 14.9063L18.255 20.8359C18.3382 21.2544 17.8928 21.5787 17.5205 21.3703L12.2451 18.4166C12.0934 18.3317 11.9091 18.3321 11.7573 18.417L6.48144 21.3695C6.10913 21.5779 5.66294 21.2544 5.74609 20.8359L6.92414 14.9066C6.95803 14.7361 6.90134 14.5599 6.77367 14.4419L2.33496 10.3368Z" />
        </svg>
    );
}

export function IconHeart({ size = 20 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 7.69431C10 2.99988 3 3.49988 3 9.49991C3 15.4999 12 20.5001 12 20.5001C12 20.5001 21 15.4999 21 9.49991C21 3.49988 14 2.99988 12 7.69431Z" />
        </svg>
    );
}

export function IconCompass({ size = 20 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12Z" />
            <path d="M10.5 10.5L16 8L13.5 13.5L8 16L10.5 10.5Z" />
        </svg>
    );
}

export function IconFlag({ size = 20 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 21V15.6871M4 15.6871C9.81818 11.1377 14.1818 20.2363 20 15.6869V4.31347C14.1818 8.86284 9.81818 -0.236103 4 4.31327V15.6871Z" />
        </svg>
    );
}

export function IconCode({ size = 20 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 7L20 12L15 17M9 17L4 12L9 7" />
        </svg>
    );
}

export function IconGift({ size = 20 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5.5V8M12 5.5C12 4.11929 13.1193 3 14.5 3C15.8807 3 17 4.11929 17 5.5C17 6.88071 15.8807 8 14.5 8M12 5.5C12 4.11929 10.8807 3 9.5 3C8.11929 3 7 4.11929 7 5.5C7 6.88071 8.11929 8 9.5 8M12 8H14.5M12 8H9.5M12 8V14M14.5 8H17.8002C18.9203 8 19.4796 8 19.9074 8.21799C20.2837 8.40973 20.5905 8.71547 20.7822 9.0918C21 9.5192 21 10.079 21 11.1969V14M9.5 8H6.2002C5.08009 8 4.51962 8 4.0918 8.21799C3.71547 8.40973 3.40973 8.71547 3.21799 9.0918C3 9.51962 3 10.0801 3 11.2002V14M3 14V16.8002C3 17.9203 3 18.4801 3.21799 18.9079C3.40973 19.2842 3.71547 19.5905 4.0918 19.7822C4.5192 20 5.07899 20 6.19691 20H12M3 14H12M12 14V20M12 14H21M12 20H17.8031C18.921 20 19.48 20 19.9074 19.7822C20.2837 19.5905 20.5905 19.2842 20.7822 18.9079C21 18.4805 21 17.9215 21 16.8036V14" />
        </svg>
    );
}

export function IconHeadphones({ size = 20 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 11C19 7.13401 15.866 4 12 4C8.13401 4 5 7.13401 5 11M16 14.5V16.5C16 16.9647 16 17.197 16.0384 17.3902C16.1962 18.1836 16.8165 18.8041 17.6099 18.9619C17.8031 19.0003 18.0353 19.0003 18.5 19.0003C18.9647 19.0003 19.197 19.0003 19.3902 18.9619C20.1836 18.8041 20.8036 18.1836 20.9614 17.3902C20.9999 17.197 21 16.9647 21 16.5V14.5C21 14.0353 20.9999 13.8026 20.9614 13.6094C20.8036 12.816 20.1836 12.1962 19.3902 12.0384C19.197 12 18.9647 12 18.5 12C18.0353 12 17.8031 12 17.6099 12.0384C16.8165 12.1962 16.1962 12.816 16.0384 13.6094C16 13.8026 16 14.0353 16 14.5ZM8 14.5V16.5C8 16.9647 7.99986 17.197 7.96143 17.3902C7.80361 18.1836 7.18352 18.8041 6.39014 18.9619C6.19694 19.0003 5.96469 19.0003 5.50004 19.0003C5.03539 19.0003 4.80306 19.0003 4.60986 18.9619C3.81648 18.8041 3.19624 18.1836 3.03843 17.3902C3 17.197 3 16.9647 3 16.5V14.5C3 14.0353 3 13.8026 3.03843 13.6094C3.19624 12.816 3.81648 12.1962 4.60986 12.0384C4.80306 12 5.03539 12 5.50004 12C5.9647 12 6.19694 12 6.39014 12.0384C7.18352 12.1962 7.80361 12.816 7.96143 13.6094C7.99986 13.8026 8 14.0353 8 14.5Z" />
        </svg>
    );
}

export function IconCamera({ size = 20 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.48898 7H6.2002C5.08009 7 4.51962 7 4.0918 7.21799C3.71547 7.40973 3.40973 7.71547 3.21799 8.0918C3 8.51962 3 9.08009 3 10.2002V15.8002C3 16.9203 3 17.4796 3.21799 17.9074C3.40973 18.2837 3.71547 18.5905 4.0918 18.7822C4.5192 19 5.07899 19 6.19691 19H17.8031C18.921 19 19.48 19 19.9074 18.7822C20.2837 18.5905 20.5905 18.2837 20.7822 17.9074C21 17.48 21 16.921 21 15.8031V10.1969C21 9.07899 21 8.5192 20.7822 8.0918C20.5905 7.71547 20.2837 7.40973 19.9074 7.21799C19.4796 7 18.9203 7 17.8002 7H14.5108M9.48898 7H14.5108M9.48898 7C9.38286 6.99995 9.32339 6.99941 9.27637 6.99414C8.68878 6.92835 8.28578 6.36908 8.40918 5.79084C8.42066 5.73703 8.44336 5.66894 8.4883 5.53412L8.49023 5.52841C8.54156 5.37443 8.56723 5.29743 8.59558 5.22949C8.88586 4.53389 9.54322 4.06083 10.2949 4.00541C10.3683 4 10.449 4 10.6113 4H13.3886C13.5509 4 13.6322 4 13.7057 4.00541C14.4574 4.06083 15.114 4.53389 15.4043 5.22949C15.4326 5.29743 15.4584 5.37434 15.5098 5.52832C15.556 5.66699 15.5791 5.73636 15.5908 5.79093C15.7142 6.36917 15.3118 6.92835 14.7242 6.99414C14.6772 6.99941 14.6171 6.99995 14.5108 7M12 16C10.3431 16 9 14.6569 9 13C9 11.3431 10.3431 10 12 10C13.6569 10 15 11.3431 15 13C15 14.6569 13.6569 16 12 16Z" />
        </svg>
    );
}

export function IconSun({ size = 20 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 4V2M12 20V22M6.41421 6.41421L5 5M17.728 17.728L19.1422 19.1422M4 12H2M20 12H22M17.7285 6.41421L19.1427 5M6.4147 17.728L5.00049 19.1422M12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7C14.7614 7 17 9.23858 17 12C17 14.7614 14.7614 17 12 17Z" />
        </svg>
    );
}

export function IconShield({ size = 20 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 9L11 13L9 11M20 10.165C20 16.7333 15.0319 19.6781 12.9258 20.6314L12.9231 20.6325C12.7016 20.7328 12.5906 20.7831 12.3389 20.8263C12.1795 20.8537 11.8215 20.8537 11.6621 20.8263C11.4094 20.7829 11.2972 20.7325 11.074 20.6314C8.9678 19.6781 4 16.7333 4 10.165V6.2002C4 5.08009 4 4.51962 4.21799 4.0918C4.40973 3.71547 4.71547 3.40973 5.0918 3.21799C5.51962 3 6.08009 3 7.2002 3H16.8002C17.9203 3 18.4796 3 18.9074 3.21799C19.2837 3.40973 19.5905 3.71547 19.7822 4.0918C20 4.5192 20 5.07899 20 6.19691V10.165Z" />
        </svg>
    );
}

export function IconClock({ size = 20 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 7V12H17M12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21Z" />
        </svg>
    );
}

export function IconChatBubble({ size = 20 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5.59961 19.9203L7.12357 18.7012L7.13478 18.6926C7.45249 18.4384 7.61281 18.3101 7.79168 18.2188C7.95216 18.1368 8.12328 18.0771 8.2998 18.0408C8.49877 18 8.70603 18 9.12207 18H17.8031C18.921 18 19.4806 18 19.908 17.7822C20.2843 17.5905 20.5905 17.2842 20.7822 16.9079C21 16.4805 21 15.9215 21 14.8036V7.19691C21 6.07899 21 5.5192 20.7822 5.0918C20.5905 4.71547 20.2837 4.40973 19.9074 4.21799C19.4796 4 18.9203 4 17.8002 4H6.2002C5.08009 4 4.51962 4 4.0918 4.21799C3.71547 4.40973 3.40973 4.71547 3.21799 5.0918C3 5.51962 3 6.08009 3 7.2002V18.6712C3 19.7369 3 20.2696 3.21846 20.5433C3.40845 20.7813 3.69644 20.9198 4.00098 20.9195C4.35115 20.9191 4.76744 20.5861 5.59961 19.9203Z" />
        </svg>
    );
}

export function IconHouse({ size = 20 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 17.0002V11.4522C20 10.9179 19.9995 10.6506 19.9346 10.4019C19.877 10.1816 19.7825 9.97307 19.6546 9.78464C19.5102 9.57201 19.3096 9.39569 18.9074 9.04383L14.1074 4.84383C13.3608 4.19054 12.9875 3.86406 12.5674 3.73982C12.1972 3.63035 11.8026 3.63035 11.4324 3.73982C11.0126 3.86397 10.6398 4.19014 9.89436 4.84244L5.09277 9.04383C4.69064 9.39569 4.49004 9.57201 4.3457 9.78464C4.21779 9.97307 4.12255 10.1816 4.06497 10.4019C4 10.6506 4 10.9179 4 11.4522V17.0002C4 17.932 4 18.3978 4.15224 18.7654C4.35523 19.2554 4.74432 19.6452 5.23438 19.8482C5.60192 20.0005 6.06786 20.0005 6.99974 20.0005C7.93163 20.0005 8.39808 20.0005 8.76562 19.8482C9.25568 19.6452 9.64467 19.2555 9.84766 18.7654C9.9999 18.3979 10 17.932 10 17.0001V16.0001C10 14.8955 10.8954 14.0001 12 14.0001C13.1046 14.0001 14 14.8955 14 16.0001V17.0001C14 17.932 14 18.3979 14.1522 18.7654C14.3552 19.2555 14.7443 19.6452 15.2344 19.8482C15.6019 20.0005 16.0679 20.0005 16.9997 20.0005C17.9316 20.0005 18.3981 20.0005 18.7656 19.8482C19.2557 19.6452 19.6447 19.2554 19.8477 18.7654C19.9999 18.3978 20 17.932 20 17.0002Z" />
        </svg>
    );
}

export function IconLink({ size = 20 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.1718 14.8288L14.8287 9.17192M7.05086 11.293L5.63664 12.7072C4.07455 14.2693 4.07409 16.8022 5.63619 18.3643C7.19829 19.9264 9.7317 19.9259 11.2938 18.3638L12.7065 16.9498M11.2929 7.05L12.7071 5.63579C14.2692 4.07369 16.8016 4.07397 18.3637 5.63607C19.9258 7.19816 19.9257 9.73085 18.3636 11.2929L16.9501 12.7071" />
        </svg>
    );
}

export function IconTerminal({ size = 20 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 15H12M7 10L10 12.5L7 15M3 15.8002V8.2002C3 7.08009 3 6.51962 3.21799 6.0918C3.40973 5.71547 3.71547 5.40973 4.0918 5.21799C4.51962 5 5.08009 5 6.2002 5H17.8002C18.9203 5 19.4796 5 19.9074 5.21799C20.2837 5.40973 20.5905 5.71547 20.7822 6.0918C21 6.5192 21 7.07899 21 8.19691V15.8031C21 16.921 21 17.48 20.7822 17.9074C20.5905 18.2837 20.2837 18.5905 19.9074 18.7822C19.48 19 18.921 19 17.8031 19H6.19691C5.07899 19 4.5192 19 4.0918 18.7822C3.71547 18.5905 3.40973 18.2837 3.21799 17.9074C3 17.4796 3 16.9203 3 15.8002Z" />
        </svg>
    );
}

// --- End of coolicons-based icons ---

export function IconCopy({ size = 20 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
        </svg>
    );
}

export function IconRegenerate({ size = 20 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
        </svg>
    );
}

export const IconDownload = ({ size = 24, className = '' }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
);

export const IconExternalLink = ({ size = 24, className = '' }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
        <polyline points="15 3 21 3 21 9"></polyline>
        <line x1="10" y1="14" x2="21" y2="3"></line>
    </svg>
);

export function IconShare({ size = 20 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
    );
}

export function IconCheck({ size = 20, className }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
}

export function IconChevronDown({ size = 16 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
        </svg>
    );
}

export function IconChevronUp({ size = 16 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="18 15 12 9 6 15" />
        </svg>
    );
}

export function IconChevronLeft({ size = 16 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
        </svg>
    );
}

export function IconChevronRight({ size = 16 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
        </svg>
    );
}

export function IconSend({ size = 18 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
    );
}

export function IconStop({ size = 18 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="6" width="12" height="12" rx="2" />
        </svg>
    );
}

export function IconMarkdown({ size = 18 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 3v4a1 1 0 001 1h4" />
            <path d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" />
            <path d="M9 15l2-2 2 2" />
            <path d="M13 13v4" />
        </svg>
    );
}

export function IconPdf({ size = 18 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 3v4a1 1 0 001 1h4" />
            <path d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" />
            <text x="7" y="17" fontSize="7" fill="currentColor" stroke="none" fontWeight="bold">PDF</text>
        </svg>
    );
}

export function IconDoc({ size = 18 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 3v4a1 1 0 001 1h4" />
            <path d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" />
            <line x1="9" y1="13" x2="15" y2="13" />
            <line x1="9" y1="17" x2="13" y2="17" />
        </svg>
    );
}

export function IconThread({ size = 18 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
    );
}

export function IconPlus({ size = 20 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    );
}

export function IconMenu({ size = 20 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
        </svg>
    );
}

export function IconSidebar({ size = 20 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><line x1="9" x2="9" y1="3" y2="21" />
        </svg>
    );
}

export function IconSidebarRight({ size = 20 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><line x1="15" x2="15" y1="3" y2="21" />
        </svg>
    );
}

export function IconFolder({ size = 20 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 17.0002V11.4522C20 10.9179 19.9995 10.6506 19.9346 10.4019C19.877 10.1816 19.7825 9.97307 19.6546 9.78464C19.5102 9.57201 19.3096 9.39569 18.9074 9.04383L14.1074 4.84383C13.3608 4.19054 12.9875 3.86406 12.5674 3.73982C12.1972 3.63035 11.8026 3.63035 11.4324 3.73982C11.0126 3.86397 10.6398 4.19014 9.89436 4.84244L5.09277 9.04383C4.69064 9.39569 4.49004 9.57201 4.3457 9.78464C4.21779 9.97307 4.12255 10.1816 4.06497 10.4019C4 10.6506 4 10.9179 4 11.4522V17.0002C4 17.932 4 18.3978 4.15224 18.7654C4.35523 19.2554 4.74432 19.6452 5.23438 19.8482C5.60192 20.0005 6.06786 20.0005 6.99974 20.0005C7.93163 20.0005 8.39808 20.0005 8.76562 19.8482C9.25568 19.6452 9.64467 19.2555 9.84766 18.7654C9.9999 18.3979 10 17.932 10 17.0001V16.0001C10 14.8955 10.8954 14.0001 12 14.0001C13.1046 14.0001 14 14.8955 14 16.0001V17.0001C14 17.932 14 18.3979 14.1522 18.7654C14.3552 19.2555 14.7443 19.6452 15.2344 19.8482C15.6019 20.0005 16.0679 20.0005 16.9997 20.0005C17.9316 20.0005 18.3981 20.0005 18.7656 19.8482C19.2557 19.6452 19.6447 19.2554 19.8477 18.7654C19.9999 18.3978 20 17.932 20 17.0002Z" />
        </svg>
    );
}

export function IconImage({ size = 20 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
        </svg>
    );
}

export function IconSettings({ size = 20, className }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
        </svg>
    );
}

export function IconLogo({ size = 24 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 12l10 10 10-10L12 2z" /><path d="M12 6l-6 6 6 6 6-6-6-6z" />
        </svg>
    );
}

export function IconMessage({ size = 20 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
    );
}

export function IconRobot({ size = 20 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" /><path d="M12 7v4" />
            <line x1="8" y1="16" x2="8" y2="16" /><line x1="16" y1="16" x2="16" y2="16" />
        </svg>
    );
}

export function IconFileText({ size = 20 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
        </svg>
    );
}

export function IconTrash({ size = 18 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
        </svg>
    );
}

export function IconEdit({ size = 18 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
    );
}

export function IconAttachment({ size = 20 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
        </svg>
    );
}

export function IconClose({ size = 20 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    );
}

export function IconError({ size = 20, className }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
    );
}

export function IconHistory({ size = 20 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /><path d="M3.51 9a9 9 0 0114.85-3.36" />
        </svg>
    );
}

export function IconSearch({ size = 18 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
    );
}

export function IconMore({ size = 18 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
        </svg>
    );
}

export function IconUser({ size = 20 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
        </svg>
    );
}

export function IconSparkles({ size = 20 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" />
            <path d="M5 3l.637 2.113a1 1 0 00.65.65L8.4 6.4 6.287 7.037a1 1 0 00-.65.65L5 9.8 4.363 7.687a1 1 0 00-.65-.65L1.6 6.4l2.113-.637a1 1 0 00.65-.65L5 3.2z" />
        </svg>
    );
}

export function IconExplore({ size = 20 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
        </svg>
    );
}

export function IconInfo({ size = 16 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
    );
}

export function IconBrain({ size = 20 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
            <ellipse cx="12" cy="12" rx="10" ry="4" />
            <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
            <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
        </svg>
    );
}

export function IconLightbulb({ size = 20 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .5 2.2 1.5 3.5.8.8 1.3 1.5 1.5 2.5" />
            <path d="M9 18h6" /><path d="M10 22h4" />
        </svg>
    );
}

export function IconMicroscope({ size = 20 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 7.2002V16.6854C6 18.0464 6 18.7268 6.20412 19.1433C6.58245 19.9151 7.41157 20.3588 8.26367 20.2454C8.7234 20.1842 9.28964 19.8067 10.4221 19.0518L10.4248 19.0499C10.8737 18.7507 11.0981 18.6011 11.333 18.5181C11.7642 18.3656 12.2348 18.3656 12.666 18.5181C12.9013 18.6012 13.1266 18.7515 13.5773 19.0519C14.7098 19.8069 15.2767 20.1841 15.7364 20.2452C16.5885 20.3586 17.4176 19.9151 17.7959 19.1433C18 18.7269 18 18.0462 18 16.6854V7.19691C18 6.07899 18 5.5192 17.7822 5.0918C17.5905 4.71547 17.2837 4.40973 16.9074 4.21799C16.4796 4 15.9203 4 14.8002 4H9.2002C8.08009 4 7.51962 4 7.0918 4.21799C6.71547 4.40973 6.40973 4.71547 6.21799 5.0918C6 5.51962 6 6.08009 6 7.2002Z" />
        </svg>
    );
}

export function IconTarget({ size = 20 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
        </svg>
    );
}

export function IconRocket({ size = 20 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
            <path d="M12 15l-3.5 3.5L5 15l3.5-3.5L12 15z" /><path d="M2 22l1-1" />
            <path d="M9 12l2.68-2.68a4 4 0 0 1 5.64 0l1 1a4 4 0 0 1 0 5.64L15.64 18.68A4 4 0 0 1 10 18.68V12z" />
            <path d="M15 14l2-2" /><path d="M12 17l2-2" /><path d="M15 7l3.5-3.5a1.5 1.5 0 1 1 2 2L17 9" />
        </svg>
    );
}

export function IconChartBar({ size = 20 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" />
        </svg>
    );
}

export function IconPalette({ size = 20 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 12V17C18 18.6569 15.3137 20 12 20C8.68629 20 6 18.6569 6 17V12M18 12V7M18 12C18 13.6569 15.3137 15 12 15C8.68629 15 6 13.6569 6 12M18 7C18 5.34315 15.3137 4 12 4C8.68629 4 6 5.34315 6 7M18 7C18 8.65685 15.3137 10 12 10C8.68629 10 6 8.65685 6 7M6 12V7" />
        </svg>
    );
}

export function IconBook({ size = 20 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
    );
}

export function IconBriefcase({ size = 20 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
    );
}

export function IconGlobe({ size = 20 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
    );
}

export function IconCrystalBall({ size = 20 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.3078 13.6923L15.1539 8.84619M20.1113 5.88867L16.0207 19.1833C15.6541 20.3747 15.4706 20.9707 15.1544 21.1683C14.8802 21.3396 14.5406 21.3683 14.2419 21.2443C13.8975 21.1014 13.618 20.5433 13.0603 19.428L10.4694 14.2461C10.3809 14.0691 10.3366 13.981 10.2775 13.9043C10.225 13.8363 10.1645 13.7749 10.0965 13.7225C10.0215 13.6647 9.93486 13.6214 9.76577 13.5369L4.57192 10.9399C3.45662 10.3823 2.89892 10.1032 2.75601 9.75879C2.63207 9.4601 2.66033 9.12023 2.83169 8.84597C3.02928 8.52974 3.62523 8.34603 4.81704 7.97932L18.1116 3.88867C19.0486 3.60038 19.5173 3.45635 19.8337 3.57253C20.1094 3.67373 20.3267 3.89084 20.4279 4.16651C20.544 4.48283 20.3999 4.95126 20.1119 5.88729L20.1113 5.88867Z" />
        </svg>
    );
}

export function IconEye({ size = 20 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
        </svg>
    );
}

export function IconEyeOff({ size = 20 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
            <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" />
        </svg>
    );
}

export function IconKey({ size = 20, className }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="7.5" cy="15.5" r="5.5" />
            <path d="M21 2l-9.6 9.6" />
            <path d="M15.5 7.5l3 3L21 8l-3-3" />
        </svg>
    );
}

export function IconArrowDown({ size = 20 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <polyline points="19 12 12 19 5 12"></polyline>
        </svg>
    );
}

export function IconArrowUp({ size = 20 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="19" x2="12" y2="5"></line>
            <polyline points="5 12 12 5 19 12"></polyline>
        </svg>
    );
}

export function IconAudio({ size = 16 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
        </svg>
    );
}

export function IconVideo({ size = 16 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
    );
}

export function IconFilter({ size = 18, className }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
        </svg>
    );
}

export function IconSort({ size = 18, className }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M11 5h10M11 9h7M11 13h4M3 17l3 3 3-3M6 18V4" />
        </svg>
    );
}
