import { withAuth } from "next-auth/middleware";

// Launch and Positions are the paid surface: no session, no entry.
export default withAuth({
  pages: { signIn: "/login" },
});

export const config = {
  matcher: ["/launch", "/launch/:path*", "/portfolio", "/portfolio/:path*"],
};
