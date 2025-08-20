import { cn } from "../../lib/utils";
import { cva, VariantProps } from "class-variance-authority";
import React, { ButtonHTMLAttributes } from "react";

const buttonVariants = cva(
  "font-head transition-all outline-hidden cursor-pointer duration-200 font-medium flex items-center",
  {
    variants: {
      variant: {
        default:
          "shadow-md hover:shadow-none bg-yellow-400 text-black border-2 border-black transition hover:translate-y-1 hover:bg-yellow-300",
        secondary:
          "shadow-md hover:shadow-none bg-yellow-200 text-black border-2 border-black transition hover:translate-y-1 hover:bg-yellow-100",
        outline:
          "shadow-md hover:shadow-none bg-transparent border-2 border-black text-black transition hover:translate-y-1",
        ghost:
          "bg-transparent hover:bg-gray-100 text-black transition",
        link: "bg-transparent text-yellow-400 hover:underline",
      },
      size: {
        sm: "px-3 py-1 text-sm shadow hover:shadow-none",
        md: "px-4 py-1.5 text-base",
        lg: "px-8 py-3 text-lg",
        icon: "p-2",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  },
);


export interface IButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> { }

export const Button = React.forwardRef<HTMLButtonElement, IButtonProps>(
  (
    {
      children,
      size = "md",
      className = "",
      variant = "default",
      ...props
    }: IButtonProps,
    forwardedRef,
  ) => (
    <button
      ref={forwardedRef}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {children}
    </button>
  ),
);

Button.displayName = "Button";
