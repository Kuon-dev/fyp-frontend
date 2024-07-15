import {
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  BellIcon,
  HandHelpingIcon,
} from "lucide-react";

export default function PendingSellerComponent() {
  return (
    <div className="w-full max-w-3xl mx-auto p-6 md:p-10">
      <div className="space-y-6">
        <div className="flex items-center justify-center">
          <CalendarIcon className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Business Profile Verification</h1>
          <p className="text-muted-foreground">
            We're currently reviewing your business profile and bank information
            to verify your account. This process typically takes 2-3 business
            days.
          </p>
        </div>
        <div className="bg-background rounded-lg p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Verification Status</h2>
              <p className="text-muted-foreground">
                Your application is currently being processed.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-primary rounded-full w-3 h-3 animate-pulse" />
              <span className="text-primary font-medium">In Progress</span>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-semibold">
              What to expect during verification:
            </h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <CheckIcon className="inline-block w-5 h-5 mr-2 text-green-500" />
                We will review your submitted documents and information.
              </li>
              <li>
                <ClockIcon className="inline-block w-5 h-5 mr-2 text-primary" />
                Our team may reach out to you for additional information or
                clarification.
              </li>
              <li>
                <BellIcon className="inline-block w-5 h-5 mr-2 text-primary" />
                Once your application is approved, we will activate your account
                and notify you.
              </li>
              <li>
                <ClockIcon className="inline-block w-5 h-5 mr-2 text-primary" />
                The entire process typically takes 3-5 business days, but may
                take longer during peak periods.
              </li>
              <li>
                <HandHelpingIcon className="inline-block w-5 h-5 mr-2 text-primary" />
                If you have any questions, please don't hesitate to contact our
                support team.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
