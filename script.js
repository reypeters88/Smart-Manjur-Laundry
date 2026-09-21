const fs = require('fs');
let html = fs.readFileSync('g:/My Drive/Apiksi/Projek 2/index.html', 'utf8');

const target =     function renderCariPelanggan() {
        if(!cpListContainer) return;
        cpListContainer.innerHTML = '';;

const newCode =     window.renderKelolaPelanggan = function() {
        const title = document.getElementById('kelola-pelanggan-title');
        if(title) title.innerText = 'Pelanggan (' + globalCustomers.length + ')';
        
        const listContainer = document.getElementById('kelola-pelanggan-list');
        if(!listContainer) return;
        
        listContainer.innerHTML = '';
        if(globalCustomers.length === 0) {
            listContainer.innerHTML = '<div style="padding:20px; text-align:center; color:#94a3b8;">Belum ada pelanggan</div>';
            return;
        }

        const colors = ['#f59e0b', '#f97316', '#3b82f6', '#10b981', '#8b5cf6'];
        globalCustomers.forEach((cust, idx) => {
            const initial = cust.nama.substring(0, 2).charAt(0).toUpperCase() + (cust.nama.substring(1, 2) || '');
            const phone = cust.hp || 'Tanpa nomor';
            const color = colors[idx % colors.length];
            listContainer.innerHTML += `
                <div class="kp-list-item">
                    <div class="kp-avatar" style="background: ${color};"><div style="display:flex; justify-content:center; width:100%; height:100%; align-items:center;">${initial}</div></div>
                    <div class="kp-info">
                        <div class="kp-name">${cust.nama}</div>
                        <div class="kp-phone">${phone}</div>
                    </div>
                    <div class="kp-action">
                        <i class="fa-solid fa-chevron-right"></i>
                    </div>
                </div>
            `;
        });
    };

    function renderCariPelanggan() {
        if(typeof window.renderKelolaPelanggan === 'function') window.renderKelolaPelanggan();
        if(!cpListContainer) return;
        cpListContainer.innerHTML = '';;

html = html.replace(target, newCode);
fs.writeFileSync('g:/My Drive/Apiksi/Projek 2/index.html', html, 'utf8');
