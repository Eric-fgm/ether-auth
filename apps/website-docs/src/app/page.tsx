import Link from "next/link";

export default function Main() {
  return (
    <div className="container">
      <div className="chip">&#10003; Secure Authentication</div>
      <h1 className="main-heading">
        The Ultimate Authentication
        <br /> Solution for <span className="stand-out">Node.js</span>
      </h1>
      <p className="main-paragraph">
        With built-in support for advanced features like multi-tenancy, and SSO,
        it simplifies the complexities of authentication, allowing you to focus
        on building application.
      </p>
      <div className="flex">
        <button className="btn-primary">
          <Link href="/docs/installation" prefetch>
            Get Started &#8594;
          </Link>
        </button>
        <button className="btn-secondary">
          <a
            href="https://github.com/Eric-fgm/ether-auth"
            target="_blank"
            rel="noreferrer"
          >
            Source Code &#10003;
          </a>
        </button>
      </div>
    </div>
  );
}
