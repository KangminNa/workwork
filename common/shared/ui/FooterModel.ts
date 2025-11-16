/**
 * Footer Model
 */

export interface FooterModel {
  visible: boolean;
  copyright?: string;
  linkGroups?: Array<{
    title: string;
    links: Array<{
      id: string;
      label: string;
      url: string;
    }>;
  }>;
  socialLinks?: Array<{
    platform: string;
    url: string;
  }>;
  style?: string;
}

