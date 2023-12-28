import { HttpClient } from '@angular/common/http';
import { Component, Input, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ResponseService } from 'src/app/components/response/response.service';
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
  selector: 'app-community',
  templateUrl: './community.component.html',
  styleUrls: ['./community.component.scss'],
})
export class CommunityComponent {
  constructor(
    private httpClient: HttpClient,
    private router: Router,
    private responseService: ResponseService,
    private requestService: RequestService,
    private route: ActivatedRoute
  ) {}

  isInsideCommunity: boolean = true;

  @ViewChild('postBox') postBox: any;
  @ViewChild('addPostButton') addPostButton: any;
  @ViewChild('closePostButton') closePostButton: any;

  @ViewChild('title') title: any;
  @ViewChild('bodyText') bodyText: any;
  @ViewChild('tags') tags: any;

  // Writer
  commentsCount: number = 0;
  createdAt: any = 0;
  followsCount: number = 0;
  isFollowing: number = 0;
  isUser: boolean = false;
  postsCount: number = 0;
  username: string = '';
  isAdmin: any = null;
  nameFromParams: string | null = this.route.snapshot.paramMap.get('community');

  // Post
  posts: Array<any> = [];

  isTitleValid: boolean = true;
  isBodyTextValid: boolean = true;
  isTagsValid: boolean = true;

  order: string = 'top'; // Default
  date: string = 'all'; // Default

  sortByOrder(event: any) {
    this.order = event?.target?.value;
    this.getPosts();
  }

  sortByDate(event: any) {
    this.date = event?.target?.value;
    this.getPosts();
  }

  ngOnInit() {
    this.getCommunityWriter();
    this.getPosts();
  }

  reset() {
    this.isTitleValid = true;
    this.isBodyTextValid = true;
    this.isTagsValid = true;
  }

  validatePost() {
    this.isTitleValid = this.validateTitle();
    this.isBodyTextValid = this.validateBodyText();
    this.isTagsValid = this.validateTags();

    if (this.isTitleValid && this.isBodyTextValid && this.isTagsValid)
      this.postPost();
  }

  validateTitle() {
    let title = this.title.nativeElement.value;
    if (title.length > 50 || title.length < 4) return false;
    return true;
  }

  validateBodyText() {
    let bodyText = this.bodyText.nativeElement.value;
    if (bodyText.length > 10000 || bodyText.length < 25) return false;
    return true;
  }

  validateTags() {
    // Max. 5 tags each with a limit of 30 characters; separate them with spaces
    let regex = /^#[a-zA-Z0-9-]{1,30}(?: #[a-zA-Z0-9-]{1,30}){0,4}$/;
    let tags = this.tags.nativeElement.value;
    if (!regex.test(tags) && tags.length < 4) return false;
    return true;
  }

  postPost() {
    const url = 'http://localhost:3000/post';
    const data = {
      title: this.title.nativeElement.value,
      bodyText: this.bodyText.nativeElement.value,
      tags: this.tags.nativeElement.value,
      name: this.nameFromParams,
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

  getPosts() {
    this.posts = [];

    const url = `http://localhost:3000/community-posts?name=${this.nameFromParams}&order=${this.order}&date=${this.date}`;
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

  getCommunityWriter(): void {
    const url = `http://localhost:3000/community-writer?name=${this.nameFromParams}`;

    this.requestService.getRequest(url).subscribe({
      next: (res) => {
        if (res) {
          const date = new Date(res.created_at);
          this.nameFromParams = res.name_for_display;
          this.commentsCount = res.comments_count;
          this.createdAt = `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`;
          this.followsCount = res.follows_count;
          this.isFollowing = res.is_following;
          this.isAdmin = res.is_admin;
          this.isUser = false;
          this.postsCount = res.posts_count;
          this.username = res.username;
        } else this.router.navigate(['/']);
      },
      error: (err) => {
        console.error(err.error.message);
      },
    });
  }

  autoResize(): void {
    const toResize = [
      this.title.nativeElement,
      this.bodyText.nativeElement,
      this.tags.nativeElement,
    ];

    toResize.forEach((item) => {
      item.style.height = 'auto';
      item.style.height = item.scrollHeight + 'px';
    });
  }

  togglePost(): void {
    this.postBox.nativeElement.classList.toggle('hidden');
    this.postBox.nativeElement.classList.toggle('mb-4');
    this.addPostButton.nativeElement.classList.toggle('mb-4');
    this.addPostButton.nativeElement.classList.toggle('mb-2');
    this.addPostButton.nativeElement.classList.toggle('hidden');
    this.closePostButton.nativeElement.classList.toggle('hidden');
  }

  data: Array<Card> = [];
}
