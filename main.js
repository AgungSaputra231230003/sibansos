// main.js
class SiteHeader extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <header class="bg-white shadow-sm py-3 px-4 md:px-8 flex flex-col md:flex-row items-center justify-between border-b-4 border-blue-500">
                <div class="flex items-center gap-3">
                    <div class="bg-blue-600 text-white w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xl">📋</div>
                    <div>
                        <h1 class="text-xl font-bold text-gray-800">SIBANSOS <span class="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full ml-2">CRUD</span></h1>
                        <small class="text-xs text-gray-500">Pencatatan Bansos Digital • MySQL</small>
                    </div>
                </div>
                <nav class="my-3 md:my-0">
                    <a href="index.html" class="text-gray-600 hover:text-blue-600 font-medium px-3 py-2 transition-all">Dashboard</a>
                    <a href="upload.html" class="text-gray-600 hover:text-blue-600 font-medium px-3 py-2 transition-all">Upload Excel</a>
                </nav>
                <div class="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full">
                    <span>👤 Admin Desa</span>
                </div>
            </header>
        `;
    }
}

class SiteFooter extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <footer class="bg-white border-t border-gray-200 py-6 px-4 mt-auto">
                <div class="container mx-auto max-w-6xl flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
                    <div>© 2024 SIBANSOS - CRUD Bantuan Sosial</div>
                    <div class="flex gap-6 mt-3 md:mt-0">
                        <a href="#" class="hover:text-blue-600">📖 Panduan</a>
                        <a href="#" class="hover:text-blue-600">🔒 Privasi</a>
                        <a href="#" class="hover:text-blue-600">🆘 Bantuan</a>
                    </div>
                </div>
            </footer>
        `;
    }
}

customElements.define('site-header', SiteHeader);
customElements.define('site-footer', SiteFooter);