import { EmailService } from '../email/email.service';
import { ContactFormDto } from './dto/contact-form.dto';
export declare class ContactController {
    private readonly emailService;
    constructor(emailService: EmailService);
    submitContactForm(contactFormDto: ContactFormDto): Promise<{
        message: string;
    }>;
}
