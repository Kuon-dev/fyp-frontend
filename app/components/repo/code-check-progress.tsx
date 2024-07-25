import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";

type CodeCheckProgressDialogProps = {
  isOpen: boolean;
  isChecking: boolean;
  checkProgress: number;
  onConfirm: () => void;
  onCancel: () => void;
};

export const CodeCheckProgressDialog: React.FC<
  CodeCheckProgressDialogProps
> = ({ isOpen, isChecking, checkProgress, onConfirm, onCancel }) => {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Submit Code Check</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to submit a code check for this repository?
            This action will analyze your code and may take a few moments to
            complete.
          </AlertDialogDescription>
          {isChecking && (
            <Progress value={checkProgress} className="w-full mt-4" />
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel} disabled={isChecking}>
            {isChecking ? "Cancel Check" : "Cancel"}
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isChecking}>
            Submit Check
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
