import { Component } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RequestService } from 'src/app/services/request.service';

interface Card {
  nameForDisplay: string;
  usernameForDisplay: string;
  createdAt: string;
  title: string;
  text: string;
  likesCount: number;
  commentsCount: number;
  isLiked: any;
  isDisliked: any;
  isBookmarked: any;
  tags: string[];
  repliedTo: string;
  repliedToAt: string;
  postId: number;
  commentId: number;
  isAuthor: boolean;
  isAdmin: boolean;
}

@Component({
  selector: 'app-communities',
  templateUrl: './communities.component.html',
  styleUrls: ['./communities.component.scss'],
})
export class CommunitiesComponent {
  constructor(
    private authService: AuthService,
    private httpClient: HttpClient,
    private requestService: RequestService
  ) {}

  posts: Array<any> = [];

  order: string = 'top'; // Default
  scope: string = 'worldwide'; // Default
  date: string = 'all'; // Default

  ngOnInit() {
    this.initPosts();
  }

  sortByOrder(event: any) {
    this.order = event?.target?.value;
    this.initPosts();
  }

  sortByScope(event: any) {
    this.scope = event?.target?.value;
    this.initPosts();
  }

  sortByDate(event: any) {
    this.date = event?.target?.value;
    this.initPosts();
  }

  initPosts() {
    this.posts = [];

    const url = `http://localhost:3000/posts?order=${this.order}&scope=${this.scope}&date=${this.date}`;
    this.requestService.getRequest(url).subscribe({
      next: (res) => {
        res.forEach(
          (p: {
            name_for_display: any;
            username_for_display: any;
            created_at: any;
            title: any;
            text: any;
            votes_count: any;
            comments_count: any;
            is_liked: any;
            is_disliked: any;
            is_bookmarked: any;
            tags: any;
            post_id: any;
            comment_id: any;
          }) => {
            const date = new Date(p.created_at);
            this.posts.push({
              nameForDisplay: p.name_for_display,
              usernameForDisplay: p.username_for_display,
              createdAt: `${date.getUTCFullYear()}-${
                date.getUTCMonth() < 10
                  ? `0${date.getUTCMonth() + 1}`
                  : date.getUTCMonth() + 1
              }-${
                date.getUTCDate() < 10
                  ? `0${date.getUTCDate()}`
                  : date.getUTCDate()
              }`,
              title: p.title,
              text: p.text,
              likesCount: p.votes_count,
              commentsCount: p.comments_count,
              isLiked: p.is_liked,
              isDisliked: p.is_disliked,
              isBookmarked: p.is_bookmarked,
              tags: p.tags,
              repliedTo: '',
              repliedToAt: '',
              postId: p.post_id,
              commentId: 0,
            });
          }
        );
      },
      error: (err) => {
        console.error(err.error.message);
      },
    });
  }
}
