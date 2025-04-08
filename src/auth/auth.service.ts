import { Injectable, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User } from './entities/user.entity';
import { MailerService } from '../shared/mailer/mailer.service';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwtService: JwtService,
        private mailerService: MailerService,
    ){}

    async register(email: string, password: string) {
        // Check if user exists
        const existingUser = await this.userRepository.findOne({ where: { email } });
        if (existingUser) {
          throw new ConflictException('Email already registered');
        }
    
        // Create verification token
        const verificationToken = uuidv4();
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);
    
        // Create new user
        const user = this.userRepository.create({
          email,
          password: hashedPassword,
          verificationToken,
        });
        await this.userRepository.save(user);
    
        // Send verification email
        await this.mailerService.sendVerificationEmail(email, verificationToken);
    
        return { message: 'Registration successful. Please verify your email.' };
      }
    
      async verifyEmail(token: string) {
        const user = await this.userRepository.findOne({ where: { verificationToken: token } });
        if (!user) {
          throw new NotFoundException('Invalid verification token');
        }
    
        user.isVerified = true;
        user.verificationToken = null;
        await this.userRepository.save(user);
    
        return { message: 'Email verified successfully' };
      }
    
      async login(email: string, password: string) {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
          throw new UnauthorizedException('Invalid credentials');
        }
    
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          throw new UnauthorizedException('Invalid credentials');
        }
    
        if (!user.isVerified) {
          throw new UnauthorizedException('Please verify your email first');
        }
    
        const payload = { sub: user.id, email: user.email };
        return {
          access_token: this.jwtService.sign(payload),
        };
      }
}
