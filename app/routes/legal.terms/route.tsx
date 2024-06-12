// import React from 'react';
import Navbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";
import { Shell } from "@/components/landing/shell";
import { Button } from "@/components/ui/button";
import { Link } from "@remix-run/react";

export function TermsOfService() {
  return (
    <Shell className="lg:px-32">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        Terms of Service
      </h1>

      <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
        1. Acceptance of Terms
      </h2>
      <p className="leading-7 [&:not(:first-child)]:mt-6">
        By using our application, you agree to comply with and be bound by the
        following terms and conditions. If you do not agree to these terms, you
        should not use this application.
      </p>

      <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
        2. Description of Service
      </h2>
      <p className="leading-7 [&:not(:first-child)]:mt-6">
        Our application provides an e-commerce platform that includes AI code
        analysis tools for code quality, functionality, and security
        assessments. The platform enables users to buy, sell, and share code
        snippets and other digital assets.
      </p>

      <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
        3. User Responsibilities
      </h2>
      <p className="leading-7 [&:not(:first-child)]:mt-6">
        Users are responsible for:
      </p>
      <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
        <li>Maintaining the confidentiality of their account information.</li>
        <li>All activities that occur under their account.</li>
        <li>
          Ensuring that any information provided is accurate and up to date.
        </li>
      </ul>

      <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
        4. Prohibited Activities
      </h2>
      <p className="leading-7 [&:not(:first-child)]:mt-6">
        Users are prohibited from:
      </p>
      <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
        <li>Using the application for any illegal or unauthorized purpose.</li>
        <li>
          Interfering with or disrupting the operation of the application.
        </li>
        <li>
          Uploading or distributing any viruses, malware, or other harmful
          software.
        </li>
      </ul>

      <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
        5. Intellectual Property
      </h2>
      <p className="leading-7 [&:not(:first-child)]:mt-6">
        All content on the application, including but not limited to text,
        graphics, logos, and software, is the property of the application owner
        or its content suppliers and is protected by intellectual property laws.
      </p>

      <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
        6. Code Submission and Use
      </h2>
      <p className="leading-7 [&:not(:first-child)]:mt-6">
        Users submitting code to the platform must ensure that:
      </p>
      <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
        <li>They have the right to upload and share the code.</li>
        <li>The code does not infringe on any third-party rights.</li>
        <li>
          The code complies with industry standards and does not contain harmful
          elements.
        </li>
      </ul>
      <p className="leading-7 [&:not(:first-child)]:mt-6">
        Users downloading or purchasing code from the platform must:
      </p>
      <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
        <li>Respect the intellectual property rights of the code creators.</li>
        <li>
          Use the code in accordance with any licensing agreements or terms
          specified by the creator.
        </li>
      </ul>

      <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
        7. Limitation of Liability
      </h2>
      <p className="leading-7 [&:not(:first-child)]:mt-6">
        The application owner is not liable for any damages arising from:
      </p>
      <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
        <li>The use or inability to use the application.</li>
        <li>Any unauthorized access to or alteration of user data.</li>
        <li>
          Any third-party content or services accessed through the application.
        </li>
      </ul>

      <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
        8. Privacy Policy
      </h2>
      <p className="leading-7 [&:not(:first-child)]:mt-6">
        Our privacy policy, which can be found{" "}
        <Button variant="link" className="p-0 leading-7 text-md underline">
          <Link to="/legal/privacy">here</Link>
        </Button>
        , explains how we collect, use, and protect your personal information.
        By using the application, you agree to the terms of the privacy policy.
      </p>

      <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
        9. Changes to Terms
      </h2>
      <p className="leading-7 [&:not(:first-child)]:mt-6">
        We reserve the right to modify these terms at any time. Changes will be
        effective immediately upon posting to the application. Continued use of
        the application following any changes indicates acceptance of the new
        terms.
      </p>

      <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
        10. Termination
      </h2>
      <p className="leading-7 [&:not(:first-child)]:mt-6">
        We reserve the right to terminate or suspend your access to the
        application at any time, without notice, for any reason, including
        violation of these terms.
      </p>

      <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
        11. Governing Law
      </h2>
      <p className="leading-7 [&:not(:first-child)]:mt-6">
        These terms are governed by and construed in accordance with the laws of
        Malaysia. Any disputes arising under these terms shall be subject to the
        exclusive jurisdiction of the courts of Malaysia.
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

          <TermsOfService />
          <Footer className="pt-10" />
        </div>
      </div>
    </>
  );
}
