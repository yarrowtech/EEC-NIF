import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, RotateCcw, Map, Globe, MapPin, Users, Ruler, Clock, CheckCircle, XCircle, Award } from 'lucide-react';

const countries = [
  { 
    id: 'india',
    name: 'India', 
    capital: 'New Delhi',
    population: '1.4 billion',
    area: '3.3 million km²',
    continent: 'Asia',
    currency: 'Indian Rupee (INR)',
    languages: ['Hindi', 'English', '22 official languages'],
    flag: '🇮🇳',
    difficulty: 'Easy',
    facts: [
      'World\'s largest democracy',
      'Home to the Taj Mahal',
      'Birthplace of four major religions'
    ],
    shape: 'polygon(20% 10%, 80% 15%, 90% 40%, 85% 70%, 60% 85%, 40% 90%, 15% 80%, 10% 50%, 15% 20%)',
    color: 'from-orange-400 to-orange-600'
  },
  { 
    id: 'usa',
    name: 'United States', 
    capital: 'Washington, D.C.',
    population: '331 million',
    area: '9.8 million km²',
    continent: 'North America',
    currency: 'US Dollar (USD)',
    languages: ['English', 'Spanish'],
    flag: '🇺🇸',
    difficulty: 'Medium',
    facts: [
      'Third largest country by area',
      'Home to Hollywood and Silicon Valley',
      'Has 50 states and federal capital'
    ],
    shape: 'polygon(15% 20%, 85% 25%, 80% 60%, 75% 80%, 25% 85%, 10% 65%, 5% 40%)',
    color: 'from-blue-400 to-blue-600'
  },
  { 
    id: 'brazil',
    name: 'Brazil', 
    capital: 'Brasília',
    population: '215 million',
    area: '8.5 million km²',
    continent: 'South America',
    currency: 'Brazilian Real (BRL)',
    languages: ['Portuguese'],
    flag: '🇧🇷',
    difficulty: 'Medium',
    facts: [
      'Home to the Amazon rainforest',
      'Largest country in South America',
      'Famous for football and carnival'
    ],
    shape: 'polygon(30% 15%, 70% 20%, 85% 50%, 80% 85%, 40% 90%, 20% 70%, 15% 40%)',
    color: 'from-green-400 to-green-600'
  },
  { 
    id: 'australia',
    name: 'Australia', 
    capital: 'Canberra',
    population: '26 million',
    area: '7.7 million km²',
    continent: 'Oceania',
    currency: 'Australian Dollar (AUD)',
    languages: ['English'],
    flag: '🇦🇺',
    difficulty: 'Easy',
    facts: [
      'Smallest continent and largest island',
      'Home to unique wildlife like kangaroos',
      'Most of the population lives in coastal cities'
    ],
    shape: 'polygon(20% 30%, 80% 25%, 85% 60%, 75% 80%, 25% 85%, 15% 55%)',
    color: 'from-yellow-400 to-yellow-600'
  },
  { 
    id: 'china',
    name: 'China', 
    capital: 'Beijing',
    population: '1.4 billion',
    area: '9.6 million km²',
    continent: 'Asia',
    currency: 'Chinese Yuan (CNY)',
    languages: ['Mandarin Chinese'],
    flag: '🇨🇳',
    difficulty: 'Hard',
    facts: [
      'Most populous country in the world',
      'Home to the Great Wall of China',
      'Fastest-growing major economy'
    ],
    shape: 'polygon(25% 20%, 75% 15%, 85% 45%, 80% 75%, 60% 80%, 40% 85%, 20% 60%, 15% 35%)',
    color: 'from-red-400 to-red-600'
  },
  { 
    id: 'russia',
    name: 'Russia', 
    capital: 'Moscow',
    population: '146 million',
    area: '17.1 million km²',
    continent: 'Europe/Asia',
    currency: 'Russian Ruble (RUB)',
    languages: ['Russian'],
    flag: '🇷🇺',
    difficulty: 'Hard',
    facts: [
      'Largest country in the world by area',
      'Spans 11 time zones',
      'Rich in natural resources'
    ],
    shape: 'polygon(10% 15%, 90% 10%, 95% 35%, 85% 50%, 75% 40%, 50% 45%, 30% 50%, 5% 25%)',
    color: 'from-purple-400 to-purple-600'
  },
  { 
    id: 'japan',
    name: 'Japan', 
    capital: 'Tokyo',
    population: '125 million',
    area: '378,000 km²',
    continent: 'Asia',
    currency: 'Japanese Yen (JPY)',
    languages: ['Japanese'],
    flag: '🇯🇵',
    difficulty: 'Medium',
    facts: [
      'Island nation with over 6,000 islands',
      'Known for technology and anime',
      'Mount Fuji is its highest peak'
    ],
    shape: 'polygon(40% 20%, 45% 15%, 65% 25%, 70% 45%, 60% 75%, 45% 80%, 35% 65%, 30% 40%)',
    color: 'from-pink-400 to-pink-600'
  },
  { 
    id: 'egypt',
    name: 'Egypt', 
    capital: 'Cairo',
    population: '104 million',
    area: '1 million km²',
    continent: 'Africa',
    currency: 'Egyptian Pound (EGP)',
    languages: ['Arabic'],
    flag: '🇪🇬',
    difficulty: 'Medium',
    facts: [
      'Home to ancient pyramids and sphinx',
      'Nile River runs through the country',
      'Birthplace of ancient civilization'
    ],
    shape: 'polygon(35% 25%, 65% 20%, 70% 45%, 60% 70%, 50% 85%, 40% 80%, 30% 55%, 25% 35%)',
    color: 'from-amber-400 to-amber-600'
  }
];

