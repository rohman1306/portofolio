import React from 'react';

export default function AdminPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-50 p-4">
      <div className="max-w-md w-full space-y-8 bg-zinc-900 p-8 rounded-xl border border-zinc-800 shadow-2xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Admin Panel
          </h2>
          <p className="mt-2 text-center text-sm text-zinc-400">
            Secure admin access area.
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <p className="text-center text-zinc-300">
            Halaman ini berada di route rahasia: <br/>
            <span className="font-mono text-emerald-400">/aadmin-k23hdnhsd</span>
          </p>
          {/* Tambahkan form login admin atau konten lainnya di sini */}
        </div>
      </div>
    </div>
  );
}
