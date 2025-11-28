// components/MarkdownComponents.tsx
import React from "react";
import { hasReadableText } from "@/shared/utils/textUtils";

export const MarkdownH1: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  ...props
}) => {
  if (!hasReadableText(children)) return null; // S6850: 빈 헤딩 회피
  return (
    <h1
      className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 lg:mb-5 text-gray-900"
      {...props}
    >
      {children}
    </h1>
  );
};

export const MarkdownH2: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  ...props
}) => {
  if (!hasReadableText(children)) return null;
  return (
    <h2
      className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 sm:mb-3 lg:mb-4 mt-4 sm:mt-6 lg:mt-8 text-gray-900"
      {...props}
    >
      {children}
    </h2>
  );
};

export const MarkdownH3: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  ...props
}) => {
  if (!hasReadableText(children)) return null;
  return (
    <h3
      className="text-base sm:text-lg lg:text-xl font-semibold mb-2 lg:mb-3 mt-3 sm:mt-4 lg:mt-6 text-gray-800"
      {...props}
    >
      {children}
    </h3>
  );
};

export const MarkdownUL: React.FC<React.HTMLAttributes<HTMLUListElement>> = ({
  children,
  ...props
}) => (
  <ul
    className="list-disc pl-4 sm:pl-5 lg:pl-6 mb-3 sm:mb-4 lg:mb-5 space-y-1.5 sm:space-y-2 lg:space-y-3"
    {...props}
  >
    {children}
  </ul>
);

export const MarkdownOL: React.FC<React.HTMLAttributes<HTMLOListElement>> = ({
  children,
  ...props
}) => (
  <ol
    className="list-decimal pl-4 sm:pl-5 lg:pl-6 mb-3 sm:mb-4 lg:mb-5 space-y-1.5 sm:space-y-2 lg:space-y-3"
    {...props}
  >
    {children}
  </ol>
);

export const MarkdownLI: React.FC<React.LiHTMLAttributes<HTMLLIElement>> = ({
  children,
  ...props
}) => (
  <li
    className="text-gray-800 leading-relaxed text-sm sm:text-base lg:text-lg"
    {...props}
  >
    {children}
  </li>
);

export const MarkdownP: React.FC<
  React.HTMLAttributes<HTMLParagraphElement>
> = ({ children, ...props }) => (
  <p
    className="mb-2 sm:mb-3 lg:mb-4 text-gray-800 leading-relaxed text-sm sm:text-base lg:text-lg"
    {...props}
  >
    {children}
  </p>
);

export const MarkdownStrong: React.FC<React.HTMLAttributes<HTMLElement>> = ({
  children,
  ...props
}) => (
  <strong className="font-bold text-gray-900" {...props}>
    {children}
  </strong>
);

type CodeProps = React.HTMLAttributes<HTMLElement> & { inline?: boolean };
export const MarkdownCode: React.FC<CodeProps> = ({
  inline,
  children,
  ...rest
}) => {
  if (inline) {
    return (
      <code
        className="bg-gray-300 px-1 sm:px-1.5 lg:px-2 py-0.5 lg:py-1 rounded text-xs sm:text-sm lg:text-base font-mono text-red-600"
        {...rest}
      >
        {children}
      </code>
    );
  }
  return (
    <code
      className="block bg-gray-300 p-3 sm:p-4 lg:p-5 rounded-lg text-xs sm:text-sm lg:text-base font-mono overflow-x-auto"
      {...rest}
    >
      {children}
    </code>
  );
};
