/**
 * Page Store
 * PageModel 캐싱 및 상태 관리
 */

import { PageModel } from '../../../common/shared/ui/PageModel';

export interface CacheEntry {
  pageModel: PageModel;
  timestamp: number;
  ttl?: number; // Time to live in milliseconds
}

export class PageStore {
  private cache: Map<string, CacheEntry> = new Map();
  private currentPageId: string | null = null;
  private defaultTTL: number = 5 * 60 * 1000; // 5분

  /**
   * PageModel 저장
   */
  set(pageId: string, pageModel: PageModel, ttl?: number): void {
    this.cache.set(pageId, {
      pageModel,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    });
    this.currentPageId = pageId;
    console.log(`[PageStore] Cached: ${pageId}`);
  }

  /**
   * PageModel 가져오기
   */
  get(pageId: string): PageModel | null {
    const entry = this.cache.get(pageId);

    if (!entry) {
      return null;
    }

    // TTL 체크
    if (this.isExpired(entry)) {
      console.log(`[PageStore] Cache expired: ${pageId}`);
      this.cache.delete(pageId);
      return null;
    }

    return entry.pageModel;
  }

  /**
   * 현재 페이지 가져오기
   */
  getCurrentPage(): PageModel | null {
    if (!this.currentPageId) {
      return null;
    }
    return this.get(this.currentPageId);
  }

  /**
   * 현재 페이지 ID 설정
   */
  setCurrentPageId(pageId: string): void {
    this.currentPageId = pageId;
  }

  /**
   * 캐시 존재 여부 확인
   */
  has(pageId: string): boolean {
    const entry = this.cache.get(pageId);
    if (!entry) return false;
    if (this.isExpired(entry)) {
      this.cache.delete(pageId);
      return false;
    }
    return true;
  }

  /**
   * 특정 페이지 캐시 삭제
   */
  delete(pageId: string): void {
    this.cache.delete(pageId);
    console.log(`[PageStore] Deleted cache: ${pageId}`);
  }

  /**
   * 모든 캐시 삭제
   */
  clear(): void {
    this.cache.clear();
    this.currentPageId = null;
    console.log('[PageStore] Cleared all cache');
  }

  /**
   * 만료된 캐시 정리
   */
  cleanup(): void {
    const now = Date.now();
    let cleanedCount = 0;

    this.cache.forEach((entry, pageId) => {
      if (this.isExpired(entry)) {
        this.cache.delete(pageId);
        cleanedCount++;
      }
    });

    if (cleanedCount > 0) {
      console.log(`[PageStore] Cleaned up ${cleanedCount} expired cache entries`);
    }
  }

  /**
   * 캐시 만료 여부 확인
   */
  private isExpired(entry: CacheEntry): boolean {
    if (!entry.ttl) return false;
    return Date.now() - entry.timestamp > entry.ttl;
  }

  /**
   * 캐시 통계
   */
  getStats(): {
    totalEntries: number;
    currentPageId: string | null;
    entries: Array<{ pageId: string; age: number }>;
  } {
    const now = Date.now();
    const entries: Array<{ pageId: string; age: number }> = [];

    this.cache.forEach((entry, pageId) => {
      entries.push({
        pageId,
        age: now - entry.timestamp,
      });
    });

    return {
      totalEntries: this.cache.size,
      currentPageId: this.currentPageId,
      entries,
    };
  }

  /**
   * 기본 TTL 설정
   */
  setDefaultTTL(ttl: number): void {
    this.defaultTTL = ttl;
  }

  /**
   * 자동 정리 시작 (주기적으로 만료된 캐시 삭제)
   */
  startAutoCleanup(interval: number = 60000): () => void {
    const timer = setInterval(() => {
      this.cleanup();
    }, interval);

    return () => clearInterval(timer);
  }
}

// 싱글톤 인스턴스
export const pageStore = new PageStore();

// 자동 정리 시작 (1분마다)
pageStore.startAutoCleanup();

