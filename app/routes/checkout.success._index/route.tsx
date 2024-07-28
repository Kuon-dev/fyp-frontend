/**
 * v0 by Vercel.
 * @see https://v0.dev/t/HA9uoWtzCKT
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Component() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-6">
        <CircleCheckIcon className="mx-auto size-12 text-green-500" />
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <CardTitle className="text-2xl font-bold">Payment Successful</CardTitle>
        <p className="text-muted-foreground">
          Your payment was processed successfully. Thank you for your business!
        </p>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Go to Dashboard</Button>
      </CardFooter>
    </Card>
  );
}

function CircleCheckIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function XIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
