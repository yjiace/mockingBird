class FooterComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                }
                .footer {
                    text-align: center;
                    color: #666;
                    padding-bottom: 20px;
                    font-size: 14px;
                    line-height: 1.6;
                }
                .footer p {
                    margin: 5px 0;
                }
            </style>
            <div class="footer">
                <p>© 冀ICP备17000836号-2 | <img src="https://pub.smallyoung.cn/mockingBird/lib/img/beian.png" alt="冀公网安备 13018102000160号" style="vertical-align:middle;"> 冀公网安备 13018102000160号</p>
                <p>提供稳定可靠的模拟API服务。</p>
            </div>
        `;
    }
}

customElements.define('footer-component', FooterComponent);

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('#footer-component').forEach(el => {
        el.replaceWith(new FooterComponent());
    });
});