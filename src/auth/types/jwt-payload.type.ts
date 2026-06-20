import { UserType } from 'src/enums/enums';

export type JwtPayload = {
  id: number;
  phone: string;
  userType: UserType;
};
