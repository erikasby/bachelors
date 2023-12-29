import { Component, ViewChild } from '@angular/core';
import { ResponseService } from './response.service';

@Component({
  selector: 'app-response',
  templateUrl: './response.component.html',
  styleUrls: ['./response.component.scss'],
})
export class ResponseComponent {
  constructor(private responseService: ResponseService) {}

  @ViewChild('responseContainer') responseContainer: any;
  @ViewChild('response') response: any;

  ngAfterViewInit() {
    // this.responseService.subscriber$.subscribe((res: any) => {
    //   if (res.status !== '' && res.message !== '') {
    //     this.show(res.message);
    //   }
    // });

    const res = this.responseService.getResponse();
    if (res.status !== '' && res.message !== '') {
      this.show(res.message);
    }
  }

  show(responseMessage: string): void {
    const responseContainer = this.responseContainer.nativeElement;
    const response = this.response.nativeElement;

    responseContainer.classList.toggle('hidden');
    response.innerText = responseMessage;

    setTimeout(() => {
      responseContainer.classList.toggle('hidden');
    }, 2000);
  }
}
