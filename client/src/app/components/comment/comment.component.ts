import { Component, Input, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RequestService } from 'src/app/services/request.service';

interface Comment {
  depth: number;
  nameForDisplay: string;
  usernameForDisplay: string;
  createdAt: string;
  text: string;
  likesCount: number;
  isLiked: any;
  isDisliked: any;
  postId: number;
  commentId: number;
  repliedTo: string;
  isAuthor: boolean;
  isAdmin: boolean;
}

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss'],
})
export class CommentComponent {
  @ViewChild('commentContainer') commentContainer: any;
  @ViewChild('replyBox') replyBox: any;
  @ViewChild('actionsElement') actionsElement: any;
  @ViewChild('addReplyButton') addReplyButton: any;
  @ViewChild('closeReplyButton') closeReplyButton: any;
  @ViewChild('bodyText') bodyText: any;
  @ViewChild('editText') editText: any;
  @ViewChild('editBox') editBox: any;

  @ViewChild('localResponseContainer') localResponseContainer: any;
  @ViewChild('localResponse') localResponse: any;

  @Input() comment: Comment = {
    depth: 0,
    nameForDisplay: '',
    usernameForDisplay: '',
    createdAt: '',
    text: '',
    likesCount: 0,
    isLiked: false,
    isDisliked: false,
    postId: 0,
    commentId: 0,
    repliedTo: '',
    isAuthor: false,
    isAdmin: false,
  };

  isEditing: boolean = false;
  isRemoving: boolean = false;
  nameFromParams: string | null = this.route.snapshot.paramMap.get('community');
  postIdFromParams: string | null = this.route.snapshot.paramMap.get('postId');

  localResponseType = '';

  constructor(
    private requestService: RequestService,
    private route: ActivatedRoute
  ) {}

  isEditTextValid: boolean = true;
  isBodyTextValid: boolean = true;

  showLocalResponse(responseMessage: string, type: string): void {
    const localResponseContainer = this.localResponseContainer.nativeElement;
    const localResponse = this.localResponse.nativeElement;
    this.localResponseType = type;

    localResponseContainer.classList.toggle('hidden');
    localResponse.innerText = responseMessage;

    setTimeout(() => {
      localResponseContainer.classList.toggle('hidden');
    }, 2000);
  }

  reset() {
    this.isEditTextValid = true;
    this.isBodyTextValid = true;
  }

  validateEditComment() {
    let text = this.editText.nativeElement.value;
    if (text.length > 1000 || text.length < 3) this.isEditTextValid = false;
    else this.updateComment();
  }

  validateReply() {
    let text = this.bodyText.nativeElement.value;
    if (text.length > 1000 || text.length < 3) this.isBodyTextValid = false;
    else this.reply();
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
  }

  toggleRemove() {
    this.isRemoving = !this.isRemoving;
  }

