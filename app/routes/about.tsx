import Navbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";
import { Shell } from "@/components/landing/shell";
import { Button } from "@/components/ui/button";
import { Link } from "@remix-run/react";

export function AboutUs() {
  return (
    <Shell className="lg:px-32 mx-auto py-12 lg:py-16">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        About Us
      </h1>

      <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
        Our Mission
      </h2>
      <p className="leading-7 [&:not(:first-child)]:mt-6">
        Our mission is to revolutionize the way developers buy, sell, and share
        code by providing an innovative platform that ensures high standards of
        code quality, functionality, and security. We aim to foster a thriving
        community where developers can monetize their skills and where buyers
        can access top-notch code snippets.
      </p>

      <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
        Our Vision
      </h2>
      <p className="leading-7 [&:not(:first-child)]:mt-6">
        Our vision is to become the leading marketplace for code snippets,
        setting new standards for code quality and security in the digital
        economy. We strive to create a platform where innovation and excellence
        are the norms, and where both code producers and consumers can thrive.
      </p>

      <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
        Our Team
      </h2>
      <p className="leading-7 [&:not(:first-child)]:mt-6">
        We are a team of passionate developers, designers, and innovators who
        are dedicated to building a platform that meets the needs of the modern
        coding community. Our diverse backgrounds and expertise enable us to
        create solutions that are both cutting-edge and user-friendly.
      </p>

      <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
        What We Offer
      </h2>
      <p className="leading-7 [&:not(:first-child)]:mt-6">
        We offer a comprehensive e-commerce platform that includes:
      </p>
      <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
        <li>
          AI-powered code analysis tools to ensure the highest standards of code
          quality and security.
        </li>
        <li>A marketplace for buying and selling code snippets.</li>
        <li>
          Community features that foster collaboration and knowledge sharing
          among developers.
        </li>
        <li>
          Resources and support to help developers succeed in the digital
          economy.
        </li>
      </ul>

      <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
        Our Values
      </h2>
      <p className="leading-7 [&:not(:first-child)]:mt-6">
        Our values guide everything we do:
      </p>
      <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
        <li>
          <strong>Innovation:</strong> We are committed to pushing the
          boundaries of what is possible in the world of code.
        </li>
        <li>
          <strong>Quality:</strong> We strive to ensure that every code snippet
          on our platform meets the highest standards of quality and security.
        </li>
        <li>
          <strong>Community:</strong> We believe in the power of collaboration
          and the importance of supporting one another.
        </li>
        <li>
          <strong>Integrity:</strong> We conduct our business with honesty and
          transparency, building trust with our users.
        </li>
      </ul>
    </Shell>
  );
}

export default function Layout() {
  return (
    <>
      <Navbar />
      <div className="w-full bg-black dark:bg-grid-white/[0.1] bg-grid-black/[0.2] pb-20 pt-32">
        <div className="md:max-w-4xl mx-auto bg-transparent max-w-2xl lg:px-0 px-4">
          <Button className="" variant="link">
            <Link to="/">&larr; Back to Home</Link>
          </Button>
          <AboutUs />
          <Footer className="pt-10" />
        </div>
      </div>
    </>
  );
}
