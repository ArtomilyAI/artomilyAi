import { create } from 'zustand'

// Global UI state store
interface AppState {
  // Add global state properties here
}

const initialState: AppState = {}

export const useAppStore = create<AppState>(() => initialState)
