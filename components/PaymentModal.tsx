import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Image from "next/image"

interface PaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  price: string
}

export function PaymentModal({ open, onOpenChange, price }: PaymentModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">微信扫码支付 {price}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center p-6">
          <Image
            src="/images/payment-qr.jpg"  // 替换为实际的二维码图片路径
            alt="微信支付二维码"
            width={200}
            height={200}
            className="rounded-lg"
          />
          <p className="mt-4 text-sm text-gray-500">
            请使用微信扫描二维码完成支付
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
} 