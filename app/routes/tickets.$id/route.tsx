import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@remix-run/react";
import TicketIndex from "../tickets._index/route";

export default function EditTickets() {
  const nav = useNavigate();
  const close = () => nav(-1);

  return (
    <TicketIndex>
      <div>test</div>
    </TicketIndex>
  );
}
