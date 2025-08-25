import { NextResponse } from "next/server";
import { getEnvironmentsByUser, saveEnvironment } from "@/lib/envService";

export async function GET(req) {
  const userId = req.headers.get("x-user-id"); 
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const envs = await getEnvironmentsByUser(userId);
  return NextResponse.json(envs);
}

export async function POST(req) {
  const userId = req.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { dbType, envA, envB } = await req.json();
     // Save Env A
    await saveEnvironment({ dbType, ...envA }, userId);
    // Save Env B
    await saveEnvironment({ dbType, ...envB }, userId);
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to save environment", details: err.message },
      { status: 500 }
    );
  }
}