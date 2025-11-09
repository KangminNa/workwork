import React from 'react';

type ButtonProps = React.ComponentPropsWithoutRef<'button'>;

export const Button = ({ children, ...props }: ButtonProps) => {
  return <button {...props}>{children}</button>;
};
