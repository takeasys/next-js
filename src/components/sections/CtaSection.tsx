interface CtaSectionProps {
  isTwoColumn?: boolean;
  theme?: "dark" | "light" | "brand";
  align?: "left" | "center";
}

const CtaSection = (props: CtaSectionProps) => {
  const { isTwoColumn = false, align = "left", theme = "light" } = props;

  const maxWidthContainerClass = isTwoColumn ? "max-w-md" : "";
  const maxWidthContentClass =
    !isTwoColumn && align === "center" ? "mx-auto max-w-2xl" : "";
  const flexStyle = align === "center" ? "center" : "start";

  const themeClasses = {
    light: {
      background: "bg-gray-100",
      h2: "text-black",
      p: "text-gray-800",
      button:
        "bg-indigo-600 text-white hover:bg-indigo-500 sfocus-visible:outline-white",
    },
    dark: {
      background: "bg-gray-900",
      h2: "text-white",
      p: "text-gray-300",
      button:
        "bg-white text-gray-900 hover:bg-gray-100 sfocus-visible:outline-white",
    },
    brand: {
      background: "bg-indigo-700",
      h2: "text-white",
      p: "text-indigo-200	",
      button:
        "bg-white text-indigo-600 hover:bg-indigo-50 sfocus-visible:outline-white",
    },
  };
  const themeStyles = themeClasses[theme];

  return (
    <>
      <div className="bg-white">
        <div className="mx-auto max-w-7xl py-24 sm:px-6 sm:py-32 lg:px-8">
          <div
            className={`relative isolate overflow-hidden ${themeStyles.background} px-6 pt-16 shadow-2xl sm:rounded-3xl sm:px-16 md:pt-24 lg:flex lg:gap-x-20 lg:px-24 lg:pt-0`}
          >
            {/* background gradient */}
            {theme === "dark" && (
              <svg
                viewBox="0 0 1024 1024"
                aria-hidden="true"
                className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-y-1/2 [mask-image:radial-gradient(closest-side,white,transparent)] sm:left-full sm:-ml-80 lg:left-1/2 lg:ml-0 lg:-translate-x-1/2 lg:translate-y-0"
              >
                <circle
                  r={512}
                  cx={512}
                  cy={512}
                  fill="url(#759c1415-0410-454c-8f7c-9a820de03641)"
                  fillOpacity="0.7"
                />
                <defs>
                  <radialGradient id="759c1415-0410-454c-8f7c-9a820de03641">
                    <stop stopColor="#7775D6" />
                    <stop offset={1} stopColor="#E935C1" />
                  </radialGradient>
                </defs>
              </svg>
            )}
            {/* background gradient - END */}

            <div
              className={`mx-auto ${maxWidthContainerClass} text-center lg:mx-0 lg:flex-auto lg:py-32 lg:text-${align}`}
            >
              <h2
                className={`text-3xl ${maxWidthContentClass} font-bold tracking-tight ${themeStyles.h2} sm:text-4xl`}
              >
                Boost your productivity.
                <br />
                Start using our app today.
              </h2>
              <p
                className={`mt-6 text-lg leading-8 ${maxWidthContentClass} ${themeStyles.p}`}
              >
                Ac euismod vel sit maecenas id pellentesque eu sed consectetur.
                Malesuada adipiscing sagittis vel nulla.
              </p>
              <div
                className={`mt-10 flex items-center justify-${flexStyle} gap-x-6 lg:justify-${flexStyle}`}
              >
                <a
                  href="#"
                  className={`rounded-md px-3.5 py-2.5 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${themeStyles.button}`}
                >
                  Get started
                </a>
                <a
                  href="#"
                  className={`text-sm font-semibold leading-6 ${themeStyles.p}`}
                >
                  Learn more <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
            {isTwoColumn && (
              <div className="relative mt-16 h-80 lg:mt-8">
                <img
                  alt="App screenshot"
                  src="https://tailwindui.com/plus/img/component-images/dark-project-app-screenshot.png"
                  width={1824}
                  height={1080}
                  className="absolute left-0 top-0 w-[57rem] max-w-none rounded-md bg-white/5 ring-1 ring-white/10"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CtaSection;
