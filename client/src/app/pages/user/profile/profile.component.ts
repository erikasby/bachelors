import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';
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
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent {
  @ViewChild('postsButton') postsButton: any;
  @ViewChild('commentsButton') commentsButton: any;
  @ViewChild('posts') posts: any;
  @ViewChild('comments') comments: any;

  commentsCount: number = 0;
  createdAt: any = 0;
  followsCount: number = 0;
  isFollowing: number = 0;
  isUser: boolean = true;
  postsCount: number = 0;
  username: string = '';
  nameFromParams: string | null = this.route.snapshot.paramMap.get('username');

  constructor(
    private requestService: RequestService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  isPostsOpen: boolean = true;
  isCommentsOpen: boolean = false;

  userPosts: Array<any> = [];
  userComments: Array<any> = [];

  ngOnInit() {
    this.getUserWriter();
    this.initPosts();
  }

  order: string = 'top'; // Default
  date: string = 'all'; // Default

  sortByOrder(event: any) {
    this.order = event?.target?.value;
    if (this.isCommentsOpen) this.initComments();
    else this.initPosts();
  }

  sortByDate(event: any) {
    this.date = event?.target?.value;
    if (this.isCommentsOpen) this.initComments();
    else this.initPosts();
  }

  initComments() {
    this.userComments = [];

    const url = `http://localhost:3000/user-comments?username=${this.nameFromParams}&order=${this.order}&date=${this.date}`;
    this.requestService.getRequest(url).subscribe({
      next: (res) => {
        console.log(res);
        res.forEach(
          (p: {
            name_for_display: any;
            username_for_display: any;
            created_at: any;
            text: any;
            votes_count: any;
            is_liked: any;
            is_disliked: any;
            post_id: any;
            comment_id: any;
            replied_to: any;
            replied_to_at: any;
            title: any;
          }) => {
            const date = new Date(p.created_at);
            const replyDate = new Date(p.replied_to_at);
            this.userComments.push({
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
              text: p.text,
              likesCount: p.votes_count,
              isLiked: p.is_liked,
              isDisliked: p.is_disliked,
              repliedTo: p.replied_to,
              repliedToAt: `${replyDate.getUTCFullYear()}-${
                replyDate.getUTCMonth() < 10
                  ? `0${replyDate.getUTCMonth() + 1}`
                  : replyDate.getUTCMonth() + 1
              }-${
                replyDate.getUTCDate() < 10
                  ? `0${replyDate.getUTCDate()}`
                  : replyDate.getUTCDate()
              }`,
              postId: p.post_id,
              commentId: p.comment_id,
              title: p.title,
            });
          }
        );
      },
      error: (err) => {
        console.error(err.error.message);
      },
    });
  }

  initPosts() {
    this.userPosts = [];
    console.log(this.order);
    console.log(this.date);

    const url = `http://localhost:3000/user-posts?username=${this.nameFromParams}&order=${this.order}&date=${this.date}`;
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
            this.userPosts.push({
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

  getUserWriter(): void {
    const url = `http://localhost:3000/user-writer?username=${this.nameFromParams}`;

    this.requestService.getRequest(url).subscribe({
      next: (res) => {
        if (res) {
          const date = new Date(res.created_at);
          this.commentsCount = res.comments_count;
          this.createdAt = `${date.getUTCFullYear()}-${
            date.getUTCMonth() < 10
              ? `0${date.getUTCMonth() + 1}`
              : date.getUTCMonth() + 1
          }-${
            date.getUTCDate() < 10 ? `0${date.getUTCDate()}` : date.getUTCDate()
          }`;
          this.followsCount = res.follows_count;
          this.isFollowing = 0;
          this.isUser = true;
          this.postsCount = res.posts_count;
          this.username = res.username;
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        console.error(err.error.message);
      },
    });
  }

  openPosts(): void {
    this.isPostsOpen = true;
    this.isCommentsOpen = false;

    let posts = this.posts.nativeElement;
    let postsButton = this.postsButton.nativeElement;
    let comments = this.comments.nativeElement;
    let commentsButton = this.commentsButton.nativeElement;

    posts.classList.remove('hidden');
    postsButton.classList.add('bg-zinc-800');
    postsButton.classList.add('text-zinc-50');
    postsButton.classList.remove('bg-zinc-900');
    postsButton.classList.remove('text-zinc-200');

    comments.classList.add('hidden');
    commentsButton.classList.remove('bg-zinc-800');
    commentsButton.classList.remove('text-zinc-50');
    commentsButton.classList.add('bg-zinc-900');
    commentsButton.classList.add('text-zinc-200');

    this.initPosts();
  }

  openComments(): void {
    this.isPostsOpen = false;
    this.isCommentsOpen = true;

    let posts = this.posts.nativeElement;
    let postsButton = this.postsButton.nativeElement;
    let comments = this.comments.nativeElement;
    let commentsButton = this.commentsButton.nativeElement;

    comments.classList.remove('hidden');
    commentsButton.classList.add('bg-zinc-800');
    commentsButton.classList.add('text-zinc-50');
    commentsButton.classList.remove('bg-zinc-900');
    commentsButton.classList.remove('text-zinc-200');

    posts.classList.add('hidden');
    postsButton.classList.remove('bg-zinc-800');
    postsButton.classList.remove('text-zinc-50');
    postsButton.classList.add('bg-zinc-900');
    postsButton.classList.add('text-zinc-200');

    this.initComments();
  }

  data: Array<Card> = [];
}
