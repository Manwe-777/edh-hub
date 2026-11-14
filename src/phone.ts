import { parsePhoneParam } from './utils/parsePhoneParam';

/** Size of the `?phone` preview frame, or null on a real device. */
export const PHONE = parsePhoneParam(location.search);
