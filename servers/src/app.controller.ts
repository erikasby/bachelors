import {
  Controller,
  Get,
  Headers,
  HttpStatus,
  HttpException,
  Request,
  Post,
  UseGuards,
  Res,
  Req,
  Put,
} from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { AuthService } from './auth/auth.service';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from './database/database.service';
import { error } from 'console';
import { SecurityService } from './security/security.service';
import { UsersService } from './users/users.service';
import { create } from 'domain';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private authService: AuthService,
    private jwtService: JwtService,
    private databaseService: DatabaseService,
    private securityService: SecurityService,
    private usersService: UsersService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @UseGuards(LocalAuthGuard)
  @Post('auth/signin')
  async signIn(@Res({ passthrough: true }) res: Response, @Request() req) {
    // console.log(req.user);
    return this.authService.signIn(res, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('username')
  getUser(@Request() req) {
    return { username: req.user.username };
  }

  @Post('auth/register')
  async register(@Res({ passthrough: true }) res: Response, @Request() req) {
    return this.authService.register(req);
  }

  @Get('auth/signout')
  async signOut(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('auth-cookie', { httpOnly: true });
    return { status: 'Success' };
  }

  // Create services for these below better
  @Get('posts')
  async getPosts(@Res({ passthrough: true }) res: Response, @Request() req) {
    try {
      let user = null;
      try {
        const authCookie = req.cookies['auth-cookie'];
        if (authCookie) {
          const accessToken = JSON.parse(authCookie).accessToken;
          user = this.jwtService.verify(accessToken);
        }
      } catch (error) {
        console.log(error);
      }

      const currentTimestamp = new Date().toUTCString();

      const order = req.query.order;
      const scope = req.query.scope;
      const date = req.query.date;
      const search = req.query.for;

      let orderQuery;
      let scopeQuery;
      let dateQuery;
      let searchQuery;

      if (order === 'new') orderQuery = 'order by cp.created_at desc,';
      else orderQuery = 'order by cp.votes_count desc,';

      if (scope === 'following')
        scopeQuery =
          'join communities_follows cf on c.community_id = cf.community_id and cf.user_id = $1 and cf.is_deleted = false';
      else scopeQuery = '';

      if (date === 'hour')
        dateQuery = `and cp.created_at::timestamp at time zone 'UTC' >= $2::timestamp at time zone 'UTC' - '1 hour'::interval`;
      else if (date === 'day')
        dateQuery = `and cp.created_at::timestamp at time zone 'UTC' >= $2::timestamp at time zone 'UTC' - '1 day'::interval`;
      else if (date === 'week')
        dateQuery = `and cp.created_at::timestamp at time zone 'UTC' >= $2::timestamp at time zone 'UTC' - '1 week'::interval`;
      else if (date === 'month')
        dateQuery = `and cp.created_at::timestamp at time zone 'UTC' >= $2::timestamp at time zone 'UTC' - '1 month'::interval`;
      else if (date === 'year')
        dateQuery = `and cp.created_at::timestamp at time zone 'UTC' >= $2::timestamp at time zone 'UTC' - '1 year'::interval`;
      else dateQuery = 'and cp.created_at < $2';

      if (search)
        searchQuery = `and lower(cp.title) like '%'||$3||'%' or lower(cp.text) like '%'||$3||'%' or lower(ct.name) like '%'||$3||'%'`;
      else searchQuery = '';

      const query =
        'select  ' +
        'cp.post_id,  ' +
        'c.name_for_display,  ' +
        'u.username_for_display,  ' +
        'cp.created_at,  ' +
        'cp.title,  ' +
        'cp.text,  ' +
        'cp.votes_count,  ' +
        'cp.comments_count, ' +
        'case when cpv.sign = 1 then true ' +
        'else false end is_liked, ' +
        'case when cpv.sign = -1 then true ' +
        'else false end is_disliked, ' +
        'case when cb.is_deleted = false then true ' +
        'else false end is_bookmarked,  ' +
        'array_agg(ct.name) tags  ' +
        'from communities_posts cp  ' +
        'join users u  ' +
        'on cp.user_id = u.user_id  ' +
        'join communities c  ' +
        'on c.community_id = cp.community_id  ' +
        'left join communities_posts_votes cpv  ' +
        'on cpv.post_id = cp.post_id  ' +
        'and cpv.user_id = $1 ' +
        'left join communities_bookmarks cb  ' +
        'on cp.post_id = cb.post_id  ' +
        'and cb.user_id = $1 ' +
        'left join communities_tags ct  ' +
        'on cp.post_id = ct.post_id  ' +
        `${scopeQuery} ` +
        'where cp.is_deleted = false ' +
        `${dateQuery} ` +
        `${searchQuery} ` +
        'group by  ' +
        'cp.post_id,  ' +
        'c.name_for_display,  ' +
        'u.username_for_display,  ' +
        'cp.created_at,  ' +
        'cp.title,  ' +
        'cp.text,  ' +
        'cp.votes_count,  ' +
        'cp.comments_count,  ' +
        'cpv.sign, ' +
        'cpv.user_id, ' +
        'cb.is_deleted, ' +
        'cb.user_id ' +
        `${orderQuery} ` +
        'cp.comments_count desc;';
      let values: Array<any> = [0, currentTimestamp];
      if (search) values = [0, currentTimestamp, search.toLowerCase()];
      if (user) values = [user.sub, currentTimestamp];
      if (user && search)
        values = [user.sub, currentTimestamp, search.toLowerCase()];

      const dbResponse = await this.databaseService.query(query, values);
      return dbResponse.rows;
    } catch (error) {
      console.error(error);
      return { status: 'Something went wrong' };
    }
  }

  @Get('bookmarked-posts')
  async getBookmarkedPosts(
    @Res({ passthrough: true }) res: Response,
    @Request() req,
  ) {
    try {
      let user = null;
      try {
        const authCookie = req.cookies['auth-cookie'];
        if (authCookie) {
          const accessToken = JSON.parse(authCookie).accessToken;
          user = this.jwtService.verify(accessToken);
        }
      } catch (error) {
        console.log(error);
      }

      const query =
        'select  ' +
        'cp.post_id,  ' +
        'c.name_for_display,  ' +
        'u.username_for_display,  ' +
        'cp.created_at,  ' +
        'cp.title,  ' +
        'cp.text,  ' +
        'cp.votes_count,  ' +
        'cp.comments_count, ' +
        'case when cpv.sign = 1 then true ' +
        'else false end is_liked, ' +
        'case when cpv.sign = -1 then true ' +
        'else false end is_disliked, ' +
        'case when cb.is_deleted = false then true ' +
        'else false end is_bookmarked,  ' +
        'array_agg(ct.name) tags  ' +
        'from communities_posts cp  ' +
        'join users u  ' +
        'on cp.user_id = u.user_id  ' +
        'join communities c  ' +
        'on c.community_id = cp.community_id  ' +
        'left join communities_posts_votes cpv  ' +
        'on cpv.post_id = cp.post_id  ' +
        'and cpv.user_id = $1 ' +
        'left join communities_bookmarks cb  ' +
        'on cp.post_id = cb.post_id  ' +
        'and cb.user_id = $1 ' +
        'left join communities_tags ct  ' +
        'on cp.post_id = ct.post_id  ' +
        'where cp.is_deleted = false and ' +
        'cb.user_id = $1 and ' +
        'cb.is_deleted = false ' +
        'group by  ' +
        'cp.post_id,  ' +
        'c.name_for_display,  ' +
        'u.username_for_display,  ' +
        'cp.created_at,  ' +
        'cp.title,  ' +
        'cp.text,  ' +
        'cp.votes_count,  ' +
        'cp.comments_count,  ' +
        'cpv.sign, ' +
        'cpv.user_id, ' +
        'cb.is_deleted, ' +
        'cb.user_id ' +
        'order by cp.votes_count desc, ' +
        'cp.comments_count desc;';
      let values = [0];
      if (user) values = [user.sub];

      const dbResponse = await this.databaseService.query(query, values);
      return dbResponse.rows;
    } catch (error) {
      console.error(error);
      return { status: 'Something went wrong' };
    }
  }

  @Get('post')
  async getPost(@Res({ passthrough: true }) res: Response, @Request() req) {
    try {
      let user = null;
      try {
        const authCookie = req.cookies['auth-cookie'];
        if (authCookie) {
          const accessToken = JSON.parse(authCookie).accessToken;
          user = this.jwtService.verify(accessToken);
        }
      } catch (error) {
        console.log(error);
      }

      const query =
        'select  ' +
        'cp.post_id,  ' +
        'c.name_for_display,  ' +
        'u.username_for_display,  ' +
        'cp.created_at,  ' +
        'cp.title,  ' +
        'cp.text,  ' +
        'cp.votes_count,  ' +
        'cp.comments_count, ' +
        'case when cpv.sign = 1 then true ' +
        'else false end is_liked, ' +
        'case when cpv.sign = -1 then true ' +
        'else false end is_disliked, ' +
        'case when cb.is_deleted = false then true ' +
        'else false end is_bookmarked,  ' +
        'case when cp.user_id = $3 then true ' +
        'else false end is_author, ' +
        'case when ca.user_id = $3 then true ' +
        'else false end is_admin, ' +
        'array_agg(ct.name) tags  ' +
        'from communities_posts cp  ' +
        'join users u  ' +
        'on cp.user_id = u.user_id  ' +
        'join communities c  ' +
        'on c.community_id = cp.community_id  ' +
        'left join communities_posts_votes cpv  ' +
        'on cpv.post_id = cp.post_id  ' +
        'and cpv.user_id = $3 ' +
        'left join communities_bookmarks cb  ' +
        'on cp.post_id = cb.post_id  ' +
        'and cb.user_id = $3 ' +
        'left join communities_tags ct  ' +
        'on cp.post_id = ct.post_id  ' +
        'left join communities_accesses ca ' +
        'on ca.community_id = c.community_id and ' +
        'ca.user_id = $3 ' +
        'where  ' +
        'c.name = $1 and  ' +
        'cp.post_id = $2 and ' +
        'cp.is_deleted = false ' +
        'group by  ' +
        'cp.post_id,  ' +
        'c.name_for_display,  ' +
        'u.username_for_display,  ' +
        'cp.created_at,  ' +
        'cp.title,  ' +
        'cp.text,  ' +
        'cp.votes_count,  ' +
        'cp.comments_count,  ' +
        'cpv.sign, ' +
        'cpv.user_id, ' +
        'cb.is_deleted, ' +
        'cb.user_id, ' +
        'ca.user_id ' +
        'order by cp.votes_count desc, ' +
        'cp.comments_count desc;';
      let values = [req.query.name.toLowerCase(), req.query.postId, 0];
      if (user)
        values = [req.query.name.toLowerCase(), req.query.postId, user.sub];

      const dbResponse = await this.databaseService.query(query, values);
      return dbResponse.rows;
    } catch (error) {
      console.error(error);
      return { status: 'Something went wrong' };
    }
  }

  @Post('community')
  async postCommunity(
    @Res({ passthrough: true }) res: Response,
    @Request() req,
  ) {
    const name = req.body.name;
    const authCookie = req.cookies['auth-cookie'];
    const accessToken = JSON.parse(authCookie).accessToken;
    try {
      // For refresh token do the additionl try-catch on this
      const user = this.jwtService.verify(accessToken);
      const currentTimestamp = new Date().toUTCString();
      const createdAt = currentTimestamp;
      const updatedAt = currentTimestamp;

      console.log(user);

      // Refactor into node-postgres prepared statement
      const query1 =
        'insert into communities ( ' +
        'name, ' +
        'created_at, ' +
        'name_for_display, ' +
        'updated_at) ' +
        'values ( ' +
        '$1, ' +
        '$2, ' +
        '$3, ' +
        '$4);';
      const values1 = [name.toLowerCase(), createdAt, name, updatedAt];

      const query2 =
        'insert into communities_accesses ( ' +
        'community_id, ' +
        'user_id, ' +
        'can_ban_users, ' +
        'can_delete_comments, ' +
        'can_delete_posts, ' +
        'can_delete_community, ' +
        'can_update_community, ' +
        'created_at, ' +
        'updated_at, ' +
        'is_admin) ' +
        'values ( ' +
        '(select community_id from communities where name = $1), ' +
        '$2, ' +
        'true, ' +
        'true, ' +
        'true, ' +
        'true, ' +
        'true, ' +
        '$3, ' +
        '$4, ' +
        '$5);';
      const values2 = [
        name.toLowerCase(),
        user.sub,
        createdAt,
        updatedAt,
        true,
      ];

      const query3 =
        'insert into communities_follows ( ' +
        'community_id, ' +
        'user_id, ' +
        'created_at, ' +
        'updated_at, ' +
        'is_deleted) ' +
        'values ( ' +
        '(select community_id from communities where name = $1), ' +
        '$2, ' +
        '$3, ' +
        '$4, ' +
        '$5);';
      const values3 = [
        name.toLowerCase(),
        user.sub,
        createdAt,
        updatedAt,
        false,
      ];

      try {
        const dbResponse1 = await this.databaseService.query(query1, values1);
        let dbResponse2;
        if (dbResponse1)
          dbResponse2 = await this.databaseService.query(query2, values2);
        let dbResponse3;
        if (dbResponse2)
          dbResponse3 = await this.databaseService.query(query3, values3);
        return { status: 'Success' };
      } catch (error) {
        if (error.constraint === 'communities_name_uq')
          return { status: 'Community name is already in use' };
        else {
          // Add a log here
          console.error(error);
          return { status: 'Something went wrong' };
        }
      }
    } catch (error) {
      // Add a log here
      console.error(error);
      return { status: 'Something went wrong' };
    }
  }

  @Post('admin')
  async postAdmin(@Res({ passthrough: true }) res: Response, @Request() req) {
    const name = req.body.name;
    const username = req.body.username;
    const authCookie = req.cookies['auth-cookie'];
    const accessToken = JSON.parse(authCookie).accessToken;
    try {
      // For refresh token do the additionl try-catch on this
      const user = this.jwtService.verify(accessToken);
      const currentTimestamp = new Date().toUTCString();
      const createdAt = currentTimestamp;
      const updatedAt = currentTimestamp;

      const query1 =
        'insert into communities_accesses ( ' +
        'community_id, ' +
        'user_id, ' +
        'can_ban_users, ' +
        'can_delete_comments, ' +
        'can_delete_posts, ' +
        'can_delete_community, ' +
        'can_update_community, ' +
        'created_at, ' +
        'updated_at, ' +
        'is_admin) ' +
        'values ( ' +
        '(select community_id from communities where name = $1), ' +
        '(select user_id from users where username = $2), ' +
        'true, ' +
        'true, ' +
        'true, ' +
        'true, ' +
        'true, ' +
        '$3, ' +
        '$4, ' +
        '$5);';
      const values1 = [
        name.toLowerCase(),
        username.toLowerCase(),
        createdAt,
        updatedAt,
        true,
      ];

      try {
        const dbResponse1 = await this.databaseService.query(query1, values1);
        return { status: 'Success' };
      } catch (error) {
        if (error.constraint === 'communities_name_uq')
          return { status: 'Community name is already in use' };
        else {
          // Add a log here
          console.error(error);
          return { status: 'Something went wrong' };
        }
      }
    } catch (error) {
      // Add a log here
      console.error(error);
      return { status: 'Something went wrong' };
    }
  }

  @Post('follow')
  async postFollow(@Res({ passthrough: true }) res: Response, @Request() req) {
    try {
      let user = null;
      try {
        const authCookie = req.cookies['auth-cookie'];
        if (authCookie) {
          const accessToken = JSON.parse(authCookie).accessToken;
          user = this.jwtService.verify(accessToken);
        }
      } catch (error) {
        console.log(error);
      }

      const currentTimestamp = new Date().toUTCString();
      const createdAt = currentTimestamp;
      const updatedAt = currentTimestamp;

      // Refactor into node-postgres prepared statement
      if (user) {
        const query1 =
          'insert into communities_follows ( ' +
          'community_id, ' +
          'user_id, ' +
          'created_at, ' +
          'updated_at, ' +
          'is_deleted) ' +
          'values ( ' +
          '(select community_id from communities where name = $1), ' +
          '$2, ' +
          '$3, ' +
          '$4, ' +
          '$5); ';
        const values1 = [
          req.body.name.toLowerCase(),
          user.sub,
          createdAt,
          updatedAt,
          false,
        ];

        const query2 =
          'update communities ' +
          'set follows_count = follows_count + 1 ' +
          'where name = $1;';
        const values2 = [req.body.name.toLowerCase()];

        try {
          const dbResponse1 = await this.databaseService.query(query1, values1);
          let dbResponse2;
          if (dbResponse1)
            dbResponse2 = await this.databaseService.query(query2, values2);
          return { status: 'Success' };
        } catch (error) {
          console.error(error);
          return { status: 'Something went wrong' };
        }
      } else {
        return { status: 'User is not logged in' };
      }
    } catch (error) {
      // Add a log here
      console.error(error);
      return { status: 'Something went wrong' };
    }
  }

  @Post('post-like')
  async postPostLike(
    @Res({ passthrough: true }) res: Response,
    @Request() req,
  ) {
    try {
      let user = null;
      try {
        const authCookie = req.cookies['auth-cookie'];
        if (authCookie) {
          const accessToken = JSON.parse(authCookie).accessToken;
          user = this.jwtService.verify(accessToken);
        }
      } catch (error) {
        console.log(error);
      }

      const currentTimestamp = new Date().toUTCString();
      const createdAt = currentTimestamp;
      const updatedAt = currentTimestamp;

      // Refactor into node-postgres prepared statement
      if (user) {
        const query1 =
          'insert into communities_posts_votes ' +
          '(post_id, user_id, sign, created_at, updated_at) ' +
          'values ($1, $2, 1, $3, $4);';
        const values1 = [
          Number(req.body.postId),
          user.sub,
          createdAt,
          updatedAt,
        ];

        const query2 =
          'update communities_posts ' +
          'set votes_count = votes_count + 1 ' +
          'where post_id = $1;';
        const values2 = [Number(req.body.postId)];

        try {
          const dbResponse1 = await this.databaseService.query(query1, values1);
          let dbResponse2;
          if (dbResponse1)
            dbResponse2 = await this.databaseService.query(query2, values2);
          return { status: 'Success' };
        } catch (error) {
          console.error(error);
          return { status: 'Something went wrong' };
        }
      } else {
        return { status: 'User is not logged in' };
      }
    } catch (error) {
      // Add a log here
      console.error(error);
      return { status: 'Something went wrong' };
    }
  }

  @Put('post-unlike')
  async putPostUnlike(
    @Res({ passthrough: true }) res: Response,
    @Request() req,
  ) {
    try {
      let user = null;
      try {
        const authCookie = req.cookies['auth-cookie'];
        if (authCookie) {
          const accessToken = JSON.parse(authCookie).accessToken;
          user = this.jwtService.verify(accessToken);
        }
      } catch (error) {
        console.log(error);
      }

      // Refactor into node-postgres prepared statement
      if (user) {
        const query1 =
          'update communities_posts_votes ' +
          'set sign = 0 ' +
          'where post_id = $1;';
        const values1 = [Number(req.body.postId)];

        const query2 =
          'update communities_posts ' +
          'set votes_count = votes_count - 1 ' +
          'where post_id = $1;';
        const values2 = [Number(req.body.postId)];

        try {
          const dbResponse1 = await this.databaseService.query(query1, values1);
          let dbResponse2;
          if (dbResponse1)
            dbResponse2 = await this.databaseService.query(query2, values2);
          return { status: 'Success' };
        } catch (error) {
          console.error(error);
          return { status: 'Something went wrong' };
        }
      } else {
        return { status: 'User is not logged in' };
      }
    } catch (error) {
      // Add a log here
      console.error(error);
      return { status: 'Something went wrong' };
    }
  }

  @Put('post-like')
  async putPostLike(@Res({ passthrough: true }) res: Response, @Request() req) {
    try {
      let user = null;
      try {
        const authCookie = req.cookies['auth-cookie'];
        if (authCookie) {
          const accessToken = JSON.parse(authCookie).accessToken;
          user = this.jwtService.verify(accessToken);
        }
      } catch (error) {
        console.log(error);
      }

      // Refactor into node-postgres prepared statement
      if (user) {
        const query1 =
          'update communities_posts_votes ' +
          'set sign = 1 ' +
          'where post_id = $1;';
        const values1 = [Number(req.body.postId)];

        const query2 =
          'update communities_posts ' +
          'set votes_count = votes_count + 1 ' +
          'where post_id = $1;';
        const values2 = [Number(req.body.postId)];

        try {
          const dbResponse1 = await this.databaseService.query(query1, values1);
          let dbResponse2;
          if (dbResponse1)
            dbResponse2 = await this.databaseService.query(query2, values2);
          return { status: 'Success' };
        } catch (error) {
          console.error(error);
          return { status: 'Something went wrong' };
        }
      } else {
        return { status: 'User is not logged in' };
      }
    } catch (error) {
      // Add a log here
      console.error(error);
      return { status: 'Something went wrong' };
    }
  }

  @Put('post-like-on-dislike')
  async putPostLikeOnDislike(
    @Res({ passthrough: true }) res: Response,
    @Request() req,
  ) {
    try {
      let user = null;
      try {
        const authCookie = req.cookies['auth-cookie'];
        if (authCookie) {
          const accessToken = JSON.parse(authCookie).accessToken;
          user = this.jwtService.verify(accessToken);
        }
      } catch (error) {
        console.log(error);
      }

      // Refactor into node-postgres prepared statement
      if (user) {
        const query1 =
          'update communities_posts_votes ' +
          'set sign = 1 ' +
          'where post_id = $1;';
        const values1 = [Number(req.body.postId)];

        const query2 =
          'update communities_posts ' +
          'set votes_count = votes_count + 2 ' +
          'where post_id = $1;';
        const values2 = [Number(req.body.postId)];

        try {
          const dbResponse1 = await this.databaseService.query(query1, values1);
          let dbResponse2;
          if (dbResponse1)
            dbResponse2 = await this.databaseService.query(query2, values2);
          return { status: 'Success' };
        } catch (error) {
          console.error(error);
          return { status: 'Something went wrong' };
        }
      } else {
        return { status: 'User is not logged in' };
      }
    } catch (error) {
      // Add a log here
      console.error(error);
      return { status: 'Something went wrong' };
    }
  }

  @Post('comment-like')
  async postCommentLike(
    @Res({ passthrough: true }) res: Response,
    @Request() req,
  ) {
    try {
      let user = null;
      try {
        const authCookie = req.cookies['auth-cookie'];
        if (authCookie) {
          const accessToken = JSON.parse(authCookie).accessToken;
          user = this.jwtService.verify(accessToken);
        }
      } catch (error) {
        console.log(error);
      }

      const currentTimestamp = new Date().toUTCString();
      const createdAt = currentTimestamp;
      const updatedAt = currentTimestamp;

      // Refactor into node-postgres prepared statement
      if (user) {
        const query1 =
          'insert into communities_comments_votes ' +
          '(comment_id, user_id, sign, created_at, updated_at) ' +
          'values ($1, $2, 1, $3, $4);';
        const values1 = [
          Number(req.body.commentId),
          user.sub,
          createdAt,
          updatedAt,
        ];

        const query2 =
          'update communities_comments ' +
          'set votes_count = votes_count + 1 ' +
          'where comment_id = $1;';
        const values2 = [Number(req.body.commentId)];

        try {
          const dbResponse1 = await this.databaseService.query(query1, values1);
          let dbResponse2;
          if (dbResponse1)
            dbResponse2 = await this.databaseService.query(query2, values2);
          return { status: 'Success' };
        } catch (error) {
          console.error(error);
          return { status: 'Something went wrong' };
        }
      } else {
        return { status: 'User is not logged in' };
      }
    } catch (error) {
      // Add a log here
      console.error(error);
      return { status: 'Something went wrong' };
    }
  }

  @Put('comment-unlike')
  async putCommentUnlike(
    @Res({ passthrough: true }) res: Response,
    @Request() req,
  ) {
    try {
      let user = null;
      try {
        const authCookie = req.cookies['auth-cookie'];
        if (authCookie) {
          const accessToken = JSON.parse(authCookie).accessToken;
          user = this.jwtService.verify(accessToken);
        }
      } catch (error) {
        console.log(error);
      }

      // Refactor into node-postgres prepared statement
      if (user) {
        const query1 =
          'update communities_comments_votes ' +
          'set sign = 0 ' +
          'where comment_id = $1;';
        const values1 = [Number(req.body.commentId)];

        const query2 =
          'update communities_comments ' +
          'set votes_count = votes_count - 1 ' +
          'where comment_id = $1;';
        const values2 = [Number(req.body.commentId)];

        try {
          const dbResponse1 = await this.databaseService.query(query1, values1);
          let dbResponse2;
          if (dbResponse1)
            dbResponse2 = await this.databaseService.query(query2, values2);
          return { status: 'Success' };
        } catch (error) {
          console.error(error);
          return { status: 'Something went wrong' };
        }
      } else {
        return { status: 'User is not logged in' };
      }
    } catch (error) {
      // Add a log here
      console.error(error);
      return { status: 'Something went wrong' };
    }
  }

  @Put('comment-like')
  async putCommentLike(
    @Res({ passthrough: true }) res: Response,
    @Request() req,
  ) {
    try {
      let user = null;
      try {
        const authCookie = req.cookies['auth-cookie'];
        if (authCookie) {
          const accessToken = JSON.parse(authCookie).accessToken;
          user = this.jwtService.verify(accessToken);
        }
      } catch (error) {
        console.log(error);
      }

      // Refactor into node-postgres prepared statement
      if (user) {
        const query1 =
          'update communities_comments_votes ' +
          'set sign = 1 ' +
          'where comment_id = $1;';
        const values1 = [Number(req.body.commentId)];

        const query2 =
          'update communities_comments ' +
          'set votes_count = votes_count + 1 ' +
          'where comment_id = $1;';
        const values2 = [Number(req.body.commentId)];

        try {
          const dbResponse1 = await this.databaseService.query(query1, values1);
          let dbResponse2;
          if (dbResponse1)
            dbResponse2 = await this.databaseService.query(query2, values2);
          return { status: 'Success' };
        } catch (error) {
          console.error(error);
          return { status: 'Something went wrong' };
        }
      } else {
        return { status: 'User is not logged in' };
      }
    } catch (error) {
      // Add a log here
      console.error(error);
      return { status: 'Something went wrong' };
    }
  }

  @Put('comment-like-on-dislike')
  async putCommentLikeOnDislike(
    @Res({ passthrough: true }) res: Response,
    @Request() req,
  ) {
    try {
      let user = null;
      try {
        const authCookie = req.cookies['auth-cookie'];
        if (authCookie) {
          const accessToken = JSON.parse(authCookie).accessToken;
          user = this.jwtService.verify(accessToken);
        }
      } catch (error) {
        console.log(error);
      }

      // Refactor into node-postgres prepared statement
      if (user) {
        const query1 =
          'update communities_comments_votes ' +
          'set sign = 1 ' +
          'where comment_id = $1;';
        const values1 = [Number(req.body.commentId)];

        const query2 =
          'update communities_comments ' +
          'set votes_count = votes_count + 2 ' +
          'where comment_id = $1;';
        const values2 = [Number(req.body.commentId)];

        try {
          const dbResponse1 = await this.databaseService.query(query1, values1);
          let dbResponse2;
          if (dbResponse1)
            dbResponse2 = await this.databaseService.query(query2, values2);
          return { status: 'Success' };
        } catch (error) {
          console.error(error);
          return { status: 'Something went wrong' };
        }
      } else {
        return { status: 'User is not logged in' };
      }
    } catch (error) {
      // Add a log here
      console.error(error);
      return { status: 'Something went wrong' };
    }
  }

  @Post('post-dislike')
  async postPostDislike(
    @Res({ passthrough: true }) res: Response,
    @Request() req,
  ) {
    try {
      let user = null;
      try {
        const authCookie = req.cookies['auth-cookie'];
        if (authCookie) {
          const accessToken = JSON.parse(authCookie).accessToken;
          user = this.jwtService.verify(accessToken);
        }
      } catch (error) {
        console.log(error);
      }

      const currentTimestamp = new Date().toUTCString();
      const createdAt = currentTimestamp;
      const updatedAt = currentTimestamp;

      // Refactor into node-postgres prepared statement
      if (user) {
        const query1 =
          'insert into communities_posts_votes ' +
          '(post_id, user_id, sign, created_at, updated_at) ' +
          'values ($1, $2, -1, $3, $4);';
        const values1 = [
          Number(req.body.postId),
          user.sub,
          createdAt,
          updatedAt,
        ];

        const query2 =
          'update communities_posts ' +
          'set votes_count = votes_count - 1 ' +
          'where post_id = $1;';
        const values2 = [Number(req.body.postId)];

        try {
          const dbResponse1 = await this.databaseService.query(query1, values1);
          let dbResponse2;
          if (dbResponse1)
            dbResponse2 = await this.databaseService.query(query2, values2);
          return { status: 'Success' };
        } catch (error) {
          console.error(error);
          return { status: 'Something went wrong' };
        }
      } else {
        return { status: 'User is not logged in' };
      }
    } catch (error) {
      // Add a log here
      console.error(error);
      return { status: 'Something went wrong' };
    }
  }

  @Put('post-undislike')
  async putPostUndislike(
    @Res({ passthrough: true }) res: Response,
    @Request() req,
  ) {
    try {
      let user = null;
      try {
        const authCookie = req.cookies['auth-cookie'];
        if (authCookie) {
          const accessToken = JSON.parse(authCookie).accessToken;
          user = this.jwtService.verify(accessToken);
        }
      } catch (error) {
        console.log(error);
      }

      // Refactor into node-postgres prepared statement
      if (user) {
        const query1 =
          'update communities_posts_votes ' +
          'set sign = 0 ' +
          'where post_id = $1;';
        const values1 = [Number(req.body.postId)];

        const query2 =
          'update communities_posts ' +
          'set votes_count = votes_count + 1 ' +
          'where post_id = $1;';
        const values2 = [Number(req.body.postId)];

        try {
          const dbResponse1 = await this.databaseService.query(query1, values1);
          let dbResponse2;
          if (dbResponse1)
            dbResponse2 = await this.databaseService.query(query2, values2);
          return { status: 'Success' };
        } catch (error) {
          console.error(error);
          return { status: 'Something went wrong' };
        }
      } else {
        return { status: 'User is not logged in' };
      }
    } catch (error) {
      // Add a log here
      console.error(error);
      return { status: 'Something went wrong' };
    }
  }

  @Put('post-dislike')
  async putPostDislike(
    @Res({ passthrough: true }) res: Response,
    @Request() req,
  ) {
    try {
      let user = null;
      try {
        const authCookie = req.cookies['auth-cookie'];
        if (authCookie) {
          const accessToken = JSON.parse(authCookie).accessToken;
          user = this.jwtService.verify(accessToken);
        }
      } catch (error) {
        console.log(error);
      }

      // Refactor into node-postgres prepared statement
      if (user) {
        const query1 =
          'update communities_posts_votes ' +
          'set sign = -1 ' +
          'where post_id = $1;';
        const values1 = [Number(req.body.postId)];

        const query2 =
          'update communities_posts ' +
          'set votes_count = votes_count - 1 ' +
          'where post_id = $1;';
        const values2 = [Number(req.body.postId)];

        try {
          const dbResponse1 = await this.databaseService.query(query1, values1);
          let dbResponse2;
          if (dbResponse1)
            dbResponse2 = await this.databaseService.query(query2, values2);
          return { status: 'Success' };
        } catch (error) {
          console.error(error);
          return { status: 'Something went wrong' };
        }
      } else {
        return { status: 'User is not logged in' };
      }
    } catch (error) {
      // Add a log here
      console.error(error);
      return { status: 'Something went wrong' };
    }
  }

  @Put('post-dislike-on-like')
  async putPostDislikeOnLike(
    @Res({ passthrough: true }) res: Response,
    @Request() req,
  ) {
    try {
      let user = null;
      try {
        const authCookie = req.cookies['auth-cookie'];
        if (authCookie) {
          const accessToken = JSON.parse(authCookie).accessToken;
          user = this.jwtService.verify(accessToken);
        }
      } catch (error) {
        console.log(error);
      }

      // Refactor into node-postgres prepared statement
      if (user) {
        const query1 =
          'update communities_posts_votes ' +
          'set sign = -1 ' +
          'where post_id = $1;';
        const values1 = [Number(req.body.postId)];

        const query2 =
          'update communities_posts ' +
          'set votes_count = votes_count - 2 ' +
          'where post_id = $1;';
        const values2 = [Number(req.body.postId)];

        try {
          const dbResponse1 = await this.databaseService.query(query1, values1);
          let dbResponse2;
          if (dbResponse1)
            dbResponse2 = await this.databaseService.query(query2, values2);
          return { status: 'Success' };
        } catch (error) {
          console.error(error);
          return { status: 'Something went wrong' };
        }
      } else {
        return { status: 'User is not logged in' };
      }
    } catch (error) {
      // Add a log here
      console.error(error);
      return { status: 'Something went wrong' };
    }
  }

  @Post('comment-dislike')
  async postCommentDislike(
    @Res({ passthrough: true }) res: Response,
    @Request() req,
  ) {
    try {
      let user = null;
      try {
        const authCookie = req.cookies['auth-cookie'];
        if (authCookie) {
          const accessToken = JSON.parse(authCookie).accessToken;
          user = this.jwtService.verify(accessToken);
        }
      } catch (error) {
        console.log(error);
      }

      const currentTimestamp = new Date().toUTCString();
      const createdAt = currentTimestamp;
      const updatedAt = currentTimestamp;

      // Refactor into node-postgres prepared statement
      if (user) {
        const query1 =
          'insert into communities_comments_votes ' +
          '(comment_id, user_id, sign, created_at, updated_at) ' +
          'values ($1, $2, -1, $3, $4);';
        const values1 = [
          Number(req.body.commentId),
          user.sub,
          createdAt,
          updatedAt,
        ];

        const query2 =
          'update communities_comments ' +
          'set votes_count = votes_count - 1 ' +
          'where comment_id = $1;';
        const values2 = [Number(req.body.commentId)];

        try {
          const dbResponse1 = await this.databaseService.query(query1, values1);
          let dbResponse2;
          if (dbResponse1)
            dbResponse2 = await this.databaseService.query(query2, values2);
          return { status: 'Success' };
        } catch (error) {
          console.error(error);
          return { status: 'Something went wrong' };
        }
      } else {
        return { status: 'User is not logged in' };
      }
    } catch (error) {
      // Add a log here
      console.error(error);
      return { status: 'Something went wrong' };
    }
  }

  @Put('comment-undislike')
  async putCommentUndislike(
    @Res({ passthrough: true }) res: Response,
    @Request() req,
  ) {
    try {
      let user = null;
      try {
        const authCookie = req.cookies['auth-cookie'];
        if (authCookie) {
          const accessToken = JSON.parse(authCookie).accessToken;
          user = this.jwtService.verify(accessToken);
        }
      } catch (error) {
        console.log(error);
      }

      // Refactor into node-postgres prepared statement
      if (user) {
        const query1 =
          'update communities_comments_votes ' +
          'set sign = 0 ' +
          'where comment_id = $1;';
        const values1 = [Number(req.body.commentId)];

        const query2 =
          'update communities_comments ' +
          'set votes_count = votes_count + 1 ' +
          'where comment_id = $1;';
        const values2 = [Number(req.body.commentId)];

        try {
          const dbResponse1 = await this.databaseService.query(query1, values1);
          let dbResponse2;
          if (dbResponse1)
            dbResponse2 = await this.databaseService.query(query2, values2);
          return { status: 'Success' };
        } catch (error) {
          console.error(error);
          return { status: 'Something went wrong' };
        }
      } else {
        return { status: 'User is not logged in' };
      }
    } catch (error) {
      // Add a log here
      console.error(error);
      return { status: 'Something went wrong' };
    }
  }

  @Put('comment-dislike')
  async putCommentDislike(
    @Res({ passthrough: true }) res: Response,
    @Request() req,
  ) {
    try {
      let user = null;
      try {
        const authCookie = req.cookies['auth-cookie'];
        if (authCookie) {
          const accessToken = JSON.parse(authCookie).accessToken;
          user = this.jwtService.verify(accessToken);
        }
      } catch (error) {
        console.log(error);
      }

      // Refactor into node-postgres prepared statement
      if (user) {
        const query1 =
          'update communities_comments_votes ' +
          'set sign = -1 ' +
          'where comment_id = $1;';
        const values1 = [Number(req.body.commentId)];

        const query2 =
          'update communities_comments ' +
          'set votes_count = votes_count - 1 ' +
          'where comment_id = $1;';
        const values2 = [Number(req.body.commentId)];

        try {
          const dbResponse1 = await this.databaseService.query(query1, values1);
          let dbResponse2;
          if (dbResponse1)
            dbResponse2 = await this.databaseService.query(query2, values2);
          return { status: 'Success' };
        } catch (error) {
          console.error(error);
          return { status: 'Something went wrong' };
        }
      } else {
        return { status: 'User is not logged in' };
      }
    } catch (error) {
      // Add a log here
      console.error(error);
      return { status: 'Something went wrong' };
    }
  }

  @Put('comment-dislike-on-like')
  async putCommentDislikeOnLike(
    @Res({ passthrough: true }) res: Response,
    @Request() req,
  ) {
    try {
      let user = null;
      try {
        const authCookie = req.cookies['auth-cookie'];
        if (authCookie) {
          const accessToken = JSON.parse(authCookie).accessToken;
          user = this.jwtService.verify(accessToken);
        }
      } catch (error) {
        console.log(error);
      }

      // Refactor into node-postgres prepared statement
      if (user) {
        const query1 =
          'update communities_comments_votes ' +
          'set sign = -1 ' +
          'where comment_id = $1;';
        const values1 = [Number(req.body.commentId)];

        const query2 =
          'update communities_comments ' +
          'set votes_count = votes_count - 2 ' +
          'where comment_id = $1;';
        const values2 = [Number(req.body.commentId)];

        try {
          const dbResponse1 = await this.databaseService.query(query1, values1);
          let dbResponse2;
          if (dbResponse1)
            dbResponse2 = await this.databaseService.query(query2, values2);
          return { status: 'Success' };
        } catch (error) {
          console.error(error);
          return { status: 'Something went wrong' };
        }
      } else {
        return { status: 'User is not logged in' };
      }
    } catch (error) {
      // Add a log here
      console.error(error);
      return { status: 'Something went wrong' };
    }
  }

  @Post('post')
  async postPost(@Res({ passthrough: true }) res: Response, @Request() req) {
    try {
      let user = null;
      try {
        const authCookie = req.cookies['auth-cookie'];
        if (authCookie) {
          const accessToken = JSON.parse(authCookie).accessToken;
          user = this.jwtService.verify(accessToken);
        }
      } catch (error) {
        console.log(error);
      }

      const currentTimestamp = new Date().toUTCString();
      const createdAt = currentTimestamp;
      const updatedAt = currentTimestamp;

      // Refactor into node-postgres prepared statement
      if (user) {
        const query1 =
          'insert into communities_posts ( ' +
          'community_id, ' +
          'user_id, ' +
          'title, ' +
          'text, ' +
          'created_at, ' +
          'updated_at, ' +
          'is_deleted) ' +
          'values ( ' +
          '(select community_id from communities where name = $1), ' +
          '$2, ' +
          '$6, ' +
          '$7, ' +
          '$3, ' +
          '$4, ' +
          '$5); ';
        const values1 = [
          req.body.name.toLowerCase(),
          user.sub,
          createdAt,
          updatedAt,
          false,
          req.body.title,
          req.body.bodyText,
        ];

        const query2 =
          'update communities ' +
          'set posts_count = posts_count + 1 ' +
          'where name = $1;';
        const values2 = [req.body.name.toLowerCase()];

        const query3 =
          'update users ' +
          'set posts_count = posts_count + 1 ' +
          'where user_id = $1;';
        const values3 = [user.sub];

        try {
          const dbResponse1 = await this.databaseService.query(query1, values1);
          let dbResponse2;
          if (dbResponse1)
            dbResponse2 = await this.databaseService.query(query2, values2);
          let dbResponse3;
          if (dbResponse2)
            dbResponse3 = await this.databaseService.query(query3, values3);
          if (dbResponse3)
            // This could be refactored into 1 insert statement
            // with select from (select ... from dual union all)
            // that would save a couple of round trips
            // also would be nice to check if there are same tags
            req.body.tags
              .replace(/\s/g, '')
              .substring(1)
              .split('#')
              .forEach(async (tag) => {
                const query4 =
                  'insert into communities_tags ( ' +
                  'post_id, ' +
                  'name, ' +
                  'created_at, ' +
                  'updated_at, ' +
                  'is_deleted) ' +
                  'values ( ' +
                  '(select post_id from communities_posts where community_id = (select community_id from communities where name = $1) and title = $6 and text = $7 and created_at = $3), ' +
                  '$2, ' +
                  '$3, ' +
                  '$4, ' +
                  '$5); ';
                const values4 = [
                  req.body.name.toLowerCase(),
                  tag,
                  createdAt,
                  updatedAt,
                  false,
                  req.body.title,
                  req.body.bodyText,
                ];

                console.log(tag);

                let dbResponse4;
                if (dbResponse3)
                  dbResponse4 = await this.databaseService.query(
                    query4,
                    values4,
                  );
              });

          return { status: 'Success' };
        } catch (error) {
          console.error(error);
          return { status: 'Something went wrong' };
        }
      } else {
        return { status: 'User is not logged in' };
      }
    } catch (error) {
      // Add a log here
      console.error(error);
      return { status: 'Something went wrong' };
    }
  }

  @Post('comment')
  async postComment(@Res({ passthrough: true }) res: Response, @Request() req) {
    try {
      let user = null;
      try {
        const authCookie = req.cookies['auth-cookie'];
        if (authCookie) {
          const accessToken = JSON.parse(authCookie).accessToken;
          user = this.jwtService.verify(accessToken);
        }
      } catch (error) {
        console.log(error);
      }

      const currentTimestamp = new Date().toUTCString();
      const createdAt = currentTimestamp;
      const updatedAt = currentTimestamp;

      // Refactor into node-postgres prepared statement
      if (user) {
        const query1 =
          'insert into communities_comments ( ' +
          'post_id, ' +
          'user_id, ' +
          'text, ' +
          'created_at, ' +
          'updated_at, ' +
          'is_deleted) ' +
          'values ( ' +
          '$1, ' +
          '$2, ' +
          '$3, ' +
          '$4, ' +
          '$5, ' +
          '$6); ';
        const values1 = [
          Number(req.body.postId),
          user.sub,
          req.body.bodyText,
          createdAt,
          updatedAt,
          false,
        ];

        const query2 =
          'update communities ' +
          'set comments_count = comments_count + 1 ' +
          'where name = $1;';
        const values2 = [req.body.name.toLowerCase()];

        const query3 =
          'update users ' +
          'set comments_count = comments_count + 1 ' +
          'where user_id = $1;';
        const values3 = [user.sub];

        const query4 =
          'update communities_posts ' +
          'set comments_count = comments_count + 1 ' +
          'where post_id = $1;';
        const values4 = [Number(req.body.postId)];

        try {
          const dbResponse1 = await this.databaseService.query(query1, values1);
          let dbResponse2;
          if (dbResponse1)
            dbResponse2 = await this.databaseService.query(query2, values2);
          let dbResponse3;
          if (dbResponse2)
            dbResponse3 = await this.databaseService.query(query3, values3);
          let dbResponse4;
          if (dbResponse3)
            dbResponse4 = await this.databaseService.query(query4, values4);

          return { status: 'Success' };
        } catch (error) {
          console.error(error);
          return { status: 'Something went wrong' };
        }
      } else {
        return { status: 'User is not logged in' };
      }
    } catch (error) {
      // Add a log here
      console.error(error);
      return { status: 'Something went wrong' };
    }
  }

  @Post('reply')
  async postReply(@Res({ passthrough: true }) res: Response, @Request() req) {
    try {
      let user = null;
      try {
        const authCookie = req.cookies['auth-cookie'];
        if (authCookie) {
          const accessToken = JSON.parse(authCookie).accessToken;
          user = this.jwtService.verify(accessToken);
        }
      } catch (error) {
        console.log(error);
      }

      const currentTimestamp = new Date().toUTCString();
      const createdAt = currentTimestamp;
      const updatedAt = currentTimestamp;

      // Refactor into node-postgres prepared statement
      if (user) {
        const query1 =
          'insert into communities_comments ( ' +
          'post_id, ' +
          'user_id, ' +
          'text, ' +
          'created_at, ' +
          'updated_at, ' +
          'is_deleted, ' +
          'replied_to_comment_id, ' +
          'depth, ' +
          'parent_comment_id) ' +
          'values ( ' +
          '$1, ' +
          '$2, ' +
          '$3, ' +
          '$4, ' +
          '$5, ' +
          '$6, ' +
          '$7, ' +
          '(select depth + 1 from communities_comments where comment_id = $7), ' +
          '(select coalesce(parent_comment_id, comment_id) from communities_comments where comment_id = $7));';
        const values1 = [
          Number(req.body.postId),
          user.sub,
          req.body.bodyText,
          createdAt,
          updatedAt,
          false,
          req.body.commentId,
        ];

        const query2 =
          'update communities ' +
          'set comments_count = comments_count + 1 ' +
          'where name = $1;';
        const values2 = [req.body.name.toLowerCase()];

        const query3 =
          'update users ' +
          'set comments_count = comments_count + 1 ' +
          'where user_id = $1;';
        const values3 = [user.sub];

        const query4 =
          'update communities_posts ' +
          'set comments_count = comments_count + 1 ' +
          'where post_id = $1;';
        const values4 = [Number(req.body.postId)];

        try {
          const dbResponse1 = await this.databaseService.query(query1, values1);
          let dbResponse2;
          if (dbResponse1)
            dbResponse2 = await this.databaseService.query(query2, values2);
          let dbResponse3;
          if (dbResponse2)
            dbResponse3 = await this.databaseService.query(query3, values3);
          let dbResponse4;
          if (dbResponse3)
            dbResponse4 = await this.databaseService.query(query4, values4);

          return { status: 'Success' };
        } catch (error) {
          console.error(error);
          return { status: 'Something went wrong' };
        }
      } else {
        return { status: 'User is not logged in' };
      }
    } catch (error) {
      // Add a log here
      console.error(error);
      return { status: 'Something went wrong' };
    }
  }

  @Put('follow')
  async putFollow(@Res({ passthrough: true }) res: Response, @Request() req) {
    try {
      let user = null;
      try {
        const authCookie = req.cookies['auth-cookie'];
        if (authCookie) {
          const accessToken = JSON.parse(authCookie).accessToken;
          user = this.jwtService.verify(accessToken);
        }
      } catch (error) {
        console.log(error);
      }

      // const currentTimestamp = new Date().toUTCString();
      // const createdAt = currentTimestamp;
      // const updatedAt = currentTimestamp;

      // Refactor into node-postgres prepared statement
      if (user) {
        const query1 =
          'update communities_follows ' +
          'set is_deleted = false ' +
          'where community_id = (select community_id from communities where name = $1) and ' +
          'user_id = $2;';
        const values1 = [req.body.name.toLowerCase(), user.sub];

        const query2 =
          'update communities ' +
          'set follows_count = follows_count + 1 ' +
          'where name = $1;';
        const values2 = [req.body.name.toLowerCase()];

        try {
          const dbResponse1 = await this.databaseService.query(query1, values1);
          let dbResponse2;
          if (dbResponse1)
            dbResponse2 = await this.databaseService.query(query2, values2);
          return { status: 'Success' };
        } catch (error) {
          console.error(error);
          return { status: 'Something went wrong' };
        }
      } else {
        return { status: 'User is not logged in' };
      }
    } catch (error) {
      // Add a log here
      console.error(error);
      return { status: 'Something went wrong' };
    }
  }

  @Put('unfollow')
  async putUnfollow(@Res({ passthrough: true }) res: Response, @Request() req) {
    try {
      let user = null;
      try {
        const authCookie = req.cookies['auth-cookie'];
        if (authCookie) {
          const accessToken = JSON.parse(authCookie).accessToken;
          user = this.jwtService.verify(accessToken);
        }
      } catch (error) {
        console.log(error);
      }

      // const currentTimestamp = new Date().toUTCString();
      // const createdAt = currentTimestamp;
      // const updatedAt = currentTimestamp;

      // Refactor into node-postgres prepared statement
      if (user) {
        const query1 =
          'update communities_follows ' +
          'set is_deleted = true ' +
          'where community_id = (select community_id from communities where name = $1) and ' +
          'user_id = $2;';
        const values1 = [req.body.name.toLowerCase(), user.sub];

        const query2 =
          'update communities ' +
          'set follows_count = follows_count - 1 ' +
          'where name = $1;';
        const values2 = [req.body.name.toLowerCase()];

        try {
          const dbResponse1 = await this.databaseService.query(query1, values1);
          let dbResponse2;
          if (dbResponse1)
            dbResponse2 = await this.databaseService.query(query2, values2);
          return { status: 'Success' };
        } catch (error) {
          console.error(error);
          return { status: 'Something went wrong' };
        }
      } else {
        return { status: 'User is not logged in' };
      }
    } catch (error) {
      // Add a log here
      console.error(error);
      return { status: 'Something went wrong' };
    }
  }

  @Put('username')
  async putUsername(@Res({ passthrough: true }) res: Response, @Request() req) {
    const authCookie = req.cookies['auth-cookie'];
    const accessToken = JSON.parse(authCookie).accessToken;
    try {
      const user = this.jwtService.verify(accessToken);

      const query =
        'update users ' +
        'set username = $2, username_for_display = $3 ' +
        'where user_id = $1;';
      const values = [
        user.sub,
        req.body.username.toLowerCase(),
        req.body.username,
      ];

      const payload = {
        username: req.body.username.toLowerCase(),
        sub: user.sub,
      };
      const newAccessToken = this.jwtService.sign(payload);
      const secretData = {
        accessToken: newAccessToken,
      };

      const secretDataAsJSONString = JSON.stringify(secretData);
      res.clearCookie('auth-cookie', { httpOnly: true });
      res.cookie('auth-cookie', secretDataAsJSONString, { httpOnly: true });

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
    } catch (error) {
      console.error(error);
      return { status: 'Something went wrong' };
    }
  }

  @Put('password')
  async putPassword(@Res({ passthrough: true }) res: Response, @Request() req) {
    const authCookie = req.cookies['auth-cookie'];
    const accessToken = JSON.parse(authCookie).accessToken;
    try {
      const user = this.jwtService.verify(accessToken);

      const dbResponse = await this.usersService.findOne(user.username);
      const password = dbResponse.rows[0].password;

      const isPasswordValid = await this.securityService.compare(
        req.body.currentPassword,
        password,
      );

      if (!isPasswordValid) return { status: 'Password is not valid' };

      const newHashedPassword = await this.securityService.hash(
        req.body.newPassword,
      );

      const query =
        'update users ' + 'set password = $2 ' + 'where user_id = $1;';
      const values = [user.sub, newHashedPassword];

      try {
        const dbResponse = await this.databaseService.query(query, values);
        return { status: 'Success' };
      } catch (error) {
        // Log here
        console.error(error);
        return { status: 'Something went wrong' };
      }
    } catch (error) {
      // Add a log here
      console.error(error);
      return { status: 'Something went wrong' };
    }
  }

  @Put('email')
  async putEmail(@Res({ passthrough: true }) res: Response, @Request() req) {
    const authCookie = req.cookies['auth-cookie'];
    const accessToken = JSON.parse(authCookie).accessToken;
    try {
      const user = this.jwtService.verify(accessToken);

      const query = 'update users ' + 'set email = $2 ' + 'where user_id = $1;';
      const values = [user.sub, req.body.email.toLowerCase()];

      try {
        const dbResponse = await this.databaseService.query(query, values);
        return { status: 'Success' };
      } catch (error) {
        if (error.constraint === 'users_email_uq')
          return { status: 'Email is already in use' };
        else {
          // Add a log here
          console.error(error);
          return { status: 'Something went wrong' };
        }
      }
    } catch (error) {
      // Add a log here
      console.error(error);
      return { status: 'Something went wrong' };
    }
  }

  @Put('us-community')
  async deleteUserSettingsCommunity(
    @Res({ passthrough: true }) res: Response,
    @Request() req,
  ) {
    const authCookie = req.cookies['auth-cookie'];
    const accessToken = JSON.parse(authCookie).accessToken;
    try {
      const user = this.jwtService.verify(accessToken);

      const query =
        'update communities c ' +
        'set is_deleted = true, ' +
        'deleted_response = $1 ' +
        'where c.name = ( ' +
        'select tc.name ' +
        'from communities tc ' +
        'join communities_accesses tca ' +
        'on tc.community_id = tca.community_id ' +
        'where tca.user_id = $2 and ' +
        'tca.is_admin = true and ' +
        'tc.name = $3);';
      const values = [
        'Deleted from admin user settings',
        user.sub,
        req.body.name,
      ];

      const dbResponse = await this.databaseService.query(query, values);
      return dbResponse;
    } catch (error) {
      console.error(error);
      return { status: 'Something went wrong' };
    }
  }

  @Put('cs-admin')
  async deleteCommunitySettingsAdmin(
    @Res({ passthrough: true }) res: Response,
    @Request() req,
  ) {
    const authCookie = req.cookies['auth-cookie'];
    const accessToken = JSON.parse(authCookie).accessToken;
    try {
      const user = this.jwtService.verify(accessToken);

      const query =
        'update communities_accesses ca ' +
        'set is_deleted = true ' +
        'where ca.user_id = ( ' +
        'select user_id ' +
        'from users ' +
        'where username = $2) and ' +
        'ca.is_admin = true and ' +
        'ca.community_id = (select community_id from communities where name = $1);';
      const values = [
        req.body.name.toLowerCase(),
        req.body.username.toLowerCase(),
      ];

      const dbResponse = await this.databaseService.query(query, values);
      return dbResponse;
    } catch (error) {
      console.error(error);
      return { status: 'Something went wrong' };
    }
  }

  @Get('us-communities')
  async getUserSettingsCommunitites(
    @Res({ passthrough: true }) res: Response,
    @Request() req,
  ) {
    const authCookie = req.cookies['auth-cookie'];
    const accessToken = JSON.parse(authCookie).accessToken;
    try {
      const user = this.jwtService.verify(accessToken);

      const query =
        'select c.name_for_display ' +
        'from communities c ' +
        'join communities_accesses ca ' +
        'on c.community_id = ca.community_id ' +
        'join users u ' +
        'on ca.user_id = u.user_id ' +
        'where u.user_id = $1 and ' +
        'ca.is_admin = true and ' +
        'c.is_deleted = false;';
      const values = [user.sub];

      const dbResponse = await this.databaseService.query(query, values);
      return dbResponse.rows;
    } catch (error) {
      console.error(error);
      return { status: 'Something went wrong' };
    }
  }

  @Get('cs-admins')
  async getCommunitySettingsAdmins(
    @Res({ passthrough: true }) res: Response,
    @Request() req,
  ) {
    const authCookie = req.cookies['auth-cookie'];
    const accessToken = JSON.parse(authCookie).accessToken;
    try {
      const user = this.jwtService.verify(accessToken);

      const query =
        'select u.username_for_display ' +
        'from communities c ' +
        'join communities_accesses ca ' +
        'on c.community_id = ca.community_id ' +
        'join users u ' +
        'on ca.user_id = u.user_id ' +
        'where c.name = $1 and ' +
        'ca.is_admin = true and ' +
        'ca.is_deleted = false;';
      const values = [req.query.name.toLowerCase()];

      const dbResponse = await this.databaseService.query(query, values);
      return dbResponse.rows;
    } catch (error) {
      console.error(error);
      return { status: 'Something went wrong' };
    }
  }

  @Get('user-follows')
  async getUserFollows(
    @Res({ passthrough: true }) res: Response,
    @Request() req,
  ) {
    const authCookie = req.cookies['auth-cookie'];
    const accessToken = JSON.parse(authCookie).accessToken;
    try {
      const user = this.jwtService.verify(accessToken);

      const query =
        'select c.name_for_display ' +
        'from communities c ' +
        'join communities_follows cf ' +
        'on c.community_id = cf.community_id ' +
        'join users u ' +
        'on cf.user_id = u.user_id ' +
        'where cf.user_id = $1 and ' +
        'cf.is_deleted = false;';
      const values = [user.sub];

      const dbResponse = await this.databaseService.query(query, values);
      return dbResponse.rows;
    } catch (error) {
      console.error(error);
      return { status: 'Something went wrong' };
    }
  }

  @Get('search-communities')
  async getSearchCommunities(
    @Res({ passthrough: true }) res: Response,
    @Request() req,
  ) {
    try {
      let user = null;
      try {
        const authCookie = req.cookies['auth-cookie'];
        if (authCookie) {
          const accessToken = JSON.parse(authCookie).accessToken;
          user = this.jwtService.verify(accessToken);
        }
      } catch (error) {
        console.log(error);
      }

      const scope = req.query.scope;
      const search = req.query.for;

      let scopeQuery;
      let searchQuery;

      if (scope === 'following')
        scopeQuery =
          'join communities_follows cf on c.community_id = cf.community_id join users u on cf.user_id = u.user_id where cf.user_id = $2 and cf.is_deleted = false and c.is_deleted = false';
      else scopeQuery = 'where c.is_deleted = false';

      if (search) searchQuery = `and c.name like '%'||$1||'%';`;
      else searchQuery = ';';

      const query =
        'select c.name_for_display ' +
        'from communities c ' +
        `${scopeQuery} ` +
        `${searchQuery}`;
      let values = [search.toLowerCase()];
      if (scope === 'following' && user)
        values = [search.toLowerCase(), user.sub];

      const dbResponse = await this.databaseService.query(query, values);
      return dbResponse.rows;
    } catch (error) {
      console.error(error);
      return { status: 'Something went wrong' };
    }
  }

  @Get('search-users')
  async getSearchUsers(
    @Res({ passthrough: true }) res: Response,
    @Request() req,
  ) {
    try {
      const search = req.query.for;
      let searchQuery;

      if (search) searchQuery = `where u.username like '%'||$1||'%';`;
      else searchQuery = ';';

      const query =
        'select u.username_for_display ' + 'from users u ' + `${searchQuery}`;
      const values = [search.toLowerCase()];

      const dbResponse = await this.databaseService.query(query, values);
      return dbResponse.rows;
    } catch (error) {
      console.error(error);
      return { status: 'Something went wrong' };
    }
  }

  @Get('us-email')
  async getUserSettingsEmail(
    @Res({ passthrough: true }) res: Response,
    @Request() req,
  ) {
    const authCookie = req.cookies['auth-cookie'];
    const accessToken = JSON.parse(authCookie).accessToken;
    try {
      const user = this.jwtService.verify(accessToken);

      const query = 'select email ' + 'from users ' + 'where user_id = $1;';
      const values = [user.sub];

      const dbResponse = await this.databaseService.query(query, values);
      return dbResponse.rows[0];
    } catch (error) {
      console.error(error);
      return { status: 'Something went wrong' };
    }
  }

  @Get('user-writer')
  async getUserWriter(
    @Res({ passthrough: true }) res: Response,
    @Request() req,
  ) {
    try {
      const query =
        'select ' +
        'username, ' +
        'username_for_display, ' +
        'created_at, ' +
        'follows_count, ' +
        'posts_count, ' +
        'comments_count ' +
        'from users ' +
        'where username = $1;';
      const values = [req.query.username.toLowerCase()];

      const dbResponse = await this.databaseService.query(query, values);
      return dbResponse.rows[0];
    } catch (error) {
      console.error(error);
      return { status: 'Something went wrong' };
    }
  }

  @Get('community-posts')
  async getCommunityPosts(
    @Res({ passthrough: true }) res: Response,
    @Request() req,
  ) {
    try {
      let user = null;
      try {
        const authCookie = req.cookies['auth-cookie'];
        if (authCookie) {
          const accessToken = JSON.parse(authCookie).accessToken;
          user = this.jwtService.verify(accessToken);
        }
      } catch (error) {
        console.log(error);
      }

      const currentTimestamp = new Date().toUTCString();

      const order = req.query.order;
      const date = req.query.date;

      let orderQuery;
      let dateQuery;

      if (order === 'new') orderQuery = 'order by cp.created_at desc,';
      else orderQuery = 'order by cp.votes_count desc,';

      if (date === 'hour')
        dateQuery = `and cp.created_at::timestamp at time zone 'UTC' >= $3::timestamp at time zone 'UTC' - '1 hour'::interval`;
      else if (date === 'day')
        dateQuery = `and cp.created_at::timestamp at time zone 'UTC' >= $3::timestamp at time zone 'UTC' - '1 day'::interval`;
      else if (date === 'week')
        dateQuery = `and cp.created_at::timestamp at time zone 'UTC' >= $3::timestamp at time zone 'UTC' - '1 week'::interval`;
      else if (date === 'month')
        dateQuery = `and cp.created_at::timestamp at time zone 'UTC' >= $3::timestamp at time zone 'UTC' - '1 month'::interval`;
      else if (date === 'year')
        dateQuery = `and cp.created_at::timestamp at time zone 'UTC' >= $3::timestamp at time zone 'UTC' - '1 year'::interval`;
      else dateQuery = 'and cp.created_at < $3';

      const query =
        'select  ' +
        'cp.post_id,  ' +
        'c.name_for_display,  ' +
        'u.username_for_display,  ' +
        'cp.created_at,  ' +
        'cp.title,  ' +
        'cp.text,  ' +
        'cp.votes_count,  ' +
        'cp.comments_count, ' +
        'case when cpv.sign = 1 then true ' +
        'else false end is_liked, ' +
        'case when cpv.sign = -1 then true ' +
        'else false end is_disliked, ' +
        'case when cb.is_deleted = false then true ' +
        'else false end is_bookmarked,  ' +
        'array_agg(ct.name) tags  ' +
        'from communities_posts cp  ' +
        'join users u  ' +
        'on cp.user_id = u.user_id  ' +
        'join communities c  ' +
        'on c.community_id = cp.community_id  ' +
        'left join communities_posts_votes cpv  ' +
        'on cpv.post_id = cp.post_id  ' +
        'and cpv.user_id = $2 ' +
        'left join communities_bookmarks cb  ' +
        'on cp.post_id = cb.post_id  ' +
        'and cb.user_id = $2 ' +
        'left join communities_tags ct  ' +
        'on cp.post_id = ct.post_id  ' +
        'where ' +
        'c.name = $1 and ' +
        'cp.is_deleted = false ' +
        `${dateQuery} ` +
        'group by  ' +
        'cp.post_id,  ' +
        'c.name_for_display,  ' +
        'u.username_for_display,  ' +
        'cp.created_at,  ' +
        'cp.title,  ' +
        'cp.text,  ' +
        'cp.votes_count,  ' +
        'cp.comments_count,  ' +
        'cpv.sign, ' +
        'cpv.user_id, ' +
        'cb.is_deleted, ' +
        'cb.user_id ' +
        `${orderQuery} ` +
        'cp.comments_count desc;';
      let values = [req.query.name.toLowerCase(), 0, currentTimestamp];
      if (user)
        values = [req.query.name.toLowerCase(), user.sub, currentTimestamp];

      const dbResponse = await this.databaseService.query(query, values);
      return dbResponse.rows;
    } catch (error) {
      console.error(error);
      return { status: 'Something went wrong' };
    }
  }

  @Get('post-comments')
  async getPostComments(
    @Res({ passthrough: true }) res: Response,
    @Request() req,
  ) {
    try {
      let user = null;
      try {
        const authCookie = req.cookies['auth-cookie'];
        if (authCookie) {
          const accessToken = JSON.parse(authCookie).accessToken;
          user = this.jwtService.verify(accessToken);
        }
      } catch (error) {
        console.log(error);
      }

      const currentTimestamp = new Date().toUTCString();

      const order = req.query.order;
      const date = req.query.date;

      let orderSelectQuery;
      let orderQuery;
      let dateQuery;

      if (order === 'new')
        orderSelectQuery =
          'max(created_at) filter(where depth = 0) over (partition by grouped) grouped_max';
      else
        orderSelectQuery =
          'max(votes_count) filter(where depth = 0) over (partition by grouped) grouped_max';

      if (order === 'new')
        orderQuery =
          'order by grouped_max desc, grouped asc, depth asc, created_at desc;';
      else
        orderQuery =
          'order by grouped_max desc, grouped asc, depth asc, votes_count desc, created_at desc;';

      if (date === 'hour')
        dateQuery = `and cc.created_at::timestamp at time zone 'UTC' >= $4::timestamp at time zone 'UTC' - '1 hour'::interval`;
      else if (date === 'day')
        dateQuery = `and cc.created_at::timestamp at time zone 'UTC' >= $4::timestamp at time zone 'UTC' - '1 day'::interval`;
      else if (date === 'week')
        dateQuery = `and cc.created_at::timestamp at time zone 'UTC' >= $4::timestamp at time zone 'UTC' - '1 week'::interval`;
      else if (date === 'month')
        dateQuery = `and cc.created_at::timestamp at time zone 'UTC' >= $4::timestamp at time zone 'UTC' - '1 month'::interval`;
      else if (date === 'year')
        dateQuery = `and cc.created_at::timestamp at time zone 'UTC' >= $4::timestamp at time zone 'UTC' - '1 year'::interval`;
      else dateQuery = 'and cp.created_at < $4';

      const query =
        'select *, ' +
        `${orderSelectQuery} ` +
        'from ( ' +
        '	select ' +
        '	coalesce(cc.parent_comment_id, cc.replied_to_comment_id, cc.comment_id) grouped, ' +
        '	cc.depth, ' +
        ' (select username_for_display from users where user_id =  ' +
        '  (select user_id from communities_comments where comment_id = cc.replied_to_comment_id) ' +
        ' ) replied_to, ' +
        '	cp.post_id, ' +
        '	cc.comment_id, ' +
        '	(select username_for_display from users where user_id = cc.user_id) username_for_display, ' +
        '	c.name_for_display, ' +
        '	cc.created_at, ' +
        ' case when cc.edited_text is not null then cc.edited_text ' +
        ' else cc.text end, ' +
        '	cc.votes_count, ' +
        '	case when ccv.sign = 1 then true ' +
        '	else false end is_liked, ' +
        '	case when ccv.sign = -1 then true ' +
        '	else false end is_disliked, ' +
        ' case when cc.user_id = $3 then true ' +
        ' else false end is_author, ' +
        ' case when ca.user_id = $3 then true ' +
        ' else false end is_admin ' +
        '	from communities_posts cp ' +
        '	join communities_comments cc ' +
        '	on cc.post_id = cp.post_id ' +
        '	join users u ' +
        '	on cp.user_id = u.user_id ' +
        '	join communities c ' +
        '	on c.community_id = cp.community_id ' +
        '	left join communities_comments_votes ccv ' +
        '	on ccv.comment_id = cc.comment_id ' +
        ' and ccv.user_id = $3 ' +
        ' left join communities_accesses ca ' +
        ' on ca.community_id = c.community_id and ' +
        ' ca.user_id = $3 ' +
        '	where c.name = $1 and ' +
        ' cp.post_id = $2 and ' +
        ' cp.is_deleted = false and ' +
        ' cc.is_deleted = false ' +
        ` ${dateQuery} ` +
        ') ' +
        `${orderQuery}`;
      let values = [
        req.query.name.toLowerCase(),
        Number(req.query.postId),
        0,
        currentTimestamp,
      ];
      if (user)
        values = [
          req.query.name.toLowerCase(),
          Number(req.query.postId),
          user.sub,
          currentTimestamp,
        ];

      const dbResponse = await this.databaseService.query(query, values);
      return dbResponse.rows;
    } catch (error) {
      console.error(error);
      return { status: 'Something went wrong' };
    }
  }

  @Get('user-posts')
  async getUserPosts(
    @Res({ passthrough: true }) res: Response,
    @Request() req,
  ) {
    try {
      let user = null;
      try {
        const authCookie = req.cookies['auth-cookie'];
        if (authCookie) {
          const accessToken = JSON.parse(authCookie).accessToken;
          user = this.jwtService.verify(accessToken);
        }
      } catch (error) {
        console.log(error);
      }

      const currentTimestamp = new Date().toUTCString();

      const order = req.query.order;
      const date = req.query.date;

      let orderQuery;
      let dateQuery;

      if (order === 'new') orderQuery = 'order by cp.created_at desc,';
      else orderQuery = 'order by cp.votes_count desc,';

      console.log(order);
      console.log(date);

      if (date === 'hour')
        dateQuery = `and cp.created_at::timestamp at time zone 'UTC' >= $3::timestamp at time zone 'UTC' - '1 hour'::interval`;
      else if (date === 'day')
        dateQuery = `and cp.created_at::timestamp at time zone 'UTC' >= $3::timestamp at time zone 'UTC' - '1 day'::interval`;
      else if (date === 'week')
        dateQuery = `and cp.created_at::timestamp at time zone 'UTC' >= $3::timestamp at time zone 'UTC' - '1 week'::interval`;
      else if (date === 'month')
        dateQuery = `and cp.created_at::timestamp at time zone 'UTC' >= $3::timestamp at time zone 'UTC' - '1 month'::interval`;
      else if (date === 'year')
        dateQuery = `and cp.created_at::timestamp at time zone 'UTC' >= $3::timestamp at time zone 'UTC' - '1 year'::interval`;
      else dateQuery = 'and cp.created_at < $3';

      const query =
        'select  ' +
        'cp.post_id,  ' +
        'c.name_for_display,  ' +
        'u.username_for_display,  ' +
        'cp.created_at,  ' +
        'cp.title,  ' +
        'cp.text,  ' +
        'cp.votes_count,  ' +
        'cp.comments_count, ' +
        'case when cpv.sign = 1 then true ' +
        'else false end is_liked, ' +
        'case when cpv.sign = -1 then true ' +
        'else false end is_disliked, ' +
        'case when cb.is_deleted = false then true ' +
        'else false end is_bookmarked,  ' +
        'array_agg(ct.name) tags  ' +
        'from communities_posts cp  ' +
        'join users u  ' +
        'on cp.user_id = u.user_id  ' +
        'join communities c  ' +
        'on c.community_id = cp.community_id  ' +
        'left join communities_posts_votes cpv  ' +
        'on cpv.post_id = cp.post_id  ' +
        'and cpv.user_id = $2 ' +
        'left join communities_bookmarks cb  ' +
        'on cp.post_id = cb.post_id  ' +
        'and cb.user_id = $2 ' +
        'left join communities_tags ct  ' +
        'on cp.post_id = ct.post_id  ' +
        'where  ' +
        'u.username = $1 and ' +
        'cp.is_deleted = false ' +
        `${dateQuery} ` +
        'group by  ' +
        'cp.post_id,  ' +
        'c.name_for_display,  ' +
        'u.username_for_display,  ' +
        'cp.created_at,  ' +
        'cp.title,  ' +
        'cp.text,  ' +
        'cp.votes_count,  ' +
        'cp.comments_count,  ' +
        'cpv.sign, ' +
        'cpv.user_id, ' +
        'cb.is_deleted, ' +
        'cb.user_id ' +
        `${orderQuery} ` +
        'cp.comments_count desc;';
      let values = [req.query.username.toLowerCase(), 0, currentTimestamp];
      if (user)
        values = [req.query.username.toLowerCase(), user.sub, currentTimestamp];

      const dbResponse = await this.databaseService.query(query, values);
      return dbResponse.rows;
    } catch (error) {
      console.error(error);
      return { status: 'Something went wrong' };
    }
  }

  @Get('user-comments')
  async getUserComments(
    @Res({ passthrough: true }) res: Response,
    @Request() req,
  ) {
    try {
      let user = null;
      try {
        const authCookie = req.cookies['auth-cookie'];
        if (authCookie) {
          const accessToken = JSON.parse(authCookie).accessToken;
          user = this.jwtService.verify(accessToken);
        }
      } catch (error) {
        console.log(error);
      }

      const currentTimestamp = new Date().toUTCString();

      const order = req.query.order;
      const date = req.query.date;
      const search = req.query.for;

      let orderQuery;
      let dateQuery;
      let searchQuery;

      if (order === 'new') orderQuery = 'order by cc.created_at desc;';
      else orderQuery = 'order by cc.votes_count desc;';

      if (date === 'hour')
        dateQuery = `and cc.created_at::timestamp at time zone 'UTC' >= $2::timestamp at time zone 'UTC' - '1 hour'::interval`;
      else if (date === 'day')
        dateQuery = `and cc.created_at::timestamp at time zone 'UTC' >= $2::timestamp at time zone 'UTC' - '1 day'::interval`;
      else if (date === 'week')
        dateQuery = `and cc.created_at::timestamp at time zone 'UTC' >= $2::timestamp at time zone 'UTC' - '1 week'::interval`;
      else if (date === 'month')
        dateQuery = `and cc.created_at::timestamp at time zone 'UTC' >= $2::timestamp at time zone 'UTC' - '1 month'::interval`;
      else if (date === 'year')
        dateQuery = `and cc.created_at::timestamp at time zone 'UTC' >= $2::timestamp at time zone 'UTC' - '1 year'::interval`;
      else dateQuery = 'and cc.created_at < $2';

      const username = req.query.username.toLowerCase();
      let usernameQuery;
      if (username === 'any') usernameQuery = `where `;
      else usernameQuery = `where u.username = $3 and `;

      if (search) searchQuery = `lower(cc.text) like '%'||$3||'%' and`;
      else searchQuery = '';

      const query =
        'select ' +
        '(select username_for_display from users where user_id =  ' +
        ' (select user_id from communities_comments where comment_id = cc.replied_to_comment_id) ' +
        ') replied_to, ' +
        '(select created_at from communities_posts where post_id = cc.post_id) created_at, ' +
        'cp.title, ' +
        'cp.post_id, ' +
        'cc.comment_id, ' +
        'c.name_for_display, ' +
        '(select username_for_display from users where user_id = cc.user_id), ' +
        'cc.created_at replied_to_at, ' +
        'case when cc.edited_text is not null then cc.edited_text ' +
        'else cc.text end, ' +
        'cc.votes_count, ' +
        'case when ccv.sign = 1 then true ' +
        'else false end is_liked, ' +
        'case when ccv.sign = -1 then true ' +
        'else false end is_disliked, ' +
        'case when cc.user_id = $1 then true ' +
        'else false end is_author ' +
        'from communities_posts cp ' +
        'join communities_comments cc ' +
        'on cc.post_id = cp.post_id ' +
        'join users u ' +
        'on cc.user_id = u.user_id ' +
        'join communities c ' +
        'on c.community_id = cp.community_id ' +
        'left join communities_comments_votes ccv ' +
        'on ccv.comment_id = cc.comment_id ' +
        'and ccv.user_id = $1 ' +
        `${usernameQuery} ` +
        'cp.is_deleted = false and ' +
        `${searchQuery} ` +
        'cc.is_deleted = false ' +
        `${dateQuery} ` +
        `${orderQuery}`;
      let values = [0, currentTimestamp, username];
      if (username === 'any' && search)
        values = [0, currentTimestamp, search.toLowerCase()];
      if (user) values = [user.sub, currentTimestamp, username];
      if (user && username === 'any' && search)
        values = [user.sub, currentTimestamp, search.toLowerCase()];

      console.log(username);
      console.log(search);
      console.log(searchQuery);
      console.log(values);

      const dbResponse = await this.databaseService.query(query, values);
      return dbResponse.rows;
    } catch (error) {
      console.error(error);
      return { status: 'Something went wrong' };
    }
  }

  @Get('community-writer')
  async getCommunityWriter(
    @Res({ passthrough: true }) res: Response,
    @Request() req,
  ) {
    try {
      let user = null;
      try {
        const authCookie = req.cookies['auth-cookie'];
        if (authCookie) {
          const accessToken = JSON.parse(authCookie).accessToken;
          user = this.jwtService.verify(accessToken);
        }
      } catch (error) {
        console.log(error);
      }

      if (user) {
        const query =
          'select ' +
          'name, ' +
          'name_for_display, ' +
          'created_at, ' +
          'follows_count, ' +
          'posts_count, ' +
          'comments_count, ' +
          '(select is_admin from communities_accesses where user_id = (select user_id from users where username = $1) and community_id = (select community_id from communities where name = $2)), ' +
          '(select count(user_id) from communities_follows where user_id = (select user_id from users where username = $1) ' +
          'and community_id = (select community_id from communities where name = $2) and is_deleted = false) is_following ' +
          'from communities ' +
          'where name = $2;';
        const values = [user.username, req.query.name.toLowerCase()];

        const dbResponse = await this.databaseService.query(query, values);
        return dbResponse.rows[0];
      } else {
        const query =
          'select ' +
          'name, ' +
          'name_for_display, ' +
          'created_at, ' +
          'follows_count, ' +
          'posts_count, ' +
          'comments_count, ' +
          'false is_admin, ' +
          'false is_user, ' +
          '0 is_following ' +
          'from communities ' +
          'where name = $1;';
        const values = [req.query.name.toLowerCase()];

        const dbResponse = await this.databaseService.query(query, values);
        return dbResponse.rows[0];
      }
    } catch (error) {
      console.error(error);
      return { status: 'Something went wrong' };
    }
  }

  @Get('follow')
  async getFollow(@Res({ passthrough: true }) res: Response, @Request() req) {
    try {
      let user = null;
      try {
        const authCookie = req.cookies['auth-cookie'];
        if (authCookie) {
          const accessToken = JSON.parse(authCookie).accessToken;
          user = this.jwtService.verify(accessToken);
        }
      } catch (error) {
        console.log(error);
      }

      if (user) {
        const query =
          'select count(*) ' +
          'from communities_follows cf ' +
          'join users u ' +
          'on cf.user_id = u.user_id ' +
          'join communities c ' +
          'on cf.community_id = c.community_id ' +
          'where u.username = $1 and ' +
          'c.name = $2';
        const values = [user.username, req.query.name.toLowerCase()];

        const dbResponse = await this.databaseService.query(query, values);
        return dbResponse.rows[0];
      } else {
        return { status: 'User is not logged in' };
      }
    } catch (error) {
      console.error(error);
      return { status: 'Something went wrong' };
    }
  }

  @Get('bookmark')
  async getBookmark(@Res({ passthrough: true }) res: Response, @Request() req) {
    try {
      let user = null;
      try {
        const authCookie = req.cookies['auth-cookie'];
        if (authCookie) {
          const accessToken = JSON.parse(authCookie).accessToken;
          user = this.jwtService.verify(accessToken);
        }
      } catch (error) {
        console.log(error);
      }

      if (user) {
        const query =
          'select is_deleted ' +
          'from communities_bookmarks ' +
          'where ' +
          'post_id = $2 and ' +
          'user_id = $1;';
        const values = [user.sub, Number(req.query.postId)];

        const dbResponse = await this.databaseService.query(query, values);
        return dbResponse.rows[0];
      } else {
        return { status: 'User is not logged in' };
      }
    } catch (error) {
      console.error(error);
      return { status: 'Something went wrong' };
    }
  }

  @Post('bookmark')
  async postBookmark(
    @Res({ passthrough: true }) res: Response,
    @Request() req,
  ) {
    try {
      let user = null;
      try {
        const authCookie = req.cookies['auth-cookie'];
        if (authCookie) {
          const accessToken = JSON.parse(authCookie).accessToken;
          user = this.jwtService.verify(accessToken);
        }
      } catch (error) {
        console.log(error);
      }

      const currentTimestamp = new Date().toUTCString();
      const createdAt = currentTimestamp;
      const updatedAt = currentTimestamp;

      if (user) {
        const query =
          'insert into communities_bookmarks ' +
          '(post_id, user_id, created_at, updated_at) ' +
          'values ' +
          '($2, $1, $3, $4);';
        const values = [
          user.sub,
          Number(req.body.postId),
          createdAt,
          updatedAt,
        ];

        const dbResponse = await this.databaseService.query(query, values);
        return { status: 'Success' };
      } else {
        return { status: 'User is not logged in' };
      }
    } catch (error) {
      console.error(error);
      return { status: 'Something went wrong' };
    }
  }

  @Put('edit-text')
  async putEditText(@Res({ passthrough: true }) res: Response, @Request() req) {
    try {
      let user = null;
      try {
        const authCookie = req.cookies['auth-cookie'];
        if (authCookie) {
          const accessToken = JSON.parse(authCookie).accessToken;
          user = this.jwtService.verify(accessToken);
        }
      } catch (error) {
        console.log(error);
      }

      if (user) {
        const query =
          'update communities_comments ' +
          'set edited_text = $3 ' +
          'where comment_id = $2 ' +
          'and user_id = $1;';
        const values = [
          user.sub,
          Number(req.body.commentId),
          req.body.editText,
        ];

        const dbResponse = await this.databaseService.query(query, values);
        return { status: 'Success' };
      } else {
        return { status: 'User is not logged in' };
      }
    } catch (error) {
      console.error(error);
      return { status: 'Something went wrong' };
    }
  }

  @Put('remove-post')
  async putRemovePost(
    @Res({ passthrough: true }) res: Response,
    @Request() req,
  ) {
    try {
      let user = null;
      try {
        const authCookie = req.cookies['auth-cookie'];
        if (authCookie) {
          const accessToken = JSON.parse(authCookie).accessToken;
          user = this.jwtService.verify(accessToken);
        }
      } catch (error) {
        console.log(error);
      }

      if (user) {
        const query1 =
          'update communities_posts ' +
          'set is_deleted = true, ' +
          'deleted_response = $2 ' +
          'where post_id = $1;';
        const values1 = [Number(req.body.postId), 'Deleted by user'];

        const query2 =
          'update communities ' +
          'set posts_count = posts_count - 1 ' +
          'where community_id = (select community_id from communities_posts where post_id = $1);';
        const values2 = [Number(req.body.postId)];

        const query3 =
          'update users ' +
          'set posts_count = posts_count - 1 ' +
          'where user_id = (select user_id from communities_posts where post_id = $1);';
        const values3 = [Number(req.body.postId)];

        // const query4 =
        //   'update communities ' +
        //   'set comments_count = comments_count - (select count(*) from communities_comments where post_id = $1) ' +
        //   'where community_id = (select community_id from communities_posts where post_id = $1);';
        // const values4 = [Number(req.body.postId)];

        // const query5 =
        //   'update users ' +
        //   'set comments_count = comments_count - (select count(*) from communities_comments where post_id = $1) ' +
        //   'where user_id = (select user_id from communities_posts where post_id = $1);';
        // const values5 = [Number(req.body.postId)];

        const dbResponse1 = await this.databaseService.query(query1, values1);
        let dbResponse2;
        if (dbResponse1)
          dbResponse2 = await this.databaseService.query(query2, values2);
        let dbResponse3;
        if (dbResponse2)
          dbResponse3 = await this.databaseService.query(query3, values3);
        // let dbResponse4;
        // if (dbResponse3)
        //   dbResponse4 = await this.databaseService.query(query4, values4);
        // let dbResponse5;
        // if (dbResponse4)
        //   dbResponse5 = await this.databaseService.query(query5, values5);
        return { status: 'Success' };
      } else {
        return { status: 'User is not logged in' };
      }
    } catch (error) {
      console.error(error);
      return { status: 'Something went wrong' };
    }
  }

  @Put('remove-comment')
  async putRemoveComment(
    @Res({ passthrough: true }) res: Response,
    @Request() req,
  ) {
    try {
      let user = null;
      try {
        const authCookie = req.cookies['auth-cookie'];
        if (authCookie) {
          const accessToken = JSON.parse(authCookie).accessToken;
          user = this.jwtService.verify(accessToken);
        }
      } catch (error) {
        console.log(error);
      }

      if (user) {
        const query1 =
          'update communities_comments ' +
          'set is_deleted = true, ' +
          'deleted_response = $2 ' +
          'where comment_id = $1;';
        const values1 = [Number(req.body.commentId), 'Deleted by user'];

        const query2 =
          'update communities_posts ' +
          'set comments_count = comments_count - 1 ' +
          'where post_id = (select post_id from communities_comments where comment_id = $1);';
        const values2 = [Number(req.body.commentId)];

        const query3 =
          'update communities ' +
          'set comments_count = comments_count - 1 ' +
          'where community_id = (select community_id from communities_comments where comment_id = $1);';
        const values3 = [Number(req.body.commentId)];

        const query4 =
          'update users ' +
          'set comments_count = comments_count - 1 ' +
          'where user_id = (select user_id from communities_comments where comment_id = $1);';
        const values4 = [Number(req.body.commentId)];

        const dbResponse1 = await this.databaseService.query(query1, values1);
        let dbResponse2;
        if (dbResponse1)
          dbResponse2 = await this.databaseService.query(query2, values2);
        let dbResponse3;
        if (dbResponse2)
          dbResponse3 = await this.databaseService.query(query3, values3);
        let dbResponse4;
        if (dbResponse3)
          dbResponse4 = await this.databaseService.query(query4, values4);
        return { status: 'Success' };
      } else {
        return { status: 'User is not logged in' };
      }
    } catch (error) {
      console.error(error);
      return { status: 'Something went wrong' };
    }
  }

  @Put('edit-post')
  async putEditPost(@Res({ passthrough: true }) res: Response, @Request() req) {
    try {
      let user = null;
      try {
        const authCookie = req.cookies['auth-cookie'];
        if (authCookie) {
          const accessToken = JSON.parse(authCookie).accessToken;
          user = this.jwtService.verify(accessToken);
        }
      } catch (error) {
        console.log(error);
      }

      if (user) {
        const currentTimestamp = new Date().toUTCString();
        const createdAt = currentTimestamp;
        const updatedAt = currentTimestamp;

        const query1 =
          'update communities_posts ' +
          'set text = $3, title = $4 ' +
          'where post_id = $2 ' +
          'and user_id = $1;';
        const values1 = [
          user.sub,
          Number(req.body.postId),
          req.body.editText,
          req.body.editTitle,
        ];

        const query2 = 'delete from communities_tags ' + 'where post_id = $1;';
        const values2 = [Number(req.body.postId)];

        const dbResponse1 = await this.databaseService.query(query1, values1);
        let dbResponse2;
        if (dbResponse1)
          dbResponse2 = await this.databaseService.query(query2, values2);
        if (dbResponse2)
          // This could be refactored into 1 insert statement
          // with select from (select ... from dual union all)
          // that would save a couple of round trips
          // also would be nice to check if there are same tags

          // merge into, when not matched update is_deleted = true
          // when matched update name
          console.log(req.body.editTags);
        req.body.editTags
          .replace(/\s/g, '')
          .substring(1)
          .split('#')
          .forEach(async (tag) => {
            const query3 =
              'insert into communities_tags ( ' +
              'post_id, ' +
              'name, ' +
              'created_at, ' +
              'updated_at, ' +
              'is_deleted) ' +
              'values ( ' +
              '$1, ' +
              '$2, ' +
              '$3, ' +
              '$4, ' +
              '$5);';
            const values3 = [
              Number(req.body.postId),
              tag,
              createdAt,
              updatedAt,
              false,
            ];

            console.log(query3);

            let dbResponse3;
            if (dbResponse2)
              dbResponse3 = await this.databaseService.query(query3, values3);
          });

        return { status: 'Success' };
      } else {
        return { status: 'User is not logged in' };
      }
    } catch (error) {
      console.error(error);
      return { status: 'Something went wrong' };
    }
  }

  @Put('bookmark')
  async putBookmark(@Res({ passthrough: true }) res: Response, @Request() req) {
    try {
      let user = null;
      try {
        const authCookie = req.cookies['auth-cookie'];
        if (authCookie) {
          const accessToken = JSON.parse(authCookie).accessToken;
          user = this.jwtService.verify(accessToken);
        }
      } catch (error) {
        console.log(error);
      }

      if (user) {
        const query =
          'update communities_bookmarks ' +
          'set is_deleted = false ' +
          'where post_id = $2 ' +
          'and user_id = $1;';
        const values = [user.sub, Number(req.body.postId)];

        const dbResponse = await this.databaseService.query(query, values);
        return { status: 'Success' };
      } else {
        return { status: 'User is not logged in' };
      }
    } catch (error) {
      console.error(error);
      return { status: 'Something went wrong' };
    }
  }

  @Put('unbookmark')
  async putUnbookmark(
    @Res({ passthrough: true }) res: Response,
    @Request() req,
  ) {
    try {
      let user = null;
      try {
        const authCookie = req.cookies['auth-cookie'];
        if (authCookie) {
          const accessToken = JSON.parse(authCookie).accessToken;
          user = this.jwtService.verify(accessToken);
        }
      } catch (error) {
        console.log(error);
      }

      if (user) {
        const query =
          'update communities_bookmarks ' +
          'set is_deleted = true ' +
          'where post_id = $2 ' +
          'and user_id = $1;';
        const values = [user.sub, Number(req.body.postId)];

        const dbResponse = await this.databaseService.query(query, values);
        return { status: 'Success' };
      } else {
        return { status: 'User is not logged in' };
      }
    } catch (error) {
      console.error(error);
      return { status: 'Something went wrong' };
    }
  }

  @Get('post-sign')
  async getPostSign(@Res({ passthrough: true }) res: Response, @Request() req) {
    try {
      let user = null;
      try {
        const authCookie = req.cookies['auth-cookie'];
        if (authCookie) {
          const accessToken = JSON.parse(authCookie).accessToken;
          user = this.jwtService.verify(accessToken);
        }
      } catch (error) {
        console.log(error);
      }

      if (user) {
        const query =
          'select sign ' +
          'from communities_posts_votes ' +
          'where ' +
          'post_id = $1 and ' +
          'user_id = $2;';
        const values = [Number(req.query.postId), user.sub];

        const dbResponse = await this.databaseService.query(query, values);
        return dbResponse.rows[0];
      } else {
        return { status: 'User is not logged in' };
      }
    } catch (error) {
      console.error(error);
      return { status: 'Something went wrong' };
    }
  }

  @Get('comment-sign')
  async getCommentSign(
    @Res({ passthrough: true }) res: Response,
    @Request() req,
  ) {
    try {
      let user = null;
      try {
        const authCookie = req.cookies['auth-cookie'];
        if (authCookie) {
          const accessToken = JSON.parse(authCookie).accessToken;
          user = this.jwtService.verify(accessToken);
        }
      } catch (error) {
        console.log(error);
      }

      if (user) {
        const query =
          'select sign ' +
          'from communities_comments_votes ' +
          'where ' +
          'comment_id = $1 and ' +
          'user_id = $2;';
        const values = [Number(req.query.commentId), user.sub];

        const dbResponse = await this.databaseService.query(query, values);
        return dbResponse.rows[0];
      } else {
        return { status: 'User is not logged in' };
      }
    } catch (error) {
      console.error(error);
      return { status: 'Something went wrong' };
    }
  }
}
