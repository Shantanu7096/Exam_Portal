import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data: files, error } = await supabase.storage
      .from("study-materials")
      .list("", {
        limit: 100,
        sortBy: { column: "created_at", order: "desc" },
      });

    if (error) {
      console.error("Storage list error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const materials = (files || []).map((file) => {
      const { data } = supabase.storage
        .from("study-materials")
        .getPublicUrl(file.name);

      const sizeInMB = file.metadata?.size
        ? (file.metadata.size / (1024 * 1024)).toFixed(2) + " MB"
        : "Unknown size";

      // Detect category from filename
      let category = "Reference Notes";
      const lower = file.name.toLowerCase();
      if (lower.includes("book") || lower.includes("textbook")) {
        category = "Reference Book";
      } else if (lower.includes("question") || lower.includes("bank") || lower.includes("pyq")) {
        category = "Question Bank";
      } else if (lower.includes("formula") || lower.includes("sheet")) {
        category = "Formula Sheet";
      } else if (lower.includes("syllabus")) {
        category = "Syllabus Guide";
      }

      return {
        id: file.id || file.name,
        name: file.name,
        size: sizeInMB,
        createdAt: file.created_at,
        url: data.publicUrl,
        category,
      };
    });

    return NextResponse.json({ materials });
  } catch (err: any) {
    console.error("Fetch materials error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load study materials" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const category = (formData.get("category") as string) || "Reference Notes";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Sanitize filename
    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `${timestamp}_${cleanFileName}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const { data, error } = await supabase.storage
      .from("study-materials")
      .upload(storagePath, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: true,
      });

    if (error) {
      console.error("Storage upload error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: publicUrlData } = supabase.storage
      .from("study-materials")
      .getPublicUrl(storagePath);

    return NextResponse.json({
      success: true,
      material: {
        id: storagePath,
        name: file.name,
        storagePath,
        category,
        url: publicUrlData.publicUrl,
        size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
      },
    });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to upload study material" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fileName = searchParams.get("fileName");

    if (!fileName) {
      return NextResponse.json(
        { error: "File name is required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { error } = await supabase.storage
      .from("study-materials")
      .remove([fileName]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "File removed" });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to delete file" },
      { status: 500 }
    );
  }
}
