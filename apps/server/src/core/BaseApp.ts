import express, { Request, Response } from "express";
import http from "http";
import { Server } from "socket.io";
import { QueueProcessor } from "./queues/QueueProcessor";
import { Resolver } from "./Resolver";

export class BaseApp {
  private app = express();
  private server: http.Server;
  private io: Server;

  constructor() {
    this.app.use(express.json());
    this.server = http.createServer(this.app);
    this.io = new Server(this.server, { cors: { origin: "*" } });

    this.initializeHttp();
    this.initializeSocket();
    this.initializeWorker();
  }

  /** HTTP Request Handling */
  private initializeHttp() {
    this.app.all("/*", async (req: Request, res: Response) => {
      const path = req.path.replace(/^\//, "").toLowerCase();
      try {
        await Resolver.handle("http", path, { req, res });
      } catch (err) {
        if (!res.headersSent) {
          res.status(500).json({ success: false, message: (err as Error).message });
        }
      }
    });
  }

  /** WebSocket Event Handling */
  private initializeSocket() {
    this.io.on("connection", (socket) => {
      console.log(`🔌 Socket Connected: ${socket.id}`);

      socket.onAny(async (event, data) => {
        try {
          await Resolver.handle("topic", event.toLowerCase(), { socket, data, event });
        } catch (err) {
          socket.emit("error", (err as Error).message);
        }
      });
    });
  }

  /** BullMQ Worker Handling */
  private initializeWorker() {
    // Resolver가 Worker 요청을 처리하도록 리스너를 등록합니다.
    QueueProcessor.onJob(async (queue, jobName, data) => {
      // Worker Controller는 큐 이름과 작업 이름을 조합하여 찾을 수 있습니다.
      // 여기서는 간단하게 jobName을 path로 사용합니다.
      await Resolver.handle("worker", jobName.toLowerCase(), { message: data });
    });

    // 예시: 'notifications' 큐에 대한 Worker를 등록합니다.
    // 실제 애플리케이션에서는 등록할 큐 목록을 외부에서 받아오는 것이 좋습니다.
    QueueProcessor.register('notifications');
  }

  public start(port: number) {
    this.server.listen(port, () =>
      console.log(`🚀 Unified Server (HTTP + WS + Worker) on port ${port}`)
    );
  }
}
