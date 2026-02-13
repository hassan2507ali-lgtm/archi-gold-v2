🚀 ArchiGold Terminal v2
ArchiGold Terminal adalah dashboard analisis pasar terintegrasi yang membandingkan performa saham PT Archi Indonesia Tbk (ARCHI.JK) dengan Emas Global (GC=F) secara real-time. Proyek ini dibangun untuk mendemonstrasikan kemampuan korelasi data statistik dalam konteks pasar modal.

🛠️ Tech Stack
Framework: Next.js 14 (App Router)

Language: TypeScript (Strongly Typed)

Styling: Tailwind CSS

Visualization: Recharts (Composed & Area Charts)

Data Provider: Yahoo Finance API (via yahoo-finance2)

📈 Fitur Utama
1. Analisis Korelasi Pearson (r)

Mengimplementasikan algoritma Pearson Correlation Coefficient untuk mengukur kekuatan hubungan linier antara harga emas dunia dan saham ARCHI secara dinamis berdasarkan timeframe yang dipilih.

Tujuannya: Memberikan wawasan apakah pergerakan harga emas merupakan indikator utama bagi investor ARCHI.

2. Indikator Teknikal Terintegrasi

Dilengkapi dengan dua indikator utama untuk analisis momentum:

MACD (Moving Average Convergence Divergence): Untuk mendeteksi perubahan tren harga saham ARCHI.

RSI (Relative Strength Index): Untuk memantau kondisi overbought dan oversold pada pasar.

3. Arsitektur Data yang Tangguh (Hybrid Fallback)

Sebagai seorang IT Enterprise Architect, saya merancang sistem ini dengan mekanisme fallback otomatis. Jika API penyedia data mengalami kendala, sistem akan beralih ke data simulasi historis untuk menjaga fungsionalitas UI tetap berjalan stabil.

4. Visualisasi Rebased

Semua data dihitung ulang (rebasing) ke angka 0% pada awal periode yang dipilih, memungkinkan perbandingan performa "apple-to-apple" antara instrumen ekuitas dan komoditas.
