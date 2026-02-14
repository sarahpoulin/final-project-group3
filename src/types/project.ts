export interface ProjectApiResponse {
  id: string;
  title: string;
  description: string | null;
  tags?: string[];
  featured: boolean;
  imageUrl: string | null;
  imagePublicId: string | null;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  /** When true, date was set as month+year only (no day); display "Month Year" and show indicator */
  dateIsMonthOnly?: boolean | null;
}

