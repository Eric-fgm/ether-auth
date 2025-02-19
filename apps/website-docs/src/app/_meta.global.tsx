export default {
  index: {
    display: "hidden",
  },
  docs: {
    type: "page",
    title: "Documentation",
    items: {
      index: "",
      _: {
        type: "separator",
        title: "Getting Started",
      },
      installation: "",
      "quick-start": "",
      typescript: "",
      __: {
        type: "separator",
        title: "Guides",
      },
      "creating-database-adapter": "",
      "configuring-oauth": "",
      ___: {
        type: "separator",
        title: "API Reference",
      },
      providers: "",
      adapters: "",
      session: "",
      jwt: "",
      hooks: "",
    },
  },
  versions: {
    type: "menu",
    title: "Versions",
    items: {
      _1: {
        title: "Ether Auth v1",
        href: "/docs",
      },
    },
  },
};
