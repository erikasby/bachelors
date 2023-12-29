import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { DatabaseService } from 'src/database/database.service';
import { SecurityService } from 'src/security/security.service';
import { ValidationService } from './validation/validation.service';

// This should be a real class/interface representing a user entity
export type User = any;

@Injectable()
export class UsersService {
  constructor(
    private databaseService: DatabaseService,
    private securityService: SecurityService,
    private validationService: ValidationService,
  ) {}

  private readonly users = [
    {
      userId: 1,
      username: 'john',
      password: 'changeme',
    },
    {
      userId: 2,
      username: 'maria',
      password: 'guess',
    },
  ];

  async findOne(username: string): Promise<User | undefined> {
    // Create index for username
    const query =
      'select user_id, username, username_for_display, password ' +
      'from users ' +
      'where username = $1';
    const values = [username.toLowerCase()];

    const dbResponse = await this.databaseService.query(query, values);

    return dbResponse;
  }

  async addOne(
    email: string,
    username: string,
    password: string,
  ): Promise<any> {
    const isValid = this.validationService.validateRegister(
      email,
      username,
      password,
    );

    if (!isValid) {
      throw new UnprocessableEntityException();
    }

    const currentTimestamp = new Date().toUTCString();
    const createdAt = currentTimestamp;
    const updatedAt = currentTimestamp;
    const hashedPassword = await this.securityService.hash(password);

    const query: string =
      'insert into users (username, username_for_display, password, email, created_at, updated_at)' +
      ' values ($1, $2, $3, $4, $5, $6)';
    const values: Array<any> = [
      username.toLowerCase(),
      username,
      hashedPassword,
      email.toLowerCase(),
      createdAt,
      updatedAt,
    ];

    try {
      const dbResponse = await this.databaseService.query(query, values);
      return { status: 'Success' };
    } catch (error) {
      if (error.constraint === 'users_username_uq')
        return { status: 'Username is already in use' };
      else if (error.constraint === 'users_email_uq')
        return { status: 'Email is already in use' };
      else return { status: 'Something went wrong' };
    }
  }
}
