import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
  selector: 'app-following',
  templateUrl: './following.component.html',
  styleUrls: ['./following.component.scss'],
})
export class FollowingComponent {
  data: Array<any> = [];

  constructor(
    private requestService: RequestService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.initFollows();
  }

  initFollows() {
    const url = `http://localhost:3000/user-follows`;

    this.requestService.getRequest(url).subscribe({
      next: (res) => {
        console.log(res);
        // Refactor into interface
        res.forEach((p: { name_for_display: any }) => {
          this.data.push({
            nameForDisplay: p.name_for_display,
          });
        });
        console.log(this.data);
      },
      error: (err) => {
        console.error(err.error.message);
      },
    });
  }
}
