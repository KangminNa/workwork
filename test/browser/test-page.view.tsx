import React from "react";
import { TestScreenResponse } from "../shared/dto";

interface TestPageViewProps {
  screen: TestScreenResponse;
}

export const TestPageView: React.FC<TestPageViewProps> = ({ screen }) => {
  return <div>Screen loaded: {screen.screenId}</div>;
};
