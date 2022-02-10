import {
	ApolloClient,
	createHttpLink,
	InMemoryCache,
	NormalizedCacheObject,
} from "@apollo/client";
import Cookies from "js-cookie";
import { NextPageContext } from "next";
import { useMemo } from "react";
import { SERVER_URL, TOKEN_NAME } from "utils/constants";
import { getTokenCookie } from "utils/cookieUtils";

let apolloClient: ApolloClient<NormalizedCacheObject>;

const uri = `${SERVER_URL}/api/v3/graphql`;

export const apollo: ApolloClient<NormalizedCacheObject> = new ApolloClient({
	uri,
	cache: new InMemoryCache(),
	credentials: "include",
	headers: {
		Authorization: Cookies.get(TOKEN_NAME) || " ",
	},
});

const createLink = (initialState: NormalizedCacheObject, token: string) => {
	const cookie =
		typeof window !== "undefined" ? Cookies.get(TOKEN_NAME) : token;

	const httpLink = createHttpLink({
		uri,
		fetch,
		credentials: "include",
		headers: {
			Authorization: cookie,
		},
	});

	return new ApolloClient({
		connectToDevTools: process.browser,
		ssrMode: !process.browser,
		link: httpLink,
		cache: new InMemoryCache().restore(initialState || {}),
	});
};

export const initializeApollo = (
	initialState?: NormalizedCacheObject,
	ctx?: NextPageContext,
): ApolloClient<NormalizedCacheObject> => {
	const cookie = getTokenCookie(ctx?.req);

	if (!process.browser) return createLink(initialState, cookie);
	if (!apolloClient) {
		apolloClient = createLink(initialState, cookie);
	}

	return apolloClient;
};

export const useApollo = (
	initialState: NormalizedCacheObject,
): ApolloClient<NormalizedCacheObject> => {
	const store = useMemo(() => initializeApollo(initialState), [initialState]);
	return store;
};
