import { request } from "../utils";
import type { OAuthProvider } from ".";

export default (config: {
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
}): OAuthProvider => ({
  id: "github",
  name: "Github OAuth",
  type: "oauth",
  authorizationUrl: `https://github.com/login/oauth/authorize?client_id=${config.clientId}&scope=read:user user:email&redirect_uri=${config.callbackUrl}`,
  accessTokenUrl: "https://github.com/login/oauth/access_token",
  userInfoUrl: "https://api.github.com/user",
  callbackUrl: config.callbackUrl,
  async retrieveToken(code) {
    const response = (await request(
      `${this.accessTokenUrl}?client_id=${config.clientId}&client_secret=${config.clientSecret}&redirect_uri=${config.callbackUrl}&code=${code}`
    )) as { access_token: string };

    return {
      accessToken: response.access_token,
      refreshToken: "",
    };
  },
  retrieveProfile(accessToken) {
    return request(
      `${this.userInfoUrl}?client_id=${config.clientId}&access_token=${accessToken}`
    );
  },
});
