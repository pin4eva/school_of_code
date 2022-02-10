import { IUser } from "interface/user.interface";
import { atom } from "recoil";

export const UserAtom = atom({
	key: "UserAtom",
	default: null as unknown as IUser,
});
