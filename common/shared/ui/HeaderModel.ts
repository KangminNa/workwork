/**
 * Header Model
 */

export interface HeaderModel {
  visible: boolean;
  logo?: {
    text?: string;
    link?: string;
    image?: string;
  };
  navigation?: Array<{
    id: string;
    label: string;
    link: string;
  }>;
  userInfo?: {
    visible: boolean;
    name?: string;
    email?: string;
    avatar?: string;
    menu?: Array<{
      id: string;
      label: string;
      link?: string;
      identifier?: string;
    }>;
  };
  style?: string;
}

