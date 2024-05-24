import Navbar from "@/elements/landing-navbar";
import Footer from "@/components/landing/footer";
import { Shell } from "@/components/landing/shell";
import { Button } from "@/components/ui/button";
import { Link } from "@remix-run/react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React from "react";
import { CircleCheckBig } from "lucide-react";

function Pricing() {
  const benefits = [
    {
      title: "Revenue Generation",
      description:
        "Sellers can monetize their coding expertise by selling high-quality React component code snippets, providing a direct financial incentive.",
    },
    {
      title: "Quality Assurance",
      description:
        "The platform's AI code analysis tool ensures that all code snippets meet high standards of quality and security, reducing the risk of integrating flawed or vulnerable code into projects.",
    },
    {
      title: "Community and Network Building",
      description:
        "Kortex fosters a sense of community, allowing developers to showcase their work, collaborate with others, and build a reputation within the developer community.",
    },
    {
      title: "Continuous Learning and Innovation",
      description:
        "The platform encourages developers to stay ahead of industry trends and best practices, fostering an environment of continuous improvement and innovation.",
    },
    {
      title: "Confidence and Trust",
      description:
        "By ensuring high-quality, vetted code snippets, Kortex builds trust among buyers, enhancing the overall development experience and increasing the likelihood of repeat purchases from reliable sellers.",
    },
  ];
  return (
    <div className="mx-auto max-w-3xl py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
      <div className="text-center">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Pricing
        </h1>
      </div>
      <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
        Marketplace Commission Rates
      </h2>
      <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
        Understand our transparent commission structure and plan your business
        growth accordingly.
      </p>

      <div className="mt-8 flex flex-col w-full">
        <div className="">
          <Card className="">
            <CardContent className="sm:pt-6 p-0">
              <Table className="">
                <TableHeader className="bg-gray-50 dark:bg-gray-800">
                  <TableRow>
                    <TableHead
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-50 sm:pl-6"
                      scope="col"
                    >
                      User Account Age
                    </TableHead>
                    <TableHead
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-50"
                      scope="col"
                    >
                      Revenue Share
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                  <TableRow>
                    <TableCell className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-gray-50 sm:pl-6">
                      Before 90 days
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                      100%
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-gray-50 sm:pl-6">
                      After 90 Days
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                      95%
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
          Key Benefits of Kortex for Sellers
        </h2>
        <ul className="my-6 ml-6 [&>li]:mt-2">
          {benefits.map((benefit, index) => (
            <li key={index} className="flex gap-4 py-2 ">
              <CircleCheckBig className="mr-4" />
              <span>
                <strong>{benefit.title}:</strong> {benefit.description}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function Layout() {
  return (
    <>
      <Shell>
        <Pricing />
      </Shell>
    </>
  );
}
