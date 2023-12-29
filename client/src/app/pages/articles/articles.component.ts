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
  selector: 'app-articles',
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.scss'],
})
export class ArticlesComponent {
  data: Array<Card> = [];
  // data: Array<Card> = [
  //   {
  //     id: 1,
  //     appendix: 'a',
  //     author: 'NetflixTechnologyBlog',
  //     date: 'Aug 18',
  //     readingTime: '12 min read',
  //     title:
  //       'Zero Configuration Service Mesh with On-Demand Cluster Discovery Zero Configuration Service Mesh with On-Demand Cluster Discovery',
  //     text: '',
  //     tags: ['#photography', '#travel', '#winter'],
  //     likesCount: 434,
  //     dislikesCount: 4,
  //     commentsCount: 46,
  //     isBookmarked: true,
  //   },
  //   {
  //     id: 2,
  //     appendix: 'a',
  //     author: 'NetflixTechnologyBlog',
  //     date: 'Aug 18',
  //     readingTime: '12 min read',
  //     title:
  //       'Zero Configuration Service Mesh with On-Demand Cluster Discovery Zero Configuration Service Mesh with On-Demand Cluster Discovery',
  //     text: '',
  //     tags: ['#photography', '#travel', '#winter'],
  //     likesCount: 434,
  //     dislikesCount: 4,
  //     commentsCount: 46,
  //     isBookmarked: true,
  //   },
  //   {
  //     id: 3,
  //     appendix: 'a',
  //     author: 'NetflixTechnologyBlog',
  //     date: 'Aug 18',
  //     readingTime: '12 min read',
  //     title:
  //       'Zero Configuration Service Mesh with On-Demand Cluster Discovery Zero Configuration Service Mesh with On-Demand Cluster Discovery',
  //     text: '',
  //     tags: ['#photography', '#travel', '#winter'],
  //     likesCount: 434,
  //     dislikesCount: 4,
  //     commentsCount: 46,
  //     isBookmarked: true,
  //   },
  //   {
  //     id: 4,
  //     appendix: 'a',
  //     author: 'NetflixTechnologyBlog',
  //     date: 'Aug 18',
  //     readingTime: '12 min read',
  //     title:
  //       'Zero Configuration Service Mesh with On-Demand Cluster Discovery Zero Configuration Service Mesh with On-Demand Cluster Discovery',
  //     text: '',
  //     tags: ['#photography', '#travel', '#winter'],
  //     likesCount: 434,
  //     dislikesCount: 4,
  //     commentsCount: 46,
  //     isBookmarked: true,
  //   },
  //   {
  //     id: 5,
  //     appendix: 'a',
  //     author: 'NetflixTechnologyBlog',
  //     date: 'Aug 18',
  //     readingTime: '12 min read',
  //     title:
  //       'Zero Configuration Service Mesh with On-Demand Cluster Discovery Zero Configuration Service Mesh with On-Demand Cluster Discovery',
  //     text: '',
  //     tags: ['#photography', '#travel', '#winter'],
  //     likesCount: 434,
  //     dislikesCount: 4,
  //     commentsCount: 46,
  //     isBookmarked: true,
  //   },
  // ];
}
