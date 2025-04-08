import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { FxController } from './fx.controller';
import { FxService } from './fx.service';

@Module({
  imports: [
    HttpModule,
    CacheModule.register(),
    ConfigModule,
  ],
  controllers: [FxController],
  providers: [FxService],
  exports: [FxService],
})
export class FxModule {}
