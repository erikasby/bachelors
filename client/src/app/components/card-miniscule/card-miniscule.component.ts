import { Component, Input } from '@angular/core';
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
  selector: 'app-card-miniscule',
  templateUrl: './card-miniscule.component.html',
  styleUrls: ['./card-miniscule.component.scss'],
})
export class CardMinisculeComponent {
  isFollowing: boolean = true;
  @Input() isSearch: boolean = false;
  @Input() isSearchUser: boolean = false;
  @Input() card: Card = {
    nameForDisplay: '',
    usernameForDisplay: '',
    createdAt: '',
    title: '',
    text: '',
    likesCount: 0,
    commentsCount: 0,
    isLiked: false,
    isDisliked: false,
    isBookmarked: false,
    tags: [],
    repliedTo: '',
    repliedToAt: '',
    postId: 0,
    commentId: 0,
    isAuthor: false,
    isAdmin: false,
  };

  constructor(private requestService: RequestService) {}

  follow() {
    const url = `http://localhost:3000/follow?name=${this.card.nameForDisplay}`;

    this.requestService.getRequest(url).subscribe({
      next: (res) => {
        if (res.count == 1) {
          this.putFollow();
        } else {
          this.postFollow();
        }
      },
      error: (err) => {
        console.error(err.error.message);
      },
    });
  }

  putFollow() {
    const url = 'http://localhost:3000/follow';
    const data = {
      name: this.card.nameForDisplay,
    };

    this.requestService.putRequest(url, data).subscribe({
      next: (res) => {
        console.log(res);
        // Refactor same as in usersService
        if (res.status === 'Success') {
          this.isFollowing = true;
        } else if (res.status === 'User is not logged in') {
          // this.responseService.setResponse('Success', 'Sign in is required');
          // this.responseService.getResponse();
        } else {
          console.error(res);
        }
      },
      error: (err) => {
        console.error(err.error.message);
      },
    });
  }

  postFollow() {
    const url = 'http://localhost:3000/follow';
    const data = {
      name: this.card.nameForDisplay,
    };

    this.requestService.postRequest(url, data).subscribe({
      next: (res) => {
        console.log(res);
        // Refactor same as in usersService
        if (res.status === 'Success') {
          this.isFollowing = true;
        }
        if (res.status === 'User is not logged in') {
          // give response error here
        } else {
          console.error(res);
        }
      },
      error: (err) => {
        console.error(err.error.message);
      },
    });
  }

  unfollow() {
    const url = 'http://localhost:3000/unfollow';
    const data = {
      name: this.card.nameForDisplay,
    };

    this.requestService.putRequest(url, data).subscribe({
      next: (res) => {
        console.log(res);
        // Refactor same as in usersService
        if (res.status === 'Success') {
          this.isFollowing = false;
        } else if (res.status === 'User is not logged in') {
          // give response error here
        } else {
          console.error(res);
        }
      },
      error: (err) => {
        console.error(err.error.message);
      },
    });
  }
}
