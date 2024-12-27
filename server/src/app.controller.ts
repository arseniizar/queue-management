import {Controller, Get} from '@nestjs/common';
import {DatabaseService} from "@/database/database.service";
import {SkipThrottle} from "@nestjs/throttler";

@SkipThrottle()
@Controller()
export class AppController {
    constructor(private readonly databaseService: DatabaseService) {
    }

    @Get('/health-check')
    async healthCheck(): Promise<{ status: string; database: string }> {
        const dbStatus = await this.databaseService.isConnected()
            ? 'Connected'
            : 'Disconnected';

        return {
            status: 'OK',
            database: dbStatus,
        };
    }
}
