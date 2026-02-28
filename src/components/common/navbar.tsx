import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { InfoIcon } from "lucide-react";

export default function Navbar() {
    return (
    <nav className="flex justify-between bg-orange-300 py-3 px-5 border-b-3">
        <div />
        <h3 className="text-xl font-bold ">いなりといっしょ！</h3>
        <Dialog>
          <DialogTrigger asChild><InfoIcon /></DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>このアプリはなに？</DialogTitle>
              <DialogDescription>
                「おかん」と評判のREALITYライバー、<br />
                「楽下いなり」の声で、生活のあらゆる場面を<br />
                お知らせしてくれるアプリケーションです。
                <br />
                <br />
                実家のおかんが恋しくなったあなたへ。<br />
                実家のような安心感を提供してくれる<br />
                楽下いなりボイスをお楽しみください。
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </nav>
    )
}