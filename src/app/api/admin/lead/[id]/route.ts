import { NextResponse } from "next/server";
import { hasValidSession } from "@/lib/admin/auth";
import { getLead } from "@/lib/admin/data";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await hasValidSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const detail = await getLead(id);
    return NextResponse.json(detail);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
