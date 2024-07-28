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
import { CircleCheckIcon } from "lucide-react";
import { Link } from "@remix-run/react";

export default function Component() {
  return (
    <div className="flex justify-center items-center">
      <Card className="w-full max-w-md">
        <CardHeader className="pb-6">
          <CircleCheckIcon className="mx-auto size-12 text-green-500" />
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <CardTitle className="text-2xl font-bold">
            Payment Successful
          </CardTitle>
          <p className="text-muted-foreground">
            Your payment was processed successfully. Thank you for your
            business!
          </p>
        </CardContent>
        <CardFooter>
          <Link to="/" className="w-full">
            <Button className="w-full">Go to Dashboard</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