  updateComment() {
    const url = 'http://localhost:3000/edit-text';
    const data = {
      editText: this.editText.nativeElement.value,
      commentId: this.comment.commentId,
    };

    this.requestService.putRequest(url, data).subscribe({
      next: (res) => {
        if (res.status === 'Success') {
          this.comment.text = data.editText;
          this.isEditing = !this.isEditing;
        } else if (res.status === 'User is not logged in') {
          this.showLocalResponse(res.status, 'Error');
        } else {
          console.error(res);
        }
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  removeComment() {
    const url = 'http://localhost:3000/remove-comment';
    const data = {
      commentId: this.comment.commentId,
    };

    this.requestService.putRequest(url, data).subscribe({
      next: (res) => {
        if (res.status === 'Success') {
          // this.card.title = data.editTitle;
          // this.card.text = data.editText;
          // this.card.tags = this.tagsPlaceholder // Mapped?
          // this.isEditing = !this.isEditing;
          location.reload();
        } else if (res.status === 'User is not logged in') {
          this.showLocalResponse(res.status, 'Error');
        } else {
          console.error(res);
        }
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  reply() {
    const url = 'http://localhost:3000/reply';
    const data = {
      bodyText: this.bodyText.nativeElement.value,
      commentId: this.comment.commentId,
      name: this.nameFromParams,
      postId: this.postIdFromParams,
    };

    this.requestService.postRequest(url, data).subscribe({
      next: (res) => {
        if (res.status === 'Success') {
          location.reload();
        } else if (res.status === 'User is not logged in') {
          this.showLocalResponse(res.status, 'Error');
        } else {
          console.error(res);
        }
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  autoResize(): void {
    const bodyText = this.bodyText.nativeElement;
    bodyText.style.height = 'auto';
    bodyText.style.height = bodyText.scrollHeight + 'px';

    const editText = this.editText.nativeElement;
    editText.style.height = 'auto';
    editText.style.height = editText.scrollHeight + 'px';
  }

  ngAfterViewInit() {
    // this.commentContainer.nativeElement.style.marginLeft = `${this.depth}rem`;
    // this.commentContainer.nativeElement.style.paddingLeft = `${this.depth}rem`;
  }

  toggleReply(): void {
    this.replyBox.nativeElement.classList.toggle('hidden');
    this.addReplyButton.nativeElement.classList.toggle('hidden');
    this.closeReplyButton.nativeElement.classList.toggle('hidden');
    this.actionsElement.nativeElement.classList.toggle('rounded-b');
  }

  like() {
    const url = `http://localhost:3000/comment-sign?commentId=${this.comment.commentId}`;

    this.requestService.getRequest(url).subscribe({
      next: (res) => {
        console.log(res);
        if (res == null) {
          this.postLike();
        } else if (res.sign == 1) {
          this.putUnlike();
        } else if (res.sign == 0) {
          this.putLike();
        } else if (res.sign == -1) {
          this.putLikeOnDislike();
        } else if (res.status == 'User is not logged in') {
          this.showLocalResponse(res.status, 'Error');
        } else {
          console.log('Something went wrong');
        }
      },
      error: (err) => {
        console.error(err.error.message);
      },
    });
  }

  putLike() {
    const url = 'http://localhost:3000/comment-like';
    const data = {
      commentId: this.comment.commentId,
    };

    this.requestService.putRequest(url, data).subscribe({
      next: (res) => {
        // Refactor same as in usersService
        if (res.status === 'Success') {
          this.comment.isLiked = true;
          this.comment.isDisliked = false;
          this.comment.likesCount = this.comment.likesCount + 1;
        } else if (res.status === 'User is not logged in') {
          this.showLocalResponse(res.status, 'Error');
        } else {
          console.error(res);
        }
      },
      error: (err) => {
        console.error(err.error.message);
      },
    });
  }

  postLike() {
    const url = 'http://localhost:3000/comment-like';
    const data = {
      commentId: this.comment.commentId,
    };

    this.requestService.postRequest(url, data).subscribe({
      next: (res) => {
        // Refactor same as in usersService
        if (res.status === 'Success') {
          this.comment.isLiked = true;
          this.comment.isDisliked = false;
          this.comment.likesCount = this.comment.likesCount + 1;
        } else if (res.status === 'User is not logged in') {
          this.showLocalResponse(res.status, 'Error');
        } else {
          console.error(res);
        }
      },
      error: (err) => {
        console.error(err.error.message);
      },
    });
  }

  putUnlike() {
    const url = 'http://localhost:3000/comment-unlike';
    const data = {
      commentId: this.comment.commentId,
    };

    this.requestService.putRequest(url, data).subscribe({
      next: (res) => {
        // Refactor same as in usersService
        if (res.status === 'Success') {
          this.comment.isLiked = false;
          this.comment.isDisliked = false;
          this.comment.likesCount = this.comment.likesCount - 1;
        } else if (res.status === 'User is not logged in') {
          this.showLocalResponse(res.status, 'Error');
        } else {
          console.error(res);
        }
      },
      error: (err) => {
        console.error(err.error.message);
      },
    });
  }

  putLikeOnDislike() {
    const url = 'http://localhost:3000/comment-like-on-dislike';
    const data = {
      commentId: this.comment.commentId,
    };

    this.requestService.putRequest(url, data).subscribe({
      next: (res) => {
        // Refactor same as in usersService
        if (res.status === 'Success') {
          this.comment.isLiked = true;
          this.comment.isDisliked = false;
          this.comment.likesCount = this.comment.likesCount + 2;
        } else if (res.status === 'User is not logged in') {
          this.showLocalResponse(res.status, 'Error');
        } else {
          console.error(res);
        }
      },
      error: (err) => {
        console.error(err.error.message);
      },
    });
  }

  dislike() {
    const url = `http://localhost:3000/comment-sign?commentId=${this.comment.commentId}`;

    this.requestService.getRequest(url).subscribe({
      next: (res) => {
        console.log(res);
        if (res == null) {
          this.postDislike();
        } else if (res.sign == -1) {
          this.putUndislike();
        } else if (res.sign == 0) {
          this.putDislike();
        } else if (res.sign == 1) {
          this.putDislikeOnLike();
        } else if (res.status == 'User is not logged in') {
          this.showLocalResponse(res.status, 'Error');
        } else {
          console.log('Something went wrong');
        }
      },
      error: (err) => {
        console.error(err.error.message);
      },
    });
  }

  putDislike() {
    const url = 'http://localhost:3000/comment-dislike';
    const data = {
      commentId: this.comment.commentId,
    };

    this.requestService.putRequest(url, data).subscribe({
      next: (res) => {
        // Refactor same as in usersService
        if (res.status === 'Success') {
          this.comment.isLiked = false;
          this.comment.isDisliked = true;
          this.comment.likesCount = this.comment.likesCount - 1;
        } else if (res.status === 'User is not logged in') {
          this.showLocalResponse(res.status, 'Error');
        } else {
          console.error(res);
        }
      },
      error: (err) => {
        console.error(err.error.message);
      },
    });
  }

  postDislike() {
    const url = 'http://localhost:3000/comment-dislike';
    const data = {
      commentId: this.comment.commentId,
    };

    this.requestService.postRequest(url, data).subscribe({
      next: (res) => {
        // Refactor same as in usersService
        if (res.status === 'Success') {
          this.comment.isLiked = false;
          this.comment.isDisliked = true;
          this.comment.likesCount = this.comment.likesCount - 1;
        } else if (res.status === 'User is not logged in') {
          this.showLocalResponse(res.status, 'Error');
        } else {
          console.error(res);
        }
      },
      error: (err) => {
        console.error(err.error.message);
      },
    });
  }

  putUndislike() {
    const url = 'http://localhost:3000/comment-undislike';
    const data = {
      commentId: this.comment.commentId,
    };

    this.requestService.putRequest(url, data).subscribe({
      next: (res) => {
        // Refactor same as in usersService
        if (res.status === 'Success') {
          this.comment.isLiked = false;
          this.comment.isDisliked = false;
          this.comment.likesCount = this.comment.likesCount + 1;
        } else if (res.status === 'User is not logged in') {
          this.showLocalResponse(res.status, 'Error');
        } else {
          console.error(res);
        }
      },
      error: (err) => {
        console.error(err.error.message);
      },
    });
  }

  putDislikeOnLike() {
    const url = 'http://localhost:3000/comment-dislike-on-like';
    const data = {
      commentId: this.comment.commentId,
    };

    this.requestService.putRequest(url, data).subscribe({
      next: (res) => {
        // Refactor same as in usersService
        if (res.status === 'Success') {
          this.comment.isLiked = false;
          this.comment.isDisliked = true;
          this.comment.likesCount = this.comment.likesCount - 2;
        } else if (res.status === 'User is not logged in') {
          this.showLocalResponse(res.status, 'Error');
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
