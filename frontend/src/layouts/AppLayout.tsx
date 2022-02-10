import { apollo } from "apollo";
import { GET_ME } from "apollo/queries/auth.query";
import { UserAtom } from "atom/user.atom";
import Cookies from "js-cookie";
import React, { useEffect, useMemo } from "react";
import { useSetRecoilState } from "recoil";
import { TOKEN_NAME } from "utils/constants";

export enum ThemeModeEnum {
	LIGHT = "light",
	DARK = "dark",
}

const AppLayout = ({ children }: { children: React.ReactChild }) => {
	const setUser = useSetRecoilState(UserAtom);
	useEffect(() => {
		const getUser = async () => {
			try {
				const { data } = await apollo.query({ query: GET_ME });
				setUser(data.me);
			} catch (error) {
				console.log(error);
			}
		};
		if (token) {
			getUser();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	const token = useMemo(() => {
		return Cookies.get(TOKEN_NAME);
	}, []);
	return <div>{children}</div>;
};

export default AppLayout;
