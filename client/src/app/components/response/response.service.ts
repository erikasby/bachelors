import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ResponseService {
  public response = {
    status: '',
    message: '',
  };

  setResponse(status: string, message: string) {
    this.response.status = status;
    this.response.message = message;
  }

  resetResponse() {
    this.response.status = '';
    this.response.message = '';
  }

  initResponse(responseMessage: string) {}

  getResponse() {
    const copyResponse = { ...this.response };
    this.resetResponse();
    return copyResponse;
  }
}
