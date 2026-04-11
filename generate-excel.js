const XLSX = require('xlsx');

// Data dummy untuk generate
const desaList = ['Cibubur', 'Ciangsana', 'Jatiasih', 'Jatikarya', 'Jatirangga', 'Jatisampurna'];
const rwList = ['01', '02', '03', '04', '05'];
const bantuanList = ['BLT Dana Desa', 'PKH', 'BPNT', 'BST', 'BLT BBM'];
const statusList = ['Tersalurkan', 'Proses', 'Pending', 'Tersalurkan', 'Tersalurkan', 'Proses'];
const namaDepan = ['Siti', 'Budi', 'Jajang', 'Rukmini', 'Ahmad', 'Siti', 'Maman', 'Ijah', 'Ujang', 'Neneng'];
const namaBelakang = ['Aminah', 'Santoso', 'Nurjaman', '', 'Hidayat', 'Rahayu', 'Suryana', 'Komariah', 'Sutisna', 'Maryati'];

const data = [];

for (let i = 1; i <= 200; i++) {
    const nik = '3276' + String(Math.floor(Math.random() * 1000000000000)).padStart(12, '0');
    const nama = namaDepan[Math.floor(Math.random() * namaDepan.length)] + ' ' + 
                 namaBelakang[Math.floor(Math.random() * namaBelakang.length)];
    const desa = desaList[Math.floor(Math.random() * desaList.length)];
    const rw = rwList[Math.floor(Math.random() * rwList.length)];
    const bantuan = bantuanList[Math.floor(Math.random() * bantuanList.length)];
    const status = statusList[Math.floor(Math.random() * statusList.length)];
    
    data.push({
        'NIK': nik,
        'Nama Lengkap': nama.trim(),
        'Alamat': `${desa} RW ${rw}`,
        'Jenis Bantuan': bantuan,
        'Status': status
    });
}

// Buat worksheet dan workbook
const ws = XLSX.utils.json_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Data Penerima');

// Save file
XLSX.writeFile(wb, 'sample-data.xlsx');
console.log('✅ File sample-data.xlsx berhasil dibuat dengan 200 data!');