import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsEthereumAddressConstraint implements ValidatorConstraintInterface {
  validate(value: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(value);
  }

  defaultMessage(): string {
    return 'Value must be a valid Ethereum wallet address (0x followed by 40 hex characters)';
  }
}

export function IsEthereumAddress(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsEthereumAddressConstraint,
    });
  };
}
