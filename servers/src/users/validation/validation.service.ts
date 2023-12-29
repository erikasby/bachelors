import { Injectable } from '@nestjs/common';

@Injectable()
export class ValidationService {
  regexUsernameCheckNumberAndChar = /^[a-zA-Z0-9_]+$/; // Check if only char, number and _
  regexUsernameCheckLength = /^.{3,30}$/; // Check length

  regexPasswordCheckLowerUpperChar = /^(?=.*[a-z])(?=.*[A-Z]).+$/; // One uppercase, one lowercase letter
  regexPasswordCheckNumber = /.*[0-9].*/; // Check if contains one number
  regexPasswordCheckLength = /^.{8,50}$/; // Check length
  regexPasswordCheckSymbols = /[@$!%*?&-]/; // Check symbols

  regexEmailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,50}$/; // Email pattern

  validateUsername(input: string) {
    if (!this.regexUsernameCheckNumberAndChar.test(input))
      return { status: 'Must contain only letters, numbers and _' };

    if (!this.regexUsernameCheckLength.test(input))
      return { status: 'Length must be between 3 and 30' };

    return { status: 'Success' };
  }

  validatePassword(input: string) {
    if (!this.regexPasswordCheckLength.test(input))
      return { status: 'Length must be between 8 and 50' };

    if (!this.regexPasswordCheckLowerUpperChar.test(input))
      return { status: 'Must containt both lower and upper case characters' };

    if (!this.regexPasswordCheckNumber.test(input))
      return { status: 'Must contain at least 1 number' };

    if (!this.regexPasswordCheckSymbols.test(input))
      return { status: 'Must contain at least one of these symbols: @$!%*?&-' };

    return { status: 'Success' };
  }

  validateEmail(input: string) {
    if (!this.regexEmailPattern.test(input))
      return { status: 'Please use a valid email address' };

    return { status: 'Success' };
  }

  validateLogin(username: string, password: string) {
    if (this.validateUsername(username) && this.validatePassword(password))
      return true;
    else return false;
  }

  validateRegister(email: string, username: string, password: string) {
    if (
      this.validateEmail(email) &&
      this.validateUsername(username) &&
      this.validatePassword(password)
    )
      return true;
    else return false;
  }
}
