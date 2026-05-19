import { NextResponse } from "next/server";
import { getSnapshot } from "@/lib/db-service";

export async function GET() {
  try {
    const snapshot = await getSnapshot();
    return NextResponse.json(snapshot);
  } catch (error) {
    return NextResponse.json(
      { error: "Falha ao carregar snapshot.", detail: String(error) },
      { status: 500 },
    );
  }
}
