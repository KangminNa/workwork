import React, { useState } from 'react';
import { UIComponent } from '../../../common/shared/ui/UIComponent';
import { actionResolver } from '../index';
import './ComponentRenderer.css';

interface ComponentRendererProps {
  component: UIComponent;
  actions?: Record<string, any>;
}

const ComponentRenderer: React.FC<ComponentRendererProps> = ({ component, actions }) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleInputChange = (id: string, value: any) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent, identifier: string) => {
    e.preventDefault();
    
    setLoading(true);
    setMessage(null);

    try {
      // ActionResolver를 통해 액션 실행
      const result = await actionResolver.executeAction(identifier, formData);

      if (result.success) {
        setMessage({ type: 'success', text: result.message || 'Success!' });
        // 리다이렉션은 ActionResolver에서 자동 처리됨
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed' });
      }
    } catch (error) {
      console.error('[ComponentRenderer] Submit error:', error);
      setMessage({ type: 'error', text: 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const renderComponent = (comp: UIComponent): React.ReactNode => {
    const style = comp.style || {};
    const className = comp.className || '';

    switch (comp.type) {
      case 'container':
        return (
          <div
            id={comp.id}
            className={`component-container ${className}`}
            style={style}
          >
            {comp.children?.map((child) => (
              <ComponentRenderer key={child.id} component={child} actions={actions} />
            ))}
          </div>
        );

      case 'text':
        const textVariant = comp.props?.variant || 'p';
        const text = comp.props?.text || '';
        const align = comp.props?.align || 'left';
        
        return React.createElement(
          textVariant,
          {
            id: comp.id,
            className: `component-text ${className}`,
            style: { ...style, textAlign: align },
          },
          text
        );

      case 'form':
        return (
          <form
            id={comp.id}
            className={`component-form ${className}`}
            style={style}
            onSubmit={(e) => {
              const submitIdentifier = comp.props?.onSubmitIdentifier;
              if (submitIdentifier) {
                handleSubmit(e, submitIdentifier);
              }
            }}
          >
            {comp.children?.map((child) => (
              <ComponentRenderer key={child.id} component={child} actions={actions} />
            ))}
            {message && (
              <div className={`form-message ${message.type}`}>
                {message.text}
              </div>
            )}
          </form>
        );

      case 'input':
        const inputType = comp.props?.inputType || 'text';
        const autoFocus = comp.props?.autoFocus || false;
        const required = comp.validation?.some(v => v.type === 'required') || false;
        
        return (
          <div className={`form-field ${className}`} style={style}>
            {comp.label && (
              <label htmlFor={comp.id} className="field-label">
                {comp.label}
                {required && <span className="required">*</span>}
              </label>
            )}
            <input
              id={comp.id}
              type={inputType}
              placeholder={comp.placeholder}
              className="component-input"
              autoFocus={autoFocus}
              onChange={(e) => handleInputChange(comp.id, e.target.value)}
              required={required}
              disabled={loading}
            />
          </div>
        );

      case 'button':
        const buttonText = comp.props?.text || 'Button';
        const buttonVariant = comp.props?.variant || 'default';
        const fullWidth = comp.props?.fullWidth || false;
        const htmlType = comp.props?.htmlType || 'button';
        
        return (
          <button
            id={comp.id}
            type={htmlType as 'button' | 'submit' | 'reset'}
            className={`component-button variant-${buttonVariant} ${fullWidth ? 'full-width' : ''} ${className}`}
            style={style}
            disabled={loading}
            onClick={() => {
              if (comp.identifier && htmlType === 'button') {
                actionResolver.executeAction(comp.identifier, formData);
              }
            }}
          >
            {loading && htmlType === 'submit' ? 'Loading...' : buttonText}
          </button>
        );

      case 'select':
        const options = comp.props?.options || [];
        const selectRequired = comp.validation?.some(v => v.type === 'required') || false;
        
        return (
          <div className={`form-field ${className}`} style={style}>
            {comp.label && (
              <label htmlFor={comp.id} className="field-label">
                {comp.label}
                {selectRequired && <span className="required">*</span>}
              </label>
            )}
            <select
              id={comp.id}
              className="component-select"
              onChange={(e) => handleInputChange(comp.id, e.target.value)}
              required={selectRequired}
              disabled={loading}
            >
              {comp.placeholder && (
                <option value="">{comp.placeholder}</option>
              )}
              {options.map((option: any) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );

      default:
        return (
          <div className="component-unknown">
            Unknown component type: {comp.type}
          </div>
        );
    }
  };

  return <>{renderComponent(component)}</>;
};

export default ComponentRenderer;

