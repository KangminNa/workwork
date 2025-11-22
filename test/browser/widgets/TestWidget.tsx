
import React from "react";

interface TestWidgetProps {
  props: {
    message: string;
  };
}

export const TestWidget: React.FC<TestWidgetProps> = ({ props }) => {
  return (
    <div style={{ padding: 20, fontSize: 24, color: "#4A4" }}>
      {props.message}
    </div>
  );
};
