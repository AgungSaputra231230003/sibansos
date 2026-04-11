const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const XLSX = require('xlsx');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Konfigurasi Multer untuk upload file
const upload = multer({ 
    dest: 'uploads/',
    fileFilter: (req, file, cb) => {
        if (file.originalname.endsWith('.xlsx') || file.originalname.endsWith('.xls')) {
            cb(null, true);
        } else {
            cb(new Error('Hanya file Excel yang diperbolehkan!'));
        }
    }
});

// Buat folder uploads jika belum ada
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Konfigurasi Koneksi MySQL
// Konfigurasi Koneksi MySQL (Production Ready)
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sibansos_db',
    port: process.env.DB_PORT || 3306,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
});

// Connect ke MySQL
db.connect((err) => {
    if (err) {
        console.error('❌ Gagal konek ke MySQL:', err);
        console.log('💡 Pastikan MySQL sudah berjalan dan database "sibansos_db" sudah dibuat!');
        return;
    }
    console.log('✅ Terhubung ke MySQL database "sibansos_db"');
    
    // Buat tabel jika belum ada
    const createTableSQL = `
        CREATE TABLE IF NOT EXISTS penerima_bansos (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nik VARCHAR(20) NOT NULL,
            nama_lengkap VARCHAR(100) NOT NULL,
            alamat VARCHAR(255),
            jenis_bantuan VARCHAR(50),
            status VARCHAR(20) DEFAULT 'Pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_nik (nik)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;
    
    db.query(createTableSQL, (err) => {
        if (err) console.error('❌ Gagal membuat tabel:', err);
        else console.log('✅ Tabel "penerima_bansos" siap digunakan');
    });
});

// ============================================
// ========== API CRUD ENDPOINTS =============
// ============================================

// 1. CREATE - Tambah Data Baru
app.post('/api/penerima', (req, res) => {
    const { nik, nama_lengkap, alamat, jenis_bantuan, status } = req.body;
    
    if (!nik || !nama_lengkap) {
        return res.status(400).json({ error: 'NIK dan Nama Lengkap wajib diisi!' });
    }
    
    const sql = `
        INSERT INTO penerima_bansos (nik, nama_lengkap, alamat, jenis_bantuan, status) 
        VALUES (?, ?, ?, ?, ?)
    `;
    
    db.query(sql, [nik, nama_lengkap, alamat, jenis_bantuan, status || 'Pending'], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ error: 'NIK sudah terdaftar!' });
            }
            console.error('Error insert:', err);
            return res.status(500).json({ error: 'Gagal menambah data' });
        }
        res.json({ 
            success: true, 
            message: 'Data berhasil ditambahkan',
            id: result.insertId 
        });
    });
});

// 2. READ - Get All Data
app.get('/api/penerima', (req, res) => {
    const sql = 'SELECT * FROM penerima_bansos ORDER BY created_at DESC';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            return res.status(500).json({ error: 'Gagal mengambil data' });
        }
        res.json(results);
    });
});

// 3. READ - Get Single Data by ID
app.get('/api/penerima/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM penerima_bansos WHERE id = ?';
    
    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            return res.status(500).json({ error: 'Gagal mengambil data' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Data tidak ditemukan' });
        }
        res.json(results[0]);
    });
});

// 4. UPDATE - Edit Data
app.put('/api/penerima/:id', (req, res) => {
    const { id } = req.params;
    const { nik, nama_lengkap, alamat, jenis_bantuan, status } = req.body;
    
    if (!nik || !nama_lengkap) {
        return res.status(400).json({ error: 'NIK dan Nama Lengkap wajib diisi!' });
    }
    
    const sql = `
        UPDATE penerima_bansos 
        SET nik = ?, nama_lengkap = ?, alamat = ?, jenis_bantuan = ?, status = ?
        WHERE id = ?
    `;
    
    db.query(sql, [nik, nama_lengkap, alamat, jenis_bantuan, status, id], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ error: 'NIK sudah digunakan oleh data lain!' });
            }
            console.error('Error update:', err);
            return res.status(500).json({ error: 'Gagal mengupdate data' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Data tidak ditemukan' });
        }
        res.json({ success: true, message: 'Data berhasil diupdate' });
    });
});

// 5. DELETE - Hapus Data
app.delete('/api/penerima/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM penerima_bansos WHERE id = ?';
    
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error delete:', err);
            return res.status(500).json({ error: 'Gagal menghapus data' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Data tidak ditemukan' });
        }
        res.json({ success: true, message: 'Data berhasil dihapus' });
    });
});

// 6. Upload Excel (Import banyak data)
app.post('/api/upload-excel', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'File tidak ditemukan!' });
    }

    try {
        const workbook = XLSX.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        
        if (data.length === 0) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: 'File Excel kosong!' });
        }

        let inserted = 0;
        let duplicates = 0;
        let errors = 0;

        const insertPromises = data.map((row, index) => {
            return new Promise((resolve) => {
                const nik = row['NIK'] || row['nik'] || `TEMP${index}`;
                const nama = row['Nama Lengkap'] || row['nama'] || row['Nama'] || 'Tanpa Nama';
                const alamat = row['Alamat'] || row['alamat'] || row['Desa'] || '';
                const bantuan = row['Jenis Bantuan'] || row['bantuan'] || 'BLT';
                const status = row['Status'] || row['status'] || 'Pending';

                const sql = `
                    INSERT INTO penerima_bansos (nik, nama_lengkap, alamat, jenis_bantuan, status) 
                    VALUES (?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE 
                        nama_lengkap = VALUES(nama_lengkap),
                        alamat = VALUES(alamat),
                        jenis_bantuan = VALUES(jenis_bantuan),
                        status = VALUES(status)
                `;

                db.query(sql, [nik, nama, alamat, bantuan, status], (err, result) => {
                    if (err) {
                        console.error('Error insert:', err);
                        errors++;
                    } else {
                        if (result.affectedRows > 0) inserted++;
                        if (result.warningStatus === 1) duplicates++;
                    }
                    resolve();
                });
            });
        });

        Promise.all(insertPromises).then(() => {
            fs.unlinkSync(req.file.path);
            res.json({
                success: true,
                message: `Berhasil import ${inserted} data baru, ${duplicates} data diupdate, ${errors} error`,
                total: data.length,
                inserted,
                duplicates,
                errors
            });
        });

    } catch (error) {
        console.error('Error processing Excel:', error);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: 'Gagal memproses file Excel: ' + error.message });
    }
});

// 7. Get Statistics
app.get('/api/statistik', (req, res) => {
    const sql = `
        SELECT 
            COUNT(*) as total_kpm,
            SUM(CASE WHEN status = 'Tersalurkan' THEN 1 ELSE 0 END) as tersalurkan,
            SUM(CASE WHEN status IN ('Proses', 'Pending') THEN 1 ELSE 0 END) as pending,
            SUM(CASE WHEN status = 'Gagal' THEN 1 ELSE 0 END) as gagal
        FROM penerima_bansos
    `;
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching stats:', err);
            return res.status(500).json({ error: 'Gagal mengambil statistik' });
        }
        res.json(results[0]);
    });
});

// Start Server

app.listen(PORT, () => {
    console.log(`\n🚀 Server berjalan di port ${PORT}`);
    console.log(`📊 Upload Excel: http://localhost:${PORT}/upload.html`);
    console.log(`🏠 Dashboard CRUD: http://localhost:${PORT}/index.html\n`);
});