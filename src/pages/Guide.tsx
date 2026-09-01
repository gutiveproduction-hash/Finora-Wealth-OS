import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Target,
  TrendingUp,
  LineChart,
  PiggyBank,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const SECTIONS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: LayoutDashboard,
    title: "Dashboard",
    body: "Ringkasan finansial harian: saldo, pemasukan/pengeluaran bulan berjalan, rasio tabungan, skor Status Keuangan, arus kas, rincian pengeluaran, tagihan mendatang, dan progres target tabungan. Gunakan tombol Quick Spend untuk mencatat pengeluaran tanpa pindah halaman, dan toggle Bulan Lalu/Bulan Ini untuk membandingkan periode.",
  },
  {
    icon: ArrowLeftRight,
    title: "Tambah Transaksi & Riwayat Transaksi",
    body: "\"Tambah Transaksi\" langsung membuka form catat transaksi baru. \"Riwayat Transaksi\" menampilkan semua transaksi yang tercatat, bisa difilter per akun, jenis, atau dicari lewat catatan. Mendukung impor massal dari file CSV bank/e-wallet kamu.",
  },
  {
    icon: Wallet,
    title: "Daftar Akun",
    body: "Kelola rekening bank, e-wallet, uang tunai, sampai kartu kredit. Setiap akun punya mata uang sendiri — saldo otomatis dikonversi ke mata uang utama saat dihitung total kekayaan.",
  },
  {
    icon: Target,
    title: "Target & Tagihan",
    body: "Buat target tabungan (Dana Darurat, liburan, dsb.) dan pantau progresnya. Tambahkan pengingat tagihan rutin atau kartu kredit supaya nggak telat bayar — tagihan yang ditandai \"berulang\" otomatis maju ke bulan berikutnya setelah dilunasi.",
  },
  {
    icon: TrendingUp,
    title: "Portofolio Investasi",
    body: "Catat saham, reksadana, kripto, obligasi, sampai properti. Update harga terbaru secara manual untuk melihat gain/loss dan alokasi portofolio — aplikasi ini offline-first dan tidak mengambil harga pasar otomatis dari internet.",
  },
  {
    icon: LineChart,
    title: "Laporan Keuangan",
    body: "Tren kekayaan bersih dari waktu ke waktu, struktur aset vs liabilitas, serta alokasi portofolio berdasarkan kelas aset. Catat snapshot kekayaan bersih secara berkala untuk membangun riwayat jangka panjang.",
  },
  {
    icon: PiggyBank,
    title: "Budgeting & Prediksi",
    body: "Tetapkan anggaran bulanan per kategori dan bandingkan dengan realisasi pengeluaran. Dashboard memakai rata-rata pengeluaran historismu untuk memperkirakan runway dana darurat.",
  },
  {
    icon: Sparkles,
    title: "FlowAI Config",
    body: "Atur ambang batas yang dipakai kartu \"AI Insight\" di Dashboard — ini mesin heuristik lokal berbasis data transaksimu sendiri, bukan model AI yang memanggil server eksternal.",
  },
  {
    icon: ShieldCheck,
    title: "Privasi & Data",
    body: "Tombol mata di pojok kanan atas menyembunyikan semua angka finansial dari layar (berguna saat screen-share). Semua data disimpan lokal di database SQLite di perangkatmu — ekspor/impor backup tersedia di halaman Pengaturan.",
  },
];

export default function Guide() {
  return (
    <div className="max-w-3xl space-y-4">
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        Panduan singkat fitur-fitur Finora, per menu di sidebar.
      </p>
      {SECTIONS.map(({ icon: Icon, title, body }) => (
        <div key={title} className="card p-5 flex gap-3">
          <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 h-fit shrink-0">
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{title}</h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">{body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
