import { ApolloProvider } from "@apollo/client";
import { ThemeProvider } from "@emotion/react";
import { useApollo } from "apollo";
import AppLayout from "layouts/AppLayout";
import Router from "next/router";
import Nprogress from "nprogress";
import { RecoilRoot } from "recoil";
import { theme } from "theme";
Router.events.on("routeChangeStart", () => {
	Nprogress.start();
});
Router.events.on("routeChangeComplete", () => Nprogress.done());
Router.events.on("routeChangeError", () => Nprogress.done());

const MyApp = ({ Component, pageProps }) => {
	const client = useApollo(pageProps.apollo);
	return (
		<ApolloProvider client={client}>
			<RecoilRoot>
				<ThemeProvider theme={theme}>
					<AppLayout>
						<Component {...pageProps} />
					</AppLayout>
				</ThemeProvider>
			</RecoilRoot>
		</ApolloProvider>
	);
};

export default MyApp;
