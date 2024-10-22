import CtaSection from "@/components/sections/CtaSection";

const HomePage = () => {
  return (
    <>
      <CtaSection isTwoColumn={true} theme="dark" />
      <CtaSection isTwoColumn={false} theme="light" />
      <CtaSection isTwoColumn={false} theme="dark" textAlign="center" />
      <CtaSection isTwoColumn={false} theme="light" textAlign="center" />
      <CtaSection isTwoColumn={false} theme="brand" textAlign="center" />
      <CtaSection isTwoColumn={true} theme="light" imageAlign="left" />
      <CtaSection theme="brand">
        <div className="mx-auto p-16">
          <h2 className="text-3xl text-gray-100	">
            Design your app with unique styles
          </h2>
        </div>
      </CtaSection>
    </>
  );
};

export default HomePage;
