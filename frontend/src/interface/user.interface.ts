export interface IUser {
	id: string;
	firstName: string;
	lastName: string;
	name: string;
	otherName: string;
	email: string;
	username: string;
	token: string;
	role: UserRoleEnum;
	isActive: boolean;
	isVerified: boolean;
	bio: string;
	image: string;
}

export enum UserRoleEnum {
	Admin = "Admin",
	Editor = "Editor",
	User = "User",
}
