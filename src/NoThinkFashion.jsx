import React, { useState, useEffect } from 'react';
import { Upload, Sparkles, TrendingUp, Cloud, Heart, X, Plus, ArrowRight, Camera, Wand2 } from 'lucide-react';

// NoThinkFashion - AI Fashion Companion
// Uses Gemini 3 API for wardrobe analysis and outfit generation

const NoThinkFashion = () => {
  const [apiKey, setApiKey] = useState('');
  const [isApiKeySet, setIsApiKeySet] = useState(false);
  const [wardrobe, setWardrobe] = useState([]);
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const [occasion, setOccasion] = useState('casual');
  const [location, setLocation] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [userMessage, setUserMessage] = useState('');
  const [generatedImage, setGeneratedImage] = useState(null);
  const [missingPiece, setMissingPiece] = useState(null);

  // Initialize API
  const initializeApi = () => {
    if (apiKey.trim()) {
      setIsApiKeySet(true);
      localStorage.setItem('gemini_api_key', apiKey);
    }
  };

  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      setIsApiKeySet(true);
    }
    
    // Load saved wardrobe from localStorage
    const savedWardrobe = localStorage.getItem('wardrobe');
    if (savedWardrobe) {
      setWardrobe(JSON.parse(savedWardrobe));
    }
  }, []);

  // Analyze clothing item using Gemini 3 Flash
  const analyzeClothing = async (imageData, fileName) => {
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                inlineData: {
                  mimeType: 'image/jpeg',
                  data: imageData.split(',')[1]
                }
              },
              {
                text: `Analyze this clothing item in detail. Return a JSON object with:
                - category (e.g., "shirt", "pants", "dress", "jacket", "shoes", "accessories")
                - primaryColor (main color)
                - secondaryColors (array of other colors)
                - style (e.g., "casual", "formal", "sporty", "bohemian", "streetwear")
                - season (array: can be "spring", "summer", "fall", "winter")
                - formality (1-5 scale, 1=very casual, 5=very formal)
                - pattern (e.g., "solid", "striped", "floral", "geometric")
                - material (e.g., "cotton", "denim", "wool", "leather")
                - description (brief 1-2 sentence description)`
              }
            ]
          }],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'object',
              properties: {
                category: { type: 'string' },
                primaryColor: { type: 'string' },
                secondaryColors: { type: 'array', items: { type: 'string' } },
                style: { type: 'string' },
                season: { type: 'array', items: { type: 'string' } },
                formality: { type: 'number' },
                pattern: { type: 'string' },
                material: { type: 'string' },
                description: { type: 'string' }
              },
              required: ['category', 'primaryColor', 'style', 'season', 'formality', 'description']
            }
          }
        })
      });

      const data = await response.json();
      const analysisText = data.candidates[0].content.parts[0].text;
      const analysis = JSON.parse(analysisText);
      
      return {
        id: Date.now(),
        image: imageData,
        fileName,
        ...analysis,
        addedDate: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error analyzing clothing:', error);
      throw error;
    }
  };

  // Handle file upload
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    setLoading(true);

    try {
      const analyzedItems = [];
      
      for (const file of files) {
        const reader = new FileReader();
        const imageData = await new Promise((resolve) => {
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(file);
        });

        const item = await analyzeClothing(imageData, file.name);
        analyzedItems.push(item);
      }

      const updatedWardrobe = [...wardrobe, ...analyzedItems];
      setWardrobe(updatedWardrobe);
      localStorage.setItem('wardrobe', JSON.stringify(updatedWardrobe));
      setActiveTab('wardrobe');
    } catch (error) {
      alert('Error analyzing clothing. Please check your API key and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Generate outfits using Gemini 3 Pro with Google Search
  const generateOutfits = async () => {
    if (wardrobe.length < 3) {
      alert('Please upload at least 3 items to generate outfits!');
      return;
    }

    setLoading(true);
    try {
      const wardrobeDescription = wardrobe.map(item => 
        `${item.category}: ${item.primaryColor} ${item.pattern} ${item.material}, ${item.style} style, formality ${item.formality}/5`
      ).join('\n');

      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a professional fashion stylist. Analyze this wardrobe and create 3 complete outfit combinations for a ${occasion} occasion${location ? ` in ${location}` : ''}.

Wardrobe items:
${wardrobeDescription}

${location ? `First, search for current weather in ${location} and latest fashion trends for ${occasion} occasions.` : 'Search for latest fashion trends for ' + occasion + ' occasions.'}

Then create 3 outfit combinations. For each outfit:
1. Select specific items from the wardrobe by their index (0-${wardrobe.length - 1})
2. Explain why these pieces work together (color theory, style, occasion appropriateness)
3. Rate the outfit (1-10)
4. Suggest one "missing piece" that would complete/enhance the outfit

Return JSON with this structure:
{
  "weatherInfo": "current weather if location provided",
  "trendInsights": "2-3 current fashion trends for this occasion",
  "outfits": [
    {
      "name": "outfit name",
      "items": [array of wardrobe item indices],
      "reasoning": "why this works",
      "colorHarmony": "color theory explanation",
      "rating": 8,
      "missingPiece": "description of item that would enhance this outfit"
    }
  ]
}`
            }]
          }],
          tools: [{ googleSearch: {} }],
          generationConfig: {
            thinkingConfig: {
              thinkingLevel: 'high'
            },
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'object',
              properties: {
                weatherInfo: { type: 'string' },
                trendInsights: { type: 'string' },
                outfits: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      items: { type: 'array', items: { type: 'number' } },
                      reasoning: { type: 'string' },
                      colorHarmony: { type: 'string' },
                      rating: { type: 'number' },
                      missingPiece: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        })
      });

      const data = await response.json();
      const resultText = data.candidates[0].content.parts.find(p => p.text)?.text;
      const result = JSON.parse(resultText);
      
      setOutfits(result.outfits);
      setActiveTab('outfits');
      
      // Initialize conversation history with outfit generation context
      setConversationHistory([
        {
          role: 'user',
          parts: [{ text: `Generated outfits for ${occasion} occasion` }]
        },
        {
          role: 'model',
          parts: [{ text: resultText }]
        }
      ]);
      
    } catch (error) {
      console.error('Error generating outfits:', error);
      alert('Error generating outfits. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Conversational refinement
  const refineOutfits = async () => {
    if (!userMessage.trim()) return;
    
    setLoading(true);
    try {
      const newHistory = [
        ...conversationHistory,
        {
          role: 'user',
          parts: [{ text: userMessage }]
        }
      ];

      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          contents: newHistory,
          generationConfig: {
            thinkingConfig: {
              thinkingLevel: 'medium'
            }
          }
        })
      });

      const data = await response.json();
      const responseText = data.candidates[0].content.parts[0].text;
      
      setConversationHistory([
        ...newHistory,
        {
          role: 'model',
          parts: [{ text: responseText }]
        }
      ]);
      
      setUserMessage('');
    } catch (error) {
      console.error('Error refining outfits:', error);
      alert('Error processing your request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Generate missing piece image using Nano Banana Pro
  const generateMissingPiece = async (description, outfitIndex) => {
    setLoading(true);
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Generate a professional product photo of this clothing item: ${description}. 
              The image should look like a high-quality e-commerce product photo with clean background, 
              proper lighting, and show the garment clearly.`
            }]
          }],
          generationConfig: {
            tools: [{ googleSearch: {} }],
            imageConfig: {
              aspectRatio: '1:1',
              imageSize: '2K'
            }
          }
        })
      });

      const data = await response.json();
      const imagePart = data.candidates[0].content.parts.find(p => p.inlineData);
      
      if (imagePart) {
        setMissingPiece({
          description,
          image: `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`,
          outfitIndex
        });
      }
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Error generating image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Remove item from wardrobe
  const removeItem = (id) => {
    const updated = wardrobe.filter(item => item.id !== id);
    setWardrobe(updated);
    localStorage.setItem('wardrobe', JSON.stringify(updated));
  };

  // Clear wardrobe
  const clearWardrobe = () => {
    if (confirm('Are you sure you want to clear your entire wardrobe?')) {
      setWardrobe([]);
      setOutfits([]);
      localStorage.removeItem('wardrobe');
    }
  };

  if (!isApiKeySet) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: '"Space Grotesk", -apple-system, sans-serif'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '48px',
          maxWidth: '500px',
          width: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <Sparkles size={48} style={{ color: '#667eea', margin: '0 auto 16px' }} />
            <h1 style={{
              fontSize: '36px',
              fontWeight: '700',
              margin: '0 0 8px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              NoThinkFashion
            </h1>
            <p style={{
              fontSize: '16px',
              color: '#666',
              margin: 0
            }}>
              Your AI fashion companion powered by Gemini 3
            </p>
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '8px',
              color: '#333'
            }}>
              Gemini API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Gemini API key"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e0e0e0',
                borderRadius: '12px',
                fontSize: '14px',
                marginBottom: '16px',
                transition: 'border-color 0.2s',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
            <button
              onClick={initializeApi}
              style={{
                width: '100%',
                padding: '14px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.4)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              Get Started
            </button>
            <p style={{
              fontSize: '12px',
              color: '#999',
              marginTop: '16px',
              textAlign: 'center'
            }}>
              Get your free API key at{' '}
              <a href="https://aistudio.google.com/apikey" target="_blank" style={{ color: '#667eea' }}>
                Google AI Studio
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      fontFamily: '"Space Grotesk", -apple-system, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        background: 'white',
        borderBottom: '1px solid #e0e0e0',
        padding: '20px 0',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Sparkles size={32} style={{ color: '#667eea' }} />
            <h1 style={{
              fontSize: '28px',
              fontWeight: '700',
              margin: 0,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              NoThinkFashion
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            {wardrobe.length > 0 && (
              <button
                onClick={clearWardrobe}
                style={{
                  padding: '8px 16px',
                  background: '#ff4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Clear Wardrobe
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid #e0e0e0'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          gap: '32px'
        }}>
          {['upload', 'wardrobe', 'outfits'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '16px 0',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab ? '3px solid #667eea' : '3px solid transparent',
                fontSize: '16px',
                fontWeight: '600',
                color: activeTab === tab ? '#667eea' : '#666',
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.2s'
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '32px 24px'
      }}>
        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div>
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '48px',
              textAlign: 'center',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}>
              <Camera size={64} style={{ color: '#667eea', margin: '0 auto 24px' }} />
              <h2 style={{
                fontSize: '28px',
                fontWeight: '700',
                marginBottom: '12px',
                color: '#333'
              }}>
                Upload Your Wardrobe
              </h2>
              <p style={{
                fontSize: '16px',
                color: '#666',
                marginBottom: '32px',
                maxWidth: '500px',
                margin: '0 auto 32px'
              }}>
                Take photos of your clothes and let AI analyze them. Upload multiple items at once!
              </p>
              
              <label style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '16px 32px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <Upload size={20} />
                Choose Files
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  disabled={loading}
                />
              </label>
              
              {loading && (
                <div style={{
                  marginTop: '24px',
                  fontSize: '14px',
                  color: '#667eea',
                  fontWeight: '600'
                }}>
                  Analyzing your items with Gemini AI...
                </div>
              )}
            </div>

            {wardrobe.length > 0 && (
              <div style={{
                marginTop: '24px',
                background: 'white',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
              }}>
                <p style={{ fontSize: '14px', color: '#666', textAlign: 'center' }}>
                  {wardrobe.length} item{wardrobe.length !== 1 ? 's' : ''} in your wardrobe
                </p>
              </div>
            )}
          </div>
        )}

        {/* Wardrobe Tab */}
        {activeTab === 'wardrobe' && (
          <div>
            {wardrobe.length === 0 ? (
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '48px',
                textAlign: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
              }}>
                <p style={{ fontSize: '16px', color: '#666' }}>
                  No items yet. Go to Upload tab to add clothes!
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '24px'
              }}>
                {wardrobe.map(item => (
                  <div key={item.id} style={{
                    background: 'white',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                  }}>
                    <div style={{ position: 'relative', paddingTop: '100%', background: '#f5f5f5' }}>
                      <img
                        src={item.image}
                        alt={item.category}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                      <button
                        onClick={() => removeItem(item.id)}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          background: 'rgba(255, 68, 68, 0.9)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'transform 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <div style={{ padding: '16px' }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px'
                      }}>
                        <span style={{
                          fontSize: '18px',
                          fontWeight: '700',
                          color: '#333',
                          textTransform: 'capitalize'
                        }}>
                          {item.category}
                        </span>
                        <span style={{
                          padding: '4px 12px',
                          background: '#667eea',
                          color: 'white',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {item.formality}/5
                        </span>
                      </div>
                      <p style={{
                        fontSize: '14px',
                        color: '#666',
                        marginBottom: '12px',
                        lineHeight: '1.5'
                      }}>
                        {item.description}
                      </p>
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '6px'
                      }}>
                        <span style={{
                          padding: '4px 8px',
                          background: '#f0f0f0',
                          borderRadius: '6px',
                          fontSize: '12px',
                          color: '#666'
                        }}>
                          {item.primaryColor}
                        </span>
                        <span style={{
                          padding: '4px 8px',
                          background: '#f0f0f0',
                          borderRadius: '6px',
                          fontSize: '12px',
                          color: '#666'
                        }}>
                          {item.style}
                        </span>
                        <span style={{
                          padding: '4px 8px',
                          background: '#f0f0f0',
                          borderRadius: '6px',
                          fontSize: '12px',
                          color: '#666'
                        }}>
                          {item.pattern}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {wardrobe.length >= 3 && (
              <div style={{
                marginTop: '32px',
                background: 'white',
                borderRadius: '16px',
                padding: '32px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
              }}>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  marginBottom: '20px',
                  color: '#333'
                }}>
                  Generate Outfits
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      marginBottom: '8px',
                      color: '#333'
                    }}>
                      Occasion
                    </label>
                    <select
                      value={occasion}
                      onChange={(e) => setOccasion(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e0e0e0',
                        borderRadius: '8px',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    >
                      <option value="casual">Casual</option>
                      <option value="business casual">Business Casual</option>
                      <option value="formal">Formal</option>
                      <option value="party">Party</option>
                      <option value="workout">Workout</option>
                      <option value="date night">Date Night</option>
                      <option value="brunch">Brunch</option>
                    </select>
                  </div>
                  
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      marginBottom: '8px',
                      color: '#333'
                    }}>
                      Location (optional)
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g., New York, London"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e0e0e0',
                        borderRadius: '8px',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                <button
                  onClick={generateOutfits}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: loading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'transform 0.2s'
                  }}
                  onMouseOver={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
                  onMouseOut={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  <Wand2 size={20} />
                  {loading ? 'Generating Outfits...' : 'Generate Outfits with AI'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Outfits Tab */}
        {activeTab === 'outfits' && (
          <div>
            {outfits.length === 0 ? (
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '48px',
                textAlign: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
              }}>
                <Sparkles size={48} style={{ color: '#667eea', margin: '0 auto 16px' }} />
                <p style={{ fontSize: '16px', color: '#666' }}>
                  No outfits generated yet. Go to Wardrobe tab to create some!
                </p>
              </div>
            ) : (
              <div>
                <div style={{
                  display: 'grid',
                  gap: '24px'
                }}>
                  {outfits.map((outfit, index) => (
                    <div key={index} style={{
                      background: 'white',
                      borderRadius: '16px',
                      padding: '24px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '16px'
                      }}>
                        <h3 style={{
                          fontSize: '22px',
                          fontWeight: '700',
                          color: '#333',
                          margin: 0
                        }}>
                          {outfit.name}
                        </h3>
                        <div style={{
                          padding: '6px 16px',
                          background: outfit.rating >= 8 ? '#4CAF50' : outfit.rating >= 6 ? '#FFC107' : '#FF9800',
                          color: 'white',
                          borderRadius: '20px',
                          fontSize: '14px',
                          fontWeight: '700'
                        }}>
                          {outfit.rating}/10
                        </div>
                      </div>

                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                        gap: '12px',
                        marginBottom: '16px'
                      }}>
                        {outfit.items.map(itemIndex => {
                          const item = wardrobe[itemIndex];
                          return item ? (
                            <div key={itemIndex} style={{
                              position: 'relative',
                              paddingTop: '100%',
                              borderRadius: '12px',
                              overflow: 'hidden',
                              background: '#f5f5f5'
                            }}>
                              <img
                                src={item.image}
                                alt={item.category}
                                style={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover'
                                }}
                              />
                            </div>
                          ) : null;
                        })}
                      </div>

                      <div style={{ marginBottom: '12px' }}>
                        <h4 style={{
                          fontSize: '14px',
                          fontWeight: '700',
                          color: '#667eea',
                          marginBottom: '6px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          Why This Works
                        </h4>
                        <p style={{
                          fontSize: '14px',
                          color: '#666',
                          lineHeight: '1.6',
                          margin: 0
                        }}>
                          {outfit.reasoning}
                        </p>
                      </div>

                      <div style={{ marginBottom: '12px' }}>
                        <h4 style={{
                          fontSize: '14px',
                          fontWeight: '700',
                          color: '#667eea',
                          marginBottom: '6px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          Color Harmony
                        </h4>
                        <p style={{
                          fontSize: '14px',
                          color: '#666',
                          lineHeight: '1.6',
                          margin: 0
                        }}>
                          {outfit.colorHarmony}
                        </p>
                      </div>

                      {outfit.missingPiece && (
                        <div style={{
                          marginTop: '16px',
                          padding: '16px',
                          background: '#f8f9fa',
                          borderRadius: '12px',
                          border: '2px dashed #667eea'
                        }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <div>
                              <h4 style={{
                                fontSize: '14px',
                                fontWeight: '700',
                                color: '#667eea',
                                marginBottom: '6px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                              }}>
                                Missing Piece
                              </h4>
                              <p style={{
                                fontSize: '14px',
                                color: '#666',
                                margin: 0
                              }}>
                                {outfit.missingPiece}
                              </p>
                            </div>
                            <button
                              onClick={() => generateMissingPiece(outfit.missingPiece, index)}
                              disabled={loading}
                              style={{
                                padding: '10px 20px',
                                background: loading ? '#ccc' : '#667eea',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              <Wand2 size={16} />
                              Visualize
                            </button>
                          </div>
                          
                          {missingPiece && missingPiece.outfitIndex === index && (
                            <div style={{ marginTop: '16px' }}>
                              <img
                                src={missingPiece.image}
                                alt="Generated item"
                                style={{
                                  width: '100%',
                                  maxWidth: '300px',
                                  borderRadius: '12px',
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                }}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Conversational Refinement */}
                <div style={{
                  marginTop: '32px',
                  background: 'white',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                }}>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    marginBottom: '16px',
                    color: '#333'
                  }}>
                    Refine Your Outfits
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#666',
                    marginBottom: '16px'
                  }}>
                    Ask me to make adjustments! Try: "Make it more colorful", "I don't like yellow", "Show me more formal options"
                  </p>

                  {conversationHistory.slice(2).map((msg, idx) => (
                    <div key={idx} style={{
                      marginBottom: '12px',
                      padding: '12px 16px',
                      background: msg.role === 'user' ? '#f0f0f0' : '#e8eeff',
                      borderRadius: '12px',
                      fontSize: '14px',
                      color: '#333'
                    }}>
                      <strong>{msg.role === 'user' ? 'You' : 'AI'}:</strong> {msg.parts[0].text}
                    </div>
                  ))}

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <input
                      type="text"
                      value={userMessage}
                      onChange={(e) => setUserMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && refineOutfits()}
                      placeholder="Type your request..."
                      style={{
                        flex: 1,
                        padding: '12px 16px',
                        border: '2px solid #e0e0e0',
                        borderRadius: '12px',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                    <button
                      onClick={refineOutfits}
                      disabled={loading || !userMessage.trim()}
                      style={{
                        padding: '12px 24px',
                        background: loading || !userMessage.trim() ? '#ccc' : '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: loading || !userMessage.trim() ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <ArrowRight size={16} />
                      Send
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        background: 'white',
        borderTop: '1px solid #e0e0e0',
        padding: '24px',
        textAlign: 'center',
        marginTop: '48px'
      }}>
        <p style={{
          fontSize: '14px',
          color: '#666',
          margin: 0
        }}>
          Powered by <strong style={{ color: '#667eea' }}>Gemini 3 AI</strong> • Built for Gemini Hackathon 2026
        </p>
      </footer>
    </div>
  );
};

export default NoThinkFashion;
