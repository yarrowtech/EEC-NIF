import React, { useState, useEffect } from 'react';
import {
  Star,
  RotateCcw,
  Shuffle,
  CheckCircle,
  X,
  ArrowLeft,
  ArrowRight,
  Brain,
  Loader2,
  Zap,
  Eye,
  EyeOff
} from 'lucide-react';

const FlashcardGenerator = ({ subject }) => {
  const [selectedTopic, setSelectedTopic] = useState('');
  const [flashcards, setFlashcards] = useState([]);
  const [currentCard, setCurrentCard] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [studiedCards, setStudiedCards] = useState(new Set());
  const [difficulty, setDifficulty] = useState('medium');

  const generateFlashcards = async () => {
    if (!selectedTopic) return;

    setLoading(true);
    try {
      const response = await fetch('/api/student-ai-learning/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: selectedTopic,
          subject: subject.name,
          contentType: 'flashcards',
          difficulty
        })
      });

      if (response.ok) {
        const data = await response.json();
        setFlashcards(data.content);
      } else {
        setFlashcards(mockFlashcards[selectedTopic] || generateDefaultFlashcards(selectedTopic));
      }
      
      setCurrentCard(0);
      setShowAnswer(false);
      setStudiedCards(new Set());
      
      // Log activity
      logActivity('flashcards');
    } catch (error) {
      console.error('Error generating flashcards:', error);
      setFlashcards(mockFlashcards[selectedTopic] || generateDefaultFlashcards(selectedTopic));
    } finally {
      setLoading(false);
    }
  };

  const logActivity = async (activityType) => {
    try {
      await fetch('/api/student-ai-learning/activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: 'mock-student-id',
          topic: selectedTopic,
          subject: subject.name,
          activityType,
          timeSpent: Math.floor(Math.random() * 20) + 10,
          completed: studiedCards.size === flashcards.length
        })
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  const nextCard = () => {
    if (currentCard < flashcards.length - 1) {
      setCurrentCard(currentCard + 1);
      setShowAnswer(false);
    }
  };

  const prevCard = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1);
      setShowAnswer(false);
    }
  };

  const markAsStudied = () => {
    setStudiedCards(prev => new Set([...prev, currentCard]));
    if (currentCard < flashcards.length - 1) {
      setTimeout(nextCard, 300);
    }
  };

  const shuffleCards = () => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    setFlashcards(shuffled);
    setCurrentCard(0);
    setShowAnswer(false);
  };

  const resetSession = () => {
    setCurrentCard(0);
    setShowAnswer(false);
    setStudiedCards(new Set());
  };

  const generateDefaultFlashcards = (topic) => [
    {
      id: 1,
      front: `What is the main concept of ${topic}?`,
      back: `${topic} is a fundamental concept in ${subject.name} that involves key principles and applications.`
    },
    {
      id: 2,
      front: `How is ${topic} applied in real life?`,
      back: `${topic} has practical applications in various fields and everyday situations.`
    }
  ];

  const getProgressPercentage = () => {
    return flashcards.length > 0 ? Math.round((studiedCards.size / flashcards.length) * 100) : 0;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500 to-orange-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center">
                <Star className="w-7 h-7 mr-3" />
                AI Flashcards
              </h2>
              <p className="text-yellow-100 mt-1">
                Interactive flashcards for effective memorization
              </p>
            </div>
            <div className="bg-yellow-400 p-3 rounded-xl">
              <Brain className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Topic for Flashcards
              </label>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              >
                <option value="">Choose a topic...</option>
                {subject.topics.map((topic, index) => (
                  <option key={index} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={generateFlashcards}
                disabled={!selectedTopic || loading}
                className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-lg font-medium hover:from-yellow-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    <span>Generate</span>
                  </>
                )}
              </button>

              {flashcards.length > 0 && (
                <>
                  <button
                    onClick={shuffleCards}
                    className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    title="Shuffle cards"
                  >
                    <Shuffle className="w-5 h-5" />
                  </button>
                  <button
                    onClick={resetSession}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Reset session"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Progress */}
          {flashcards.length > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progress</span>
                <span>{studiedCards.size} of {flashcards.length} cards studied</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-yellow-500 to-orange-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getProgressPercentage()}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Flashcard Display */}
        {flashcards.length > 0 ? (
          <div className="p-8">
            <div className="max-w-2xl mx-auto">
              {/* Card Counter */}
              <div className="text-center mb-6">
                <span className="inline-block px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
                  Card {currentCard + 1} of {flashcards.length}
                </span>
              </div>

              {/* Flashcard */}
              <div 
                className="relative w-full h-80 cursor-pointer"
                onClick={() => setShowAnswer(!showAnswer)}
              >
                <div className={`
                  absolute inset-0 w-full h-full rounded-xl shadow-lg transform transition-all duration-500 preserve-3d
                  ${showAnswer ? 'rotate-y-180' : ''}
                `}>
                  {/* Front of card */}
                  <div className="absolute inset-0 w-full h-full backface-hidden rounded-xl bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 flex items-center justify-center p-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Eye className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">Question</h3>
                      <p className="text-gray-700 leading-relaxed">
                        {flashcards[currentCard]?.front}
                      </p>
                      <p className="text-sm text-gray-500 mt-4">Click to reveal answer</p>
                    </div>
                  </div>

                  {/* Back of card */}
                  <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-xl bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200 flex items-center justify-center p-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <EyeOff className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">Answer</h3>
                      <p className="text-gray-700 leading-relaxed">
                        {flashcards[currentCard]?.back}
                      </p>
                      {studiedCards.has(currentCard) && (
                        <div className="mt-3">
                          <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Studied
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              {showAnswer && (
                <div className="flex justify-center space-x-4 mt-6">
                  <button
                    onClick={markAsStudied}
                    className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Got it!</span>
                  </button>
                  <button
                    onClick={nextCard}
                    disabled={currentCard === flashcards.length - 1}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between items-center mt-8">
                <button
                  onClick={prevCard}
                  disabled={currentCard === 0}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="text-sm text-gray-500">
                  {studiedCards.size === flashcards.length && (
                    <span className="text-green-600 font-medium">
                      🎉 All cards completed!
                    </span>
                  )}
                </div>

                <button
                  onClick={nextCard}
                  disabled={currentCard === flashcards.length - 1}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Ready to Study</h3>
            <p className="text-gray-600 mb-4">
              Select a topic and generate AI-powered flashcards for effective learning.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 max-w-md mx-auto">
              <h4 className="font-medium text-gray-800 mb-2">Flashcard Features:</h4>
              <ul className="text-sm text-gray-600 space-y-1 text-left">
                <li>⚡ AI-generated questions</li>
                <li>🔄 Interactive flip cards</li>
                <li>🎯 Progress tracking</li>
                <li>🔀 Shuffle & repeat options</li>
                <li>✅ Study completion tracking</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
};

// Mock flashcards data with extensive content
const mockFlashcards = {
  'Algebra': [
    {
      id: 1,
      front: "What is a variable in algebra?",
      back: "A variable is a letter or symbol (like x, y, z) that represents an unknown number or value that can change. Variables allow us to write general mathematical relationships."
    },
    {
      id: 2,
      front: "What is the difference between an equation and an expression?",
      back: "An equation has an equals sign (=) and states that two things are equal (e.g., 2x + 3 = 7), while an expression is a mathematical phrase without an equals sign (e.g., 2x + 3)."
    },
    {
      id: 3,
      front: "How do you solve for x in the equation 2x + 5 = 15?",
      back: "Step 1: Subtract 5 from both sides: 2x = 10\nStep 2: Divide both sides by 2: x = 5\nAlways check: 2(5) + 5 = 15 ✓"
    },
    {
      id: 4,
      front: "What is the distributive property?",
      back: "The distributive property states that a(b + c) = ab + ac. For example: 3(x + 4) = 3x + 12. You multiply the number outside the parentheses by each term inside."
    },
    {
      id: 5,
      front: "What are like terms?",
      back: "Like terms have the same variables raised to the same powers. Examples: 3x and 5x are like terms, but 3x² and 5x are not. You can only combine like terms."
    },
    {
      id: 6,
      front: "How do you solve a system of equations by substitution?",
      back: "1. Solve one equation for one variable\n2. Substitute that expression into the other equation\n3. Solve for the remaining variable\n4. Substitute back to find the other variable"
    }
  ],
  'Geometry': [
    {
      id: 1,
      front: "What is the Pythagorean Theorem?",
      back: "In a right triangle, a² + b² = c², where c is the hypotenuse (longest side) and a and b are the other two sides. This only works for right triangles!"
    },
    {
      id: 2,
      front: "What is the sum of interior angles in any triangle?",
      back: "The sum of interior angles in any triangle is always 180°. This is true for all triangles: equilateral, isosceles, scalene, right, acute, or obtuse."
    },
    {
      id: 3,
      front: "How do you find the area of a circle?",
      back: "Area = πr², where r is the radius. Remember: radius is half the diameter. If diameter = 6, then radius = 3, so Area = π(3)² = 9π"
    },
    {
      id: 4,
      front: "What makes two triangles congruent?",
      back: "Triangles are congruent if: SSS (all sides equal), SAS (two sides and included angle), ASA (two angles and included side), AAS (two angles and non-included side), or HL (hypotenuse-leg for right triangles)."
    },
    {
      id: 5,
      front: "What is the difference between area and perimeter?",
      back: "Perimeter is the distance around the outside of a shape (measured in units like cm, m). Area is the space inside a shape (measured in square units like cm², m²)."
    }
  ],
  'Trigonometry': [
    {
      id: 1,
      front: "What are the three basic trigonometric ratios?",
      back: "SOH-CAH-TOA:\nSin = Opposite/Hypotenuse\nCos = Adjacent/Hypotenuse\nTan = Opposite/Adjacent\n(In a right triangle)"
    },
    {
      id: 2,
      front: "What is the unit circle?",
      back: "The unit circle is a circle with radius 1 centered at the origin. It's used to define trig functions for all angles. Key angles: 0°, 30°, 45°, 60°, 90°."
    },
    {
      id: 3,
      front: "What is the Pythagorean identity in trigonometry?",
      back: "sin²θ + cos²θ = 1\nThis is true for any angle θ and comes from the Pythagorean theorem applied to the unit circle."
    },
    {
      id: 4,
      front: "What are the values of sin, cos, and tan at 30°?",
      back: "At 30°:\nsin(30°) = 1/2\ncos(30°) = √3/2\ntan(30°) = 1/√3 = √3/3"
    }
  ],
  'Mechanics': [
    {
      id: 1,
      front: "What is Newton's First Law of Motion?",
      back: "An object at rest stays at rest, and an object in motion stays in motion at constant velocity, unless acted upon by a net external force. Also called the Law of Inertia."
    },
    {
      id: 2,
      front: "What is the equation for kinetic energy?",
      back: "KE = ½mv², where m is mass (kg) and v is velocity (m/s). Kinetic energy is the energy of motion and is always positive."
    },
    {
      id: 3,
      front: "What is acceleration?",
      back: "Acceleration is the rate of change of velocity. a = (v_final - v_initial)/time = Δv/Δt. Units are m/s². Can be positive (speeding up) or negative (slowing down)."
    },
    {
      id: 4,
      front: "What is the difference between mass and weight?",
      back: "Mass is the amount of matter in an object (kg) - constant everywhere. Weight is the gravitational force on an object (N) - changes with gravity. Weight = mg."
    }
  ],
  'Thermodynamics': [
    {
      id: 1,
      front: "What is the First Law of Thermodynamics?",
      back: "Energy cannot be created or destroyed, only converted from one form to another. ΔU = Q - W (change in internal energy = heat added - work done by system)."
    },
    {
      id: 2,
      front: "What is the ideal gas law?",
      back: "PV = nRT, where P = pressure, V = volume, n = moles of gas, R = gas constant, T = temperature (in Kelvin). Describes behavior of ideal gases."
    },
    {
      id: 3,
      front: "What is specific heat capacity?",
      back: "The amount of heat energy needed to raise the temperature of 1 kg of a substance by 1°C. Q = mcΔT, where c is specific heat capacity."
    }
  ],
  'Atomic Structure': [
    {
      id: 1,
      front: "What are the three main subatomic particles?",
      back: "Protons (positive charge, in nucleus), Neutrons (no charge, in nucleus), Electrons (negative charge, in electron shells around nucleus)."
    },
    {
      id: 2,
      front: "What is atomic number?",
      back: "The number of protons in an atom's nucleus. This defines what element it is. For example, all carbon atoms have 6 protons, so carbon's atomic number is 6."
    },
    {
      id: 3,
      front: "What is an isotope?",
      back: "Atoms of the same element with different numbers of neutrons. They have the same atomic number but different mass numbers. Example: Carbon-12 and Carbon-14."
    },
    {
      id: 4,
      front: "What is electron configuration?",
      back: "The arrangement of electrons in an atom's shells and subshells. Follows the Aufbau principle (fill lowest energy first), Pauli exclusion, and Hund's rule."
    }
  ],
  'Chemical Bonding': [
    {
      id: 1,
      front: "What is an ionic bond?",
      back: "A bond formed when electrons are transferred from a metal to a non-metal, creating oppositely charged ions that attract each other. Example: Na⁺Cl⁻ in table salt."
    },
    {
      id: 2,
      front: "What is a covalent bond?",
      back: "A bond formed when two non-metal atoms share electrons. Can be single (2e⁻), double (4e⁻), or triple (6e⁻) bonds. Example: H-H in hydrogen gas."
    },
    {
      id: 3,
      front: "What is electronegativity?",
      back: "The ability of an atom to attract electrons in a bond. Fluorine is most electronegative (4.0). Difference in electronegativity determines bond type: <0.5 = nonpolar covalent, 0.5-1.7 = polar covalent, >1.7 = ionic."
    },
    {
      id: 4,
      front: "What is VSEPR theory?",
      back: "Valence Shell Electron Pair Repulsion theory. Electron pairs around a central atom repel each other and arrange to minimize repulsion, determining molecular geometry."
    }
  ],
  'Cell Biology': [
    {
      id: 1,
      front: "What is the difference between prokaryotic and eukaryotic cells?",
      back: "Prokaryotic: No nucleus, DNA free in cytoplasm (bacteria, archaea). Eukaryotic: Has nucleus, DNA in nucleus, membrane-bound organelles (plants, animals, fungi, protists)."
    },
    {
      id: 2,
      front: "What is the function of mitochondria?",
      back: "The 'powerhouse' of the cell - produces ATP through cellular respiration. Has double membrane, contains its own DNA, found in eukaryotic cells."
    },
    {
      id: 3,
      front: "What is the cell membrane made of?",
      back: "Phospholipid bilayer with embedded proteins. Selectively permeable - controls what enters and leaves the cell. Has hydrophilic heads and hydrophobic tails."
    },
    {
      id: 4,
      front: "What is the difference between mitosis and meiosis?",
      back: "Mitosis: Produces 2 identical diploid cells for growth/repair. Meiosis: Produces 4 genetically different haploid gametes for reproduction."
    }
  ],
  'Photosynthesis': [
    {
      id: 1,
      front: "What is the overall equation for photosynthesis?",
      back: "6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂ + ATP\n(Carbon dioxide + water + light → glucose + oxygen + energy)"
    },
    {
      id: 2,
      front: "Where do the light reactions occur?",
      back: "In the thylakoid membranes of chloroplasts. Here, light energy is captured by chlorophyll and converted to chemical energy (ATP and NADPH)."
    },
    {
      id: 3,
      front: "What happens in the Calvin cycle?",
      back: "Takes place in the stroma. Uses ATP and NADPH from light reactions to convert CO₂ into glucose through carbon fixation. Also called the dark reactions."
    },
    {
      id: 4,
      front: "Why is photosynthesis important?",
      back: "Produces oxygen for breathing, glucose for food, removes CO₂ from atmosphere, forms the base of most food chains, and converts light energy to chemical energy."
    }
  ],
  'Genetics': [
    {
      id: 1,
      front: "What is DNA?",
      back: "Deoxyribonucleic acid - the hereditary material in living organisms. Double helix structure with four bases: A, T, G, C. A pairs with T, G pairs with C."
    },
    {
      id: 2,
      front: "What is the central dogma of molecular biology?",
      back: "DNA → RNA → Protein. Information flows from DNA (genes) to RNA (transcription) to proteins (translation). This is how genes control traits."
    },
    {
      id: 3,
      front: "What is the difference between genotype and phenotype?",
      back: "Genotype: The genetic makeup (actual genes/alleles). Phenotype: The observable characteristics (what you see). Example: Bb is genotype, brown eyes is phenotype."
    },
    {
      id: 4,
      front: "What is a mutation?",
      back: "A change in the DNA sequence. Can be beneficial, harmful, or neutral. Types include point mutations, insertions, deletions, and chromosomal changes."
    }
  ],
  'Poetry Analysis': [
    {
      id: 1,
      front: "What is a metaphor?",
      back: "A direct comparison between two unlike things without using 'like' or 'as'. Example: 'Life is a journey' - comparing life to a journey to show life's progression and challenges."
    },
    {
      id: 2,
      front: "What is the difference between a simile and a metaphor?",
      back: "A simile uses 'like' or 'as' to compare (e.g., 'brave as a lion'), while a metaphor makes a direct comparison without these words (e.g., 'he is a lion in battle')."
    },
    {
      id: 3,
      front: "What is iambic pentameter?",
      back: "A rhythmic pattern with 5 iambs per line (10 syllables total), where each iamb has an unstressed syllable followed by a stressed one. Common in Shakespeare's sonnets."
    },
    {
      id: 4,
      front: "What makes a sonnet?",
      back: "A 14-line poem with a specific rhyme scheme. Shakespearean sonnets follow ABAB CDCD EFEF GG pattern, while Petrarchan sonnets use ABBAABBA CDECDE or similar."
    }
  ],
  'World War I': [
    {
      id: 1,
      front: "What were the main causes of World War I?",
      back: "MAIN causes: Militarism (arms race), Alliances (entangling agreements), Imperialism (competition for colonies), Nationalism (ethnic tensions). The immediate trigger was Archduke Franz Ferdinand's assassination."
    },
    {
      id: 2,
      front: "What was trench warfare?",
      back: "A type of combat where opposing armies fought from networks of trenches. Characterized by stalemate, terrible conditions, high casualties for little territorial gain. Dominated the Western Front."
    },
    {
      id: 3,
      front: "What was the Treaty of Versailles?",
      back: "The 1919 peace treaty ending WWI. Imposed harsh terms on Germany: war guilt clause, massive reparations, military restrictions, territorial losses. Created resentment that contributed to WWII."
    },
    {
      id: 4,
      front: "How did WWI end?",
      back: "Germany signed an armistice on November 11, 1918, at 11 AM. This ended fighting, followed by peace negotiations. The war officially ended with various treaties, primarily the Treaty of Versailles in 1919."
    }
  ],
  'Physical Geography': [
    {
      id: 1,
      front: "What is plate tectonics?",
      back: "The theory that Earth's outer shell consists of large moving plates. These plates interact at boundaries, causing earthquakes, volcanoes, and mountain formation. Explains continental drift and seafloor spreading."
    },
    {
      id: 2,
      front: "What are the three main types of rocks?",
      back: "1) Igneous (formed from cooled magma/lava), 2) Sedimentary (formed from compressed sediments), 3) Metamorphic (existing rocks changed by heat/pressure). They cycle through the rock cycle."
    },
    {
      id: 3,
      front: "What causes different climate zones?",
      back: "Mainly latitude (distance from equator), which affects sun angle and solar energy received. Also influenced by altitude, ocean currents, distance from water bodies, and topography."
    },
    {
      id: 4,
      front: "What is erosion vs. weathering?",
      back: "Weathering is the breakdown of rocks in place (chemical or physical). Erosion is the transport of weathered material by wind, water, ice, or gravity. Both shape Earth's surface over time."
    }
  ],
  'Supply and Demand': [
    {
      id: 1,
      front: "What is the law of demand?",
      back: "As price increases, quantity demanded decreases (and vice versa), all else being equal. This creates a downward-sloping demand curve, reflecting consumer behavior and purchasing power."
    },
    {
      id: 2,
      front: "What is the law of supply?",
      back: "As price increases, quantity supplied increases (and vice versa), all else being equal. This creates an upward-sloping supply curve, as higher prices incentivize more production."
    },
    {
      id: 3,
      front: "What is market equilibrium?",
      back: "The point where quantity demanded equals quantity supplied, determining market price and quantity. At equilibrium, there's no shortage or surplus - the market clears."
    },
    {
      id: 4,
      front: "What is price elasticity of demand?",
      back: "Measures how responsive quantity demanded is to price changes. Elastic demand (>1) means large quantity changes from small price changes. Inelastic demand (<1) means small quantity changes."
    }
  ],
  'Programming Basics': [
    {
      id: 1,
      front: "What is a variable?",
      back: "A named storage location that holds data. Variables can store different types of data (numbers, text, etc.) and their values can change during program execution. Example: age = 25"
    },
    {
      id: 2,
      front: "What is the difference between = and == in programming?",
      back: "= is assignment (assigns a value to a variable). == is comparison (checks if two values are equal). Example: x = 5 assigns 5 to x, while x == 5 checks if x equals 5."
    },
    {
      id: 3,
      front: "What is a loop?",
      back: "A programming construct that repeats a block of code. Common types: for loops (known number of iterations), while loops (condition-based), do-while loops (executes at least once)."
    },
    {
      id: 4,
      front: "What is debugging?",
      back: "The process of finding and fixing errors in code. Involves identifying bugs (logic errors, syntax errors, runtime errors), understanding their causes, and implementing corrections."
    }
  ],
  'Cognitive Psychology': [
    {
      id: 1,
      front: "What is working memory?",
      back: "A limited-capacity system for temporarily holding and processing information. Includes the central executive (control), phonological loop (verbal), and visuospatial sketchpad (visual). Capacity ~7±2 items."
    },
    {
      id: 2,
      front: "What is selective attention?",
      back: "The ability to focus on relevant information while filtering out irrelevant stimuli. Example: cocktail party effect - hearing your name in a crowded room despite focusing on a conversation."
    },
    {
      id: 3,
      front: "What are schemas in psychology?",
      back: "Mental frameworks that organize knowledge and guide information processing. Help interpret new experiences based on existing knowledge, but can also lead to biases and stereotypes."
    },
    {
      id: 4,
      front: "What is the difference between recognition and recall?",
      back: "Recognition: identifying previously learned information when presented (multiple choice). Recall: retrieving information from memory without cues (essay questions). Recognition is typically easier."
    }
  ]
};

export default FlashcardGenerator;