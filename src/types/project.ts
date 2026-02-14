export interface ProjectApiResponse {
  id: string;
  title: string;
  description: string | null;
  tags?: string[];
  featured: boolean;
  imageUrl: string | null;
  imagePublicId: string | null;
  createdAt: string;
  updatedAt: string;
}

