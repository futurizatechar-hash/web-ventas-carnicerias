"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Lock, User, ArrowRight, AlertCircle, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(false);

    // Mock Authentication Delay
    setTimeout(() => {
      // Mock validation
      if (username === "admin" && password === "admin") {
        router.push("/admin");
      } else {
        setError(true);
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-center items-center relative overflow-hidden selection:bg-black selection:text-white px-4">
      
      {/* Elementos de fondo decorativos sutiles */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-zinc-200/50 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-zinc-200/40 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-[400px] bg-white rounded-[2rem] p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-zinc-100 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Header del Login */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative w-32 h-14 bg-white flex items-center justify-center shrink-0 mb-6">
             <Image src="/logo.webp" alt="Logo" fill className="object-contain" priority />
          </div>
          <div className="flex items-center gap-2 text-zinc-400 mb-2">
            <ShieldCheck size={16} />
            <h2 className="text-xs font-bold uppercase tracking-widest text-center">Acceso Seguro</h2>
          </div>
          <h1 className="text-2xl font-black text-zinc-800 tracking-tight text-center">Panel de Gestión</h1>
        </div>

        {/* Formulario */}
        <form onSubmit={handleLogin} className="space-y-5">
          
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-semibold animate-in shake">
              <AlertCircle size={18} className="shrink-0" />
              <p>Credenciales incorrectas.</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Usuario" 
                disabled={isLoading}
                className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:border-black focus:bg-white focus:ring-1 focus:ring-black transition font-medium disabled:opacity-50"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña" 
                disabled={isLoading}
                className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:border-black focus:bg-white focus:ring-1 focus:ring-black transition font-medium disabled:opacity-50"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={!username || !password || isLoading}
            className="w-full flex items-center justify-center gap-2 bg-black text-white font-bold py-4 rounded-2xl hover:bg-zinc-800 transition-all active:scale-[0.98] shadow-lg shadow-black/10 disabled:opacity-50 disabled:active:scale-100 mt-2"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                Ingresar al Sistema
                <ArrowRight size={18} className="ml-1" />
              </>
            )}
          </button>
        </form>

        {/* Footer info (Para pruebas) */}
        <div className="mt-8 text-center bg-zinc-50 rounded-xl p-3 border border-zinc-100">
           <p className="text-[10px] text-zinc-400 font-medium">Uso interno exclusivo.</p>
           <p className="text-[10px] text-zinc-400 font-medium mt-1">Mock: u: <span className="font-bold">admin</span> / p: <span className="font-bold">admin</span></p>
        </div>

      </div>
    </div>
  );
}
