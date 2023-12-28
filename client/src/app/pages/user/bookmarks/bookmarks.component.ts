import { Component } from '@angular/core';
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
  selector: 'app-bookmarks',
  templateUrl: './bookmarks.component.html',
  styleUrls: ['./bookmarks.component.scss'],
})
export class BookmarksComponent {
  data: Array<any> = [];

  constructor(private requestService: RequestService) {}

  ngOnInit() {
    this.initPosts();
  }

  initPosts() {
    const url = 'http://localhost:3000/bookmarked-posts';

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
            this.data.push({
              nameForDisplay: p.name_for_display,
              usernameForDisplay: p.username_for_display,
              createdAt: `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`,
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
