import nextra from "nextra";

const withNextra = nextra({});

export default withNextra({
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
});
