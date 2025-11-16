/**
 * UI Component Interface
 * 모든 UI 컴포넌트의 기본 인터페이스
 */

export interface UIComponent {
  id: string;
  type: string;
  className?: string;
  style?: Record<string, any>;
  props?: Record<string, any>;
  children?: UIComponent[];
  label?: string;
  placeholder?: string;
  validation?: Array<{
    type: string;
    message: string;
  }>;
  identifier?: string;
}

