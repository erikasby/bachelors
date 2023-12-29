import { Component, Input, ViewChild } from '@angular/core';
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
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class CardComponent {
  @ViewChild('editTitle') editTitle: any;
  @ViewChild('editText') editText: any;
  @ViewChild('editTags') editTags: any;
  @ViewChild('editBox') editBox: any;

  @ViewChild('localResponseContainer') localResponseContainer: any;
  @ViewChild('localResponse') localResponse: any;

  @Input() isInsideCommunity: boolean = false;
  @Input() isComment: boolean = false;
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

  isEditing: boolean = false;
  isRemoving: boolean = false;

  tagsPlaceholder: String = '';

  localResponseType = '';

  constructor(private requestService: RequestService) {}

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

  autoResize(): void {
    const editText = this.editText.nativeElement;
    editText.style.height = 'auto';
    editText.style.height = editText.scrollHeight + 'px';
  }

  removePost() {
    const url = 'http://localhost:3000/remove-post';
    const data = {
      postId: this.card.postId,
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

  isEditTitleValid: boolean = true;
  isEditTextValid: boolean = true;
  isEditTagsValid: boolean = true;

  validatePost() {
    this.isEditTitleValid = this.validateTitle();
    this.isEditTextValid = this.validateBodyText();
    this.isEditTagsValid = this.validateTags();

    if (this.isEditTitleValid && this.isEditTextValid && this.isEditTagsValid)
      this.updatePost();
  }

  validateTitle() {
    let title = this.editTitle.nativeElement.value;
    if (title.length > 50 || title.length < 4) return false;
    return true;
  }

  validateBodyText() {
    let bodyText = this.editText.nativeElement.value;
    if (bodyText.length > 10000 || bodyText.length < 25) return false;
    return true;
  }

  validateTags() {
    // Max. 5 tags each with a limit of 30 characters; separate them with spaces
    let regex = /^#[a-zA-Z0-9-]{1,30}(?: #[a-zA-Z0-9-]{1,30}){0,4}$/;
    let tags = this.editTags.nativeElement.value;
    if (!regex.test(tags) && tags.length < 4) return false;
    return true;
  }

  updatePost() {
    const url = 'http://localhost:3000/edit-post';
    const data = {
      editTitle: this.editTitle.nativeElement.value,
      editText: this.editText.nativeElement.value,
      editTags: this.editTags.nativeElement.value,
      oldTags: this.card.tags,
      postId: this.card.postId,
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

  toggleEdit() {
    this.tagsPlaceholder = '';
    this.card.tags.map(
      (tag) => (this.tagsPlaceholder = this.tagsPlaceholder + `#${tag}`)
    );

    this.isEditing = !this.isEditing;
  }

  toggleRemove() {
    this.isRemoving = !this.isRemoving;
  }

  bookmark() {
    const url = `http://localhost:3000/bookmark?postId=${this.card.postId}`;
    this.requestService.getRequest(url).subscribe({
      next: (res) => {
        console.log(res);
        if (res == null) {
          this.postBookmark();
        } else if (res.is_deleted) {
          this.putBookmark();
        } else if (!res.is_deleted) {
          this.putUnbookmark();
        } else {
          console.log('Something went wrong');
        }
      },
      error: (err) => {
        console.error(err.error.message);
      },
    });
  }

  postBookmark() {
    const url = 'http://localhost:3000/bookmark';
    const data = {
      postId: this.card.postId,
    };

    this.requestService.postRequest(url, data).subscribe({
      next: (res) => {
        // Refactor same as in usersService
        if (res.status === 'Success') {
          this.card.isBookmarked = true;
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

  putBookmark() {
    const url = 'http://localhost:3000/bookmark';
    const data = {
      postId: this.card.postId,
    };

    this.requestService.putRequest(url, data).subscribe({
      next: (res) => {
        // Refactor same as in usersService
        if (res.status === 'Success') {
          this.card.isBookmarked = true;
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

  putUnbookmark() {
    const url = 'http://localhost:3000/unbookmark';
    const data = {
      postId: this.card.postId,
    };

    this.requestService.putRequest(url, data).subscribe({
      next: (res) => {
        // Refactor same as in usersService
        if (res.status === 'Success') {
          this.card.isBookmarked = false;
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

  like() {
    let url;
    if (this.isComment) {
      url = `http://localhost:3000/comment-sign?commentId=${this.card.commentId}`;
    } else {
      url = `http://localhost:3000/post-sign?postId=${this.card.postId}`;
    }

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
    let url;
    let data;
    if (this.isComment) {
      url = 'http://localhost:3000/comment-like';
      data = {
        commentId: this.card.commentId,
      };
    } else {
      url = 'http://localhost:3000/post-like';
      data = {
        postId: this.card.postId,
      };
    }

    this.requestService.putRequest(url, data).subscribe({
      next: (res) => {
        // Refactor same as in usersService
        if (res.status === 'Success') {
          this.card.isLiked = true;
          this.card.isDisliked = false;
          this.card.likesCount = this.card.likesCount + 1;
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
    let url;
    let data;
    if (this.isComment) {
      url = 'http://localhost:3000/comment-like';
      data = {
        commentId: this.card.commentId,
      };
    } else {
      url = 'http://localhost:3000/post-like';
      data = {
        postId: this.card.postId,
      };
    }

    this.requestService.postRequest(url, data).subscribe({
      next: (res) => {
        // Refactor same as in usersService
        if (res.status === 'Success') {
          this.card.isLiked = true;
          this.card.isDisliked = false;
          this.card.likesCount = this.card.likesCount + 1;
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

  putUnlike() {
    let url;
    let data;
    if (this.isComment) {
      url = 'http://localhost:3000/comment-unlike';
      data = {
        commentId: this.card.commentId,
      };
    } else {
      url = 'http://localhost:3000/post-unlike';
      data = {
        postId: this.card.postId,
      };
    }

    this.requestService.putRequest(url, data).subscribe({
      next: (res) => {
        // Refactor same as in usersService
        if (res.status === 'Success') {
          this.card.isLiked = false;
          this.card.isDisliked = false;
          this.card.likesCount = this.card.likesCount - 1;
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
    let url;
    let data;
    if (this.isComment) {
      url = 'http://localhost:3000/comment-like-on-dislike';
      data = {
        commentId: this.card.commentId,
      };
    } else {
      url = 'http://localhost:3000/post-like-on-dislike';
      data = {
        postId: this.card.postId,
      };
    }

    this.requestService.putRequest(url, data).subscribe({
      next: (res) => {
        // Refactor same as in usersService
        if (res.status === 'Success') {
          this.card.isLiked = true;
          this.card.isDisliked = false;
          this.card.likesCount = this.card.likesCount + 2;
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
    let url;
    if (this.isComment) {
      url = `http://localhost:3000/comment-sign?commentId=${this.card.commentId}`;
    } else {
      url = `http://localhost:3000/post-sign?postId=${this.card.postId}`;
    }

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
    let url;
    let data;
    if (this.isComment) {
      url = 'http://localhost:3000/comment-dislike';
      data = {
        commentId: this.card.commentId,
      };
    } else {
      url = 'http://localhost:3000/post-dislike';
      data = {
        postId: this.card.postId,
      };
    }

    this.requestService.putRequest(url, data).subscribe({
      next: (res) => {
        // Refactor same as in usersService
        if (res.status === 'Success') {
          this.card.isLiked = false;
          this.card.isDisliked = true;
          this.card.likesCount = this.card.likesCount - 1;
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
    let url;
    let data;
    if (this.isComment) {
      url = 'http://localhost:3000/comment-dislike';
      data = {
        commentId: this.card.commentId,
      };
    } else {
      url = 'http://localhost:3000/post-dislike';
      data = {
        postId: this.card.postId,
      };
    }

    this.requestService.postRequest(url, data).subscribe({
      next: (res) => {
        // Refactor same as in usersService
        if (res.status === 'Success') {
          this.card.isLiked = false;
          this.card.isDisliked = true;
          this.card.likesCount = this.card.likesCount - 1;
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
    let url;
    let data;
    if (this.isComment) {
      url = 'http://localhost:3000/comment-undislike';
      data = {
        commentId: this.card.commentId,
      };
    } else {
      url = 'http://localhost:3000/post-undislike';
      data = {
        postId: this.card.postId,
      };
    }

    this.requestService.putRequest(url, data).subscribe({
      next: (res) => {
        // Refactor same as in usersService
        if (res.status === 'Success') {
          this.card.isLiked = false;
          this.card.isDisliked = false;
          this.card.likesCount = this.card.likesCount + 1;
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
    let url;
    let data;
    if (this.isComment) {
      url = 'http://localhost:3000/comment-dislike-on-like';
      data = {
        commentId: this.card.commentId,
      };
    } else {
      url = 'http://localhost:3000/post-dislike-on-like';
      data = {
        postId: this.card.postId,
      };
    }

    this.requestService.putRequest(url, data).subscribe({
      next: (res) => {
        // Refactor same as in usersService
        if (res.status === 'Success') {
          this.card.isLiked = false;
          this.card.isDisliked = true;
          this.card.likesCount = this.card.likesCount - 2;
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
