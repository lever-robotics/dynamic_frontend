import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/utils/SupabaseClient';
import { useAuth } from '@/utils/AuthProvider';
import type { MessageBubble, ToolExecutionBubble } from '@/types/chat';

type WhiteboardView = 'DataExecutor' | 'DocViewer' | 'GraphViewer';

interface Thread {
  id: string;
  name: string;
}

interface WorkspaceState {
  // Thread management
  threads: Thread[];
  currentThreadId: string | null;
  messages: MessageBubble[];
  artifacts: {
    images: string[];
    documents: string[];
    queries: string[];
  };
  // Whiteboard state
  currentView: WhiteboardView;
  selectedTool: ToolExecutionBubble | null;
  document: string | null;
  image: string | null;
  query: string | null;
}

interface WorkspaceContextType {
  state: WorkspaceState;
  isLoading: boolean;
  error: string | null;
  // Thread management functions
  createThread: (name: string) => Promise<void>;
  switchThread: (threadId: string) => Promise<void>;
  addMessage: (message: MessageBubble) => Promise<void>;
  addArtifact: (type: 'image' | 'document' | 'query', content: string) => Promise<void>;
  // Whiteboard functions
  setView: (view: WhiteboardView) => void;
  setSelectedTool: (tool: ToolExecutionBubble | null) => void;
  setDocument: (document: string | null) => void;
  setImage: (image: string | null) => void;
  setQuery: (query: string | null) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { userId } = useAuth();
  const [state, setState] = useState<WorkspaceState>({
    // Thread management
    threads: [],
    currentThreadId: null,
    messages: [],
    artifacts: {
      images: [],
      documents: [],
      queries: []
    },
    // Whiteboard state
    currentView: 'DocViewer',
    selectedTool: null,
    document: null,
    image: null,
    query: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch threads when user changes
  useEffect(() => {
    if (!userId) return;

    const fetchThreads = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('threads')
          .select('id, name')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setState(prev => ({
          ...prev,
          threads: data
        }));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch threads');
      } finally {
        setIsLoading(false);
      }
    };

    fetchThreads();
  }, [userId]);

  // Fetch thread content when current thread changes
  useEffect(() => {
    if (!userId || !state.currentThreadId) return;

    const fetchThreadContent = async () => {
      setIsLoading(true);
      try {
        // Fetch messages
        const { data: messages, error: messagesError } = await supabase
          .from('thread_messages')
          .select('content')
          .eq('thread_id', state.currentThreadId)
          .order('created_at', { ascending: true });

        if (messagesError) throw messagesError;

        // Fetch artifacts
        const { data: artifacts, error: artifactsError } = await supabase
          .from('thread_artifacts')
          .select('artifact_type, content')
          .eq('thread_id', state.currentThreadId);

        if (artifactsError) throw artifactsError;

        // Get the latest document and image
        const latestDocument = artifacts
          .filter(a => a.artifact_type === 'document')
          .sort((a, b) => b.created_at - a.created_at)[0]?.content || null;
        
        const latestImage = artifacts
          .filter(a => a.artifact_type === 'image')
          .sort((a, b) => b.created_at - a.created_at)[0]?.content || null;
        const latestQuery = artifacts
          .filter(a => a.artifact_type === 'query')
          .sort((a, b) => b.created_at - a.created_at)[0]?.content || null;

        setState(prev => ({
          ...prev,
          messages: messages.map(m => m.content),
          artifacts: {
            images: artifacts
              .filter(a => a.artifact_type === 'image')
              .map(a => a.content),
            documents: artifacts
              .filter(a => a.artifact_type === 'document')
              .map(a => a.content),
            queries: artifacts
              .filter(a => a.artifact_type === 'query')
              .map(a => a.content)
          },
          document: latestDocument,
          image: latestImage,
          query: latestQuery
        }));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch thread content');
      } finally {
        setIsLoading(false);
      }
    };

    fetchThreadContent();
  }, [userId, state.currentThreadId]);

  // Thread management functions
  const createThread = async (name: string) => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('threads')
        .insert([{ user_id: userId, name }])
        .select()
        .single();

      if (error) throw error;

      setState(prev => ({
        ...prev,
        threads: [data, ...prev.threads],
        currentThreadId: data.id
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create thread');
    }
  };

  const switchThread = async (threadId: string) => {
    setState(prev => ({
      ...prev,
      currentThreadId: threadId
    }));
  };

  const addMessage = async (message: MessageBubble) => {
    if (!state.currentThreadId) return;

    try {
      const { error } = await supabase
        .from('thread_messages')
        .insert([{
          thread_id: state.currentThreadId,
          message_type: message.type,
          content: message
        }]);

      if (error) throw error;

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, message]
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add message');
    }
  };

  const addArtifact = async (type: 'image' | 'document' | 'query', content: string) => {
    if (!state.currentThreadId) return;

    try {
      const { error } = await supabase
        .from('thread_artifacts')
        .insert([{
          thread_id: state.currentThreadId,
          artifact_type: type,
          content,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;

      setState(prev => ({
        ...prev,
        artifacts: {
          ...prev.artifacts,
          [type === 'image' ? 'images' : type === 'document' ? 'documents' : 'queries']: [
            ...prev.artifacts[type === 'image' ? 'images' : type === 'document' ? 'documents' : 'queries'],
            content
          ]
        },
        [type === 'image' ? 'image' : type === 'document' ? 'document' : 'query']: content
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add artifact');
    }
  };

  // Whiteboard functions
  const setView = (view: WhiteboardView) => {
    setState(prev => ({
      ...prev,
      currentView: view
    }));
  };

  const setSelectedTool = (tool: ToolExecutionBubble | null) => {
    setState(prev => ({
      ...prev,
      selectedTool: tool
    }));
  };

  const setDocument = (document: string | null) => {
    setState(prev => ({
      ...prev,
      document
    }));
  };

  const setImage = (image: string | null) => {
    setState(prev => ({
      ...prev,
      image
    }));
  };

  const setQuery = (query: string | null) => {
    setState(prev => ({
      ...prev,
      query
    }));
  };

  return (
    <WorkspaceContext.Provider
      value={{
        state,
        isLoading,
        error,
        // Thread management functions
        createThread,
        switchThread,
        addMessage,
        addArtifact,
        // Whiteboard functions
        setView,
        setSelectedTool,
        setDocument,
        setImage,
        setQuery
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}