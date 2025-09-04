import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const createPollSchema = z.object({
  question: z.string().min(5).max(300).trim(),
  options: z.array(z.string().min(1).max(100)).min(2).max(10),
});

export async function POST(req: Request) {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.user_metadata?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = createPollSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { question, options } = parsed.data;

    const { data, error } = await supabase
      .from("polls")
      .insert([{ question, options, created_by: user.id }])
      .select("id, question, options, created_at, created_by")
      .single();

    if (error) throw error;

    return NextResponse.json({ poll: data }, { status: 201 });
  } catch (err: any) {
    console.error("Admin Polls POST error:", err.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.user_metadata?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
  }

  try {
    const { data, error } = await supabase
      .from("polls")
      .select("id, question, options, created_at, created_by");

    if (error) throw error;

    return NextResponse.json({ polls: data }, { status: 200 });
  } catch (err: any) {
    console.error("Admin Polls GET error:", err.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}