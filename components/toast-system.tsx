"use client"

import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { AnimatePresence, motion, Variants } from "framer-motion"
import { cn } from "../lib/utils"

// Toast Variants
const toastVariants = cva(
    "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-xl border p-4 pr-8 shadow-lg backdrop-blur-md transition-all",
    {
        variants: {
            variant: {
                default: "bg-white/90 border-gray-200/50 text-gray-900",
                destructive:
                    "bg-red-50/90 border-red-200/50 text-red-900",
                success: "bg-green-50/90 border-green-200/50 text-green-900",
                warning: "bg-amber-50/90 border-amber-200/50 text-amber-900",
                info: "bg-blue-50/90 border-blue-200/50 text-blue-900",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

// Toast Components
const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
    React.ElementRef<typeof ToastPrimitives.Viewport>,
    React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
    <ToastPrimitives.Viewport
        ref={ref}
        className={cn(
            "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
            className
        )}
        {...props}
    />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const Toast = React.forwardRef<
    React.ElementRef<typeof ToastPrimitives.Root>,
    React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants> & {
        showProgress?: boolean;
    }
>(({ className, variant, showProgress = true, ...props }, ref) => {
    return (
        <ToastPrimitives.Root
            ref={ref}
            className={cn(toastVariants({ variant }), className)}
            {...props}
        />
    )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
    React.ElementRef<typeof ToastPrimitives.Action>,
    React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
    <ToastPrimitives.Action
        ref={ref}
        className={cn(
            "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
            className
        )}
        {...props}
    />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
    React.ElementRef<typeof ToastPrimitives.Close>,
    React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
    <ToastPrimitives.Close
        ref={ref}
        className={cn(
            "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",
            className
        )}
        toast-close=""
        {...props}
    >
        <X className="h-4 w-4" />
    </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
    React.ElementRef<typeof ToastPrimitives.Title>,
    React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
    <ToastPrimitives.Title
        ref={ref}
        className={cn("text-sm font-semibold", className)}
        {...props}
    />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
    React.ElementRef<typeof ToastPrimitives.Description>,
    React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
    <ToastPrimitives.Description
        ref={ref}
        className={cn("text-sm opacity-90", className)}
        {...props}
    />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

// Icon component with animation
const ToastIcon = ({ variant }: { variant: VariantProps<typeof toastVariants>["variant"] }) => {
    const iconClass = "h-5 w-5 flex-shrink-0";

    switch (variant) {
        case "success":
            return (
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                >
                    <CheckCircle className={cn(iconClass, "text-green-600")} />
                </motion.div>
            );
        case "destructive":
            return (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.5, times: [0, 0.5, 1] }}
                >
                    <AlertCircle className={cn(iconClass, "text-red-600")} />
                </motion.div>
            );
        case "warning":
            return (
                <motion.div
                    initial={{ rotate: 0 }}
                    animate={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5, times: [0, 0.25, 0.5, 0.75, 1] }}
                >
                    <AlertTriangle className={cn(iconClass, "text-amber-600")} />
                </motion.div>
            );
        case "info":
            return (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                >
                    <Info className={cn(iconClass, "text-blue-600")} />
                </motion.div>
            );
        default:
            return null;
    }
};

// Types
type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>
type ToastActionElement = React.ReactElement<typeof ToastAction>

// Toast State Management
const TOAST_LIMIT = 3
const TOAST_REMOVE_DELAY = 1000

type ToasterToast = ToastProps & {
    id: string
    title?: React.ReactNode
    description?: React.ReactNode
    action?: ToastActionElement
    icon?: boolean
    duration?: number
}

const actionTypes = {
    ADD_TOAST: "ADD_TOAST",
    UPDATE_TOAST: "UPDATE_TOAST",
    DISMISS_TOAST: "DISMISS_TOAST",
    REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
    count = (count + 1) % Number.MAX_SAFE_INTEGER
    return count.toString()
}

type ActionType = typeof actionTypes

type Action =
    | { type: ActionType["ADD_TOAST"]; toast: ToasterToast }
    | { type: ActionType["UPDATE_TOAST"]; toast: Partial<ToasterToast> }
    | { type: ActionType["DISMISS_TOAST"]; toastId?: ToasterToast["id"] }
    | { type: ActionType["REMOVE_TOAST"]; toastId?: ToasterToast["id"] }

interface State {
    toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
    if (toastTimeouts.has(toastId)) return

    const timeout = setTimeout(() => {
        toastTimeouts.delete(toastId)
        dispatch({ type: "REMOVE_TOAST", toastId: toastId })
    }, TOAST_REMOVE_DELAY)

    toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case "ADD_TOAST":
            return { ...state, toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT) }
        case "UPDATE_TOAST":
            return { ...state, toasts: state.toasts.map((t) => (t.id === action.toast.id ? { ...t, ...action.toast } : t)) }
        case "DISMISS_TOAST": {
            const { toastId } = action
            if (toastId) addToRemoveQueue(toastId)
            else state.toasts.forEach((toast) => addToRemoveQueue(toast.id))
            return { ...state, toasts: state.toasts.map((t) => (t.id === toastId || toastId === undefined ? { ...t, open: false } : t)) }
        }
        case "REMOVE_TOAST":
            if (action.toastId === undefined) return { ...state, toasts: [] }
            return { ...state, toasts: state.toasts.filter((t) => t.id !== action.toastId) }
    }
}

const listeners: Array<(state: State) => void> = []
let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
    memoryState = reducer(memoryState, action)
    listeners.forEach((listener) => listener(memoryState))
}

