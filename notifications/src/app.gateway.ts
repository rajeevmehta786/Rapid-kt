import { Logger } from "@nestjs/common";
import { OnGatewayConnection, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";

@WebSocketGateway(3004, { cors: true })
export class AppGateway implements OnGatewayConnection {
    @WebSocketServer()
    wss; // web socket to emit the data.

    private logger = new Logger('App Gateway');

    handleConnection() {
        this.logger.log('new client is connected');
        this.wss.emit('connection' , 'New client is connected');
    }
}