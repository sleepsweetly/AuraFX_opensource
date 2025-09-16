"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import type { JSX } from "react/jsx-runtime"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

interface SplitTextProps {
  text: string
  className?: string
  tag?: React.ElementType
  delay?: number
  duration?: number
  ease?: string
  splitType?: "chars" | "words" | "lines"
  from?: Record<string, any>
  to?: Record<string, any>
  threshold?: number
  rootMargin?: string
  textAlign?: "left" | "center" | "right"
}

const SplitText: React.FC<SplitTextProps> = ({
  text,
  className = "",
  tag: Tag = "div",
  delay = 0,
  duration = 0.8,
  ease = "power3.out",
  splitType = "chars",
  from = { opacity: 0, y: 50 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = "-100px",
  textAlign = "left",
}) => {
  const elementRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const splitText = (text: string, type: string) => {
      if (type === "chars") {
        return text
          .split("")
          .map((char, i) => `<span key="${i}" style="display: inline-block;">${char === " " ? "&nbsp;" : char}</span>`)
          .join("")
      } else if (type === "words") {
        return text
          .split(" ")
          .map((word, i) => `<span key="${i}" style="display: inline-block; margin-right: 0.25em;">${word}</span>`)
          .join("")
      }
      return text
    }

    element.innerHTML = splitText(text, splitType)
    const spans = element.querySelectorAll("span")

    gsap.set(spans, from)

    ScrollTrigger.create({
      trigger: element,
      start: `top bottom${rootMargin}`,
      onEnter: () => {
        gsap.to(spans, {
          ...to,
          duration,
          ease,
          stagger: 0.02,
          delay,
        })
      },
      once: true,
    })

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [text, splitType, from, to, duration, ease, delay, threshold, rootMargin])

  const TagComponent = Tag as any
  return <TagComponent ref={(el: HTMLElement | null) => { elementRef.current = el }} className={className} style={{ textAlign }} />
}

export default SplitText
