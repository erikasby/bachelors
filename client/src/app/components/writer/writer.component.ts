import { Component, Input } from '@angular/core';
import { RequestService } from 'src/app/services/request.service';
import { ResponseService } from '../response/response.service';

@Component({
  selector: 'app-writer',
  templateUrl: './writer.component.html',
  styleUrls: ['./writer.component.scss'],
})
export class WriterComponent {
  isPostingHidden: boolean = true;
  isInformationHidden: boolean = true;
  areBothHidden: boolean = true;
  @Input() name: string | null = '';
  @Input() createdAt: any = 0;
  @Input() followsCount: number = 0;
  @Input() postsCount: number = 0;
  @Input() commentsCount: number = 0;
  @Input() isFollowing: number = 0;
  @Input() isUser: boolean = false;
  @Input() isAdmin: boolean = false;

  constructor(
    private requestService: RequestService,
    private responseService: ResponseService
  ) {}

  ngOnInit() {}

  follow() {
    const url = `http://localhost:3000/follow?name=${this.name}`;

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
      name: this.name,
    };

    this.requestService.putRequest(url, data).subscribe({
      next: (res) => {
        console.log(res);
        // Refactor same as in usersService
        if (res.status === 'Success') {
          this.isFollowing = 1;
          this.followsCount = this.followsCount + 1;
        } else if (res.status === 'User is not logged in') {
          this.responseService.setResponse('Success', 'Sign in is required');
          this.responseService.getResponse();
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
      name: this.name,
    };

    this.requestService.postRequest(url, data).subscribe({
      next: (res) => {
        console.log(res);
        // Refactor same as in usersService
        if (res.status === 'Success') {
          this.isFollowing = 1;
          this.followsCount = this.followsCount + 1;
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
      name: this.name,
    };

    this.requestService.putRequest(url, data).subscribe({
      next: (res) => {
        console.log(res);
        // Refactor same as in usersService
        if (res.status === 'Success') {
          this.isFollowing = 0;
          this.followsCount = this.followsCount - 1;
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

  openPosting() {
    this.isInformationHidden = true;
    this.isPostingHidden = !this.isPostingHidden;
    this.checkBothHidden();
  }

  openInformation() {
    this.isPostingHidden = true;
    this.isInformationHidden = !this.isInformationHidden;
    this.checkBothHidden();
  }

  checkBothHidden() {
    if (this.isInformationHidden && this.isPostingHidden)
      this.areBothHidden = true;
    else this.areBothHidden = false;
  }
}
