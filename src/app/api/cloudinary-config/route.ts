import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guards";
import {
  DEFAULT_PROJECTS_FOLDER,
  generateProjectFolder,
  getSignedUploadParams,
} from "@/lib/cloudinary";

export const runtime = "nodejs";

/**
 * Derive a Cloudinary folder path from a project's createdAt, for legacy projects
 * that have no cloudinaryFolder stored.
 */
function folderFromCreatedAt(createdAt: Date): string {
  const d = new Date(createdAt);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  const s = String(d.getSeconds()).padStart(2, "0");
  return `${DEFAULT_PROJECTS_FOLDER}/${y}${m}${day}-${h}${min}${s}`;
}

/**
 * GET /api/cloudinary-config
 *
 * Admin-only. Returns signed upload parameters for client-side uploads. The
 * browser uploads directly to Cloudinary with these params (and the file), so
 * the progress bar reflects real upload progress. Only your server can
 * generate valid signatures.
 *
 * Query params:
 * - projectId (optional): When editing an existing project, pass its ID so images
 *   are uploaded to that project's Cloudinary folder. Omit for new projects.
 */
export async function GET(req: NextRequest) {
  const adminResult = await requireAdmin();
  if (!adminResult.ok) {
    return adminResult.response;
  }

  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    let folder: string;

    if (projectId) {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { cloudinaryFolder: true, createdAt: true },
      });
      if (project?.cloudinaryFolder) {
        folder = project.cloudinaryFolder;
      } else if (project) {
        folder = folderFromCreatedAt(project.createdAt);
      } else {
        folder = generateProjectFolder();
      }
    } else {
      folder = generateProjectFolder();
    }

    const params = getSignedUploadParams(folder);
    return NextResponse.json(params);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Cloudinary not configured";
    return NextResponse.json(
      { error: message },
      { status: 503 },
    );
  }
}
