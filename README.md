# ChordFylan YouTube Playlists

Paket repository terpisah. Unggah ISI folder ini ke root repository publik `chordfylan-playlists`, termasuk `.github/workflows`. Jangan unggah folder `secrets` proyek utama.

1. Buat repository publik GitHub dengan branch `main`.
2. Unggah isi paket ini. Bila menggunakan web GitHub, pastikan kedua file workflow juga dibuat di `.github/workflows/`.
3. Settings > Secrets and variables > Actions > New repository secret: `YOUTUBE_API_KEY`.
4. Settings > Pages > Source: GitHub Actions.
5. Actions > Refresh YouTube playlists > Run workflow. Setelah selesai, Publish playlist data akan menerbitkan `public/`.
6. Buka URL GitHub Pages dan periksa empat kartu. Data awal harus dihasilkan oleh sync; tidak ada daftar lagu palsu/bawaan.
7. Ganti `GITHUB_USERNAME` pada seluruh file dalam `blogger/` dengan username Anda. Jika nama repository berbeda, sesuaikan juga `chordfylan-playlists`.
8. Tempel masing-masing HTML halaman ke editor mode HTML laman Blogger yang sesuai.
9. Sisipkan isi `blogger/widget-below-post.xml` sesudah isi postingan pada includable Blogger, di luar `.post-body` dan toolbar sticky. Jangan memasukkannya ke homepage/static pages. Integrasi template final dilakukan setelah URL Pages tersedia.

## Pengujian lokal dan pengisian data awal

Dari folder paket ini: `python scripts/sync.py`. API key diminta tersembunyi dan tidak disimpan. Hasil ada di `public/data/`. Script tidak memerlukan pip dependency tambahan.

## Perilaku

Tiga playlist RDCLAK hanya memakai halaman pertama API (maksimal 50 baris); video privat/dihapus dilewati sehingga jumlah tampil bisa kurang dari 50. Playlist Top 100 diambil hingga akhir, bukan dipaksa selalu berjumlah 100. Urutan sumber dipertahankan. Tiap file hanya diganti setelah sukses; kegagalan mempertahankan snapshot lama. Workflow tetap menyimpan playlist lain yang berhasil dan menandai run gagal untuk diperiksa.

Jadwal UTC `23 */6 * * *` (sekitar 02:23, 08:23, 14:23, 20:23 WITA); GitHub dapat menunda jadwal. Periksa Actions jika data tampak lama. Repository baru belum memiliki data sampai sinkronisasi pertama sukses.

Player YouTube dimuat ketika lagu dipilih, tidak menjamin semua video bisa diputar pada semua akun/jaringan. Setiap baris menyediakan tautan YouTube langsung.
