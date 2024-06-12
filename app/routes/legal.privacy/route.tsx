import Navbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";
import { Shell } from "@/components/landing/shell";
import { Button } from "@/components/ui/button";
import { Link } from "@remix-run/react";

export function PrivacyPolicy() {
  return (
    <Shell className="lg:px-32">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        Privacy Policy
      </h1>

      <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
        1. Introduction
      </h2>
      <p className="leading-7 [&:not(:first-child)]:mt-6">
        We value your privacy and are committed to protecting your personal
        information. This privacy policy outlines how we collect, use, and
        protect your information when you use our application.
      </p>

      <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
        2. Information We Collect
      </h2>
      <p className="leading-7 [&:not(:first-child)]:mt-6">
        We collect various types of information in connection with the services
        we provide, including:
      </p>
      <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
        <li>
          Personal Information: Information that can be used to identify you,
          such as your name, email address, and contact details.
        </li>
        <li>
          Usage Data: Information about how you use our application, such as
          your browsing actions and patterns.
        </li>
        <li>
          Technical Data: Information about your device, such as IP address,
          browser type, and operating system.
        </li>
      </ul>

      <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
        3. How We Use Your Information
      </h2>
      <p className="leading-7 [&:not(:first-child)]:mt-6">
        We use your information for the following purposes:
      </p>
      <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
        <li>To provide and maintain our services.</li>
        <li>To notify you about changes to our services.</li>
        <li>
          To allow you to participate in interactive features of our application
          when you choose to do so.
        </li>
        <li>To provide customer support.</li>
        <li>
          To gather analysis or valuable information so that we can improve our
          services.
        </li>
        <li>To monitor the usage of our application.</li>
        <li>To detect, prevent, and address technical issues.</li>
      </ul>

      <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
        4. Sharing Your Information
      </h2>
      <p className="leading-7 [&:not(:first-child)]:mt-6">
        We do not sell, trade, or otherwise transfer to outside parties your
        personally identifiable information except in the following
        circumstances:
      </p>
      <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
        <li>With your consent.</li>
        <li>
          For external processing with trusted partners who perform services on
          our behalf.
        </li>
        <li>
          For legal reasons, such as to comply with a subpoena or similar legal
          process.
        </li>
      </ul>

      <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
        5. Security of Your Information
      </h2>
      <p className="leading-7 [&:not(:first-child)]:mt-6">
        We take reasonable measures to protect your personal information from
        unauthorized access, use, or disclosure. However, no method of
        transmission over the internet, or method of electronic storage, is 100%
        secure, and we cannot guarantee its absolute security.
      </p>

      <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
        6. Your Data Protection Rights
      </h2>
      <p className="leading-7 [&:not(:first-child)]:mt-6">
        Depending on your location, you may have the following rights regarding
        your personal data:
      </p>
      <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
        <li>
          The right to access – You have the right to request copies of your
          personal data.
        </li>
        <li>
          The right to rectification – You have the right to request that we
          correct any information you believe is inaccurate or complete
          information you believe is incomplete.
        </li>
        <li>
          The right to erasure – You have the right to request that we erase
          your personal data, under certain conditions.
        </li>
        <li>
          The right to restrict processing – You have the right to request that
          we restrict the processing of your personal data, under certain
          conditions.
        </li>
        <li>
          The right to object to processing – You have the right to object to
          our processing of your personal data, under certain conditions.
        </li>
        <li>
          The right to data portability – You have the right to request that we
          transfer the data that we have collected to another organization, or
          directly to you, under certain conditions.
        </li>
      </ul>

      <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
        7. Changes to This Privacy Policy
      </h2>
      <p className="leading-7 [&:not(:first-child)]:mt-6">
        We may update our privacy policy from time to time. We will notify you
        of any changes by posting the new privacy policy on this page. You are
        advised to review this privacy policy periodically for any changes.
        Changes to this privacy policy are effective when they are posted on
        this page.
      </p>
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
          <PrivacyPolicy />
          <Footer className="pt-10" />
        </div>
      </div>
    </>
  );
}
