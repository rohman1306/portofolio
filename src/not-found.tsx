export const dynamic = 'force-dynamic'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">404 - Halaman Tidak Ditemukan</h1>
      <p className="mt-2 text-gray-600">Halaman yang Anda cari tidak tersedia.</p>
    </div>
  )
}