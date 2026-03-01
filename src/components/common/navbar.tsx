import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { InfoIcon } from "lucide-react";

export default function Navbar() {
    return (
    <nav
      className="flex justify-between py-3 px-6 border-b border-brand/30 shrink-0 relative overflow-hidden"
      style={{
        backgroundImage: [
          "linear-gradient(135deg, var(--brand-dark) 0%, oklch(0.26 0.06 45) 100%)",
          "repeating-linear-gradient(45deg, transparent, transparent 8px, oklch(0.65 0.17 55 / 0.06) 8px, oklch(0.65 0.17 55 / 0.06) 9px)",
          "repeating-linear-gradient(-45deg, transparent, transparent 8px, oklch(0.65 0.17 55 / 0.06) 8px, oklch(0.65 0.17 55 / 0.06) 9px)",
        ].join(", "),
      }}
    >
        <div />
        <h3 className="text-xl font-bold text-white relative z-10">いなりといっしょ！</h3>
        <Dialog>
          <DialogTrigger asChild>
            <InfoIcon className="text-white/70 hover:text-white cursor-pointer transition-colors relative z-10" />
          </DialogTrigger>
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
