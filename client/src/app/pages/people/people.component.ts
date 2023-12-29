import { Component } from '@angular/core';

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
  selector: 'app-people',
  templateUrl: './people.component.html',
  styleUrls: ['./people.component.scss'],
})
export class PeopleComponent {
  data: Array<Card> = [];

  // data: Array<Card> = [
  //   {
  //     id: 1,
  //     appendix: 'p',
  //     author: 'NetflixTechnologyBlog',
  //     date: 'Aug 18',
  //     readingTime: '',
  //     title: '',
  //     text: 'Netflix’s service mesh adoption: history, motivations, and how we worked with the Envoy community on a feature to streamline mesh adoption',
  //     tags: ['#photography', '#travel', '#winter'],
  //     likesCount: 434,
  //     dislikesCount: 4,
  //     commentsCount: 46,
  //     isBookmarked: true,
  //   },
  //   {
  //     id: 2,
  //     appendix: 'p',
  //     author: 'NetflixTechnologyBlog',
  //     date: 'Aug 18',
  //     readingTime: '',
  //     title: '',
  //     text: 'Netflix’s service mesh adoption: history, motivations, and how we worked with the Envoy community on a feature to streamline mesh adoption',
  //     tags: ['#photography', '#travel', '#winter'],
  //     likesCount: 434,
  //     dislikesCount: 4,
  //     commentsCount: 46,
  //     isBookmarked: true,
  //   },
  //   {
  //     id: 3,
  //     appendix: 'p',
  //     author: 'NetflixTechnologyBlog',
  //     date: 'Aug 18',
  //     readingTime: '',
  //     title: '',
  //     text: 'Netflix’s service mesh adoption: history, motivations, and how we worked with the Envoy community on a feature to streamline mesh adoption',
  //     tags: ['#photography', '#travel', '#winter'],
  //     likesCount: 434,
  //     dislikesCount: 4,
  //     commentsCount: 46,
  //     isBookmarked: true,
  //   },
  //   {
  //     id: 4,
  //     appendix: 'p',
  //     author: 'NetflixTechnologyBlog',
  //     date: 'Aug 18',
  //     readingTime: '',
  //     title: '',
  //     text: 'Netflix’s service mesh adoption: history, motivations, and how we worked with the Envoy community on a feature to streamline mesh adoption',
  //     tags: ['#photography', '#travel', '#winter'],
  //     likesCount: 434,
  //     dislikesCount: 4,
  //     commentsCount: 46,
  //     isBookmarked: true,
  //   },
  //   {
  //     id: 5,
  //     appendix: 'p',
  //     author: 'NetflixTechnologyBlog',
  //     date: 'Aug 18',
  //     readingTime: '',
  //     title: '',
  //     text: 'Netflix’s service mesh adoption: history, motivations, and how we worked with the Envoy community on a feature to streamline mesh adoption',
  //     tags: ['#photography', '#travel', '#winter'],
  //     likesCount: 434,
  //     dislikesCount: 4,
  //     commentsCount: 46,
  //     isBookmarked: true,
  //   },
  // ];
}
