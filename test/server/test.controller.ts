import { Request, Response } from "express";

export class TestController {
  async getTestScreen(req: Request, res: Response) {
    return res.json({
      screenId: "test",
      mode: "PAGE",
      layout: {
        type: "WIDGET_SLOT",
        widgetId: "test-content"
      },
      widgets: {
        "test-content": {
          type: "Text",
          props: { text: "Hello Test Screen!" }
        }
      }
    });
  }
}
