import { useState, useEffect, useCallback } from 'react';
import { firstAidDataset, type FirstAidArticle } from '../data/firstAidData';

export interface RAGLogEntry {
  timestamp: string;
  type: 'retrieval' | 'augmentation' | 'generation' | 'info';
  message: string;
}

export interface UseRAGResult {
  query: string;
  setQuery: (query: string) => void;
  selectedBodyPart: string | null;
  setSelectedBodyPart: (part: string | null) => void;
  results: { article: FirstAidArticle; score: number }[];
  activeArticle: FirstAidArticle | null;
  setActiveArticleById: (id: string | null) => void;
  logs: RAGLogEntry[];
  clearLogs: () => void;
  isProcessing: boolean;
}

export function useRAG(): UseRAGResult {
  const [query, setQueryState] = useState('');
  const [selectedBodyPart, setSelectedBodyPartState] = useState<string | null>(null);
  const [results, setResults] = useState<{ article: FirstAidArticle; score: number }[]>([]);
  const [activeArticle, setActiveArticle] = useState<FirstAidArticle | null>(null);
  const [logs, setLogs] = useState<RAGLogEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const addLog = useCallback((type: RAGLogEntry['type'], message: string) => {
    const entry: RAGLogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
    };
    setLogs((prev) => [entry, ...prev].slice(0, 50)); // Keep last 50 logs
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const setQuery = (q: string) => {
    if (q) setSelectedBodyPartState(null); // Clear body part filter if user searches text
    setQueryState(q);
  };

  const setSelectedBodyPart = (part: string | null) => {
    if (part) setQueryState(''); // Clear text search if user selects body part
    setSelectedBodyPartState(part);
  };

  const setActiveArticleById = (id: string | null) => {
    if (!id) {
      setActiveArticle(null);
      return;
    }
    const article = firstAidDataset.find((a) => a.id === id) || null;
    setActiveArticle(article);
    if (article) {
      addLog('info', `User explicitly focused on document: "${article.title}"`);
    }
  };

  useEffect(() => {
    const runRAGPipeline = async () => {
      setIsProcessing(true);
      const searchTerms = query.toLowerCase().split(/\s+/).filter(Boolean);
      
      addLog('info', `--- Starting RAG Pipeline Execution ---`);
      if (selectedBodyPart) {
        addLog('retrieval', `Embedding input query: "body_part: ${selectedBodyPart}"`);
      } else if (searchTerms.length > 0) {
        addLog('retrieval', `Embedding text query: "${query}" (tokens: [${searchTerms.join(', ')}])`);
      } else {
        // Empty state
        setResults([]);
        setActiveArticle(null);
        setIsProcessing(false);
        return;
      }

      // 1. Retrieval Phase
      addLog('retrieval', `Scanning local vector database index... (size: ${firstAidDataset.length} documents)`);
      
      // Introduce a small artificial delay to simulate neural search / vector lookup (150ms)
      await new Promise((resolve) => setTimeout(resolve, 150));

      const scoredDocs = firstAidDataset.map((doc) => {
        let score = 0;

        // Scoring rules:
        // A. Body Part Match (high weight if matched)
        if (selectedBodyPart) {
          if (doc.bodyParts.includes(selectedBodyPart.toLowerCase())) {
            score += 10.0;
            addLog('retrieval', `Document Match: "${doc.title}" matches body part filter [${selectedBodyPart}] (+10.0 score)`);
          }
        }

        // B. Title exact match or partial match
        searchTerms.forEach((term) => {
          if (doc.title.toLowerCase().includes(term)) {
            score += 5.0;
          }
          // C. Tag Match
          const tagMatches = doc.tags.filter((tag) => tag.includes(term));
          score += tagMatches.length * 2.0;

          // D. Description & Steps Match
          if (doc.description.toLowerCase().includes(term)) {
            score += 1.0;
          }
          doc.steps.forEach((step) => {
            if (step.text.toLowerCase().includes(term)) score += 0.5;
            step.substeps?.forEach((sub) => {
              if (sub.toLowerCase().includes(term)) score += 0.2;
            });
          });
        });

        return { article: doc, score };
      });

      // Filter out documents with 0 score and sort
      const rankedDocs = scoredDocs
        .filter((d) => d.score > 0)
        .sort((a, b) => b.score - a.score);

      setResults(rankedDocs);

      if (rankedDocs.length > 0) {
        const topMatch = rankedDocs[0];
        addLog(
          'retrieval',
          `Successfully retrieved ${rankedDocs.length} candidate documents. Top match: "${topMatch.article.title}" (Relevance score: ${topMatch.score.toFixed(1)})`
        );

        // 2. Augmentation Phase
        addLog('augmentation', `Retrieving full text segments for: "${topMatch.article.title}"`);
        addLog(
          'augmentation',
          `Constructing generation prompt context: Injecting system-level safety instructions, medical warnings, and step procedures.`
        );

        // Simulate prompt formatting and LLM generation (250ms)
        await new Promise((resolve) => setTimeout(resolve, 250));

        // 3. Generation Phase
        addLog(
          'generation',
          `Generating tailored step-by-step checklist and extracting warning contraindications...`
        );
        addLog('generation', `Synthesis complete. Rendering structured instructions.`);

        setActiveArticle(topMatch.article);
      } else {
        addLog('retrieval', 'Vector database search returned 0 documents matching the query.');
        setActiveArticle(null);
      }

      setIsProcessing(false);
    };

    // Debounce RAG execution slightly for text inputs
    const delayDebounceFn = setTimeout(
      () => {
        runRAGPipeline();
      },
      query ? 300 : 0
    );

    return () => clearTimeout(delayDebounceFn);
  }, [query, selectedBodyPart, addLog]);

  return {
    query,
    setQuery,
    selectedBodyPart,
    setSelectedBodyPart,
    results,
    activeArticle,
    setActiveArticleById,
    logs,
    clearLogs,
    isProcessing,
  };
}
