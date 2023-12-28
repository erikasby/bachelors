import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { DatabaseModule } from 'src/database/database.module';
import { SecurityModule } from 'src/security/security.module';
import { ValidationService } from './validation/validation.service';

@Module({
  imports: [DatabaseModule, SecurityModule],
  providers: [UsersService, ValidationService],
  exports: [UsersService],
})
export class UsersModule {}
