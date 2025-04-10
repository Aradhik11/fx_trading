import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
    @ApiProperty({
        example: 'user@example.com',
        description: 'User email address',
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        example: 'StrongP@ss123',
        description: 'User password (min 8 chars, max 32 chars, must include uppercase, lowercase, number)',
    })
    @IsString()
    @MinLength(8)
    @MaxLength(32)
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]+$/,
        {
            message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
        },
    )
    password: string;
} 