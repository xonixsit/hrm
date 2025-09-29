<template>
    <div class="logo-container">
        <svg viewBox="0 0 240 80" xmlns="http://www.w3.org/2000/svg" class="e-tax-logo">
            <!-- Background Elements -->
            <defs>
                <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#2563eb" stop-opacity="1">
                        <animate attributeName="stop-color" values="#2563eb;#1e40af;#2563eb" dur="4s" repeatCount="indefinite" />
                    </stop>
                    <stop offset="100%" stop-color="#0284c7" stop-opacity="1">
                        <animate attributeName="stop-color" values="#0284c7;#0369a1;#0284c7" dur="4s" repeatCount="indefinite" />
                    </stop>
                </linearGradient>
                
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                
                <filter id="strongGlow" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>
            
            <!-- Main Logo Shape -->
            <g class="logo-group">
                <!-- ID Card Icon -->
                <g class="id-card-icon" transform="translate(10, 20)" filter="url(#strongGlow)">
                    <rect x="0" y="0" width="30" height="40" rx="3" fill="url(#bgGradient)" stroke="#ffffff" stroke-width="0.5" />
                    <rect x="5" y="5" width="20" height="12" rx="1" fill="white" opacity="0.95" />
                    <circle cx="15" cy="11" r="4" fill="#475569" stroke="#ffffff" stroke-width="0.5" />
                    <rect x="5" y="20" width="20" height="2" rx="1" fill="white" opacity="0.95">
                        <animate attributeName="width" values="20;15;20" dur="2s" repeatCount="indefinite" />
                    </rect>
                    <rect x="5" y="26" width="15" height="2" rx="1" fill="white" opacity="0.95">
                        <animate attributeName="width" values="15;10;15" dur="2s" repeatCount="indefinite" />
                    </rect>
                    <rect x="5" y="32" width="20" height="2" rx="1" fill="white" opacity="0.95">
                        <animate attributeName="width" values="15;20;15" dur="2s" repeatCount="indefinite" />
                    </rect>
                </g>
                
                <!-- Calendar Icon -->
                <g class="calendar-icon" transform="translate(25, 15)" filter="url(#glow)">
                    <rect x="0" y="0" width="25" height="35" rx="3" fill="#475569" opacity="1" stroke="#ffffff" stroke-width="0.5" />
                    <rect x="3" y="3" width="19" height="6" rx="1" fill="#94a3b8" />
                    <line x1="6" y1="0" x2="6" y2="6" stroke="white" stroke-width="1" opacity="0.9" />
                    <line x1="12" y1="0" x2="12" y2="6" stroke="white" stroke-width="1" opacity="0.9" />
                    <line x1="18" y1="0" x2="18" y2="6" stroke="white" stroke-width="1" opacity="0.9" />
                    <rect x="3" y="12" width="4" height="4" rx="1" fill="white" opacity="0.95">
                        <animate attributeName="opacity" values="0.8;1;0.8" dur="3s" repeatCount="indefinite" />
                    </rect>
                    <rect x="10" y="12" width="4" height="4" rx="1" fill="white" opacity="0.95">
                        <animate attributeName="opacity" values="1;0.8;1" dur="3s" repeatCount="indefinite" />
                    </rect>
                    <rect x="17" y="12" width="4" height="4" rx="1" fill="white" opacity="0.95">
                        <animate attributeName="opacity" values="0.8;1;0.8" dur="3s" repeatCount="indefinite" />
                    </rect>
                    <rect x="3" y="19" width="4" height="4" rx="1" fill="white" opacity="0.95">
                        <animate attributeName="opacity" values="1;0.8;1" dur="3s" repeatCount="indefinite" />
                    </rect>
                    <rect x="10" y="19" width="4" height="4" rx="1" fill="white" opacity="0.95">
                        <animate attributeName="opacity" values="0.8;1;0.8" dur="3s" repeatCount="indefinite" />
                    </rect>
                    <rect x="17" y="19" width="4" height="4" rx="1" fill="white" opacity="0.95">
                        <animate attributeName="opacity" values="1;0.8;1" dur="3s" repeatCount="indefinite" />
                    </rect>
                    <rect x="3" y="26" width="4" height="4" rx="1" fill="white" opacity="0.95">
                        <animate attributeName="opacity" values="0.8;1;0.8" dur="3s" repeatCount="indefinite" />
                    </rect>
                    <rect x="10" y="26" width="4" height="4" rx="1" fill="white" opacity="0.95">
                        <animate attributeName="opacity" values="1;0.8;1" dur="3s" repeatCount="indefinite" />
                    </rect>
                    <rect x="17" y="26" width="4" height="4" rx="1" fill="white" opacity="0.95">
                        <animate attributeName="opacity" values="0.8;1;0.8" dur="3s" repeatCount="indefinite" />
                    </rect>
                </g>
                
                <!-- People Icon -->
                <g class="people-icon" transform="translate(45, 20)" filter="url(#glow)">
                    <circle cx="10" cy="10" r="15" fill="#10b981" opacity="1" stroke="#ffffff" stroke-width="0.5">
                        <animate attributeName="r" values="15;16;15" dur="3s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="10" cy="7" r="5" fill="white" opacity="1" stroke="#475569" stroke-width="0.5" />
                    <path d="M2,20 Q10,15 18,20" stroke="white" stroke-width="2.5" fill="none" stroke-linecap="round">
                        <animate attributeName="stroke-width" values="2.5;3;2.5" dur="2s" repeatCount="indefinite" />
                    </path>
                </g>
            </g>
            
            <!-- Text -->
            <text x="80" y="35" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="currentColor" class="logo-text" filter="url(#strongGlow)">
                E-Tax Planner
                <animate attributeName="opacity" values="0.95;1;0.95" dur="3s" repeatCount="indefinite" />
            </text>
            <text x="80" y="50" font-family="Arial, sans-serif" font-size="10" fill="currentColor" opacity="0.9" class="logo-tagline">
                HR Management Solution
            </text>
        </svg>
    </div>
</template>

<style scoped>
.logo-container {
    display: inline-block;
    position: relative;
    filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.2));
}

.e-tax-logo {
    overflow: visible;
}

.logo-group {
    transform-origin: center;
    animation: pulse 4s infinite ease-in-out;
}

@keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.02); }
}

.logo-text {
    font-weight: 700;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    font-size: 22px;
}

.logo-tagline {
    font-weight: 400;
    text-shadow: 0 1px 1px rgba(0, 0, 0, 0.15);
    font-size: 10px;
}
</style>
