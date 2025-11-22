import React from "react";

type TextProps = { props?: { text?: string }; data?: unknown };

export const Text: React.FC<TextProps> = ({ props }) => {
  return <div>{props?.text ?? ""}</div>;
};
