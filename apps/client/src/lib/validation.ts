import { z } from 'zod';
import i18n from '@/i18n/i18n';

type ValidationMessageOptions = {
  field?: string;
  min?: number;
};

const t = (key: string, defaultValue: string, options?: ValidationMessageOptions) =>
  i18n.t(`Validation.${key}`, {
    ns: 'common',
    defaultValue,
    ...options,
  });

const requiredMessage = (field?: string) =>
  field
    ? t('RequiredField', '{{field}} is required.', { field })
    : t('Required', 'This field is required.');

const invalidStringMessage = (field?: string) =>
  field
    ? t('StringField', '{{field}} is not valid.', { field })
    : t('String', 'Invalid text.');

const invalidNumberMessage = (field?: string) =>
  field
    ? t('NumberField', '{{field}} must be a number.', { field })
    : t('Number', 'Invalid number.');

const invalidDateMessage = (field?: string) =>
  field
    ? t('DateField', '{{field}} must be a valid date.', { field })
    : t('Date', 'Invalid date.');

const invalidDateTimeMessage = (field?: string) =>
  field
    ? t('DateTimeField', '{{field}} must be a valid date and time.', { field })
    : t('DateTime', 'Invalid date and time.');

const invalidEmailMessage = (field?: string) =>
  field
    ? t('EmailField', '{{field}} must be a valid email.', { field })
    : t('Email', 'Invalid email address.');

const invalidPhoneMessage = (field?: string) =>
  field
    ? t('PhoneField', '{{field}} must be a valid phone number.', { field })
    : t('Phone', 'Invalid phone number.');

const invalidUrlMessage = (field?: string) =>
  field
    ? t('UrlField', '{{field}} must be a valid URL.', { field })
    : t('Url', 'Invalid URL.');

const minLengthMessage = (min: number, field?: string) =>
  field
    ? t('MinLengthField', '{{field}} must be at least {{min}} characters.', {
        field,
        min,
      })
    : t('MinLength', 'Must be at least {{min}} characters.', { min });

const phoneRegex = /^\+?[0-9\s().-]{6,}$/;

export const string = (field?: string) =>
  z.string().refine(value => typeof value === 'string', {
    message: invalidStringMessage(field),
  });

export const requiredString = (field?: string) =>
  z
    .string()
    .trim()
    .min(1, requiredMessage(field))
    .refine(value => typeof value === 'string', {
      message: invalidStringMessage(field),
    });

export const number = (field?: string) =>
  z.coerce.number().refine(value => !Number.isNaN(value), {
    message: invalidNumberMessage(field),
  });

export const requiredNumber = (field?: string) =>
  z.coerce
    .number()
    .refine(value => !Number.isNaN(value), {
      message: invalidNumberMessage(field),
    })
    .refine(value => value !== null && value !== undefined, {
      message: requiredMessage(field),
    });

export const email = (field?: string) =>
  z.string().trim().email(invalidEmailMessage(field));

export const requiredEmail = (field?: string) =>
  requiredString(field).email(invalidEmailMessage(field));

export const phone = (field?: string) =>
  z.string().trim().regex(phoneRegex, invalidPhoneMessage(field));

export const requiredPhone = (field?: string) =>
  requiredString(field).regex(phoneRegex, invalidPhoneMessage(field));

export const date = (field?: string) =>
  z.coerce.date().refine(value => value instanceof Date, {
    message: invalidDateMessage(field),
  });

export const requiredDate = (field?: string) =>
  z
    .coerce.date()
    .refine(value => value instanceof Date, {
      message: invalidDateMessage(field),
    })
    .refine(value => value !== null && value !== undefined, {
      message: requiredMessage(field),
    });

export const dateTime = (field?: string) =>
  z.string().trim().datetime({ message: invalidDateTimeMessage(field) });

export const requiredDateTime = (field?: string) =>
  requiredString(field).datetime({ message: invalidDateTimeMessage(field) });

export const url = (field?: string) =>
  z.string().trim().url(invalidUrlMessage(field));

export const requiredUrl = (field?: string) =>
  requiredString(field).url(invalidUrlMessage(field));

export const minLength = (min: number, field?: string) =>
  string(field).min(min, minLengthMessage(min, field));

export const requiredMinLength = (min: number, field?: string) =>
  requiredString(field).min(min, minLengthMessage(min, field));

export const passwordsDontMatch = () =>
  t('PasswordsDontMatch', 'Passwords do not match.');

export const matchPasswords = <
  TData extends Record<string, unknown>,
  P extends keyof TData,
  C extends keyof TData
>(
  passwordKey: P,
  confirmKey: C
) => ({
  check: (data: TData) =>
    String(data[passwordKey] ?? '') === String(data[confirmKey] ?? ''),
  message: passwordsDontMatch(),
});
