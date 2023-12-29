import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';

@Injectable()
export class SecurityService {
  private saltRounds = 10;

  async hash(password: string) {
    return await bcrypt.hash(password, this.saltRounds);
  }

  async compare(password: string, hashedPassword: string) {
    return await bcrypt.compare(password, hashedPassword);
  }
}
