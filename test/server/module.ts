
import { Request, Response } from "express";

const TestModule = {
  routes: [
    {
      method: "get",
      path: "/screen/test",
      controller: class {
        async get(req: Request, res: Response) {
          return res.json({
            screenId: "test",
            mode: "PAGE",
            layout: { type: "WIDGET_SLOT", widgetId: "testWidget" },
            widgets: {
              testWidget: {
                type: "TestWidget",
                props: { message: "Hello Test Screen!" }
              }
            }
          });
        }
      },
      handler: "get"
    }
  ]
};

export default TestModule;
