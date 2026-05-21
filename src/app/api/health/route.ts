import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Rota de setup: cria todas as tabelas via prisma db push (uso único)
export async function GET() {
  try {
    // Testa conexão básica
    await prisma.$executeRaw`SELECT 1`;
    return NextResponse.json({
      ok: true,
      message: "Banco conectado. Use prisma db push para criar tabelas.",
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
