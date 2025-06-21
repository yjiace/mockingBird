// Header Component
function createHeader(activePage = '') {
    return `
    <header class="header">
        <div class="header-container">
            <a href="/" class="logo">
                <svg class="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="16 18 22 12 16 6"></polyline>
                    <polyline points="8 6 2 12 8 18"></polyline>
                </svg>
                <span class="logo-text">Mock Flow API</span>
            </a>
            <nav class="nav">
                <a href="/" ${activePage === 'home' ? 'class="active"' : ''}>首页</a>
                <a href="/docs" ${activePage === 'docs' ? 'class="active"' : ''}>API 文档</a>
                <a href="/test" ${activePage === 'test' ? 'class="active"' : ''}>在线测试</a>
            </nav>
            <button class="mobile-menu-btn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
            </button>
        </div>
    </header>
    `;
}

// Header CSS Styles
const headerStyles = `
/* Header */
.header {
    position: sticky;
    top: 0;
    z-index: 1000;
    background-color: hsla(var(--background), 0.95);
    backdrop-filter: blur(8px);
    border-bottom: 1px solid hsl(var(--border));
}

.header-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.logo {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    text-decoration: none;
    color: hsl(var(--foreground));
}

.logo-icon {
    width: 24px;
    height: 24px;
    color: hsl(var(--primary));
}

.logo-text {
    font-size: 1.25rem;
    font-weight: 700;
    background: linear-gradient(45deg, hsl(var(--primary)), hsl(var(--accent)));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.nav {
    display: flex;
    gap: 2rem;
}

.nav a {
    color: hsl(var(--muted-foreground));
    text-decoration: none;
    font-weight: 500;
    transition: color 0.3s ease;
}

.nav a:hover,
.nav a.active {
    color: hsl(var(--primary));
}

/* Mobile menu */
.mobile-menu-btn {
    display: none;
    background: none;
    border: none;
    color: hsl(var(--foreground));
    cursor: pointer;
    padding: 0.5rem;
}

@media (max-width: 768px) {
    .nav {
        display: none;
    }
    
    .mobile-menu-btn {
        display: block;
    }
}
`;

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createHeader, headerStyles };
}