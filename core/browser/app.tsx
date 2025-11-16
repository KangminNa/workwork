/**
 * Core Browser App
 * 모든 페이지를 렌더링하는 중앙 브라우저 애플리케이션
 * 비즈니스 모듈은 순수 .ts만 제공하고, UI는 core가 완전히 통제
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { PageModel } from '../../common/shared/ui/PageModel';
import { pageRouter, actionResolver } from './index';
import PageRenderer from './renderer/PageRenderer';
import './styles/main.css';

interface AppState {
  pageModel: PageModel | null;
  loading: boolean;
  error: string | null;
}

class App extends React.Component<{}, AppState> {
  private unsubscribePageChange?: () => void;

  constructor(props: {}) {
    super(props);
    this.state = {
      pageModel: null,
      loading: true,
      error: null,
    };
  }

  componentDidMount() {
    this.initializeApp();
  }

  componentWillUnmount() {
    if (this.unsubscribePageChange) {
      this.unsubscribePageChange();
    }
  }

  private async initializeApp() {
    try {
      // 라우트 등록 (모든 비즈니스 모듈의 페이지)
      this.registerRoutes();

      // 페이지 변경 구독
      this.unsubscribePageChange = pageRouter.onPageChange((page) => {
        console.log('[Core App] Page changed:', page.id);
        this.setState({
          pageModel: page,
          loading: false,
          error: null,
        });
      });

      // 현재 경로에 맞는 페이지 로드
      await this.loadCurrentPage();
    } catch (error) {
      console.error('[Core App] Initialization error:', error);
      this.setState({
        loading: false,
        error: 'Failed to initialize application',
      });
    }
  }

  private registerRoutes() {
    // 모든 비즈니스 모듈의 라우트를 여기서 등록
    pageRouter.registerRoutes({
      '/': '/pages/login',      // 기본 페이지를 로그인으로
      '/login': '/pages/login',
      '/dashboard': '/pages/dashboard',
      '/schedule': '/pages/schedule',
    });

    console.log('[Core App] Routes registered:', pageRouter.getRegisteredRoutes());
  }

  private async loadCurrentPage() {
    const path = window.location.pathname || '/login';
    console.log('[Core App] Loading page:', path);
    
    try {
      await pageRouter.navigateTo(path, false);
    } catch (error) {
      console.error('[Core App] Failed to load page:', error);
      this.setState({
        loading: false,
        error: 'Failed to load page',
      });
    }
  }

  private handleRetry = () => {
    this.setState({ loading: true, error: null });
    this.loadCurrentPage();
  };

  render() {
    const { pageModel, loading, error } = this.state;

    if (loading) {
      return (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      );
    }

    if (error || !pageModel) {
      return (
        <div className="error-container">
          <h1>Error</h1>
          <p>{error || 'Page not found'}</p>
          <button onClick={this.handleRetry}>Retry</button>
        </div>
      );
    }

    return <PageRenderer pageModel={pageModel} />;
  }
}

// React 앱 마운트
const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

