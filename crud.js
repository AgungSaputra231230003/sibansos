// crud.js - Logic CRUD Frontend

const API_URL = '/api/penerima';
let currentData = [];

// DOM Elements
const tableBody = document.getElementById('tableBody');
const modalForm = document.getElementById('modalForm');
const modalTitle = document.getElementById('modalTitle');
const formPenerima = document.getElementById('formPenerima');
const editId = document.getElementById('editId');
const nikInput = document.getElementById('nik');
const namaInput = document.getElementById('nama_lengkap');
const alamatInput = document.getElementById('alamat');
const bantuanSelect = document.getElementById('jenis_bantuan');
const statusSelect = document.getElementById('status');

// Buttons
const btnTambah = document.getElementById('btnTambah');
const closeModal = document.getElementById('closeModal');
const cancelModal = document.getElementById('cancelModal');
const refreshBtn = document.getElementById('refreshBtn');

// ========== FUNGSI UTAMA ==========

// Load semua data
async function loadData() {
    try {
        // Load statistik
        const statsRes = await fetch('/api/statistik');
        const stats = await statsRes.json();
        document.getElementById('totalKPM').textContent = stats.total_kpm || 0;
        document.getElementById('tersalurkan').textContent = stats.tersalurkan || 0;
        document.getElementById('pending').textContent = stats.pending || 0;
        document.getElementById('gagal').textContent = stats.gagal || 0;

        // Load data tabel
        const res = await fetch(API_URL);
        currentData = await res.json();
        renderTable(currentData);
    } catch (error) {
        console.error('Error loading data:', error);
        tableBody.innerHTML = `<tr><td colspan="7" class="py-8 text-center text-red-500">Gagal memuat data. Pastikan server berjalan.</td></tr>`;
    }
}

// Render tabel
function renderTable(data) {
    if (data.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" class="py-8 text-center text-gray-500">Belum ada data. Klik "Tambah Data" untuk menambahkan.</td></tr>`;
        return;
    }

    const statusColors = {
        'Tersalurkan': 'bg-green-100 text-green-800',
        'Proses': 'bg-yellow-100 text-yellow-800',
        'Pending': 'bg-gray-100 text-gray-800',
        'Gagal': 'bg-red-100 text-red-800'
    };

    tableBody.innerHTML = data.map((item, index) => {
        const statusColor = statusColors[item.status] || 'bg-gray-100 text-gray-800';
        return `
            <tr class="hover:bg-gray-50">
                <td class="py-4 pr-2">${index + 1}</td>
                <td class="py-4 pr-4 font-mono text-sm">${item.nik || '-'}</td>
                <td class="py-4 pr-4 font-medium">${item.nama_lengkap || '-'}</td>
                <td class="py-4 pr-4">${item.alamat || '-'}</td>
                <td class="py-4 pr-4">${item.jenis_bantuan || '-'}</td>
                <td class="py-4 pr-4">
                    <span class="text-xs font-semibold px-3 py-1 rounded-full ${statusColor}">${item.status || 'Pending'}</span>
                </td>
                <td class="py-4">
                    <div class="flex gap-2">
                        <button onclick="editData(${item.id})" class="text-blue-600 hover:text-blue-800 font-medium text-sm">✏️ Edit</button>
                        <button onclick="deleteData(${item.id})" class="text-red-600 hover:text-red-800 font-medium text-sm">🗑️ Hapus</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// ========== MODAL FUNCTIONS ==========

function openModal(title = 'Tambah Data Penerima') {
    modalTitle.textContent = title;
    modalForm.classList.add('show');
}

function closeModalFunc() {
    modalForm.classList.remove('show');
    formPenerima.reset();
    editId.value = '';
}

// ========== CRUD OPERATIONS ==========

// Save (Create / Update)
formPenerima.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = editId.value;
    const data = {
        nik: nikInput.value.trim(),
        nama_lengkap: namaInput.value.trim(),
        alamat: alamatInput.value.trim(),
        jenis_bantuan: bantuanSelect.value,
        status: statusSelect.value
    };
    
    const url = id ? `${API_URL}/${id}` : API_URL;
    const method = id ? 'PUT' : 'POST';
    
    try {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await res.json();
        
        if (res.ok) {
            alert(result.message || 'Data berhasil disimpan!');
            closeModalFunc();
            loadData();
        } else {
            alert('Error: ' + (result.error || 'Gagal menyimpan data'));
        }
    } catch (error) {
        console.error('Error saving data:', error);
        alert('Gagal menyimpan data. Periksa koneksi.');
    }
});

// Edit Data
async function editData(id) {
    try {
        const res = await fetch(`${API_URL}/${id}`);
        const data = await res.json();
        
        editId.value = data.id;
        nikInput.value = data.nik;
        namaInput.value = data.nama_lengkap;
        alamatInput.value = data.alamat || '';
        bantuanSelect.value = data.jenis_bantuan || '';
        statusSelect.value = data.status || 'Pending';
        
        openModal('Edit Data Penerima');
    } catch (error) {
        console.error('Error fetching data:', error);
        alert('Gagal mengambil data untuk diedit');
    }
}

// Delete Data
async function deleteData(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) return;
    
    try {
        const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        const result = await res.json();
        
        if (res.ok) {
            alert('Data berhasil dihapus!');
            loadData();
        } else {
            alert('Error: ' + (result.error || 'Gagal menghapus data'));
        }
    } catch (error) {
        console.error('Error deleting data:', error);
        alert('Gagal menghapus data. Periksa koneksi.');
    }
}

// ========== EVENT LISTENERS ==========

btnTambah.addEventListener('click', () => openModal('Tambah Data Penerima'));
closeModal.addEventListener('click', closeModalFunc);
cancelModal.addEventListener('click', closeModalFunc);
refreshBtn.addEventListener('click', loadData);

// Close modal when clicking outside
modalForm.addEventListener('click', (e) => {
    if (e.target === modalForm) closeModalFunc();
});

// ========== INIT ==========
loadData();

// Make functions globally available for onclick handlers
window.editData = editData;
window.deleteData = deleteData;