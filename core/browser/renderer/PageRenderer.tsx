import React from 'react';
import { PageModel } from '../../../common/shared/ui/PageModel';
import ComponentRenderer from './ComponentRenderer';
import './PageRenderer.css';

interface PageRendererProps {
  pageModel: PageModel;
}

const PageRenderer: React.FC<PageRendererProps> = ({ pageModel }) => {
  return (
    <div className={`page-container layout-${pageModel.layout || 'default'}`}>
      {/* Header */}
      {pageModel.header?.visible && (
        <header className="page-header">
          {pageModel.header.logo && (
            <div className="header-logo">
              {pageModel.header.logo.text && (
                <a href={pageModel.header.logo.link || '/'}>
                  {pageModel.header.logo.text}
                </a>
              )}
            </div>
          )}
          
          {pageModel.header.navigation && (
            <nav className="header-nav">
              {pageModel.header.navigation.map((item) => (
                <a key={item.id} href={item.link}>
                  {item.label}
                </a>
              ))}
            </nav>
          )}

          {pageModel.header.userInfo?.visible && (
            <div className="header-user">
              {pageModel.header.userInfo.avatar && (
                <img src={pageModel.header.userInfo.avatar} alt={pageModel.header.userInfo.name} />
              )}
              <span>{pageModel.header.userInfo.name}</span>
            </div>
          )}
        </header>
      )}

      {/* Body */}
      <main className="page-body">
        {pageModel.body.map((component) => (
          <ComponentRenderer
            key={component.id}
            component={component}
            actions={pageModel.actions}
          />
        ))}
      </main>

      {/* Footer */}
      {pageModel.footer?.visible && (
        <footer className="page-footer">
          {pageModel.footer.copyright && (
            <p className="footer-copyright">{pageModel.footer.copyright}</p>
          )}
          
          {pageModel.footer.linkGroups && (
            <div className="footer-links">
              {pageModel.footer.linkGroups.map((group, index) => (
                <div key={index} className="footer-link-group">
                  <h4>{group.title}</h4>
                  <ul>
                    {group.links.map((link) => (
                      <li key={link.id}>
                        <a href={link.url}>{link.label}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {pageModel.footer.socialLinks && (
            <div className="footer-social">
              {pageModel.footer.socialLinks.map((social, index) => (
                <a key={index} href={social.url} target="_blank" rel="noopener noreferrer">
                  {social.platform}
                </a>
              ))}
            </div>
          )}
        </footer>
      )}
    </div>
  );
};

export default PageRenderer;

