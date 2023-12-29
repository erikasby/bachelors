import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss'],
})
export class PostComponent {
  @ViewChild('commentBox') commentBox: any;
  @ViewChild('addCommentButton') addCommentButton: any;
  @ViewChild('closeCommentButton') closeCommentButton: any;
  @ViewChild('bodyText') bodyText: any;

  constructor(
    private requestService: RequestService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  commentsCount: number = 0;
  createdAt: any = 0;
  followsCount: number = 0;
  isFollowing: number = 0;
  isUser: boolean = true;
  postsCount: number = 0;
  username: string = '';
  nameFromParams: string | null = this.route.snapshot.paramMap.get('community');
  postIdFromParams: string | null = this.route.snapshot.paramMap.get('postId');

  post: any;
  comments: Array<any> = [];

  ngOnInit() {
    this.initPost();
    this.initComments();
  }

  order: string = 'top'; // Default
  date: string = 'all'; // Default

  sortByOrder(event: any) {
    this.order = event?.target?.value;
    this.initComments();
  }

  sortByDate(event: any) {
    this.date = event?.target?.value;
    this.initComments();
  }

  initComments() {
    this.comments = [];

    const url = `http://localhost:3000/post-comments?name=${this.nameFromParams}&postId=${this.postIdFromParams}&order=${this.order}&date=${this.date}`;
    this.requestService.getRequest(url).subscribe({
      next: (res) => {
        console.log(res);
        res.forEach(
          (p: {
            depth: any;
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
            is_author: any;
            is_admin: any;
          }) => {
            const date = new Date(p.created_at);
            console.log(p.depth);
            this.comments.push({
              depth: p.depth,
              nameForDisplay: p.name_for_display,
              usernameForDisplay: p.username_for_display,
              createdAt: `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`,
              text: p.text,
              likesCount: p.votes_count,
              isLiked: p.is_liked,
              isDisliked: p.is_disliked,
              postId: p.post_id,
              commentId: p.comment_id,
              repliedTo: p.replied_to,
              isAuthor: p.is_author,
              isAdmin: p.is_admin,
            });
          }
        );
        console.log(this.comments);
      },
      error: (err) => {
        console.error(err.error.message);
      },
    });
  }

  isTextValid: boolean = true;

  reset() {
    this.isTextValid = true;
  }

  validateComment() {
    let text = this.bodyText.nativeElement.value;
    if (text.length > 1000 || text.length < 3) this.isTextValid = false;
    else this.postComment();
  }

  postComment() {
    const url = 'http://localhost:3000/comment';
    const data = {
      bodyText: this.bodyText.nativeElement.value,
      name: this.nameFromParams,
      postId: this.postIdFromParams,
    };

    this.requestService.postRequest(url, data).subscribe({
      next: (res) => {
        if (res.status === 'Success') {
          location.reload();
        } else if (res.status === 'User is not logged in') {
          console.log(res);
        } else {
          console.error(res);
        }
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  initPost() {
    const url = `http://localhost:3000/post?name=${this.nameFromParams}&postId=${this.postIdFromParams}`;

    this.requestService.getRequest(url).subscribe({
      next: (res) => {
        if (res.length > 0) {
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
              is_author: any;
              is_admin: any;
            }) => {
              const date = new Date(p.created_at);
              this.post = {
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
                isAuthor: p.is_author,
                isAdmin: p.is_admin,
              };
            }
          );
        } else this.router.navigate(['/']);
      },
      error: (err) => {
        console.error(err.error.message);
      },
    });
  }

  autoResize(): void {
    const bodyText = this.bodyText.nativeElement;
    bodyText.style.height = 'auto';
    bodyText.style.height = bodyText.scrollHeight + 'px';
  }

  // data: Card = {
  //   id: 1,
  //   appendix: 'c',
  //   author: 'NetflixTechnologyBlog',
  //   date: 'Aug 18',
  //   readingTime: '',
  //   title:
  //     'Zero Configuration Service Mesh with On-Demand Cluster Discovery Zero Configuration Service Mesh with On-Demand Cluster Discovery',
  //   text: 'Netflix’s service mesh adoption: history, motivations, and how we worked with the Envoy community on a feature to streamline mesh adoption',
  //   tags: ['#photography', '#travel', '#winter'],
  //   likesCount: 434,
  //   dislikesCount: 4,
  //   commentsCount: 46,
  //   isBookmarked: true,
  // };

  toggleComment(): void {
    this.commentBox.nativeElement.classList.toggle('hidden');
    this.commentBox.nativeElement.classList.toggle('mb-4');
    this.addCommentButton.nativeElement.classList.toggle('mb-4');
    this.addCommentButton.nativeElement.classList.toggle('mb-2');
    this.addCommentButton.nativeElement.classList.toggle('hidden');
    this.closeCommentButton.nativeElement.classList.toggle('hidden');
  }
}
