import React, { useState, useEffect } from 'react';
import { ContentService } from '../services/contentService';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { CONTENT_TONE } from '../utils/constants';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [postIdeas, setPostIdeas] = useState<string[]>([]);
  const [selectedIdea, setSelectedIdea] = useState('');
  const [generatedPost, setGeneratedPost] = useState('');
  const [scheduleDate, setScheduleDate] = useState<Date>(new Date());
  const [isGeneratingPost, setIsGeneratingPost] = useState(false);
  const [refreshingIdeas, setRefreshingIdeas] = useState(false);
  
  // Post customization options
  const [contentType, setContentType] = useState<'text' | 'poll' | 'image' | 'video'>('text');
  const [contentLength, setContentLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [contentTone, setContentTone] = useState<typeof CONTENT_TONE[keyof typeof CONTENT_TONE]>(CONTENT_TONE.PROFESSIONAL);

  useEffect(() => {
    const loadData = async () => {
      try {
        const ideas = await ContentService.generateContentIdeas();
        setPostIdeas(ideas);
        const profile = await ContentService.getUserProfile();
        setUserData(profile);
        
        // Get user preferences for default settings
        const prefs = await ContentService.getUserPreferences();
        setContentTone(prefs.contentTone || CONTENT_TONE.PROFESSIONAL);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleRefreshIdeas = async () => {
    try {
      setRefreshingIdeas(true);
      const ideas = await ContentService.generateContentIdeas(5); // Request 5 ideas
      setPostIdeas(ideas);
    } catch (error) {
      console.error('Error refreshing ideas:', error);
    } finally {
      setRefreshingIdeas(false);
    }
  };

  const handleGeneratePost = async () => {
    if (!selectedIdea) return;
    
    try {
      setIsGeneratingPost(true);
      const post = await ContentService.generateFullPost(selectedIdea, {
        contentType,
        contentLength,
        contentTone
      });
      setGeneratedPost(post);
    } catch (error) {
      console.error('Error generating post:', error);
    } finally {
      setIsGeneratingPost(false);
    }
  };

  const handleSchedule = async () => {
    if (!generatedPost) return;
    
    try {
      await ContentService.schedulePost({
        content: generatedPost,
        scheduledTime: scheduleDate.toISOString()
      });
      alert('Post scheduled successfully!');
      setGeneratedPost('');
      setSelectedIdea('');
    } catch (error) {
      console.error('Error scheduling post:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <p>Loading your personalized content dashboard...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>LinkedIn Booster</h1>
        <div className="user-info">
          <p>Industry: {userData?.industry || 'Technology'}</p>
          <p>Role: {userData?.role || 'Professional'}</p>
        </div>
      </header>
      
      <div className="content-section">
        <div className="section-header">
          <h2>Post Ideas</h2>
          <button 
            onClick={handleRefreshIdeas} 
            disabled={refreshingIdeas}
            className="refresh-button"
          >
            {refreshingIdeas ? 'Refreshing...' : 'Refresh Ideas'}
          </button>
        </div>
        
        <div className="ideas-container">
          {postIdeas.length === 0 ? (
            <p>No post ideas available. Click 'Refresh Ideas' to generate some.</p>
          ) : (
            <ul className="ideas-list">
              {postIdeas.map((idea, index) => (
                <li 
                  key={index} 
                  className={selectedIdea === idea ? 'selected-idea' : ''}
                  onClick={() => setSelectedIdea(idea)}
                >
                  {idea}
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {selectedIdea && (
          <div className="post-generator">
            <h3>Customize Your Post</h3>
            
            <div className="customization-options">
              <div className="option-group">
                <label>Content Type:</label>
                <select 
                  value={contentType} 
                  onChange={(e) => setContentType(e.target.value as any)}
                >
                  <option value="text">Text</option>
                  <option value="poll">Poll</option>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
              </div>
              
              <div className="option-group">
                <label>Length:</label>
                <select 
                  value={contentLength} 
                  onChange={(e) => setContentLength(e.target.value as any)}
                >
                  <option value="short">Short (100-150 words)</option>
                  <option value="medium">Medium (200-300 words)</option>
                  <option value="long">Long (350-500 words)</option>
                </select>
              </div>
              
              <div className="option-group">
                <label>Tone:</label>
                <select 
                  value={contentTone} 
                  onChange={(e) => setContentTone(e.target.value as typeof CONTENT_TONE[keyof typeof CONTENT_TONE])}
                >
                  <option value={CONTENT_TONE.PROFESSIONAL}>Professional</option>
                  <option value={CONTENT_TONE.CONVERSATIONAL}>Conversational</option>
                  <option value={CONTENT_TONE.EDUCATIONAL}>Educational</option>
                  <option value={CONTENT_TONE.INSPIRING}>Inspiring</option>
                </select>
              </div>
            </div>
            
            <button 
              onClick={handleGeneratePost} 
              disabled={isGeneratingPost}
              className="generate-button"
            >
              {isGeneratingPost ? 'Generating...' : 'Generate Post'}
            </button>
            
            {generatedPost && (
              <div className="post-preview">
                <h3>Generated Post</h3>
                <textarea 
                  value={generatedPost} 
                  onChange={(e) => setGeneratedPost(e.target.value)}
                  rows={10}
                  className="post-textarea"
                />
                
                <div className="schedule-container">
                  <h4>Schedule Post</h4>
                  <div className="date-picker-container">
                    <label>Post Date/Time:</label>
                    <DatePicker 
                      selected={scheduleDate} 
                      onChange={(date: Date) => setScheduleDate(date)}
                      showTimeSelect
                      dateFormat="MMMM d, yyyy h:mm aa"
                      className="date-picker"
                    />
                  </div>
                  <button 
                    onClick={handleSchedule}
                    className="schedule-button"
                  >
                    Schedule Post
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;