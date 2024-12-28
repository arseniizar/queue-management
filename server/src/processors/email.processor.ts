import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable, Logger } from '@nestjs/common';
import { MailService } from '@/mail/mail.service';

@Injectable()
@Processor('email')
export class EmailProcessor {
    private readonly logger = new Logger(EmailProcessor.name);

    constructor(private readonly mailService: MailService) {}

    @Process('send-appointment-reminder')
    async handleSendAppointmentReminder(job: Job<{ email: string; appointmentTime: Date }>) {
        const { email, appointmentTime } = job.data;

        try {
            await this.mailService.sendAppointmentReminder(email, appointmentTime);
            this.logger.log(`Successfully sent appointment reminder to ${email}`);
        } catch (error) {
            this.logger.error(`Failed to send appointment reminder to ${email}:`, error);
        }
    }
}
