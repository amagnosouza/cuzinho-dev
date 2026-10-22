import { useEffect, useSyncExternalStore, type AnchorHTMLAttributes, type MouseEvent } from 'react'

// Tiny History API router: the site has a handful of static pages, so no need for a library
const listeners = new Set<() => void>()

function subscribe(cb: () => void) {
  listeners.add(cb)
  window.addEventListener('popstate', cb)
  return () => {
    listeners.delete(cb)
    window.removeEventListener('popstate', cb)
  }
}

const snapshot = () => location.pathname + location.hash

export function navigate(to: string, { replace = false } = {}) {
  history[replace ? 'replaceState' : 'pushState'](null, '', to)
  listeners.forEach(l => l())
}

export function useLocation() {
  useSyncExternalStore(subscribe, snapshot)
  const path = location.pathname.replace(/\/+$/, '') || '/'
  return {
    path, hash:
      location.hash
  }
}

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }

export function Link({ to, onClick, ...props }: LinkProps) {
  const { path } = useLocation()
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    navigate(to)
  }
  return <a href={to} onClick={handle} aria-current={to === path ? 'page' : undefined} {...props} />
}

export function useTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · cuzinho.dev` : 'cuzinho.dev'
  }, [title])
}