// Complete Indian States and Territories Data
const indianStates = [
  {
    id: 'maharashtra',
    name: 'Maharashtra',
    capital: 'Mumbai',
    population: '112.4 million',
    area: '307,713 km²',
    language: 'Marathi',
    famousFor: 'Bollywood, IT Hub, Gateway of India',
    governor: 'Ramesh Bais',
    formed: '1960',
    districts: 36,
    x: '45%',
    y: '55%',
    size: 'w-16 h-14',
    shape: 'polygon(20% 20%, 70% 15%, 85% 45%, 80% 75%, 45% 85%, 15% 70%, 10% 40%)',
    color: 'from-orange-400 to-orange-600'
  },
  {
    id: 'karnataka',
    name: 'Karnataka',
    capital: 'Bengaluru',
    population: '61.1 million',
    area: '191,791 km²',
    language: 'Kannada',
    famousFor: 'Silicon Valley of India, Mysore Palace',
    governor: 'Thaawarchand Gehlot',
    formed: '1956',
    districts: 30,
    x: '40%',
    y: '68%',
    size: 'w-14 h-16',
    shape: 'polygon(25% 10%, 75% 20%, 80% 60%, 65% 85%, 30% 80%, 15% 50%, 20% 25%)',
    color: 'from-red-400 to-red-600'
  },
  {
    id: 'tamilnadu',
    name: 'Tamil Nadu',
    capital: 'Chennai',
    population: '72.1 million',
    area: '130,060 km²',
    language: 'Tamil',
    famousFor: 'Temples, Classical Dance, Film Industry',
    governor: 'R. N. Ravi',
    formed: '1956',
    districts: 38,
    x: '45%',
    y: '78%',
    size: 'w-12 h-18',
    shape: 'polygon(30% 5%, 70% 10%, 85% 40%, 75% 70%, 60% 90%, 25% 85%, 15% 60%, 20% 30%)',
    color: 'from-green-400 to-green-600'
  },
  {
    id: 'kerala',
    name: 'Kerala',
    capital: 'Thiruvananthapuram',
    population: '33.4 million',
    area: '38,852 km²',
    language: 'Malayalam',
    famousFor: 'Backwaters, Spices, Ayurveda',
    governor: 'Arif Mohammed Khan',
    formed: '1956',
    districts: 14,
    x: '38%',
    y: '80%',
    size: 'w-6 h-20',
    shape: 'polygon(40% 0%, 60% 5%, 65% 30%, 55% 60%, 45% 85%, 35% 90%, 25% 70%, 30% 40%, 35% 15%)',
    color: 'from-emerald-400 to-emerald-600'
  },
  {
    id: 'rajasthan',
    name: 'Rajasthan',
    capital: 'Jaipur',
    population: '68.5 million',
    area: '342,239 km²',
    language: 'Hindi, Rajasthani',
    famousFor: 'Desert, Palaces, Forts',
    governor: 'Kalraj Mishra',
    formed: '1956',
    districts: 33,
    x: '35%',
    y: '38%',
    size: 'w-20 h-18',
    shape: 'polygon(15% 25%, 80% 15%, 90% 45%, 85% 70%, 60% 85%, 30% 80%, 10% 60%, 5% 40%)',
    color: 'from-yellow-400 to-yellow-600'
  },
  {
    id: 'uttar-pradesh',
    name: 'Uttar Pradesh',
    capital: 'Lucknow',
    population: '199.8 million',
    area: '240,928 km²',
    language: 'Hindi, Urdu',
    famousFor: 'Taj Mahal, Varanasi, Allahabad',
    governor: 'Anandiben Patel',
    formed: '1950',
    districts: 75,
    x: '48%',
    y: '35%',
    size: 'w-24 h-12',
    shape: 'polygon(10% 30%, 85% 20%, 90% 50%, 80% 70%, 20% 75%, 5% 55%)',
    color: 'from-blue-400 to-blue-600'
  },
  {
    id: 'west-bengal',
    name: 'West Bengal',
    capital: 'Kolkata',
    population: '91.3 million',
    area: '88,752 km²',
    language: 'Bengali',
    famousFor: 'Literature, Fish, Sweets',
    governor: 'La. Ganesan',
    formed: '1947',
    districts: 23,
    x: '62%',
    y: '42%',
    size: 'w-14 h-16',
    shape: 'polygon(20% 15%, 75% 10%, 85% 35%, 80% 65%, 60% 85%, 25% 80%, 10% 50%, 15% 25%)',
    color: 'from-cyan-400 to-cyan-600'
  },
  {
    id: 'gujarat',
    name: 'Gujarat',
    capital: 'Gandhinagar',
    population: '60.4 million',
    area: '196,244 km²',
    language: 'Gujarati',
    famousFor: 'Business Hub, Handicrafts, Salt',
    governor: 'Acharya Devvrat',
    formed: '1960',
    districts: 33,
    x: '28%',
    y: '45%',
    size: 'w-16 h-20',
    shape: 'polygon(30% 5%, 70% 10%, 85% 30%, 80% 60%, 65% 85%, 35% 90%, 15% 70%, 20% 40%, 25% 15%)',
    color: 'from-purple-400 to-purple-600'
  },
  {
    id: 'madhya-pradesh',
    name: 'Madhya Pradesh',
    capital: 'Bhopal',
    population: '72.6 million',
    area: '308,245 km²',
    language: 'Hindi',
    famousFor: 'Heart of India, Khajuraho Temples',
    governor: 'Mangubhai C. Patel',
    formed: '1956',
    districts: 52,
    x: '42%',
    y: '48%',
    size: 'w-18 h-14',
    shape: 'polygon(15% 25%, 80% 20%, 85% 55%, 75% 75%, 25% 80%, 10% 50%)',
    color: 'from-indigo-400 to-indigo-600'
  },
  {
    id: 'andhra-pradesh',
    name: 'Andhra Pradesh',
    capital: 'Amaravati',
    population: '49.4 million',
    area: '162,968 km²',
    language: 'Telugu',
    famousFor: 'IT Services, Tirupati Temple',
    governor: 'S. Abdul Nazeer',
    formed: '1956',
    districts: 26,
    x: '50%',
    y: '70%',
    size: 'w-14 h-12',
    shape: 'polygon(25% 20%, 70% 15%, 80% 45%, 75% 70%, 30% 80%, 15% 55%, 20% 30%)',
    color: 'from-teal-400 to-teal-600'
  },
  {
    id: 'telangana',
    name: 'Telangana',
    capital: 'Hyderabad',
    population: '35.0 million',
    area: '112,077 km²',
    language: 'Telugu',
    famousFor: 'IT Hub, Charminar, Biryani',
    governor: 'Tamilisai Soundararajan',
    formed: '2014',
    districts: 33,
    x: '48%',
    y: '62%',
    size: 'w-12 h-10',
    shape: 'polygon(20% 25%, 75% 20%, 80% 55%, 70% 75%, 25% 80%, 15% 50%)',
    color: 'from-violet-400 to-violet-600'
  },
  {
    id: 'punjab',
    name: 'Punjab',
    capital: 'Chandigarh',
    population: '27.7 million',
    area: '50,362 km²',
    language: 'Punjabi',
    famousFor: 'Golden Temple, Agriculture',
    governor: 'Banwarilal Purohit',
    formed: '1966',
    districts: 23,
    x: '40%',
    y: '22%',
    size: 'w-12 h-10',
    shape: 'polygon(15% 30%, 80% 25%, 85% 60%, 75% 80%, 20% 75%, 10% 55%)',
    color: 'from-amber-400 to-amber-600'
  },
  {
    id: 'haryana',
    name: 'Haryana',
    capital: 'Chandigarh',
    population: '25.3 million',
    area: '44,212 km²',
    language: 'Hindi',
    famousFor: 'NCR, Agriculture, Industry',
    governor: 'Bandaru Dattatraya',
    formed: '1966',
    districts: 22,
    x: '45%',
    y: '28%',
    size: 'w-10 h-8',
    shape: 'polygon(20% 20%, 75% 15%, 80% 50%, 70% 75%, 25% 80%, 15% 45%)',
    color: 'from-lime-400 to-lime-600'
  },
  {
    id: 'odisha',
    name: 'Odisha',
    capital: 'Bhubaneswar',
    population: '42.0 million',
    area: '155,707 km²',
    language: 'Odia',
    famousFor: 'Jagannath Temple, Classical Dance',
    governor: 'Ganeshi Lal',
    formed: '1936',
    districts: 30,
    x: '58%',
    y: '52%',
    size: 'w-12 h-14',
    shape: 'polygon(30% 15%, 70% 10%, 80% 40%, 75% 75%, 35% 85%, 20% 60%, 25% 30%)',
    color: 'from-rose-400 to-rose-600'
  },
  {
    id: 'bihar',
    name: 'Bihar',
    capital: 'Patna',
    population: '104.1 million',
    area: '94,163 km²',
    language: 'Hindi',
    famousFor: 'Ancient History, Bodh Gaya',
    governor: 'Rajendra Vishwanath Arlekar',
    formed: '1912',
    districts: 38,
    x: '56%',
    y: '38%',
    size: 'w-16 h-10',
    shape: 'polygon(10% 35%, 85% 30%, 90% 60%, 80% 75%, 15% 70%, 5% 50%)',
    color: 'from-emerald-400 to-emerald-600'
  },
  {
    id: 'jharkhand',
    name: 'Jharkhand',
    capital: 'Ranchi',
    population: '33.0 million',
    area: '79,716 km²',
    language: 'Hindi',
    famousFor: 'Minerals, Tribal Culture',
    governor: 'Ramesh Bais',
    formed: '2000',
    districts: 24,
    x: '58%',
    y: '45%',
    size: 'w-12 h-12',
    shape: 'polygon(25% 20%, 70% 15%, 80% 45%, 75% 75%, 30% 80%, 20% 50%, 20% 25%)',
    color: 'from-stone-400 to-stone-600'
  },
  // Union Territories
  {
    id: 'delhi',
    name: 'Delhi (NCT)',
    capital: 'New Delhi',
    population: '16.8 million',
    area: '1,484 km²',
    language: 'Hindi, English',
    famousFor: 'National Capital, Red Fort',
    governor: 'Vinai Kumar Saxena',
    formed: '1911',
    districts: 11,
    x: '46%',
    y: '30%',
    size: 'w-4 h-4',
    shape: 'polygon(25% 25%, 75% 25%, 75% 75%, 25% 75%)',
    color: 'from-red-400 to-red-600',
    type: 'UT'
  },
  {
    id: 'goa',
    name: 'Goa',
    capital: 'Panaji',
    population: '1.5 million',
    area: '3,702 km²',
    language: 'Konkani',
    famousFor: 'Beaches, Portuguese Heritage',
    governor: 'P.S. Sreedharan Pillai',
    formed: '1987',
    districts: 2,
    x: '38%',
    y: '62%',
    size: 'w-4 h-6',
    shape: 'polygon(30% 10%, 70% 15%, 75% 60%, 65% 85%, 35% 80%, 25% 40%)',
    color: 'from-sky-400 to-sky-600'
  },
  {
    id: 'himachal-pradesh',
    name: 'Himachal Pradesh',
    capital: 'Shimla',
    population: '6.9 million',
    area: '55,673 km²',
    language: 'Hindi',
    famousFor: 'Hill Stations, Tourism',
    governor: 'Shiv Pratap Shukla',
    formed: '1971',
    districts: 12,
    x: '42%',
    y: '18%',
    size: 'w-14 h-8',
    shape: 'polygon(15% 40%, 80% 30%, 90% 60%, 75% 80%, 20% 75%, 10% 55%)',
    color: 'from-green-400 to-green-600'
  }
];

