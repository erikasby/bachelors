import { Injectable, Res } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { Request } from '@nestjs/common';
import { SecurityService } from 'src/security/security.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private securityService: SecurityService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const dbResponse = await this.usersService.findOne(username);
    const user = dbResponse.rows[0];

    const isPasswordValid = await this.securityService.compare(
      password,
      user.password,
    );

    if (user && isPasswordValid) {
      return {
        username: user.username,
        userId: user.user_id,
      };
    }
    return null;
  }

  // Need to add refresh token here somehow with expiry of 7d
  async signIn(@Res({ passthrough: true }) res: Response, user: any) {
    const payload = { username: user.username, sub: user.userId };
    const accessToken = this.jwtService.sign(payload);

    const secretData = {
      accessToken,
    };

    const secretDataAsJSONString = JSON.stringify(secretData);
    res.cookie('auth-cookie', secretDataAsJSONString, { httpOnly: true });
    return { status: 'Success' };
  }

  async register(@Request() req) {
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;

    const dbResponse = await this.usersService.addOne(
      email,
      username,
      password,
    );

    return dbResponse;
  }
}
