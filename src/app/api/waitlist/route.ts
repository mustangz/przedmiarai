import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Invalid email" },
        { status: 400 }
      );
    }

    // Log for now - Supabase integration later
    console.log(`[WAITLIST] New signup: ${email} at ${new Date().toISOString()}`);

    // TODO: Save to Supabase
    // const { error } = await supabase
    //   .from('waitlist')
    //   .insert({ email, created_at: new Date().toISOString() });

    return NextResponse.json(
      { success: true, message: "Added to waitlist" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[WAITLIST] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
