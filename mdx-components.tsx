import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import { slug } from "@/lib/slug";

const components: MDXComponents = {
  // Section headings get an id so the "On this page" list can link to them.
  h2: ({ children, ...props }) => (
    <h2 id={typeof children === "string" ? slug(children) : undefined} {...props}>
      {children}
    </h2>
  ),
  a: ({ href = "", children, ...props }) => {
    const external = /^https?:\/\//.test(href);
    if (external) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} {...props}>
        {children}
      </Link>
    );
  },
};

export function useMDXComponents(): MDXComponents {
  return components;
}
