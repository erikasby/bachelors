import { Component, ViewChild, ViewChildren } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RequestService } from 'src/app/services/request.service';

@Component({
  selector: 'app-community-settings',
  templateUrl: './community-settings.component.html',
  styleUrls: ['./community-settings.component.scss'],
})
export class CommunitySettingsComponent {
  addAdminRegex = /^[a-zA-Z0-9_]{3,20}$/;

  @ViewChild('admins') admins: any;
  @ViewChild('adminsBox') adminsBox: any;
  @ViewChild('adminsButton') adminsButton: any;

  isAddAdminValid: boolean = true;
  isAddAdminSuccess: boolean = false;
  addedAdmin: string = '';
  @ViewChild('addAdmin') addAdmin: any;
  @ViewChild('addAdminBox') addAdminBox: any;
  @ViewChild('addAdminButton') addAdminButton: any;

  deleteAdminName: string = '';
  @ViewChildren('deleteAdmin') deleteAdmins: any;
  @ViewChild('deleteAdminBox') deleteAdminBox: any;

  nameFromParams: string | null = this.route.snapshot.paramMap.get('community');
  commnuityAdmins: Array<any> = [];

  constructor(
    private requestService: RequestService,
    private route: ActivatedRoute
  ) {}

  // Create function to check if user has admin rights, same for user settings

  isAdminsOpen: boolean = false;
  toggleAdmins(): void {
    let adminsButton = this.adminsButton.nativeElement;
    let adminsBox = this.adminsBox.nativeElement;

    this.isAdminsOpen = !this.isAdminsOpen;

    adminsBox.classList.toggle('hidden');
    adminsButton.classList.toggle('rounded-b');
    adminsButton.classList.toggle('border-b');

    if (this.isAdminsOpen) this.getAdmins();
  }

  isDeleteAdminOpen: boolean = false;
  toggleDeleteAdmin(value: string): void {
    let deleteAdminBox = this.deleteAdminBox.nativeElement;

    if (this.deleteAdminName !== value && !this.isDeleteAdminOpen) {
      this.deleteAdminName = value;
      deleteAdminBox.classList.toggle('hidden');
      this.isDeleteAdminOpen = !this.isDeleteAdminOpen;
    } else if (this.deleteAdminName !== value && this.isDeleteAdminOpen) {
      this.deleteAdminName = value;
    } else {
      this.deleteAdminName = value;
      deleteAdminBox.classList.toggle('hidden');
      this.isDeleteAdminOpen = !this.isDeleteAdminOpen;
    }

    if (this.isDeleteAdminOpen) deleteAdminBox.scrollIntoView();
  }

  toggleAddAdmin(): void {
    let addAdminButton = this.addAdminButton.nativeElement;
    let addAdminBox = this.addAdminBox.nativeElement;

    addAdminBox.classList.toggle('hidden');
    addAdminButton.classList.toggle('rounded-b');
    addAdminButton.classList.toggle('border-b');
  }

  validateAddAdmin(): void {
    let addAdmin = this.addAdmin.nativeElement.value;

    if (this.addAdminRegex.test(addAdmin)) {
      this.isAddAdminValid = true;
      this.postAdmin(addAdmin);
    } else this.isAddAdminValid = false;
  }

  reset(): void {
    this.isAddAdminValid = true;
  }

  putAdmin() {
    const url = 'http://localhost:3000/cs-admin';
    const data = {
      username: this.deleteAdminName,
      name: this.nameFromParams,
    };

    // Have a prepared statement which first check if exists
    this.requestService.putRequest(url, data).subscribe({
      next: (res) => {
        // Refactor same as in usersService
        if (res.rowCount === 1) {
          let deleteAdmins = this.deleteAdmins;
          for (let i = 0; i < deleteAdmins.length; i++) {
            if (
              deleteAdmins._results[i].nativeElement.innerText ===
              this.deleteAdminName
            ) {
              deleteAdmins._results[i].nativeElement.parentElement.remove();

              let deleteAdminBox = this.deleteAdminBox.nativeElement;
              deleteAdminBox.classList.toggle('hidden');
              this.isDeleteAdminOpen = !this.isDeleteAdminOpen;
            }
          }
        }
      },
      error: (err) => {
        console.error(err.error.message);
      },
    });
  }

  getAdmins() {
    const url = `http://localhost:3000/cs-admins?name=${this.nameFromParams}`;

    this.requestService.getRequest(url).subscribe({
      next: (res) => {
        // Refactor same as in usersService
        this.commnuityAdmins = res;
        console.log(this.commnuityAdmins);
      },
      error: (err) => {
        console.error(err.error.message);
      },
    });
  }

  postAdmin(username: string) {
    let addAdmin = this.addAdmin.nativeElement.value;

    const url = 'http://localhost:3000/admin';
    const data = {
      name: this.nameFromParams,
      username: username,
    };

    // Have a prepared statement which first check if exists
    this.requestService.postRequest(url, data).subscribe({
      next: (res) => {
        // Refactor same as in usersService
        if (res.status === 'Success') {
          this.addedAdmin = addAdmin;
          addAdmin = '';
          this.isAddAdminValid = true;
          this.isAddAdminSuccess = true;

          setTimeout(() => {
            this.isAddAdminSuccess = false;
            this.addedAdmin = '';
          }, 2000);
        } else if (res.status === 'Admin is already added') {
          this.isAddAdminValid = false;
        } else {
          this.isAddAdminValid = false;
          console.error(res);
        }
      },
      error: (err) => {
        console.error(err.error.message);
      },
    });
  }
}
