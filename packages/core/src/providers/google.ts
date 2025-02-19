import { request } from "../utils";
import type { OAuthProvider } from ".";

export default (config: {
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
  scope?: string[];
}): OAuthProvider => ({
  id: "google",
  name: "Google OAuth",
  type: "oauth",
  authorizationUrl: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${config.clientId}&scope=email,profile&redirect_uri=${config.callbackUrl}&access_type=offline&include_granted_scopes=true&response_type=code&scope=${(config.scope ?? ["https://www.googleapis.com/auth/userinfo.email"]).join(" ")}`,
  accessTokenUrl: "https://oauth2.googleapis.com/token",
  userInfoUrl: "https://www.googleapis.com/oauth2/v2/userinfo",
  callbackUrl: config.callbackUrl,
  async retrieveToken(code) {
    const response = (await request(
      `${this.accessTokenUrl}?client_id=${config.clientId}&client_secret=${config.clientSecret}&redirect_uri=${config.callbackUrl}&code=${code}&grant_type=authorization_code`
    )) as { access_token: string; refresh_token: string };

    return {
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
    };
  },
  async retrieveProfile(accessToken) {
    const response = (await request(
      `${this.userInfoUrl}?client_id=${config.clientId}&access_token=${accessToken}`
    )) as any;

    if (
      typeof response.id !== "number" ||
      !response.email ||
      !response.email_verified
    ) {
      throw new Error("Could not get required attributes");
    }

    return {
      id: response.id,
      email: response.email,
      name: response.name,
      image: response.picture,
    };
  },
});
