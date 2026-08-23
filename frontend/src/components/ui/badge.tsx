import * as React from "react"

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ")
}

function Slot({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  children: React.ReactElement<React.HTMLAttributes<HTMLElement>>
}) {
  return React.cloneElement(children, {
    ...props,
    className: cn(children.props.className, className),
  })
}

type BadgeVariant = "default" | "secondary" | "destructive" | "outline"

const badgeVariants = ({ variant = "default" }: { variant?: BadgeVariant } = {}) =>
  cn(
    "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
    {
      default:
        "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
      secondary:
        "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
      destructive:
        "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
      outline:
        "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
    }[variant]
  )

function Badge({
  className,
  variant,
  asChild = false,
  children,
  ...props
}: React.ComponentProps<"span"> &
  { variant?: BadgeVariant; asChild?: boolean }) {
  const badgeClassName = cn(badgeVariants({ variant }), className)

  if (asChild) {
    return (
      <Slot
        {...props}
        data-slot="badge"
        className={badgeClassName}
        children={
          children as React.ReactElement<React.HTMLAttributes<HTMLElement>>
        }
      />
    )
  }

  return (
    <span {...props} data-slot="badge" className={badgeClassName}>
      {children}
    </span>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export { Badge, badgeVariants }
