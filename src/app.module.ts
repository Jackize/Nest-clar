import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonHttpModule } from '@/common/http/common-http.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [CommonHttpModule, UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