// 3D India Map Component
const IndiaMap3D = ({ highlightState, onStateClick, className = "" }) => {
  const [rotation, setRotation] = useState({ x: -15, y: 0 });
  const [selectedState, setSelectedState] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [memoryMode, setMemoryMode] = useState('study'); // 'study', 'test', 'results'
  const [showLabels, setShowLabels] = useState(true);
  const [testAnswers, setTestAnswers] = useState({});
  const [testScore, setTestScore] = useState(0);
  const [studyTime, setStudyTime] = useState(0);
  const [testStartTime, setTestStartTime] = useState(null);

  const getStateColor = (stateId) => {
    const state = indianStates.find(s => s.id === stateId);
    if (highlightState === stateId) {
      return 'from-yellow-400 to-yellow-600 ring-4 ring-yellow-300 animate-pulse';
    } else if (selectedState === stateId) {
      return 'from-pink-400 to-pink-600 ring-2 ring-pink-300';
    }
    return state ? state.color : 'from-gray-400 to-gray-600';
  };

  const handleStateClick = (stateId) => {
    const state = indianStates.find(s => s.id === stateId);
    
    if (memoryMode === 'study') {
      setSelectedState(stateId);
      setShowDetails(true);
      onStateClick?.(state);
    } else if (memoryMode === 'test') {
      // In test mode, allow user to input their guess
      const guess = prompt(`What is the name of this state/territory?\n\nHint: This region is known for: ${state.famousFor}`);
      if (guess) {
        const isCorrect = guess.toLowerCase().trim() === state.name.toLowerCase();
        setTestAnswers(prev => ({
          ...prev,
          [stateId]: {
            guess: guess.trim(),
            correct: state.name,
            isCorrect
          }
        }));
        
        if (isCorrect) {
          setTestScore(prev => prev + 1);
        }
      }
    }
  };

  const startMemoryTest = () => {
    setMemoryMode('test');
    setShowLabels(false);
    setTestAnswers({});
    setTestScore(0);
    setTestStartTime(Date.now());
    setSelectedState(null);
    setShowDetails(false);
  };

  const finishTest = () => {
    setMemoryMode('results');
    const testDuration = Date.now() - testStartTime;
    console.log(`Test completed in ${Math.round(testDuration / 1000)} seconds`);
  };

  const resetToStudy = () => {
    setMemoryMode('study');
    setShowLabels(true);
    setTestAnswers({});
    setTestScore(0);
    setTestStartTime(null);
    setSelectedState(null);
    setShowDetails(false);
  };

  // Study timer
  useEffect(() => {
    let interval;
    if (memoryMode === 'study') {
      interval = setInterval(() => {
        setStudyTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [memoryMode]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Memory Test Header */}
      <div className="mb-6 bg-gradient-to-r from-orange-100 via-white to-green-100 rounded-xl p-4 border-2 border-orange-200">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h3 className="text-lg font-bold text-gray-800">🧠 India States & Territories Memory Test</h3>
            <p className="text-sm text-gray-600">
              {memoryMode === 'study' && 'Study the labeled map as long as you need'}
              {memoryMode === 'test' && 'Click on each state to test your memory'}
              {memoryMode === 'results' && 'See your results below!'}
            </p>
          </div>
          <div className="text-right">
            {memoryMode === 'study' && (
              <div className="text-sm text-gray-600">
                Study Time: <span className="font-mono font-bold">{formatTime(studyTime)}</span>
              </div>
            )}
            {memoryMode === 'test' && (
              <div className="text-sm text-gray-600">
                Progress: <span className="font-bold">{Object.keys(testAnswers).length}/{indianStates.length}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          {memoryMode === 'study' && (
            <>
              <button
                onClick={() => setShowLabels(!showLabels)}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  showLabels 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {showLabels ? '👁️ Labels ON' : '👁️‍🗨️ Labels OFF'}
              </button>
              <button
                onClick={startMemoryTest}
                className="px-4 py-1 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
              >
                🧪 Start Memory Test
              </button>
              <div className="px-3 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-lg">
                💡 Study tip: Click on states to see detailed information
              </div>
            </>
          )}
          
          {memoryMode === 'test' && (
            <>
              <button
                onClick={finishTest}
                disabled={Object.keys(testAnswers).length < indianStates.length}
                className={`px-4 py-1 text-sm rounded-lg font-medium transition-colors ${
                  Object.keys(testAnswers).length === indianStates.length
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                ✅ Finish Test ({Object.keys(testAnswers).length}/{indianStates.length})
              </button>
              <button
                onClick={resetToStudy}
                className="px-3 py-1 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                📖 Back to Study
              </button>
              <div className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-lg">
                🎯 Click any state to guess its name
              </div>
            </>
          )}
          
          {memoryMode === 'results' && (
            <button
              onClick={resetToStudy}
              className="px-4 py-1 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
            >
              🔄 Study Again
            </button>
          )}
        </div>
      </div>

      {/* India Map Container */}
      <div className="relative w-full h-96 mx-auto perspective-1000">
        {/* Map Background */}
        <div 
          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-green-100 via-orange-100 to-blue-100 shadow-2xl transform-gpu border-4 border-white"
          style={{
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            transformStyle: 'preserve-3d',
            filter: 'drop-shadow(0 25px 50px rgba(0,0,0,0.3))'
          }}
        >
          {/* India Outline Border */}
          <div className="absolute inset-4 rounded-xl border-2 border-saffron-300 bg-gradient-to-br from-white to-green-50 opacity-80"></div>
          
          {/* States on the map */}
          <div className="absolute inset-0 overflow-hidden rounded-2xl">
            {indianStates.map((state) => (
              <div
                key={state.id}
                className={`absolute ${state.size} cursor-pointer country-3d`}
                style={{
                  left: state.x,
                  top: state.y,
                  transform: `translateX(-50%) translateY(-50%)`,
                  filter: 'drop-shadow(2px 2px 6px rgba(0,0,0,0.3))'
                }}
                onClick={() => handleStateClick(state.id)}
              >
                <div 
                  className={`w-full h-full bg-gradient-to-br ${getStateColor(state.id)} rounded-lg relative overflow-hidden border-2 border-white`}
                  style={{
                    clipPath: state.shape,
                    boxShadow: selectedState === state.id 
                      ? '0 0 20px rgba(236, 72, 153, 0.6), inset 0 2px 4px rgba(255,255,255,0.4)' 
                      : 'inset 0 2px 4px rgba(255,255,255,0.3)'
                  }}
                >
                  {/* State surface highlight */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent opacity-30"></div>
                  
                  {/* Pulsing effect for highlighted state */}
                  {(highlightState === state.id || selectedState === state.id) && (
                    <div className="absolute inset-0 bg-yellow-300 rounded-lg animate-pulse opacity-20"></div>
                  )}
                </div>
                
                {/* State name label - conditional based on memory mode */}
                <div className={`absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-800 bg-white bg-opacity-90 px-3 py-1 rounded-full shadow-md whitespace-nowrap transition-all duration-300 border border-gray-200 ${
                  (memoryMode === 'study' && showLabels) || memoryMode === 'results' 
                    ? 'opacity-100' 
                    : memoryMode === 'test' && testAnswers[state.id]
                      ? testAnswers[state.id].isCorrect
                        ? 'opacity-100 bg-green-100 border-green-300'
                        : 'opacity-100 bg-red-100 border-red-300'
                    : 'opacity-0 hover:opacity-60'
                }`}>
                  <span className="drop-shadow-sm">
                    {memoryMode === 'test' && testAnswers[state.id] ? (
                      testAnswers[state.id].isCorrect 
                        ? `✓ ${state.name}`
                        : `✗ ${testAnswers[state.id].guess} (${state.name})`
                    ) : (
                      state.name
                    )}
                    {state.type === 'UT' && <span className="text-xs opacity-60 ml-1">UT</span>}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Decorative elements */}
          <div className="absolute top-4 left-4 text-2xl opacity-60">🇮🇳</div>
          <div className="absolute bottom-4 right-4 text-xs text-gray-600 font-medium bg-white bg-opacity-80 px-2 py-1 rounded">
            भारत • India
          </div>
        </div>
      </div>

      {/* State Details Panel */}
      {showDetails && selectedState && (
        <div className="mt-6 bg-gradient-to-br from-orange-50 via-white to-green-50 rounded-xl p-6 shadow-xl border-2 border-orange-200 animate-fade-in">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-saffron-400 to-saffron-600 rounded-xl shadow-lg">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">
                  {indianStates.find(s => s.id === selectedState)?.name}
                </h3>
                <p className="text-sm text-gray-600">
                  Capital: {indianStates.find(s => s.id === selectedState)?.capital}
                </p>
              </div>
            </div>
            <button
              onClick={() => {setShowDetails(false); setSelectedState(null);}}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  Demographics
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Population:</span>
                    <span className="font-medium">{indianStates.find(s => s.id === selectedState)?.population}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Area:</span>
                    <span className="font-medium">{indianStates.find(s => s.id === selectedState)?.area}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Language:</span>
                    <span className="font-medium">{indianStates.find(s => s.id === selectedState)?.language}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Districts:</span>
                    <span className="font-medium">{indianStates.find(s => s.id === selectedState)?.districts}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4 text-green-500" />
                  State Information
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Governor:</span>
                    <span className="font-medium text-right max-w-32">{indianStates.find(s => s.id === selectedState)?.governor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Formed:</span>
                    <span className="font-medium">{indianStates.find(s => s.id === selectedState)?.formed}</span>
                  </div>
                  <div className="mt-3">
                    <span className="text-gray-600">Famous For:</span>
                    <p className="font-medium text-gray-800 mt-1">{indianStates.find(s => s.id === selectedState)?.famousFor}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-gradient-to-r from-orange-100 to-green-100 rounded-lg border border-orange-200">
            <p className="text-sm text-gray-700 text-center">
              🌟 Click on other states to explore more about incredible India! 🌟
            </p>
          </div>
        </div>
      )}

      {/* Memory Test Results */}
      {memoryMode === 'results' && (
        <div className="mt-8 bg-gradient-to-br from-blue-50 via-white to-green-50 rounded-xl p-6 shadow-xl border-2 border-blue-200">
          <div className="text-center mb-6">
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Memory Test Complete! 🎉</h3>
            <div className="text-lg text-gray-600 mb-4">
              Your Score: <span className="font-bold text-blue-600">{testScore}/{indianStates.length}</span> 
              <span className="ml-2">({Math.round((testScore / indianStates.length) * 100)}%)</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Correct Answers */}
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Correct Answers ({Object.values(testAnswers).filter(a => a.isCorrect).length})
              </h4>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {Object.entries(testAnswers)
                  .filter(([_, answer]) => answer.isCorrect)
                  .map(([stateId, answer]) => (
                    <div key={stateId} className="text-sm text-green-700 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      <span className="font-medium">{answer.correct}</span>
                    </div>
                  ))}
              </div>
            </div>
            
            {/* Incorrect Answers */}
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <h4 className="font-bold text-red-800 mb-3 flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                Incorrect Answers ({Object.values(testAnswers).filter(a => !a.isCorrect).length})
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {Object.entries(testAnswers)
                  .filter(([_, answer]) => !answer.isCorrect)
                  .map(([stateId, answer]) => (
                    <div key={stateId} className="text-sm">
                      <div className="text-red-700 flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                        <span>Your guess: <span className="font-medium">{answer.guess}</span></span>
                      </div>
                      <div className="text-green-700 ml-4 text-xs">
                        Correct: <span className="font-medium">{answer.correct}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
          
          {/* Performance Analysis */}
          <div className="bg-gradient-to-r from-orange-100 to-green-100 rounded-lg p-4 border border-orange-200">
            <h4 className="font-bold text-gray-800 mb-2">📊 Performance Analysis</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{testScore}</div>
                <div className="text-gray-600">States Correct</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{Math.round((testScore / indianStates.length) * 100)}%</div>
                <div className="text-gray-600">Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{formatTime(studyTime)}</div>
                <div className="text-gray-600">Study Time</div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-white rounded-lg">
              <div className="text-sm text-gray-700 text-center">
                {testScore === indianStates.length ? (
                  <span className="text-green-600 font-medium">🏆 Perfect Score! You've mastered all Indian states and territories!</span>
                ) : testScore >= indianStates.length * 0.8 ? (
                  <span className="text-blue-600 font-medium">🌟 Excellent! You know most of India's geography very well!</span>
                ) : testScore >= indianStates.length * 0.6 ? (
                  <span className="text-yellow-600 font-medium">👍 Good job! Keep studying to improve further!</span>
                ) : (
                  <span className="text-orange-600 font-medium">💪 Keep practicing! Spend more time studying the map to improve your score.</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              💡 <strong>Memory Tip:</strong> The more you practice recalling real-world information, the stronger your memory becomes!
            </p>
          </div>
        </div>
      )}

      {/* Control hints */}
      <div className="text-center mt-4 text-xs text-gray-500">
        {memoryMode === 'study' && '🗺️ Click on states to learn • Toggle labels to test yourself'}
        {memoryMode === 'test' && '🧠 Click on each state to guess its name • Use hints if needed'}
        {memoryMode === 'results' && '📊 Review your results above • Study again to improve!'}
      </div>
    </div>
  );
};

// 3D World Map Component
const WorldMap3D = ({ highlightCountry, onCountryClick, className = "" }) => {
  const [rotation, setRotation] = useState({ x: -10, y: 0 });
  const [isRotating, setIsRotating] = useState(true);

  useEffect(() => {
    if (isRotating) {
      const interval = setInterval(() => {
        setRotation(prev => ({ ...prev, y: (prev.y + 1) % 360 }));
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isRotating]);

  const worldMapCountries = [
    // North America
    { id: 'usa', name: 'USA', x: '20%', y: '30%', size: 'w-16 h-12' },
    { id: 'canada', name: 'Canada', x: '15%', y: '20%', size: 'w-20 h-8' },
    { id: 'mexico', name: 'Mexico', x: '18%', y: '45%', size: 'w-8 h-10' },
    
    // South America
    { id: 'brazil', name: 'Brazil', x: '30%', y: '60%', size: 'w-12 h-16' },
    { id: 'argentina', name: 'Argentina', x: '28%', y: '75%', size: 'w-6 h-12' },
    
    // Europe
    { id: 'russia', name: 'Russia', x: '60%', y: '25%', size: 'w-24 h-10' },
    { id: 'france', name: 'France', x: '48%', y: '35%', size: 'w-4 h-6' },
    { id: 'germany', name: 'Germany', x: '50%', y: '33%', size: 'w-4 h-5' },
    { id: 'uk', name: 'UK', x: '46%', y: '32%', size: 'w-3 h-4' },
    
    // Asia
    { id: 'china', name: 'China', x: '70%', y: '35%', size: 'w-14 h-12' },
    { id: 'india', name: 'India', x: '65%', y: '45%', size: 'w-8 h-10' },
    { id: 'japan', name: 'Japan', x: '80%', y: '38%', size: 'w-6 h-4' },
    
    // Africa
    { id: 'egypt', name: 'Egypt', x: '52%', y: '45%', size: 'w-6 h-8' },
    { id: 'southafrica', name: 'South Africa', x: '54%', y: '70%', size: 'w-6 h-8' },
    { id: 'nigeria', name: 'Nigeria', x: '48%', y: '52%', size: 'w-4 h-6' },
    
    // Oceania
    { id: 'australia', name: 'Australia', x: '75%', y: '70%', size: 'w-12 h-8' }
  ];

  const getCountryColor = (countryId) => {
    const country = countries.find(c => c.id === countryId);
    if (highlightCountry === countryId) {
      return 'from-yellow-400 to-yellow-600 ring-4 ring-yellow-300 animate-pulse';
    } else if (country) {
      return country.color;
    }
    return 'from-gray-400 to-gray-600';
  };

  return (
    <div className={`relative ${className}`}>
      {/* Globe Container with 3D perspective */}
      <div 
        className="relative w-full h-96 mx-auto perspective-1000 cursor-grab active:cursor-grabbing"
        style={{ 
          perspective: '1000px',
          transformStyle: 'preserve-3d'
        }}
        onMouseEnter={() => setIsRotating(false)}
        onMouseLeave={() => setIsRotating(true)}
      >
        {/* 3D Globe Background */}
        <div 
          className="absolute inset-0 rounded-full globe-glow transform-gpu"
          style={{
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            transformStyle: 'preserve-3d',
            background: `
              radial-gradient(circle at 30% 30%, rgba(135, 206, 250, 0.9) 0%, transparent 60%),
              radial-gradient(circle at 70% 70%, rgba(30, 64, 175, 0.8) 0%, transparent 50%),
              conic-gradient(from 0deg at 50% 50%, #1e40af 0deg, #3b82f6 72deg, #60a5fa 144deg, #93c5fd 216deg, #dbeafe 288deg, #1e40af 360deg)
            `,
            filter: 'drop-shadow(0 25px 50px rgba(0,0,0,0.4))'
          }}
        >
          {/* Ocean texture overlay */}
          <div className="absolute inset-0 rounded-full opacity-20 bg-gradient-to-br from-transparent via-white to-transparent"></div>
          
          {/* Countries on the globe */}
          <div className="absolute inset-0 rounded-full overflow-hidden">
            {worldMapCountries.map((mapCountry) => (
              <div
                key={mapCountry.id}
                className={`absolute ${mapCountry.size} rounded country-3d cursor-pointer`}
                style={{
                  left: mapCountry.x,
                  top: mapCountry.y,
                  transform: `translateX(-50%) translateY(-50%) rotateY(${rotation.y * 0.2}deg)`,
                  filter: 'drop-shadow(3px 3px 8px rgba(0,0,0,0.4))'
                }}
                onClick={() => onCountryClick?.(mapCountry.id)}
              >
                <div 
                  className={`w-full h-full bg-gradient-to-br ${getCountryColor(mapCountry.id)} rounded-md relative overflow-hidden`}
                  style={{
                    clipPath: countries.find(c => c.id === mapCountry.id)?.shape || 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
                    boxShadow: highlightCountry === mapCountry.id 
                      ? '0 0 20px rgba(255, 235, 59, 0.8), inset 0 2px 4px rgba(255,255,255,0.3)' 
                      : 'inset 0 2px 4px rgba(255,255,255,0.2)'
                  }}
                >
                  {/* Country surface highlight */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent opacity-20"></div>
                  
                  {/* Pulsing effect for highlighted country */}
                  {highlightCountry === mapCountry.id && (
                    <div className="absolute inset-0 bg-yellow-300 rounded-md animate-pulse opacity-30"></div>
                  )}
                </div>
                
                {/* Enhanced Country label */}
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs font-medium text-white bg-gradient-to-r from-gray-800 to-gray-900 px-3 py-1 rounded-full shadow-lg whitespace-nowrap opacity-0 hover:opacity-100 transition-all duration-300 backdrop-blur-sm border border-gray-600">
                  <span className="drop-shadow-sm">{mapCountry.name}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Latitude/Longitude grid lines */}
          <div className="absolute inset-0 rounded-full">
            {/* Latitude lines */}
            {Array.from({length: 5}).map((_, i) => (
              <div
                key={`lat-${i}`}
                className="absolute left-0 right-0 border-t border-white opacity-10"
                style={{ top: `${20 + i * 15}%` }}
              ></div>
            ))}
            {/* Longitude lines */}
            {Array.from({length: 6}).map((_, i) => (
              <div
                key={`lng-${i}`}
                className="absolute top-0 bottom-0 border-l border-white opacity-10 rounded-full"
                style={{ left: `${15 + i * 14}%` }}
              ></div>
            ))}
          </div>

          {/* Multi-layered atmospheric glow */}
          <div className="absolute -inset-4 rounded-full bg-gradient-to-br from-blue-300 via-cyan-300 to-blue-400 opacity-15 blur-lg"></div>
          <div className="absolute -inset-2 rounded-full bg-gradient-to-br from-blue-400 to-transparent opacity-25 blur-md"></div>
          
          {/* Subtle sparkle effects */}
          <div className="absolute inset-0 rounded-full overflow-hidden">
            {Array.from({length: 12}).map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full opacity-60 animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              ></div>
            ))}
          </div>
        </div>

        {/* Enhanced floating info panel */}
        {highlightCountry && (
          <div className="absolute top-4 right-4 bg-gradient-to-br from-white via-blue-50 to-indigo-50 bg-opacity-95 backdrop-blur-md rounded-xl p-4 shadow-2xl animate-fade-in border border-white border-opacity-30">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg">
                <Globe className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-bold text-gray-800">
                  {countries.find(c => c.id === highlightCountry)?.name || 'Unknown'}
                </div>
                <div className="text-xs text-gray-600">
                  {countries.find(c => c.id === highlightCountry)?.flag} {countries.find(c => c.id === highlightCountry)?.continent}
                </div>
              </div>
            </div>
            <div className="mt-2 text-xs text-blue-600 font-medium">
              Click to learn more!
            </div>
          </div>
        )}

        {/* Orbital rings for extra visual appeal */}
        <div className="absolute inset-0 rounded-full border border-blue-300 opacity-20 animate-pulse"></div>
        <div 
          className="absolute inset-2 rounded-full border border-cyan-300 opacity-15"
          style={{
            transform: `rotateX(75deg) rotateY(${rotation.y * 0.5}deg)`,
            transformStyle: 'preserve-3d'
          }}
        ></div>
      </div>

      {/* Enhanced control hints */}
      <div className="text-center mt-6 space-y-2">
        <div className="text-xs text-gray-500 flex items-center justify-center gap-4">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
            Hover to pause rotation
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Click countries to explore
          </span>
        </div>
        {highlightCountry && (
          <div className="text-xs text-yellow-600 font-medium animate-bounce">
            ⭐ This country is highlighted for the question!
          </div>
        )}
      </div>
    </div>
  );
};

const MapIdentifier = ({ onBack }) => {
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'result', 'info'
  const [currentCountry, setCurrentCountry] = useState(null);
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const [show3DMap, setShow3DMap] = useState(true);
  const [showIndiaMap, setShowIndiaMap] = useState(false);
  const maxRounds = 8;

  const startGame = () => {
    // Pick a random country
    const randomCountry = countries[Math.floor(Math.random() * countries.length)];
    
    // Create 4 options including the correct one
    const wrongOptions = countries.filter(c => c.id !== randomCountry.id);
    const shuffledWrong = wrongOptions.sort(() => Math.random() - 0.5).slice(0, 3);
    const allOptions = [...shuffledWrong, randomCountry].sort(() => Math.random() - 0.5);
    
    setCurrentCountry(randomCountry);
    setOptions(allOptions);
    setGameState('playing');
    setTimeLeft(15);
    setIsCorrect(null);
    setShowInfo(false);
  };

  const handleAnswer = (selectedCountry) => {
    const correct = selectedCountry.id === currentCountry.id;
    setIsCorrect(correct);
    if (correct) {
      setScore(score + 10);
    }
    setGameState('result');
    
    setTimeout(() => {
      if (round < maxRounds) {
        setRound(round + 1);
        startGame();
      } else {
        setGameState('menu');
        setRound(1);
      }
    }, 3000);
  };

  const resetGame = () => {
    setGameState('menu');
    setScore(0);
    setRound(1);
    setTimeLeft(15);
    setIsCorrect(null);
    setShowInfo(false);
  };

  const showCountryInfo = () => {
    setShowInfo(true);
  };

  // Timer countdown
  useEffect(() => {
    let timer;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (gameState === 'playing' && timeLeft === 0) {
      setIsCorrect(false);
      setGameState('result');
      setTimeout(() => {
        if (round < maxRounds) {
          setRound(round + 1);
          startGame();
        } else {
          setGameState('menu');
          setRound(1);
        }
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [gameState, timeLeft, round, maxRounds]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Custom CSS for 3D effects */}
      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-gpu {
          transform: translate3d(0, 0, 0);
        }
        @keyframes rotate {
          from { transform: rotateY(0deg); }
          to { transform: rotateY(360deg); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .globe-glow {
          box-shadow: 
            0 0 50px rgba(59, 130, 246, 0.3),
            inset 0 0 50px rgba(59, 130, 246, 0.1),
            0 20px 40px rgba(0, 0, 0, 0.2);
        }
        .country-3d {
          transform-style: preserve-3d;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .country-3d:hover {
          transform: translateZ(10px) scale(1.05);
        }
        .border-saffron-300 {
          border-color: #f59e0b;
        }
        .from-saffron-400 {
          --tw-gradient-from: #f59e0b;
        }
        .to-saffron-600 {
          --tw-gradient-to: #d97706;
        }
      `}</style>
      
      <div className="flex items-center gap-3 mb-6">
        {onBack && (
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Map Identifier</h2>
          <p className="text-gray-600">Test your geography knowledge with our 3D world map!</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8">
        {gameState === 'menu' && (
          <div className="text-center space-y-6">
            <div className="mb-6">
              <Globe className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Geography Challenge</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Identify countries on the 3D world map and learn fascinating facts about each nation!
              </p>
            </div>
            
            {/* Interactive Maps */}
            <div className="mb-8">
              <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
                <button
                  onClick={() => {setShow3DMap(true); setShowIndiaMap(false);}}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    show3DMap && !showIndiaMap
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  🌍 3D World Map
                </button>
                <button
                  onClick={() => {setShowIndiaMap(true); setShow3DMap(false);}}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    showIndiaMap && !show3DMap
                      ? 'bg-orange-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  🇮🇳 India States Map
                </button>
                <button
                  onClick={() => {setShow3DMap(false); setShowIndiaMap(false);}}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    !show3DMap && !showIndiaMap
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  🗺️ Country Silhouettes
                </button>
              </div>
              
              {show3DMap && !showIndiaMap ? (
                <WorldMap3D 
                  className="max-w-2xl mx-auto"
                  onCountryClick={(countryId) => {
                    const country = countries.find(c => c.id === countryId);
                    if (country) {
                      console.log('Clicked country:', country.name);
                    }
                  }}
                />
              ) : showIndiaMap && !show3DMap ? (
                <IndiaMap3D 
                  className="max-w-3xl mx-auto"
                  onStateClick={(state) => {
                    console.log('Clicked state:', state.name);
                  }}
                />
              ) : (
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {countries.slice(0, 4).map((country) => (
                    <div key={country.id} className="text-center">
                      <div className="w-16 h-16 mx-auto mb-2 relative">
                        <div 
                          className={`w-full h-full bg-gradient-to-br ${country.color} rounded-lg transform hover:scale-110 transition-transform duration-300`}
                          style={{ 
                            clipPath: country.shape,
                            filter: 'drop-shadow(3px 3px 6px rgba(0,0,0,0.2))'
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-600">{country.name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {score > 0 && (
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <div className="text-lg font-bold text-blue-600">Final Score: {score}/{maxRounds * 10}</div>
                <div className="text-sm text-gray-600">
                  {score >= (maxRounds * 8) ? '🌍 Geography Expert!' : score >= (maxRounds * 6) ? '🗺️ Great Explorer!' : '🧭 Keep Exploring!'}
                </div>
              </div>
            )}
            
            <button
              onClick={startGame}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <Play className="w-5 h-5" />
              {score > 0 ? 'Play Again' : 'Start Geography Quiz'}
            </button>
          </div>
        )}

        {gameState === 'playing' && currentCountry && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="text-lg font-semibold">Round {round}/{maxRounds}</div>
              <div className="flex items-center gap-2 text-orange-600">
                <Clock className="w-5 h-5" />
                <span className="text-xl font-bold">{timeLeft}s</span>
              </div>
              <div className="text-lg font-semibold">Score: {score}</div>
            </div>

            <div className="text-center space-y-6">
              <div className="text-xl font-bold text-gray-800">
                Which country is this?
              </div>
              
              {/* Toggle between different map views */}
              <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
                <button
                  onClick={() => {setShow3DMap(true); setShowIndiaMap(false);}}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    show3DMap && !showIndiaMap
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  🌍 3D World Map
                </button>
                <button
                  onClick={() => {setShowIndiaMap(true); setShow3DMap(false);}}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    showIndiaMap && !show3DMap
                      ? 'bg-orange-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  🇮🇳 India Map
                </button>
                <button
                  onClick={() => {setShow3DMap(false); setShowIndiaMap(false);}}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    !show3DMap && !showIndiaMap
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  🗺️ Silhouette
                </button>
              </div>
              
              {show3DMap && !showIndiaMap ? (
                <div className="max-w-lg mx-auto">
                  <WorldMap3D 
                    highlightCountry={currentCountry.id}
                    className="transform scale-90"
                  />
                  <div className="mt-2 text-sm text-gray-600">
                    The highlighted country is your answer!
                  </div>
                </div>
              ) : showIndiaMap && !show3DMap ? (
                <div className="max-w-2xl mx-auto">
                  <IndiaMap3D 
                    highlightState={currentCountry.id === 'india' ? 'maharashtra' : null}
                    className="transform scale-95"
                  />
                  <div className="mt-2 text-sm text-gray-600">
                    {currentCountry.id === 'india' 
                      ? "This shows India's detailed state map for reference!" 
                      : "India map shown for geographical context"}
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-8 max-w-md mx-auto">
                  <div 
                    className={`w-48 h-32 mx-auto bg-gradient-to-br ${currentCountry.color} shadow-lg transform hover:scale-105 transition-transform duration-300`}
                    style={{ 
                      clipPath: currentCountry.shape,
                      filter: 'drop-shadow(4px 4px 8px rgba(0,0,0,0.2))'
                    }}
                  ></div>
                  <div className="mt-4 text-sm text-gray-600">
                    Difficulty: <span className={`font-medium ${
                      currentCountry.difficulty === 'Easy' ? 'text-green-600' :
                      currentCountry.difficulty === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                    }`}>{currentCountry.difficulty}</span>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                {options.map((country) => (
                  <button
                    key={country.id}
                    onClick={() => handleAnswer(country)}
                    className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-all border-2 border-transparent hover:border-blue-400 text-center group"
                  >
                    <div className="flex items-center gap-2 justify-center mb-2">
                      <span className="text-lg">{country.flag}</span>
                      <div className="text-lg font-semibold text-gray-800 group-hover:text-blue-600">
                        {country.name}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">{country.continent}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {gameState === 'result' && currentCountry && (
          <div className="text-center space-y-6">
            {isCorrect ? (
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            ) : (
              <XCircle className="w-16 h-16 text-red-500 mx-auto" />
            )}
            
            <div className="text-2xl font-bold">
              {isCorrect ? 'Correct! +10 points' : 'Time\'s up or wrong answer!'}
            </div>
            
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 max-w-2xl mx-auto">
              <div className="text-lg font-semibold mb-4 flex items-center justify-center gap-2">
                <span className="text-2xl">{currentCountry.flag}</span>
                <span>{currentCountry.name}</span>
                <MapPin className="w-5 h-5 text-gray-500" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">Capital:</span> {currentCountry.capital}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-green-500" />
                    <span className="font-medium">Population:</span> {currentCountry.population}
                  </div>
                  <div className="flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-purple-500" />
                    <span className="font-medium">Area:</span> {currentCountry.area}
                  </div>
                </div>
                <div className="space-y-2">
                  <div><span className="font-medium">Currency:</span> {currentCountry.currency}</div>
                  <div><span className="font-medium">Languages:</span> {currentCountry.languages.join(', ')}</div>
                  <div><span className="font-medium">Continent:</span> {currentCountry.continent}</div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="font-medium mb-2">🌟 Did you know?</div>
                <div className="space-y-1 text-sm text-gray-700">
                  {currentCountry.facts.map((fact, index) => (
                    <div key={index}>• {fact}</div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="text-gray-600">
              {round < maxRounds ? `Round ${round + 1} starting...` : 'Geography quiz completed!'}
            </div>
          </div>
        )}

        {gameState !== 'result' && gameState !== 'menu' && (
          <div className="text-center mt-6">
            <button
              onClick={resetGame}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Game
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapIdentifier;