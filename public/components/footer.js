// Footer Component
function createFooter() {
    return `
    <footer class="footer">
        <p>© 冀ICP备17000836号-2 | <img src="img/beian.png" alt="冀公网安备 13018102000160号" style="vertical-align:middle;"> 冀公网安备 13018102000160号</p>
        <p>提供稳定可靠的模拟API服务。</p>
    </footer>
    `;
}

// Footer CSS Styles
const footerStyles = `
/* Footer */
.footer {
    text-align: center;
    padding: 2rem;
    color: hsl(var(--muted-foreground));
    border-top: 1px solid hsl(var(--border));
    margin-top: auto;
}

.footer p {
    margin: 0;
    font-size: 0.875rem;
}
`;

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createFooter, footerStyles };
}