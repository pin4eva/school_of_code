// import getConfig from 'next/config'

// const { serverRuntimeConfig, publicRuntimeConfig } = getConfig()

export const SERVER_URL =
	process.env.NODE_ENV === "production"
		? "https://helar.law"
		: "http://localhost:8000";
export const TOKEN_NAME = "__helar";
export const WS_URI =
	process.env.NODE_ENV === "production"
		? "wss://helar.law"
		: "ws://localhost:8000";
// export const SERVER_URL = serverRuntimeConfig.SERVER_URL || publicRuntimeConfig.SERVER_URL
// export const SERVER_URL = 'http://153.92.210.10'
// console.log('NEXT_PUBLIC_SERVER_URL:', SERVER_URL)
