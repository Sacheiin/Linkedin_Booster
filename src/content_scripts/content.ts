interface LinkedInPostElement extends HTMLElement {
  dataset: {
    testId?: string;
  };
}

interface LinkedInPost {
  id: string;
  content: string;
  authorName?: string;
  authorTitle?: string;
  engagement?: {
    likes: number;
    comments: number;
    shares: number;
  };
}

type ContentMessage = {
  type: 'analyzePost' | 'generateComment' | 'getPostInsights';
  payload?: unknown;
};

console.log('LinkedIn Booster Content Script Loaded');

// Extract post content and metadata for better analysis
function extractPostData(postElement: LinkedInPostElement): LinkedInPost {
  const postId = postElement.id || `post-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const contentElement = postElement.querySelector('.feed-shared-update-v2__description');
  const content = contentElement ? contentElement.textContent || '' : '';
  
  // Extract author information when available
  const authorElement = postElement.querySelector('.feed-shared-actor__name');
  const authorTitleElement = postElement.querySelector('.feed-shared-actor__description');
  
  // Extract engagement metrics when available
  const likesElement = postElement.querySelector('.social-details-social-counts__reactions-count');
  const commentsElement = postElement.querySelector('.social-details-social-counts__comments');
  const sharesElement = postElement.querySelector('.social-details-social-counts__shares');
  
  return {
    id: postId,
    content,
    authorName: authorElement ? authorElement.textContent || undefined : undefined,
    authorTitle: authorTitleElement ? authorTitleElement.textContent || undefined : undefined,
    engagement: {
      likes: likesElement ? parseInt(likesElement.textContent || '0', 10) : 0,
      comments: commentsElement ? parseInt(commentsElement.textContent || '0', 10) : 0,
      shares: sharesElement ? parseInt(sharesElement.textContent || '0', 10) : 0
    }
  };
}

chrome.runtime.onMessage.addListener(
  (message: ContentMessage, sender, sendResponse) => {
    if (message.type === 'analyzePost') {
      const postElements = Array.from(
        document.querySelectorAll<LinkedInPostElement>('[data-test-id="post-content"]')
      );
      
      // Extract detailed post data for better content generation
      const posts = postElements.map(extractPostData);
      sendResponse({ posts, count: posts.length });
    } else if (message.type === 'getPostInsights') {
      // Analyze current feed for trending topics and engagement patterns
      const postElements = Array.from(
        document.querySelectorAll<LinkedInPostElement>('[data-test-id="post-content"]')
      );
      
      const posts = postElements.map(extractPostData);
      const topEngagingPosts = posts
        .filter(post => post.engagement && post.engagement.likes > 0)
        .sort((a, b) => (b.engagement?.likes || 0) - (a.engagement?.likes || 0))
        .slice(0, 5);
      
      sendResponse({ 
        topEngagingPosts,
        trendingTopics: analyzeTrendingTopics(posts)
      });
    }
    return true;
  }
);

// Simple analysis of trending topics based on post content
function analyzeTrendingTopics(posts: LinkedInPost[]): string[] {
  // This is a simplified implementation
  // In a production environment, this would use more sophisticated NLP
  const allContent = posts.map(post => post.content).join(' ');
  const words = allContent.toLowerCase().split(/\s+/);
  
  // Filter common words and count occurrences
  const commonWords = new Set(['the', 'and', 'a', 'to', 'of', 'in', 'is', 'that', 'for', 'on', 'with']);
  const wordCounts: Record<string, number> = {};
  
  words.forEach(word => {
    if (word.length > 3 && !commonWords.has(word)) {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    }
  });
  
  // Return top 5 trending words
  return Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
}

if (window.location.hostname.includes('linkedin.com')) {
  console.log('LinkedIn detected, initializing enhanced extension features');
  chrome.runtime.sendMessage({ 
    type: 'contentScriptReady',
    payload: { platform: 'linkedin', version: '2.0' }
  });
}