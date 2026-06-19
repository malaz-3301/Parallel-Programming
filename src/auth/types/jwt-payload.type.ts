import { UserType } from 'src/users/utils/user-type';

export type JwtPayload = {
  id: number;
  phone: string;
  userType: UserType;
};
