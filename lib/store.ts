import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DatabaseConnection, QueryHistory, QueryTab, DatabaseSchema } from '@/types';

interface AppState {
  // Conexiones
  connections: DatabaseConnection[];
  activeConnection: DatabaseConnection | null;
  
  // Esquemas
  schemas: DatabaseSchema[];
  
  // Historial
  queryHistory: QueryHistory[];
  
  // Pestañas
  tabs: QueryTab[];
  activeTab: string;
  
  // Acciones para conexiones
  addConnection: (connection: DatabaseConnection) => void;
  updateConnection: (id: string, updates: Partial<DatabaseConnection>) => void;
  deleteConnection: (id: string) => void;
  setActiveConnection: (connection: DatabaseConnection | string | null) => void;
  
  // Acciones para esquemas
  setSchemas: (schemas: DatabaseSchema[]) => void;
  
  // Acciones para historial
  addQueryToHistory: (query: Omit<QueryHistory, 'id'>) => void;
  clearQueryHistory: () => void;
  
  // Acciones para pestañas
  addTab: (tab: QueryTab) => void;
  updateTab: (id: string, updates: Partial<QueryTab>) => void;
  deleteTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  closeTab: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      connections: [],
      activeConnection: null,
      schemas: [],
      queryHistory: [],
      tabs: [],
      activeTab: '',

      // Acciones para conexiones
      addConnection: (connection) =>
        set((state) => ({
          connections: [...state.connections, connection],
        })),

      updateConnection: (id, updates) =>
        set((state) => ({
          connections: state.connections.map((conn) =>
            conn.id === id ? { ...conn, ...updates } : conn
          ),
        })),

      deleteConnection: (id) =>
        set((state) => ({
          connections: state.connections.filter((conn) => conn.id !== id),
          activeConnection: state.activeConnection?.id === id ? null : state.activeConnection,
        })),

      setActiveConnection: (connection) => {
        if (typeof connection === 'string') {
          const foundConnection = get().connections.find(c => c.id === connection);
          set({ activeConnection: foundConnection || null });
        } else {
          set({ activeConnection: connection });
        }
      },

      // Acciones para esquemas
      setSchemas: (schemas) => set({ schemas }),

      // Acciones para historial
      addQueryToHistory: (query) =>
        set((state) => ({
          queryHistory: [
            {
              ...query,
              id: Date.now().toString(),
            },
            ...state.queryHistory.slice(0, 99), // Mantener solo los últimos 100
          ],
        })),

      clearQueryHistory: () => set({ queryHistory: [] }),

      // Acciones para pestañas
      addTab: (tab) =>
        set((state) => ({
          tabs: [...state.tabs, tab],
          activeTab: tab.id,
        })),

      updateTab: (id, updates) =>
        set((state) => ({
          tabs: state.tabs.map((tab) =>
            tab.id === id ? { ...tab, ...updates } : tab
          ),
        })),

      deleteTab: (id) =>
        set((state) => {
          const newTabs = state.tabs.filter((tab) => tab.id !== id);
          const newActiveTab = state.activeTab === id 
            ? (newTabs.length > 0 ? newTabs[0].id : '')
            : state.activeTab;
          
          return {
            tabs: newTabs,
            activeTab: newActiveTab,
          };
        }),

      setActiveTab: (id) => set({ activeTab: id }),

      closeTab: (id) => {
        const { deleteTab } = get();
        deleteTab(id);
      },
    }),
    {
      name: 'datagrip-store',
      partialize: (state) => ({
        connections: state.connections,
        queryHistory: state.queryHistory,
      }),
    }
  )
);
