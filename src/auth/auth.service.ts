import { Injectable, ConflictException, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwtService: JwtService,
        private mailerService: MailerService,
        private configService: ConfigService,
    ) {}

    private generateVerificationCode(): string {
        // Generate a 6-digit code
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    async register(registerDto: RegisterDto) {
        // Check if user exists
        const existingUser = await this.userRepository.findOne({
            where: { email: registerDto.email }
        });

        if (existingUser) {
            throw new ConflictException('User already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(registerDto.password, 12);
        const verificationCode = this.generateVerificationCode();

        // Create user
        const user = this.userRepository.create({
            email: registerDto.email,
            password: hashedPassword,
            verificationToken: verificationCode,
        });

        await this.userRepository.save(user);

        // Send verification email
        try {
            await this.sendVerificationEmail(user.email, verificationCode);
            this.logger.log(`Verification email sent to ${user.email}`);
        } catch (error) {
            this.logger.error(`Failed to send verification email to ${user.email}: ${error.message}`);
            // Continue with registration even if email fails
            // You might want to implement a retry mechanism or queue here
        }

        return {
            message: 'Registration successful. Please check your email for verification.',
            userId: user.id
        };
    }

    private async sendVerificationEmail(email: string, code: string) {
        try {
            const mailOptions = {
                to: email,
                subject: 'Your FX Trading App Verification Code',
                text: `Welcome to FX Trading App!

Your verification code is: ${code}

Please use this code to verify your email address.

This code will expire in 24 hours.

If you didn't create an account with FX Trading App, you can safely ignore this email.

© ${new Date().getFullYear()} FX Trading App. All rights reserved.`
            };

            await this.mailerService.sendMail(mailOptions);
            this.logger.debug(`Verification email sent to ${email} with code: ${code}`);
        } catch (error) {
            this.logger.error(`Email sending failed: ${error.message}`, error.stack);
            throw new Error('Failed to send verification email');
        }
    }

    async verifyEmail(token: string) {
        this.logger.debug(`Attempting to verify email with code: ${token}`);
        
        const user = await this.userRepository.findOne({
            where: { verificationToken: token }
        });

        if (!user) {
            this.logger.warn(`Invalid verification code: ${token}`);
            throw new UnauthorizedException('Invalid verification code');
        }

        user.isVerified = true;
        user.verificationToken = null;
        await this.userRepository.save(user);

        this.logger.log(`Email verified successfully for user: ${user.email}`);
        return {
            message: 'Email verified successfully'
        };
    }

    async login(loginDto: LoginDto) {
        const user = await this.userRepository.findOne({
            where: { email: loginDto.email }
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (!user.isVerified) {
            throw new UnauthorizedException('Please verify your email first');
        }

        const payload = { sub: user.id, email: user.email };
        
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email
            }
        };
    }
}
