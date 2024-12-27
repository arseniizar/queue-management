import {Injectable} from '@nestjs/common';
import {InjectConnection} from '@nestjs/mongoose';
import {Connection} from 'mongoose';

@Injectable()
export class DatabaseService {
    constructor(@InjectConnection() private readonly connection: Connection) {
    }

    async isConnected(): Promise<boolean> {
        const state = this.connection.readyState;
        return state === 1; // 1 = connected, per mongoose documentation
    }
}