type Toast = Omit<ToasterToast, "id">

function toast({ ...props }: Toast) {
    const id = genId()
    const update = (props: ToasterToast) => dispatch({ type: "UPDATE_TOAST", toast: { ...props, id } })
    const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

    dispatch({
        type: "ADD_TOAST",
        toast: { ...props, id, open: true, onOpenChange: (open) => { if (!open) dismiss() } },
    })

    return { id: id, dismiss, update }
}

function useToast() {
    const [state, setState] = React.useState<State>(memoryState)
    React.useEffect(() => { listeners.push(setState); return () => { const index = listeners.indexOf(setState); if (index > -1) listeners.splice(index, 1) } }, [state])
    return { ...state, toast, dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }) }
}

// Progress bar component
const ProgressBar = ({ variant }: { variant: VariantProps<typeof toastVariants>["variant"] }) => {
    const [width, setWidth] = React.useState(100)

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setWidth(0)
        }, 100)

        return () => clearTimeout(timer)
    }, [])

    const progressColor = {
        default: "bg-gray-400",
        destructive: "bg-red-400",
        success: "bg-green-400",
        warning: "bg-amber-400",
        info: "bg-blue-400",
    }[variant || "default"]

    return (
        <motion.div
            className={`absolute bottom-0 left-0 h-1 ${progressColor}`}
            initial={{ width: "100%" }}
            animate={{ width: `${width}%` }}
            transition={{ duration: 5, ease: "linear" }}
        />
    )
}

// Animation variants
const toastVariantsAnimation: Variants = {
    initial: {
        opacity: 0,
        y: -50,
        scale: 0.95
    },
    animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 400,
            damping: 25,
            staggerChildren: 0.1,
            delayChildren: 0.05
        }
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        x: 400,
        transition: {
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1]
        }
    }
}

const itemVariants: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 400,
            damping: 25
        }
    }
}

// Toaster Component
export function Toaster() {
    const { toasts } = useToast()

    return (
        <ToastProvider>
            <AnimatePresence mode="popLayout">
                {toasts.map(function ({ id, title, description, action, variant, icon = true, duration = 5000, ...props }) {
                    return (
                        <motion.div
                            key={id}
                            layoutId={id}
                            variants={toastVariantsAnimation}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="flex flex-col"
                            style={{ originY: 0 }}
                        >
                            <Toast variant={variant} {...props}>
                                <ProgressBar variant={variant} />
                                <div className="grid gap-1 flex-1">
                                    <div className="flex items-start gap-3">
                                        {icon && <ToastIcon variant={variant} />}
                                        <div className="flex-1">
                                            {title && (
                                                <motion.div variants={itemVariants}>
                                                    <ToastTitle>{title}</ToastTitle>
                                                </motion.div>
                                            )}
                                            {description && (
                                                <motion.div variants={itemVariants}>
                                                    <ToastDescription>{description}</ToastDescription>
                                                </motion.div>
                                            )}
                                        </div>
                                    </div>
                                    {action && (
                                        <motion.div
                                            className="mt-2"
                                            variants={itemVariants}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            {action}
                                        </motion.div>
                                    )}
                                </div>
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                >
                                    <ToastClose />
                                </motion.div>
                            </Toast>
                        </motion.div>
                    )
                })}
            </AnimatePresence>
            <ToastViewport />
        </ToastProvider>
    )
}

// Exports
export {
    type ToastProps,
    type ToastActionElement,
    ToastProvider,
    ToastViewport,
    Toast,
    ToastTitle,
    ToastDescription,
    ToastClose,
    ToastAction,
    useToast,
    toast,
}