import {Global, Module} from '@nestjs/common';
import {MailService} from './mail.service';
import {ConfigService} from '@nestjs/config';
import {createTransport, Transporter} from 'nodemailer';

@Global()
@Module({
    providers: [
        {
            provide: 'MAIL_TRANSPORT',
            useFactory: (configService: ConfigService): Transporter => {
                return createTransport({
                    service: 'gmail',
                    auth: {
                        user: configService.get('MAIL_USER'),
                        pass: configService.get('MAIL_PASSWORD'),
                    },
                });
            },
            inject: [ConfigService],
        },
        MailService,
    ],
    exports: [MailService],
})
export class MailModule {
}
