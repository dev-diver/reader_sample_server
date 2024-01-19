import express, { Application } from "express";
import { Server } from "socket.io";
import { createServer, Server as HTTPServer } from "http";
import path from "path";
import cors from "cors";
 
export class Server_ {
 private httpServer!: HTTPServer;
 private app: Application;
 private io: Server;
 
 private readonly DEFAULT_PORT = 5000;
 
 constructor() {
   this.initialize();
 
   this.handleRoutes();
   this.handleSocketConnection();
 }

  private initialize(): void {
    this.app = express();
    this.httpServer = createServer(this.app);
    this.io = new Server(this.httpServer, 
    { 
      cors: {
      origin: ['http://localhost:5000'],
      credentials: true,
      },
      path: '/api/socket.io',
  });

   this.configureApp();
 }
 
  private configureApp(): void {
    this.app.use(cors());
    this.app.use('/src', express.static("public"));
    this.app.use('/', express.static(path.join(__dirname, "../../client_reader_sample","build")));
  }

  private handleRoutes(): void {

    this.app.get("/", (req, res) => {
      res.sendFile(path.join(__dirname, "../../client_reader_sample","build","index.html")); 
    });
  }
 
 private handleSocketConnection(): void {
   this.io.on("connection", (socket) => {
      console.log(`socket 연결 ${socket.id}`);
      socket.on('disconnect', () => {
        console.log('클라이언트가 연결 해제되었습니다.');
      });
      socket.on('attention', (data) => {
        console.log(data);
        this.io.emit("attention", data);
      })
      socket.on("attention", data => { 
        socket.broadcast.emit(data) 
      });
   });
   
 }

 public listen(callback: (port: number) => void): void {
   this.httpServer.listen(this.DEFAULT_PORT, () =>
     callback(this.DEFAULT_PORT)
   );
 }
}