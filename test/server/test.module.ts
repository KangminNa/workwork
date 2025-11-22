import { TestController } from "./test.controller";

export const TestModule = {
  routes: [
    {
      method: "get",
      path: "/screen/test",
      controller: TestController,
      handler: "getTestScreen"
    }
  ]
};

export default TestModule;
