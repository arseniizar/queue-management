import {Injectable, Logger} from '@nestjs/common';
import {InjectQueue} from '@nestjs/bull';
import {Queue} from 'bull';
import {MailService} from '@/mail/mail.service';

@Injectable()
export class SchedulerService {
    private readonly logger = new Logger(SchedulerService.name);

    constructor(
        @InjectQueue('email') private readonly emailQueue: Queue,
        private readonly mailService: MailService,
    ) {
    }

    async scheduleAppointmentNotification(email: string, appointmentTime: Date) {
        const currentTime = new Date();
        const delay = appointmentTime.getTime() - currentTime.getTime();

        if (delay <= 0) {
            this.logger.warn(`Cannot schedule email for a past time: ${appointmentTime}`);
            return;
        }

        try {
            await this.emailQueue.add(
                'send-appointment-reminder',
                {email, appointmentTime},
                {delay},
            );

            this.logger.log(`Scheduled email for ${email} at ${appointmentTime}`);
        } catch (error) {
            this.logger.error(`Failed to schedule email for ${email}:`, error);
        }
    }
}
