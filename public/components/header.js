class HeaderComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                }
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px 50px;
                    background-color: #ffffff;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.03);
                    position: sticky;
                    top: 0;
                    z-index: 1000;
                    backdrop-filter: blur(8px);
                    background-color: rgba(255, 255, 255, 0.9);
                    border-bottom-left-radius: 16px;
                    border-bottom-right-radius: 16px;
                    animation: fadeInBottom 0.6s ease-out;
                }
                .logo {
                    font-size: 28px;
                    font-weight: 800;
                    background: linear-gradient(45deg, #8e44ad, #5d34a8);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    color: transparent;
                    transition: transform 0.3s ease;
                }
                .logo:hover {
                    transform: scale(1.05);
                }
                .nav a {
                    margin-left: 35px;
                    color: #666;
                    text-decoration: none;
                    font-size: 17px;
                    position: relative;
                    transition: color 0.3s ease, transform 0.3s ease;
                    padding: 5px 0;
                }
                .nav a::after {
                    content: '';
                    position: absolute;
                    width: 0;
                    height: 2px;
                    bottom: 0;
                    left: 0;
                    background: linear-gradient(45deg, #8e44ad, #5d34a8);
                    transition: width 0.3s ease-out;
                    border-radius: 2px;
                }
                .nav a:hover {
                    color: #2c2c2c;
                    transform: translateY(-2px);
                }
                .nav a:hover::after {
                    width: 100%;
                }
                .nav a.active {
                    color: #2c2c2c;
                    font-weight: 600;
                    transform: translateY(-2px);
                }
                .nav a.active::after {
                    width: 100%;
                }
                @keyframes fadeInBottom {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            </style>
            <div class="header">
                <div class="logo">Mock Flow API</div>
                <div class="nav">
                    <a href="/index.html" class="${window.location.pathname === '/index.html' ? 'active' : ''}">首页</a>
                    <a href="/api-doc.html" class="${window.location.pathname === '/api-doc.html' ? 'active' : ''}">API文档</a>
                    <a href="#">API测试器</a>
                </div>
            </div>
        `;
    }
}

customElements.define('header-component', HeaderComponent);

document.getElementById('header-component').appendChild(document.createElement('header-component'));