import nextra from "nextra";

const withNextra = nextra({
  search: true,
  defaultShowCopyCode: true,
});

export default withNextra({
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
});
