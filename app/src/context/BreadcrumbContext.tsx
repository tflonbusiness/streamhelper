import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

type BreadcrumbContextValue = {
  dynamicLabel: string | null
  setDynamicLabel: (label: string | null) => void
}

const BreadcrumbContext = createContext<BreadcrumbContextValue | null>(null)

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [dynamicLabel, setDynamicLabel] = useState<string | null>(null)

  const value = useMemo(
    () => ({ dynamicLabel, setDynamicLabel }),
    [dynamicLabel],
  )

  return (
    <BreadcrumbContext.Provider value={value}>
      {children}
    </BreadcrumbContext.Provider>
  )
}

export function useBreadcrumbDynamicLabel() {
  const context = useContext(BreadcrumbContext)

  if (!context) {
    throw new Error('useBreadcrumbDynamicLabel requires BreadcrumbProvider')
  }

  return context
}

export function useSetBreadcrumbLabel(label: string | null) {
  const { setDynamicLabel } = useBreadcrumbDynamicLabel()

  useEffect(() => {
    setDynamicLabel(label)

    return () => {
      setDynamicLabel(null)
    }
  }, [label, setDynamicLabel])
}
