import * as React from "react"

type ToastActionElement = React.ReactElement
type ToastProps = {
  title?: string
  description?: string
  action?: ToastActionElement
  variant?: "default" | "destructive"
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

export function useToast() {
  const toast = ({ title, description, variant = "default" }: ToastProps) => {
    const id = Math.random().toString(36).substr(2, 9)
    
    // Create toast element
    const toastElement = document.createElement("div")
    toastElement.className = `fixed top-4 left-1/2 transform -translate-x-1/2 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
      variant === "destructive" 
        ? "bg-red-600 text-white" 
        : "bg-white text-gray-900 border border-gray-200"
    }`
    toastElement.style.minWidth = "300px"
    toastElement.style.maxWidth = "500px"

    const content = `
      <div>
        ${title ? `<div class="font-bold mb-1">${title}</div>` : ""}
        ${description ? `<div class="text-sm ${variant === "destructive" ? "text-white" : "text-gray-600"}">${description}</div>` : ""}
      </div>
    `
    toastElement.innerHTML = content
    
    document.body.appendChild(toastElement)
    
    // Auto remove after 3 seconds
    const timeout = setTimeout(() => {
      toastElement.style.opacity = "0"
      setTimeout(() => {
        document.body.removeChild(toastElement)
        toastTimeouts.delete(id)
      }, 300)
    }, 3000)
    
    toastTimeouts.set(id, timeout)
    
    return { id }
  }

  return { toast }
}
