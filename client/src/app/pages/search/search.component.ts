import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RequestService } from 'src/app/services/request.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent {
  @ViewChild('postsButton') postsButton: any;
  @ViewChild('commentsButton') commentsButton: any;
  @ViewChild('communitiesButton') communitiesButton: any;
  @ViewChild('usersButton') usersButton: any;
  @ViewChild('posts') posts: any;
  @ViewChild('comments') comments: any;
  @ViewChild('communities') communities: any;
  @ViewChild('users') users: any;

  constructor(
    private requestService: RequestService,
    private route: ActivatedRoute
  ) {}

  searchString: string = this.route.snapshot.queryParams['for'].trim();

  searchPosts: Array<any> = [];
  searchComments: Array<any> = [];
  searchCommunities: Array<any> = [];
  searchUsers: Array<any> = [];

  isPostsOpen: boolean = true;
  isCommentsOpen: boolean = false;
  isCommunitiesOpen: boolean = false;
  isUsersOpen: boolean = false;

  order: string = 'top'; // Default
  scope: string = 'worldwide'; // Default
  date: string = 'all'; // Default

  ngOnInit() {
    this.getPosts();
  }

  sortByOrder(event: any) {
    this.order = event?.target?.value;
    if (this.isUsersOpen) this.openUsers();
    else if (this.isCommentsOpen) this.openComments();
    else if (this.isCommunitiesOpen) this.openCommunities();
    else this.openPosts();
  }

  sortByDate(event: any) {
    this.date = event?.target?.value;
    if (this.isUsersOpen) this.openUsers();
    else if (this.isCommentsOpen) this.openComments();
    else if (this.isCommunitiesOpen) this.openCommunities();
    else this.openPosts();
  }

  sortByScope(event: any) {
    this.scope = event?.target?.value;
    if (this.isUsersOpen) this.openUsers();
    else if (this.isCommentsOpen) this.openComments();
    else if (this.isCommunitiesOpen) this.openCommunities();
    else this.openPosts();
  }

  getUsers() {
    // Create this as an observable
    this.searchString = this.route.snapshot.queryParams['for'].trim();
    this.searchPosts = [];
    this.searchComments = [];
    this.searchCommunities = [];
    this.searchUsers = [];

    const url = `http://localhost:3000/search-users?for=${this.searchString}`;
    this.requestService.getRequest(url).subscribe({
      next: (res) => {
        console.log(res);
        // Refactor into interface
        res.forEach((p: { username_for_display: any }) => {
          this.searchUsers.push({
            usernameForDisplay: p.username_for_display,
          });
        });
      },
      error: (err) => {
        console.error(err.error.message);
      },
    });
  }

  getCommunities() {
    // Create this as an observable
    this.searchString = this.route.snapshot.queryParams['for'].trim();
    this.searchPosts = [];
    this.searchComments = [];
    this.searchCommunities = [];
    this.searchUsers = [];

    const url = `http://localhost:3000/search-communities?scope=${this.scope}&for=${this.searchString}`;
    this.requestService.getRequest(url).subscribe({
      next: (res) => {
        console.log(res);
        // Refactor into interface
        res.forEach((p: { name_for_display: any }) => {
          this.searchCommunities.push({
            nameForDisplay: p.name_for_display,
          });
        });
      },
      error: (err) => {
        console.error(err.error.message);
      },
    });
  }

  getComments() {
    // Create this as an observable
    this.searchString = this.route.snapshot.queryParams['for'].trim();
    this.searchPosts = [];
    this.searchComments = [];
    this.searchCommunities = [];
    this.searchUsers = [];

    const url = `http://localhost:3000/user-comments?username=any&order=${this.order}&date=${this.date}&for=${this.searchString}`;
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
            this.searchComments.push({
              nameForDisplay: p.name_for_display,
              usernameForDisplay: p.username_for_display,
              createdAt: `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`,
              text: p.text,
              likesCount: p.votes_count,
              isLiked: p.is_liked,
              isDisliked: p.is_disliked,
              repliedTo: p.replied_to,
              repliedToAt: `${replyDate.getUTCFullYear()}-${replyDate.getUTCMonth()}-${replyDate.getUTCDate()}`,
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

  getPosts() {
    // Create this as an observable
    this.searchString = this.route.snapshot.queryParams['for'].trim();
    this.searchPosts = [];
    this.searchComments = [];
    this.searchCommunities = [];
    this.searchUsers = [];

    const url = `http://localhost:3000/posts?order=${this.order}&scope=${this.scope}&date=${this.date}&for=${this.searchString}`;
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
            this.searchPosts.push({
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

  // Show same as Communities
  openPosts() {
    this.isPostsOpen = true;
    this.isCommentsOpen = false;
    this.isCommunitiesOpen = false;
    this.isUsersOpen = false;

    let posts = this.posts.nativeElement;
    let postsButton = this.postsButton.nativeElement;
    let comments = this.comments.nativeElement;
    let commentsButton = this.commentsButton.nativeElement;
    let communities = this.communities.nativeElement;
    let communitiesButton = this.communitiesButton.nativeElement;
    let users = this.users.nativeElement;
    let usersButton = this.usersButton.nativeElement;

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

    communities.classList.add('hidden');
    communitiesButton.classList.remove('bg-zinc-800');
    communitiesButton.classList.remove('text-zinc-50');
    communitiesButton.classList.add('bg-zinc-900');
    communitiesButton.classList.add('text-zinc-200');

    users.classList.add('hidden');
    usersButton.classList.remove('bg-zinc-800');
    usersButton.classList.remove('text-zinc-50');
    usersButton.classList.add('bg-zinc-900');
    usersButton.classList.add('text-zinc-200');

    this.getPosts();
  }

  // Same as reply in Profile
  openComments() {
    this.isPostsOpen = false;
    this.isCommentsOpen = true;
    this.isCommunitiesOpen = false;
    this.isUsersOpen = false;

    let posts = this.posts.nativeElement;
    let postsButton = this.postsButton.nativeElement;
    let comments = this.comments.nativeElement;
    let commentsButton = this.commentsButton.nativeElement;
    let communities = this.communities.nativeElement;
    let communitiesButton = this.communitiesButton.nativeElement;
    let users = this.users.nativeElement;
    let usersButton = this.usersButton.nativeElement;

    posts.classList.add('hidden');
    postsButton.classList.remove('bg-zinc-800');
    postsButton.classList.remove('text-zinc-50');
    postsButton.classList.add('bg-zinc-900');
    postsButton.classList.add('text-zinc-200');

    comments.classList.remove('hidden');
    commentsButton.classList.add('bg-zinc-800');
    commentsButton.classList.add('text-zinc-50');
    commentsButton.classList.remove('bg-zinc-900');
    commentsButton.classList.remove('text-zinc-200');

    communities.classList.add('hidden');
    communitiesButton.classList.remove('bg-zinc-800');
    communitiesButton.classList.remove('text-zinc-50');
    communitiesButton.classList.add('bg-zinc-900');
    communitiesButton.classList.add('text-zinc-200');

    users.classList.add('hidden');
    usersButton.classList.remove('bg-zinc-800');
    usersButton.classList.remove('text-zinc-50');
    usersButton.classList.add('bg-zinc-900');
    usersButton.classList.add('text-zinc-200');

    this.getComments();
  }

  // Card-miniscule, as in Bookmarks
  openCommunities() {
    this.isPostsOpen = false;
    this.isCommentsOpen = false;
    this.isCommunitiesOpen = true;
    this.isUsersOpen = false;

    let posts = this.posts.nativeElement;
    let postsButton = this.postsButton.nativeElement;
    let comments = this.comments.nativeElement;
    let commentsButton = this.commentsButton.nativeElement;
    let communities = this.communities.nativeElement;
    let communitiesButton = this.communitiesButton.nativeElement;
    let users = this.users.nativeElement;
    let usersButton = this.usersButton.nativeElement;

    posts.classList.add('hidden');
    postsButton.classList.remove('bg-zinc-800');
    postsButton.classList.remove('text-zinc-50');
    postsButton.classList.add('bg-zinc-900');
    postsButton.classList.add('text-zinc-200');

    comments.classList.add('hidden');
    commentsButton.classList.remove('bg-zinc-800');
    commentsButton.classList.remove('text-zinc-50');
    commentsButton.classList.add('bg-zinc-900');
    commentsButton.classList.add('text-zinc-200');

    communities.classList.remove('hidden');
    communitiesButton.classList.add('bg-zinc-800');
    communitiesButton.classList.add('text-zinc-50');
    communitiesButton.classList.remove('bg-zinc-900');
    communitiesButton.classList.remove('text-zinc-200');

    users.classList.add('hidden');
    usersButton.classList.remove('bg-zinc-800');
    usersButton.classList.remove('text-zinc-50');
    usersButton.classList.add('bg-zinc-900');
    usersButton.classList.add('text-zinc-200');

    this.getCommunities();
  }

  // Card-miniscule, as in Bookmarks, remove star icon if isSearch
  openUsers() {
    this.isPostsOpen = false;
    this.isCommentsOpen = false;
    this.isCommunitiesOpen = false;
    this.isUsersOpen = true;

    let posts = this.posts.nativeElement;
    let postsButton = this.postsButton.nativeElement;
    let comments = this.comments.nativeElement;
    let commentsButton = this.commentsButton.nativeElement;
    let communities = this.communities.nativeElement;
    let communitiesButton = this.communitiesButton.nativeElement;
    let users = this.users.nativeElement;
    let usersButton = this.usersButton.nativeElement;

    posts.classList.add('hidden');
    postsButton.classList.remove('bg-zinc-800');
    postsButton.classList.remove('text-zinc-50');
    postsButton.classList.add('bg-zinc-900');
    postsButton.classList.add('text-zinc-200');

    comments.classList.add('hidden');
    commentsButton.classList.remove('bg-zinc-800');
    commentsButton.classList.remove('text-zinc-50');
    commentsButton.classList.add('bg-zinc-900');
    commentsButton.classList.add('text-zinc-200');

    communities.classList.add('hidden');
    communitiesButton.classList.remove('bg-zinc-800');
    communitiesButton.classList.remove('text-zinc-50');
    communitiesButton.classList.add('bg-zinc-900');
    communitiesButton.classList.add('text-zinc-200');

    users.classList.remove('hidden');
    usersButton.classList.add('bg-zinc-800');
    usersButton.classList.add('text-zinc-50');
    usersButton.classList.remove('bg-zinc-900');
    usersButton.classList.remove('text-zinc-200');

    this.getUsers();
  }
}
