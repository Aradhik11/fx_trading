import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    @ApiOperation({ summary: 'Register a new user' })
    @ApiResponse({ 
        status: 201, 
        description: 'User registered successfully',
    })
    @ApiResponse({ 
        status: 400, 
        description: 'Invalid input data',
    })
    @ApiResponse({ 
        status: 409, 
        description: 'User already exists',
    })
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Get('verify')
    @ApiOperation({ summary: 'Verify email address' })
    @ApiResponse({ 
        status: 200, 
        description: 'Email verified successfully',
    })
    @ApiResponse({ 
        status: 400, 
        description: 'Invalid verification token',
    })
    async verifyEmail(@Query('token') token: string) {
        return this.authService.verifyEmail(token);
    }

    @Post('login')
    @ApiOperation({ summary: 'Login user' })
    @ApiResponse({ 
        status: 200, 
        description: 'User logged in successfully',
    })
    @ApiResponse({ 
        status: 401, 
        description: 'Invalid credentials',
    })
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }
}
