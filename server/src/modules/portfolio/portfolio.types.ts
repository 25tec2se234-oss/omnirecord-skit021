import { PortfolioTemplate, PortfolioVisibility } from '@prisma/client';

export interface PortfolioSettingsDTO {
  template: PortfolioTemplate;
  visibility: PortfolioVisibility;
  headline?: string | null;
  bio?: string | null;
  customSlug?: string | null;
}

export type UpdatePortfolioSettingsInput = PortfolioSettingsDTO;

export interface UpdateCredentialsDTO {
  credentialIds: string[];
}

export interface EligibleCredentialItem {
  id: string;
  recordNumber: string;
  title: string;
  category: string;
  participationDate: string | Date;
  achievementLevel: string;
  certificateRef: string | null;
  description: string;
  departmentName?: string;
  verificationStatus: 'VERIFIED';
  isVerified: boolean;
  isSelected: boolean;
  displayOrder: number;
}

export interface PublicCredentialItem {
  id: string;
  recordNumber: string;
  title: string;
  category: string;
  participationDate: string | Date;
  achievementLevel: string;
  certificateRef: string | null;
  description: string;
  departmentName: string;
  issuer: string;
  isVerified: true;
  verificationBadge: string;
}

export interface PublicPortfolioResponse {
  student: {
    studentId: string;
    name: string;
    program: string;
    year: string;
    departmentName: string;
    avatar: string | null;
    headline: string | null;
    bio: string | null;
  };
  institution: {
    name: string;
    shortName: string;
    code: string;
    accreditation: string | null;
  };
  portfolio: {
    template: PortfolioTemplate;
    visibility: 'PUBLIC';
    publishedAt: Date | null;
    updatedAt: Date;
  };
  credentials: PublicCredentialItem[];
  canonicalUrl?: string;
}
