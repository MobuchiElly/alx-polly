import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const updatePollSchema = z.object({
  question: z.string().min(5).max(300).trim().optional(),
  options: z.array(z.string().min(1).max(100)).min(2).max(10).optional(),
});

export async function PUT(req: Request, { params }: { params: { id: string } }) {
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
    const parsed = updatePollSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("polls")
      .update(parsed.data)
      .eq("id", params.id)
      .select("id, question, options, created_at, created_by")
      .single();

    if (error) throw error;

    return NextResponse.json({ poll: data }, { status: 200 });
  } catch (err: any) {
    console.error("Admin Polls PUT error:", err.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
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
    const { error } = await supabase.from("polls").delete().eq("id", params.id);

    if (error) throw error;

    return NextResponse.json(null, { status: 204 });
  } catch (err: any) {
    console.error("Admin Polls DELETE error:", err.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}