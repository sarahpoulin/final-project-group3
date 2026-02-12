import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAdmin } from "@/lib/auth-guards";
import { deleteImage, replaceProjectImage } from "@/lib/cloudinary";

export const runtime = "nodejs";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

type RouteParams = {
  params: Promise<{ id: string }>;
};

/** Public: no authentication required. Returns a single project by id or 404. */
export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("Failed to fetch project", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 },
    );
  }
}

/**
 * Admin only. Accepts multipart/form-data with optional fields:
 * title, description, category (strings), featured ("true"/"false"),
 * image (File), removeImage ("true" to remove image without replacement).
 * Returns the full updated project object on success.
 */
export async function PATCH(req: Request, { params }: RouteParams) {
  const { id } = await params;
  const adminResult = await verifyAdmin(req, { params });
  if (!adminResult.ok) {
    return adminResult.response;
  }

  try {
    const existing = await prisma.project.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 },
      );
    }

    const formData = await req.formData();
    const title = formData.get("title");
    const description = formData.get("description");
    const category = formData.get("category");
    const featured = formData.get("featured");
    const image = formData.get("image");
    const removeImage = formData.get("removeImage");

    let imageUrl: string | null = existing.imageUrl;
    let imagePublicId: string | null = existing.imagePublicId;

    if (removeImage === "true" && existing.imagePublicId) {
      try {
        await deleteImage(existing.imagePublicId);
      } catch (error) {
        console.error("Failed to delete project image in Cloudinary", error);
      }
      imageUrl = null;
      imagePublicId = null;
    }

    if (image instanceof File && image.size > 0) {
      if (!ALLOWED_IMAGE_TYPES.has(image.type)) {
        return NextResponse.json(
          {
            error:
              "Invalid image type. Allowed: image/jpeg, image/jpg, image/png, image/webp, image/gif",
          },
          { status: 400 },
        );
      }
      if (image.size > MAX_IMAGE_SIZE_BYTES) {
        return NextResponse.json(
          { error: "Image file is too large (max 10MB)" },
          { status: 400 },
        );
      }

      const buffer = Buffer.from(await image.arrayBuffer());
      const uploaded = await replaceProjectImage(existing.imagePublicId, buffer);
      imageUrl = uploaded.secureUrl;
      imagePublicId = uploaded.publicId;
    }

    const updated = await prisma.project.update({
      where: { id },
      data: {
        title:
          typeof title === "string" && title.trim().length > 0
            ? title.trim()
            : existing.title,
        description:
          typeof description === "string"
            ? (description.trim() || null)
            : existing.description,
        category:
          typeof category === "string"
            ? (category.trim() || null)
            : existing.category,
        featured:
          typeof featured === "string"
            ? featured === "true"
            : existing.featured,
        imageUrl,
        imagePublicId,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update project", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 },
    );
  }
}

/**
 * Admin only. Deletes the project and its Cloudinary image (if any).
 * Process: verify admin → fetch project → 404 if not found → delete image from Cloudinary (best effort) → delete project → return success.
 */
export async function DELETE(req: Request, { params }: RouteParams) {
  const { id } = await params;
  const adminResult = await verifyAdmin(req, { params });
  if (!adminResult.ok) {
    return adminResult.response;
  }

  try {
    const existing = await prisma.project.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 },
      );
    }

    if (existing.imagePublicId) {
      try {
        await deleteImage(existing.imagePublicId);
      } catch (error) {
        console.error("Failed to delete project image in Cloudinary", error);
      }
    }

    await prisma.project.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete project", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 },
    );
  }
}

