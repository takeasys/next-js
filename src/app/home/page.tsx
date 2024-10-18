import CtaSection from "@/components/sections/CtaSection";

const HomePage = () => {
  return (
    <>
      <CtaSection isTwoColumn={true} theme="dark" />
      <CtaSection isTwoColumn={false} theme="light" />
      <CtaSection isTwoColumn={false} theme="dark" align="center" />
      <CtaSection isTwoColumn={false} theme="light" align="center" />
      <CtaSection isTwoColumn={false} theme="brand" align="center" />
    </>
  );
};

export default HomePage;
