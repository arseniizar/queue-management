import {Injectable, Inject} from '@nestjs/common';
import {Transporter} from 'nodemailer';
import {User} from 'src/schemas/user.schema';

@Injectable()
export class MailService {
    constructor(
        @Inject('MAIL_TRANSPORT') private readonly mailTransport: Transporter,
    ) {
    }

    async sendTest(email: string) {
        await this.mailTransport.sendMail({
            to: email,
            from: `"Test Team" <${process.env.MAIL_FROM}>`,
            subject: 'Test',
            text: 'Hello from Nodemailer!',
        });
    }

    async sendPassReset(user: User, token: string) {
        const url = `${process.env.HOST_URL}password-reset?token=${token}`;
        await this.mailTransport.sendMail({
            to: user.email,
            from: `"Support Team" <${process.env.MAIL_FROM}>`,
            subject: 'Reset Your Password',
            text: `Hello, ${user.username}! Use this link to reset your password: ${url}`,
        });
    }

    async sendConfirmation(user: User, token: string) {
        const url = `${process.env.HOST_URL}confirmation?token=${token}`;
        await this.mailTransport.sendMail({
            to: user.email,
            from: `"Support Team" <${process.env.MAIL_FROM}>`,
            subject: 'Confirm Your Email',
            text: `Hello, ${user.username}! Please confirm your email: ${url}`,
        });
    }

    async sendAppointmentReminder(email: string, appointmentTime: Date) {
        const formattedTime = appointmentTime.toLocaleString();

        await this.mailTransport.sendMail({
            to: email,
            from: `"Support Team" <${process.env.MAIL_FROM}>`,
            subject: 'Appointment Reminder',
            text: `Hello! This is a reminder for your appointment scheduled at ${formattedTime}.`,
        });
    }
}
