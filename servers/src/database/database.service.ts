import { Injectable } from '@nestjs/common';
// import postgres from 'postgres';
import { Pool } from 'pg';

import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseService {
  constructor(private configService: ConfigService) {}

  dbConfig = {
    host: this.configService.get<string>('HOST'),
    port: this.configService.get<number>('PORT'),
    database: this.configService.get<string>('DATABASE'),
    user: this.configService.get<string>('USER'),
    password: this.configService.get<string>('PASSWORD'),
  };

  pool = new Pool({
    user: this.dbConfig.user,
    host: this.dbConfig.host,
    database: this.dbConfig.database,
    password: this.dbConfig.password,
    port: this.dbConfig.port,
  });

  async query(query: string, values: Array<any>) {
    return await this.pool.query(query, values);
  }

  // sql = postgres(`postgres://postgres:Qwasdfer-5597@localhost:5432/heapster`);
  // sql = postgres('postgres://username:password@host:port/database', {
  //   host: this.dbConfig.host,
  //   port: this.dbConfig.port,
  //   database: this.dbConfig.database,
  //   username: this.dbConfig.username,
  //   password: this.dbConfig.password,
  // });
}
