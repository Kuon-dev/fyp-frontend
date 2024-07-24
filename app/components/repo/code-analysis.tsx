import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ShieldIcon,
  WrenchIcon,
  BookOpenIcon,
  ChevronDownIcon,
  Code2,
  Star,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type PublicCodeCheckResult = {
  securityScore: number;
  maintainabilityScore: number;
  readabilityScore: number;
  overallDescription: string;
  eslintErrorCount: number;
  eslintFatalErrorCount: number;
};

export type PrivateCodeCheckResult = PublicCodeCheckResult & {
  securitySuggestion: string;
  maintainabilitySuggestion: string;
  readabilitySuggestion: string;
};

type CodeAnalysisProps = {
  isOpen: boolean;
  onClose: () => void;
  codeCheckResult: PublicCodeCheckResult | PrivateCodeCheckResult;
  repoName: string;
  repoLanguage: string;
  isPublicView: boolean;
};

const CodeAnalysis: React.FC<CodeAnalysisProps> = ({
  isOpen,
  onClose,
  codeCheckResult,
  repoName,
  repoLanguage,
  isPublicView,
}) => {
  const {
    securityScore,
    maintainabilityScore,
    readabilityScore,
    overallDescription,
    eslintErrorCount,
    eslintFatalErrorCount,
  } = codeCheckResult;

  const overallScore = Math.round(
    (securityScore + maintainabilityScore + readabilityScore) / 3,
  );

  const renderSuggestions = () => {
    if (isPublicView) return null;

    const privateResult = codeCheckResult as PrivateCodeCheckResult;
    return (
      <Card>
        <CardHeader>
          <CardTitle>Suggestions</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible>
            <AccordionItem value="security">
              <AccordionTrigger>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-accent rounded-full p-2">
                      <ShieldIcon className="w-5 h-5 text-accent-foreground" />
                    </div>
                    <span>Security</span>
                  </div>
                  <ChevronDownIcon className="w-5 h-5 text-muted-foreground" />
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-4">
                  {privateResult.securitySuggestion
                    .split(". ")
                    .map((suggestion, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Checkbox />
                        <span>{suggestion}</span>
                      </div>
                    ))}
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="maintainability">
              <AccordionTrigger>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary rounded-full p-2">
                      <WrenchIcon className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <span>Maintainability</span>
                  </div>
                  <ChevronDownIcon className="w-5 h-5 text-muted-foreground" />
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-4">
                  {privateResult.maintainabilitySuggestion
                    .split(". ")
                    .map((suggestion, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Checkbox />
                        <span>{suggestion}</span>
                      </div>
                    ))}
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="readability">
              <AccordionTrigger>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-secondary rounded-full p-2">
                      <BookOpenIcon className="w-5 h-5 text-secondary-foreground" />
                    </div>
                    <span>Readability</span>
                  </div>
                  <ChevronDownIcon className="w-5 h-5 text-muted-foreground" />
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-4">
                  {privateResult.readabilitySuggestion
                    .split(". ")
                    .map((suggestion, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Checkbox />
                        <span>{suggestion}</span>
                      </div>
                    ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Code Analysis Results</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[80vh] pr-4">
          <div className="flex flex-col bg-muted/40 p-4 rounded-lg">
            <Card className="w-full shadow-lg mb-6">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Code2 className="h-6 w-6 text-primary" />
                    <CardTitle className="text-2xl font-bold">
                      {repoName}
                    </CardTitle>
                  </div>
                  <Badge variant="outline" className="text-sm px-3 py-1">
                    {repoLanguage}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex items-center justify-center bg-primary/10 rounded-lg p-4">
                  <Star className="h-10 w-10 text-primary mr-2" />
                  <span className="text-5xl font-bold text-primary">
                    {overallScore}/10
                  </span>
                </div>
                <p className="mt-4 text-center text-sm text-muted-foreground">
                  Overall Code Quality Score
                </p>
              </CardContent>
            </Card>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex items-center gap-4">
                  <div className="bg-accent rounded-full p-2">
                    <ShieldIcon className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <div>
                    <CardTitle>Security</CardTitle>
                    <CardDescription>
                      <div className="flex items-center gap-2">
                        <span className="text-4xl font-bold">
                          {securityScore}
                        </span>
                        <span className="text-muted-foreground">/ 10</span>
                      </div>
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="flex items-center gap-4">
                  <div className="bg-primary rounded-full p-2">
                    <WrenchIcon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle>Maintainability</CardTitle>
                    <CardDescription>
                      <div className="flex items-center gap-2">
                        <span className="text-4xl font-bold">
                          {maintainabilityScore}
                        </span>
                        <span className="text-muted-foreground">/ 10</span>
                      </div>
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="flex items-center gap-4">
                  <div className="bg-secondary rounded-full p-2">
                    <BookOpenIcon className="w-6 h-6 text-secondary-foreground" />
                  </div>
                  <div>
                    <CardTitle>Readability</CardTitle>
                    <CardDescription>
                      <div className="flex items-center gap-2">
                        <span className="text-4xl font-bold">
                          {readabilityScore}
                        </span>
                        <span className="text-muted-foreground">/ 10</span>
                      </div>
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </div>
            {renderSuggestions()}
            <Card>
              <CardHeader>
                <CardTitle>Code Quality Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{overallDescription}</p>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold">ESLint Errors:</p>
                    <p>{eslintErrorCount}</p>
                  </div>
                  <div>
                    <p className="font-semibold">ESLint Fatal Errors:</p>
                    <p>{eslintFatalErrorCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default CodeAnalysis;
