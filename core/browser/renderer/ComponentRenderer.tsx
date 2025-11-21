import React, { useState, useCallback, useMemo, useContext } from 'react';
import { UIComponent } from '../../../common/shared/ui/UIComponent';
import { actionResolver } from '../index';
import './ComponentRenderer.css';

interface ComponentRendererProps {
  component: UIComponent;
  actions?: Record<string, any>;
}

interface FormContextValue {
  formData: Record<string, any>;
  setFieldValue: (component: UIComponent, value: any) => void;
  validateField: (component: UIComponent) => string | null;
  validationErrors: Record<string, string | null>;
  loading: boolean;
}

const FormContext = React.createContext<FormContextValue | null>(null);

const ComponentRenderer: React.FC<ComponentRendererProps> = ({ component, actions }) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const parentFormContext = useContext(FormContext);

  const evaluateValidationRules = useCallback((comp: UIComponent, value: any): string | null => {
    if (!comp.validation || comp.validation.length === 0) {
      return null;
    }

    for (const rule of comp.validation) {
      switch (rule.type) {
        case 'required':
          if (value === undefined || value === null || String(value).trim() === '') {
            return rule.message;
          }
          break;
        case 'email':
          if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) {
            return rule.message;
          }
          break;
        case 'minLength':
          if (value && String(value).length < (rule.value || 0)) {
            return rule.message;
          }
          break;
        case 'maxLength':
          if (value && String(value).length > (rule.value || 0)) {
            return rule.message;
          }
          break;
        default:
          break;
      }
    }

    return null;
  }, []);

  const setFieldValue = useCallback((fieldComponent: UIComponent, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldComponent.id]: value }));

    if (fieldComponent.validation?.length) {
      const error = evaluateValidationRules(fieldComponent, value);
      setValidationErrors((prev) => ({ ...prev, [fieldComponent.id]: error }));
    } else {
      setValidationErrors((prev) => ({ ...prev, [fieldComponent.id]: null }));
    }
  }, [evaluateValidationRules]);

  const validateField = useCallback((fieldComponent: UIComponent) => {
    const value = formData[fieldComponent.id];
    const error = evaluateValidationRules(fieldComponent, value);
    setValidationErrors((prev) => ({ ...prev, [fieldComponent.id]: error }));
    return error;
  }, [evaluateValidationRules, formData]);

  const validateAllFields = useCallback(() => {
    if (!component.children) {
      return true;
    }

    let isValid = true;
    const errors: Record<string, string | null> = {};

    const traverse = (nodes: UIComponent[]) => {
      nodes.forEach((node) => {
        if (node.type === 'input' || node.type === 'select') {
          const value = formData[node.id];
          const error = evaluateValidationRules(node, value);
          errors[node.id] = error;
          if (error) {
            isValid = false;
          }
        }

        if (node.children && node.children.length > 0) {
          traverse(node.children);
        }
      });
    };

    traverse(component.children);
    setValidationErrors((prev) => ({ ...prev, ...errors }));

    return isValid;
  }, [component, formData, evaluateValidationRules]);

  const formContextValue = useMemo<FormContextValue | null>(() => {
    if (component.type !== 'form') {
      return null;
    }

    return {
      formData,
      setFieldValue,
      validateField,
      validationErrors,
      loading,
    };
  }, [component, formData, setFieldValue, validateField, validationErrors, loading]);

  const renderComponent = (comp: UIComponent): React.ReactNode => {
    const style = comp.style || {};
    const className = comp.className || '';

    switch (comp.type) {
      case 'container':
        return (
          <div id={comp.id} className={`component-container ${className}`} style={style}>
            {comp.children?.map((child) => (
              <ComponentRenderer key={child.id} component={child} actions={actions} />
            ))}
          </div>
        );

      case 'text': {
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
      }

      case 'form': {
        const submitIdentifier = comp.props?.onSubmitIdentifier;

        const handleSubmit = async (event: React.FormEvent) => {
          event.preventDefault();

          if (!submitIdentifier) {
            return;
          }

          setMessage(null);

          const isValid = validateAllFields();
          if (!isValid) {
            setMessage({ type: 'error', text: '필수 입력값을 확인해주세요.' });
            return;
          }

          try {
            setLoading(true);
            const result = await actionResolver.executeAction(submitIdentifier, formData);

            if (result.success) {
              setMessage({ type: 'success', text: result.message || '성공했습니다.' });
            } else {
              setMessage({ type: 'error', text: result.message || '요청에 실패했습니다.' });
            }
          } catch (error) {
            console.error('[ComponentRenderer] Submit error:', error);
            setMessage({ type: 'error', text: '요청을 처리하지 못했습니다.' });
          } finally {
            setLoading(false);
          }
        };

        const formBody = (
          <form id={comp.id} className={`component-form ${className}`} style={style} onSubmit={handleSubmit}>
            {comp.children?.map((child) => (
              <ComponentRenderer key={child.id} component={child} actions={actions} />
            ))}
            {message && <div className={`form-message ${message.type}`}>{message.text}</div>}
          </form>
        );

        if (!formContextValue) {
          return formBody;
        }

        return <FormContext.Provider value={formContextValue}>{formBody}</FormContext.Provider>;
      }

      case 'input': {
        const inputType = comp.props?.inputType || 'text';
        const autoFocus = comp.props?.autoFocus || false;
        const required = comp.validation?.some((v) => v.type === 'required') || false;
        const formContext = parentFormContext;
        const value = formContext?.formData[comp.id] ?? '';
        const error = formContext?.validationErrors[comp.id];

        return (
          <div className={`form-field ${error ? 'has-error' : ''} ${className}`} style={style}>
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
              value={value}
              onChange={(e) => formContext?.setFieldValue(comp, e.target.value)}
              onBlur={() => formContext?.validateField(comp)}
              required={required}
              disabled={formContext?.loading}
            />
            {error && <div className="validation-tooltip">{error}</div>}
          </div>
        );
      }

      case 'button': {
        const buttonText = comp.props?.text || 'Button';
        const buttonVariant = comp.props?.variant || 'default';
        const fullWidth = comp.props?.fullWidth || false;
        const htmlType = comp.props?.htmlType || 'button';
        const formContext = parentFormContext;
        const isSubmitting = formContext?.loading && htmlType === 'submit';

        return (
          <button
            id={comp.id}
            type={htmlType as 'button' | 'submit' | 'reset'}
            className={`component-button variant-${buttonVariant} ${fullWidth ? 'full-width' : ''} ${className}`}
            style={style}
            disabled={formContext?.loading}
            onClick={() => {
              if (comp.identifier && htmlType === 'button') {
                const payload = formContext?.formData || {};
                actionResolver.executeAction(comp.identifier, payload);
              }
            }}
          >
            {isSubmitting ? 'Loading...' : buttonText}
          </button>
        );
      }

      case 'select': {
        const options = comp.props?.options || [];
        const selectRequired = comp.validation?.some((v) => v.type === 'required') || false;
        const formContext = parentFormContext;
        const value = formContext?.formData[comp.id] ?? '';
        const error = formContext?.validationErrors[comp.id];

        return (
          <div className={`form-field ${error ? 'has-error' : ''} ${className}`} style={style}>
            {comp.label && (
              <label htmlFor={comp.id} className="field-label">
                {comp.label}
                {selectRequired && <span className="required">*</span>}
              </label>
            )}
            <select
              id={comp.id}
              className="component-select"
              value={value}
              onChange={(e) => formContext?.setFieldValue(comp, e.target.value)}
              onBlur={() => formContext?.validateField(comp)}
              required={selectRequired}
              disabled={formContext?.loading}
            >
              {comp.placeholder && <option value="">{comp.placeholder}</option>}
              {options.map((option: any) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {error && <div className="validation-tooltip">{error}</div>}
          </div>
        );
      }

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
