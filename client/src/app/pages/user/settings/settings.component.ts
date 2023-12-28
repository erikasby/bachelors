import {
  Component,
  HostListener,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { Router } from '@angular/router';
import { ResponseService } from 'src/app/components/response/response.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { RequestService } from 'src/app/services/request.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent {
  emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  // Allows letters, numbers, and underscores. Must be 3-20 characters long.
  usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  addCommunityRegex = /^[a-zA-Z0-9_]{3,20}$/;
  // Requires at least one uppercase letter, one lowercase letter, one number, one special character, and a minimum length of 8 characters.
  passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  regexPasswordCheckLowerUpperChar = /^(?=.*[a-z])(?=.*[A-Z]).+$/; // One uppercase, one lowercase letter
  regexPasswordCheckNumber = /.*[0-9].*/; // Check if contains one number
  regexPasswordCheckLength = /^.{8,50}$/; // Check length
  regexPasswordCheckSymbols = /[@$!%*?&-]/; // Check symbols

  isEmailValid: boolean = true;
  isUsernameValid: boolean = true;
  isPasswordValid: boolean = true;
  isConfirmPasswordValid: boolean = true;

  @ViewChild('email') email: any;
  @ViewChild('username') username: any;
  @ViewChild('currentPassword') currentPassword: any;
  @ViewChild('newPassword') newPassword: any;
  @ViewChild('confirmPassword') confirmPassword: any;

  @ViewChild('passwordButton') passwordButton: any;
  @ViewChild('usernameButton') usernameButton: any;
  @ViewChild('emailButton') emailButton: any;

  @ViewChild('passwordBox') passwordBox: any;
  @ViewChild('usernameBox') usernameBox: any;
  @ViewChild('emailBox') emailBox: any;

  @ViewChild('myCommunities') myCommunities: any;
  @ViewChild('myCommunitiesBox') myCommunitiesBox: any;
  @ViewChild('myCommunitiesButton') myCommunitiesButton: any;

  isAddCommunityValid: boolean = true;
  isAddCommunitySuccess: boolean = false;
  addedCommunity: string = '';
  @ViewChild('addCommunity') addCommunity: any;
  @ViewChild('addCommunityBox') addCommunityBox: any;
  @ViewChild('addCommunityButton') addCommunityButton: any;

  deleteCommunityName: string = '';
  @ViewChildren('deleteCommunity') deleteCommunities: any;
  @ViewChild('deleteCommunityBox') deleteCommunityBox: any;

  communities: Array<any> = [];
  userEmail: string = '';
  isUpdateUserEmailSuccess: boolean = false;
  userUsername: string = '';
  isUpdateUserUsernameSuccess: boolean = false;
  isUpdateUserPasswordSuccess: boolean = false;

  constructor(
    private requestService: RequestService,
    private responseService: ResponseService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngAfterViewInit() {
    // Refactor into whole page query (Refactor as Navbar)
    const isLoggedIn = this.authService.getIsLoggedIn();
    if (!isLoggedIn) this.router.navigate(['/']);
  }

  putPassword() {
    let currentPassword = this.currentPassword.nativeElement.value;
    let newPassword = this.newPassword.nativeElement.value;

    const url = 'http://localhost:3000/password';
    const data = {
      currentPassword: currentPassword,
      newPassword: newPassword,
    };

    // Have a prepared statement which first check if exists
    this.requestService.putRequest(url, data).subscribe({
      next: (res) => {
        // Refactor same as in usersService
        if (res.status === 'Success') {
          // this.userUsername = username.toLowerCase();
          // this.username.nativeElement.value = username.toLowerCase();
          this.isUpdateUserPasswordSuccess = true;
          this.currentPassword.nativeElement.value = '';
          this.newPassword.nativeElement.value = '';
          this.confirmPassword.nativeElement.value = '';

          setTimeout(() => {
            this.isUpdateUserPasswordSuccess = false;
          }, 2000);
        } else {
          console.error(res);
        }
      },
      error: (err) => {
        console.error(err.error.message);
      },
    });
  }

  putUsername() {
    let username = this.username.nativeElement.value;

    const url = 'http://localhost:3000/username';
    const data = {
      username: username,
    };

    // Have a prepared statement which first check if exists
    this.requestService.putRequest(url, data).subscribe({
      next: (res) => {
        // Refactor same as in usersService
        if (res.status === 'Success') {
          this.userUsername = username.toLowerCase();
          this.username.nativeElement.value = username.toLowerCase();
          this.isUpdateUserUsernameSuccess = true;

          setTimeout(() => {
            this.isUpdateUserUsernameSuccess = false;
          }, 2000);
        } else if (res.status === 'Username is already in use') {
          this.isUsernameValid = false;
        } else {
          this.isUsernameValid = false;
          console.error(res);
        }
      },
      error: (err) => {
        console.error(err.error.message);
      },
    });
  }

  putEmail() {
    let email = this.email.nativeElement.value;

    const url = 'http://localhost:3000/email';
    const data = {
      email: email,
    };

    // Have a prepared statement which first check if exists
    this.requestService.putRequest(url, data).subscribe({
      next: (res) => {
        // Refactor same as in usersService
        if (res.status === 'Success') {
          this.userEmail = email.toLowerCase();
          this.email.nativeElement.value = email.toLowerCase();
          this.isUpdateUserEmailSuccess = true;

          setTimeout(() => {
            this.isUpdateUserEmailSuccess = false;
          }, 2000);
        } else if (res.status === 'Email is already in use') {
          this.isEmailValid = false;
        } else {
          this.isEmailValid = false;
          console.error(res);
        }
      },
      error: (err) => {
        console.error(err.error.message);
      },
    });
  }

  getEmail() {
    const username = this.authService.getUsername();
    const url = `http://localhost:3000/us-email?username=${username}`;

    this.requestService.getRequest(url).subscribe({
      next: (res) => {
        // Refactor same as in usersService
        this.userEmail = res.email;
      },
      error: (err) => {
        console.error(err.error.message);
      },
    });
  }

  getUsername() {
    this.userUsername = this.authService.getUsername();
  }

  getCommunities() {
    const username = this.authService.getUsername();
    const url = `http://localhost:3000/us-communities?username=${username}`;

    this.requestService.getRequest(url).subscribe({
      next: (res) => {
        // Refactor same as in usersService
        this.communities = res;
      },
      error: (err) => {
        console.error(err.error.message);
      },
    });
  }

  postCommunity(name: string) {
    let addCommunity = this.addCommunity.nativeElement.value;

    const url = 'http://localhost:3000/community';
    const data = {
      name: name,
    };

    // Have a prepared statement which first check if exists
    this.requestService.postRequest(url, data).subscribe({
      next: (res) => {
        // Refactor same as in usersService
        if (res.status === 'Success') {
          this.addedCommunity = addCommunity;
          addCommunity = '';
          this.isAddCommunityValid = true;
          this.isAddCommunitySuccess = true;

          setTimeout(() => {
            this.isAddCommunitySuccess = false;
            this.addedCommunity = '';
          }, 2000);
        } else if (res.status === 'Community name is already in use') {
          this.isAddCommunityValid = false;
        } else {
          this.isAddCommunityValid = false;
          console.error(res);
        }
      },
      error: (err) => {
        console.error(err.error.message);
      },
    });
  }

  putCommunity() {
    const url = 'http://localhost:3000/us-community';
    const data = {
      name: this.deleteCommunityName,
    };

    // Have a prepared statement which first check if exists
    this.requestService.putRequest(url, data).subscribe({
      next: (res) => {
        // Refactor same as in usersService
        if (res.rowCount === 1) {
          let deleteCommunities = this.deleteCommunities;
          for (let i = 0; i < deleteCommunities.length; i++) {
            if (
              deleteCommunities._results[i].nativeElement.innerText ===
              this.deleteCommunityName
            ) {
              deleteCommunities._results[
                i
              ].nativeElement.parentElement.remove();

              let deleteCommunityBox = this.deleteCommunityBox.nativeElement;
              deleteCommunityBox.classList.toggle('hidden');
              this.isDeleteCommunityOpen = !this.isDeleteCommunityOpen;
            }
          }
        }
      },
      error: (err) => {
        console.error(err.error.message);
      },
    });
  }

  validatePassword(): void {
    let newValid = true;
    let curValid = true;
    let conValid = true;

    let currentPassword = this.currentPassword.nativeElement.value;
    let newPassword = this.newPassword.nativeElement.value;
    let confirmPassword = this.confirmPassword.nativeElement.value;

    if (
      this.regexPasswordCheckLength.test(newPassword) &&
      this.regexPasswordCheckLowerUpperChar.test(newPassword) &&
      this.regexPasswordCheckNumber.test(newPassword) &&
      this.regexPasswordCheckSymbols.test(newPassword)
    )
      this.isPasswordValid = true;
    else {
      newValid = false;
      this.isPasswordValid = false;
    }

    if (
      this.regexPasswordCheckLength.test(currentPassword) &&
      this.regexPasswordCheckLowerUpperChar.test(currentPassword) &&
      this.regexPasswordCheckNumber.test(currentPassword) &&
      this.regexPasswordCheckSymbols.test(currentPassword)
    )
      this.isPasswordValid = true;
    else {
      curValid = false;
      this.isPasswordValid = false;
    }

    if (
      confirmPassword === newPassword &&
      newPassword !== '' &&
      confirmPassword !== ''
    )
      this.isConfirmPasswordValid = true;
    else {
      conValid = false;
      this.isConfirmPasswordValid = false;
    }

    if (newValid && curValid && conValid) this.putPassword();
  }

  validateUsername(): void {
    let username = this.username.nativeElement.value;

    if (this.usernameRegex.test(username)) {
      this.isUsernameValid = true;
      this.putUsername();
    } else this.isUsernameValid = false;
  }

  validateEmail(): void {
    let email = this.email.nativeElement.value;

    if (this.emailRegex.test(email)) {
      this.isEmailValid = true;
      this.putEmail();
    } else this.isEmailValid = false;
  }

  validateAddCommunity(): void {
    let addCommunity = this.addCommunity.nativeElement.value;

    if (this.addCommunityRegex.test(addCommunity)) {
      this.isAddCommunityValid = true;
      this.postCommunity(addCommunity);
    } else this.isAddCommunityValid = false;
  }

  reset(): void {
    this.isEmailValid = true;
    this.isUsernameValid = true;
    this.isPasswordValid = true;
    this.isConfirmPasswordValid = true;
    this.isAddCommunityValid = true;
  }

  togglePassword(): void {
    let passwordButton = this.passwordButton.nativeElement;
    let passwordBox = this.passwordBox.nativeElement;

    passwordBox.classList.toggle('hidden');
    passwordButton.classList.toggle('rounded-b');
    passwordButton.classList.toggle('border-b');
  }

  isUsernameOpen: boolean = false;
  toggleUsername(): void {
    let usernameButton = this.usernameButton.nativeElement;
    let usernameBox = this.usernameBox.nativeElement;

    this.isUsernameOpen = !this.isUsernameOpen;

    usernameBox.classList.toggle('hidden');
    usernameButton.classList.toggle('rounded-b');
    usernameButton.classList.toggle('border-b');

    if (this.isUsernameOpen) this.getUsername();
  }

  isEmailOpen: boolean = false;
  toggleEmail(): void {
    let emailButton = this.emailButton.nativeElement;
    let emailBox = this.emailBox.nativeElement;

    this.isEmailOpen = !this.isEmailOpen;

    emailBox.classList.toggle('hidden');
    emailButton.classList.toggle('rounded-b');
    emailButton.classList.toggle('border-b');

    if (this.isEmailOpen) this.getEmail();
  }

  isMyCommunitiesOpen: boolean = false;
  toggleMyCommunities(): void {
    let myCommunitiesButton = this.myCommunitiesButton.nativeElement;
    let myCommunitiesBox = this.myCommunitiesBox.nativeElement;

    this.isMyCommunitiesOpen = !this.isMyCommunitiesOpen;

    myCommunitiesBox.classList.toggle('hidden');
    myCommunitiesButton.classList.toggle('rounded-b');
    myCommunitiesButton.classList.toggle('border-b');

    if (this.isMyCommunitiesOpen) this.getCommunities();
  }

  toggleAddCommunity(): void {
    let addCommunityButton = this.addCommunityButton.nativeElement;
    let addCommunityBox = this.addCommunityBox.nativeElement;

    addCommunityBox.classList.toggle('hidden');
    addCommunityButton.classList.toggle('rounded-b');
    addCommunityButton.classList.toggle('border-b');
  }

  isDeleteCommunityOpen: boolean = false;
  toggleDeleteCommunity(value: string): void {
    let deleteCommunityBox = this.deleteCommunityBox.nativeElement;

    if (this.deleteCommunityName !== value && !this.isDeleteCommunityOpen) {
      this.deleteCommunityName = value;
      deleteCommunityBox.classList.toggle('hidden');
      this.isDeleteCommunityOpen = !this.isDeleteCommunityOpen;
    } else if (
      this.deleteCommunityName !== value &&
      this.isDeleteCommunityOpen
    ) {
      this.deleteCommunityName = value;
    } else {
      this.deleteCommunityName = value;
      deleteCommunityBox.classList.toggle('hidden');
      this.isDeleteCommunityOpen = !this.isDeleteCommunityOpen;
    }

    if (this.isDeleteCommunityOpen) deleteCommunityBox.scrollIntoView();
  }
}
