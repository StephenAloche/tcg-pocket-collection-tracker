import InstallPrompt from '@/components/InstallPrompt.tsx'
import { useToast } from '@/hooks/use-toast.ts'
import { authSSO, supabase } from '@/lib/Auth.ts'
import { fetchAccount } from '@/lib/fetchAccount.ts'
import type { AccountRow, CollectionRow } from '@/types'
import loadable from '@loadable/component'
import { useEffect, useMemo, useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { Route, Routes, useLocation } from 'react-router'
import Footer from './components/Footer.tsx'
import { Header } from './components/Header.tsx'
import { Toaster } from './components/ui/toaster.tsx'
import { CollectionContext } from './lib/context/CollectionContext.ts'
import { type User, UserContext } from './lib/context/UserContext.ts'
import { fetchCollection } from './lib/fetchCollection.ts'

// Lazy import for chunking
const Overview = loadable(() => import('./pages/overview/Overview.tsx'))
const Collection = loadable(() => import('./pages/collection/Collection.tsx'))
const Trade = loadable(() => import('./pages/trade/Trade.tsx'))
const EditProfile = loadable(() => import('./components/EditProfile.tsx'))

function App() {
  const { toast } = useToast()
  const location = useLocation()
  const isOverviewPage = location.pathname === '/'

  const [user, setUser] = useState<User | null>(null)
  const [account, setAccount] = useState<AccountRow | null>(null)
  const [ownedCards, setOwnedCards] = useState<CollectionRow[]>([])
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false)
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)
  const [selectedCardId, setSelectedCardId] = useState('')
  const [selectedMissionCardOptions, setSelectedMissionCardOptions] = useState<string[]>([])

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    // @ts-ignore
    window.umami?.track((props) => ({ ...props, url: location.pathname }))
  }, [location])

  useEffect(() => {
    if (user) {
      // check if query params sso & sig are set
      const params = new URLSearchParams(window.location.search)
      const sso = params.get('sso')
      const sig = params.get('sig')
      if (sso && sig) {
        toast({ title: 'Logging in', description: 'Please wait...', variant: 'default' })
        authSSO(user, sso, sig).catch(console.error)
      } else if (user.user.email) {
        fetchCollection(user.user.email).then(setOwnedCards).catch(console.error)
        fetchAccount(user.user.email).then(setAccount).catch(console.error)
      }
    } else {
      setOwnedCards([]) // in case the user is logged out, clear the cards
    }
  }, [user])

  const userContextValue = useMemo(
    () => ({
      user,
      setUser,
      account,
      setAccount,
      isLoginDialogOpen,
      setIsLoginDialogOpen,
      isProfileDialogOpen,
      setIsProfileDialogOpen,
    }),
    [user, account, isLoginDialogOpen, isProfileDialogOpen],
  )

  const collectionContextValue = useMemo(
    () => ({
      ownedCards,
      setOwnedCards,
      selectedCardId,
      setSelectedCardId,
      selectedMissionCardOptions,
      setSelectedMissionCardOptions,
    }),
    [ownedCards, selectedCardId, selectedMissionCardOptions],
  )

  return (
    <UserContext.Provider value={userContextValue}>
      <CollectionContext.Provider value={collectionContextValue}>
        <ErrorBoundary fallback={<div className="m-4">A new version was deployed, please refresh the page to see the latest changes.</div>}>
          <Toaster />
          <Header />
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/collection/:friendId?/trade?" element={<Collection />} />
            <Route path="/trade" element={<Trade />} />
          </Routes>
          <EditProfile account={account} setAccount={setAccount} isProfileDialogOpen={isProfileDialogOpen} setIsProfileDialogOpen={setIsProfileDialogOpen} />
          <InstallPrompt />
          {isOverviewPage && <Footer />}
        </ErrorBoundary>
      </CollectionContext.Provider>
    </UserContext.Provider>
  )
}

export default App
