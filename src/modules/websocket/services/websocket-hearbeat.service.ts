// websocket-heartbeat.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { WebSocketSessionManager } from './websocket-sesi-manager.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WebSocketHeartbeatService implements OnModuleInit, OnModuleDestroy {
  private interval: NodeJS.Timeout;

  constructor(
    private readonly manager: WebSocketSessionManager,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit(): void {
    this.interval = setInterval(() => {
      for (const socket of this.manager.getActiveSockets()) {
        if (socket.readyState !== 1) continue;

        if (!socket.isAlive) {
          socket.missedPongs++;
          if (socket.missedPongs >= this.configService.get('WS_MAX_MISSED_PONGS', 2)) {
            socket.close(1001, 'Heartbeat timeout');
            continue;
          }
        }

        socket.isAlive = false;
        socket.ping();
      }
    }, this.configService.get('WS_HEARTBEAT_INTERVAL', 30000)); // 30 detik
  }

  onModuleDestroy(): void {
    clearInterval(this.interval);
    for (const socket of this.manager.getActiveSockets()) {
      socket.terminate();
    }
  }
}