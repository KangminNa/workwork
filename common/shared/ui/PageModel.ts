/**
 * Page Model
 * 서버가 브라우저에 전달하는 페이지 구조
 */

import { UIComponent } from './UIComponent';
import { HeaderModel } from './HeaderModel';
import { FooterModel } from './FooterModel';

export interface PageModel {
  id: string;
  name: string;
  path: string;
  title: string;
  description?: string;
  layout?: 'default' | 'centered' | 'full';
  
  header?: HeaderModel;
  footer?: FooterModel;
  body: UIComponent[];
  
  actions?: Record<string, any>;
  initialData?: Record<string, any>;
  metadata?: Record<string, any>;
}

