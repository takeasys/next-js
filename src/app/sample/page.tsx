import { SectionTitle } from "@/app/components/SectionTitle";
import { Container } from "@/app/components/Container";
import { Cta } from "../components/Cta";
import { Faq } from "../components/Faq";
import { Hero } from "../components/Hero";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

const Page1 = () => {
  return (
    <>
      <Navbar />
      <Container>
        <Hero />
        <SectionTitle
          preTitle="Nextly Benefits"
          title=" Why should you use this landing page"
        >
          Nextly is a free landing page & marketing website template for
          startups and indie projects. Its built with Next.js & TailwindCSS. And
          its completely open-source.
        </SectionTitle>

        {/* <Benefits data={benefitOne} /> */}
        {/* <Benefits imgPos="right" data={benefitTwo} /> */}

        <SectionTitle
          preTitle="Watch a video"
          title="Learn how to fullfil your needs"
        >
          This section is to highlight a promo or demo video of your product.
          Analysts says a landing page with video has 3% more conversion rate.
          So, don&apos;t forget to add one. Just like this.
        </SectionTitle>

        {/* <Video videoId="fZ0D0cnR88E" /> */}

        <SectionTitle
          preTitle="Testimonials"
          title="Here's what our customers said"
        >
          Testimonials is a great way to increase the brand trust and awareness.
          Use this section to highlight your popular customers.
        </SectionTitle>

        {/* <Testimonials /> */}

        <SectionTitle preTitle="FAQ" title="Frequently Asked Questions">
          Answer your customers possible questions here, it will increase the
          conversion rate as well as support or chat requests.
        </SectionTitle>

        <Faq />
        <Cta />
      </Container>
      <Footer />
    </>
  );
};

export default Page1;
