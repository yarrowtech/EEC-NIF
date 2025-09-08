import React, { useState, useEffect, useRef } from 'react';
import {
  Globe,
  Zap,
  Download,
  RefreshCw,
  Maximize2,
  Minimize2,
  Share2,
  Eye,
  EyeOff,
  Brain,
  Loader2,
  TreePine,
  Network
} from 'lucide-react';

const MindMapGenerator = ({ subject }) => {
  const [selectedTopic, setSelectedTopic] = useState('');
  const [mindMapData, setMindMapData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [fullscreen, setFullscreen] = useState(false);
  const canvasRef = useRef(null);

  const generateMindMap = async () => {
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
          contentType: 'mindmap',
          difficulty: 'medium'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMindMapData(data.content);
        setExpandedNodes(new Set([data.content.center]));
      } else {
        setMindMapData(mockMindMaps[selectedTopic] || generateDefaultMindMap(selectedTopic));
        setExpandedNodes(new Set([selectedTopic]));
      }

      // Log learning activity
      logActivity('mindmap');
    } catch (error) {
      console.error('Error generating mind map:', error);
      setMindMapData(mockMindMaps[selectedTopic] || generateDefaultMindMap(selectedTopic));
      setExpandedNodes(new Set([selectedTopic]));
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
          timeSpent: Math.floor(Math.random() * 15) + 5,
          completed: true
        })
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  const toggleNode = (nodeId) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const downloadMindMap = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement('a');
      link.download = `${selectedTopic}_mindmap.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const getNodeColors = (index) => {
    const colors = [
      'bg-blue-500 text-white',
      'bg-green-500 text-white',
      'bg-purple-500 text-white',
      'bg-orange-500 text-white',
      'bg-red-500 text-white',
      'bg-indigo-500 text-white',
      'bg-pink-500 text-white',
      'bg-yellow-500 text-white'
    ];
    return colors[index % colors.length];
  };

  const renderMindMapNode = (node, level = 0, parentIndex = 0) => {
    const isCenter = level === 0;
    const nodeId = `${node}-${level}-${parentIndex}`;
    const isExpanded = expandedNodes.has(nodeId);

    return (
      <div
        key={nodeId}
        className={`
          ${isCenter ? 'mind-map-center' : 'mind-map-branch'}
          ${isCenter ? 'text-xl font-bold' : 'text-sm'}
        `}
        style={{
          marginLeft: level > 0 ? `${level * 30}px` : '0',
          marginTop: level > 0 ? '8px' : '0'
        }}
      >
        <div
          className={`
            ${isCenter 
              ? 'px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
              : `px-4 py-2 ${getNodeColors(parentIndex)}`
            }
            rounded-xl shadow-lg cursor-pointer transform transition-all hover:scale-105
            flex items-center space-x-2
          `}
          onClick={() => toggleNode(nodeId)}
        >
          {!isCenter && (
            <div className="w-2 h-2 bg-white rounded-full"></div>
          )}
          <span>{typeof node === 'string' ? node : node.name}</span>
          {!isCenter && (
            <div className={`ml-2 ${isExpanded ? 'rotate-90' : ''} transition-transform`}>
              <TreePine className="w-3 h-3" />
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderInteractiveMindMap = () => {
    if (!mindMapData) return null;

    return (
      <div className="mind-map-container p-8">
        {/* Center Node */}
        <div className="flex flex-col items-center">
          <div className="mb-8">
            {renderMindMapNode(mindMapData.center, 0)}
          </div>
          
          {/* Branches */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl">
            {mindMapData.branches.map((branch, branchIndex) => (
              <div key={branchIndex} className="mind-map-branch-container">
                <div className="mb-4">
                  {renderMindMapNode(branch.name, 1, branchIndex)}
                </div>
                
                {/* Sub-nodes */}
                {expandedNodes.has(`${branch.name}-1-${branchIndex}`) && (
                  <div className="ml-6 space-y-2 animate-fadeIn">
                    {branch.children.map((child, childIndex) => (
                      <div
                        key={childIndex}
                        className={`
                          px-3 py-2 rounded-lg text-xs
                          ${getNodeColors(branchIndex).replace('500', '100').replace('text-white', 'text-gray-800')}
                          border-l-2 border-current transform transition-all hover:translate-x-1
                        `}
                      >
                        {child}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const generateDefaultMindMap = (topic) => ({
    center: topic,
    branches: [
      { name: 'Key Concepts', children: ['Concept 1', 'Concept 2', 'Concept 3'] },
      { name: 'Applications', children: ['Application 1', 'Application 2'] },
      { name: 'Examples', children: ['Example 1', 'Example 2'] }
    ]
  });

  return (
    <div className={`${fullscreen ? 'fixed inset-0 z-50 bg-white' : 'max-w-6xl mx-auto'}`}>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center">
                <Globe className="w-7 h-7 mr-3" />
                AI Mind Map Generator
              </h2>
              <p className="text-purple-100 mt-1">
                Visualize concepts and their connections
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setFullscreen(!fullscreen)}
                className="p-2 bg-purple-400 hover:bg-purple-300 rounded-lg transition-colors"
                title={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              >
                {fullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </button>
              <div className="bg-purple-400 p-3 rounded-xl">
                <Brain className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Topic for Mind Map
              </label>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                onClick={generateMindMap}
                disabled={!selectedTopic || loading}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all"
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

              {mindMapData && (
                <>
                  <button
                    onClick={downloadMindMap}
                    className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    title="Download mind map"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={generateMindMap}
                    className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Regenerate mind map"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mind Map Content */}
        <div className={`${fullscreen ? 'h-full overflow-auto' : 'min-h-96'}`}>
          {mindMapData ? (
            <div className="relative">
              {renderInteractiveMindMap()}
              
              {/* Legend */}
              <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 border border-gray-200">
                <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                  <Network className="w-4 h-4 mr-2" />
                  Mind Map Guide
                </h4>
                <div className="space-y-1 text-xs text-gray-600">
                  <p>• Click branches to expand/collapse</p>
                  <p>• Central topic connects to main concepts</p>
                  <p>• Colors represent different categories</p>
                  <p>• Use fullscreen for better viewing</p>
                </div>
              </div>

              {/* Stats */}
              <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 border border-gray-200">
                <h4 className="font-medium text-gray-800 mb-2">Map Statistics</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>Branches: {mindMapData.branches.length}</p>
                  <p>Total Nodes: {mindMapData.branches.reduce((acc, branch) => acc + branch.children.length, mindMapData.branches.length + 1)}</p>
                  <p>Expanded: {expandedNodes.size}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Create Your Mind Map</h3>
              <p className="text-gray-600 mb-4">
                Select a topic and generate an interactive mind map to visualize concepts and connections.
              </p>
              <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto">
                <h4 className="font-medium text-gray-800 mb-3">Mind Map Features:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Interactive nodes</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Color-coded branches</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Expandable sections</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Download support</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hidden canvas for download functionality */}
      <canvas ref={canvasRef} style={{ display: 'none' }} width={1200} height={800} />

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .mind-map-center {
          position: relative;
        }
        
        .mind-map-center::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 120%;
          height: 120%;
          border: 2px dashed rgba(59, 130, 246, 0.3);
          border-radius: 50%;
          z-index: -1;
        }
        
        .mind-map-branch-container {
          position: relative;
        }
        
        .mind-map-branch-container::before {
          content: '';
          position: absolute;
          top: 20px;
          left: -20px;
          width: 20px;
          height: 2px;
          background: linear-gradient(to right, rgba(147, 51, 234, 0.3), rgba(147, 51, 234, 0.1));
        }
      `}</style>
    </div>
  );
};

// Mock mind map data with expanded content
const mockMindMaps = {
  'Algebra': {
    center: 'Algebra',
    branches: [
      {
        name: 'Basic Operations',
        children: ['Addition (+)', 'Subtraction (-)', 'Multiplication (×)', 'Division (÷)', 'Order of Operations (PEMDAS)', 'Distributive Property']
      },
      {
        name: 'Variables & Expressions',
        children: ['Variables (x, y, z)', 'Constants', 'Coefficients', 'Terms', 'Like Terms', 'Combining Terms', 'Algebraic Expressions']
      },
      {
        name: 'Equations & Inequalities',
        children: ['Linear Equations', 'Quadratic Equations', 'System of Equations', 'Inequalities', 'Absolute Value', 'Rational Equations']
      },
      {
        name: 'Functions',
        children: ['Function Notation f(x)', 'Domain & Range', 'Linear Functions', 'Quadratic Functions', 'Exponential Functions', 'Graphing']
      },
      {
        name: 'Factoring',
        children: ['Common Factors', 'Difference of Squares', 'Perfect Square Trinomials', 'Factoring Trinomials', 'Grouping Method']
      },
      {
        name: 'Applications',
        children: ['Word Problems', 'Rate Problems', 'Mixture Problems', 'Geometry Applications', 'Physics Applications', 'Economics']
      }
    ]
  },
  'Geometry': {
    center: 'Geometry',
    branches: [
      {
        name: 'Basic Elements',
        children: ['Points', 'Lines', 'Rays', 'Segments', 'Planes', 'Angles', 'Parallel Lines', 'Perpendicular Lines']
      },
      {
        name: 'Triangles',
        children: ['Types (Scalene, Isosceles, Equilateral)', 'Right Triangles', 'Pythagorean Theorem', 'Similar Triangles', 'Congruent Triangles', 'Area Formulas']
      },
      {
        name: 'Quadrilaterals',
        children: ['Squares', 'Rectangles', 'Parallelograms', 'Rhombus', 'Trapezoids', 'Properties', 'Area & Perimeter']
      },
      {
        name: 'Circles',
        children: ['Radius & Diameter', 'Circumference', 'Area', 'Chords', 'Tangents', 'Arcs', 'Central Angles', 'Inscribed Angles']
      },
      {
        name: 'Solid Geometry',
        children: ['Cubes', 'Rectangular Prisms', 'Cylinders', 'Spheres', 'Cones', 'Pyramids', 'Surface Area', 'Volume']
      },
      {
        name: 'Coordinate Geometry',
        children: ['Cartesian Plane', 'Distance Formula', 'Midpoint Formula', 'Slope', 'Equation of a Line', 'Graphing']
      }
    ]
  },
  'Trigonometry': {
    center: 'Trigonometry',
    branches: [
      {
        name: 'Basic Functions',
        children: ['Sine (sin)', 'Cosine (cos)', 'Tangent (tan)', 'Cosecant (csc)', 'Secant (sec)', 'Cotangent (cot)']
      },
      {
        name: 'Unit Circle',
        children: ['Angles in Radians', 'Angles in Degrees', 'Special Angles', 'Reference Angles', 'Quadrants', 'Signs of Functions']
      },
      {
        name: 'Identities',
        children: ['Pythagorean Identity', 'Reciprocal Identities', 'Quotient Identities', 'Co-function Identities', 'Double Angle', 'Half Angle']
      },
      {
        name: 'Graphs',
        children: ['Sine Wave', 'Cosine Wave', 'Tangent Graph', 'Amplitude', 'Period', 'Phase Shift', 'Vertical Shift']
      },
      {
        name: 'Applications',
        children: ['Right Triangle Problems', 'Law of Sines', 'Law of Cosines', 'Navigation', 'Physics Applications', 'Engineering']
      }
    ]
  },
  'Mechanics': {
    center: 'Mechanics',
    branches: [
      {
        name: 'Kinematics',
        children: ['Position', 'Velocity', 'Acceleration', 'Motion Graphs', 'Equations of Motion', 'Projectile Motion', 'Circular Motion']
      },
      {
        name: 'Forces',
        children: ['Newton\'s Laws', 'Gravity', 'Normal Force', 'Friction', 'Tension', 'Applied Force', 'Net Force', 'Free Body Diagrams']
      },
      {
        name: 'Energy',
        children: ['Kinetic Energy', 'Potential Energy', 'Work', 'Power', 'Conservation of Energy', 'Energy Transformations']
      },
      {
        name: 'Momentum',
        children: ['Linear Momentum', 'Impulse', 'Conservation of Momentum', 'Collisions', 'Elastic Collisions', 'Inelastic Collisions']
      },
      {
        name: 'Rotational Motion',
        children: ['Angular Velocity', 'Angular Acceleration', 'Torque', 'Moment of Inertia', 'Angular Momentum', 'Rolling Motion']
      }
    ]
  },
  'Thermodynamics': {
    center: 'Thermodynamics',
    branches: [
      {
        name: 'Heat & Temperature',
        children: ['Temperature Scales', 'Heat Transfer', 'Conduction', 'Convection', 'Radiation', 'Thermal Expansion', 'Specific Heat']
      },
      {
        name: 'Laws of Thermodynamics',
        children: ['Zeroth Law', 'First Law (Energy Conservation)', 'Second Law (Entropy)', 'Third Law', 'Thermal Equilibrium']
      },
      {
        name: 'Ideal Gas',
        children: ['Ideal Gas Law', 'Boyle\'s Law', 'Charles\'s Law', 'Gay-Lussac\'s Law', 'Avogadro\'s Law', 'Kinetic Theory']
      },
      {
        name: 'Processes',
        children: ['Isothermal', 'Adiabatic', 'Isobaric', 'Isochoric', 'Cyclic Processes', 'Reversible vs Irreversible']
      },
      {
        name: 'Applications',
        children: ['Heat Engines', 'Refrigerators', 'Heat Pumps', 'Carnot Cycle', 'Efficiency', 'Entropy Changes']
      }
    ]
  },
  'Atomic Structure': {
    center: 'Atomic Structure',
    branches: [
      {
        name: 'Subatomic Particles',
        children: ['Protons', 'Neutrons', 'Electrons', 'Mass & Charge', 'Quarks', 'Atomic Number', 'Mass Number']
      },
      {
        name: 'Atomic Models',
        children: ['Dalton Model', 'Thomson Model', 'Rutherford Model', 'Bohr Model', 'Quantum Mechanical Model', 'Electron Cloud']
      },
      {
        name: 'Electron Configuration',
        children: ['Orbitals (s, p, d, f)', 'Aufbau Principle', 'Pauli Exclusion', 'Hund\'s Rule', 'Electron Shells', 'Valence Electrons']
      },
      {
        name: 'Periodic Trends',
        children: ['Atomic Radius', 'Ionization Energy', 'Electronegativity', 'Metallic Character', 'Electron Affinity']
      },
      {
        name: 'Isotopes',
        children: ['Same Element', 'Different Mass', 'Radioactivity', 'Half-life', 'Nuclear Reactions', 'Carbon Dating']
      }
    ]
  },
  'Chemical Bonding': {
    center: 'Chemical Bonding',
    branches: [
      {
        name: 'Ionic Bonding',
        children: ['Metal + Non-metal', 'Electron Transfer', 'Cations & Anions', 'Lattice Energy', 'Crystal Structures', 'Properties']
      },
      {
        name: 'Covalent Bonding',
        children: ['Non-metal + Non-metal', 'Electron Sharing', 'Single Bonds', 'Double Bonds', 'Triple Bonds', 'Polar vs Non-polar']
      },
      {
        name: 'Molecular Geometry',
        children: ['VSEPR Theory', 'Linear', 'Trigonal Planar', 'Tetrahedral', 'Trigonal Bipyramidal', 'Octahedral']
      },
      {
        name: 'Intermolecular Forces',
        children: ['Van der Waals', 'Dipole-Dipole', 'Hydrogen Bonding', 'London Dispersion', 'Ion-Dipole']
      },
      {
        name: 'Properties',
        children: ['Melting Point', 'Boiling Point', 'Solubility', 'Conductivity', 'Hardness', 'Brittleness']
      }
    ]
  },
  'Cell Biology': {
    center: 'Cell Biology',
    branches: [
      {
        name: 'Cell Types',
        children: ['Prokaryotic', 'Eukaryotic', 'Plant Cells', 'Animal Cells', 'Bacteria', 'Archaea', 'Protists']
      },
      {
        name: 'Cell Organelles',
        children: ['Nucleus', 'Mitochondria', 'Ribosomes', 'ER', 'Golgi Apparatus', 'Lysosomes', 'Chloroplasts', 'Vacuoles']
      },
      {
        name: 'Cell Membrane',
        children: ['Phospholipid Bilayer', 'Membrane Proteins', 'Selective Permeability', 'Transport', 'Osmosis', 'Diffusion']
      },
      {
        name: 'Cell Division',
        children: ['Mitosis', 'Meiosis', 'Cell Cycle', 'Interphase', 'Prophase', 'Metaphase', 'Anaphase', 'Telophase']
      },
      {
        name: 'Cellular Processes',
        children: ['Photosynthesis', 'Cellular Respiration', 'Protein Synthesis', 'DNA Replication', 'Enzyme Function']
      }
    ]
  },
  'Photosynthesis': {
    center: 'Photosynthesis',
    branches: [
      {
        name: 'Light Reactions',
        children: ['Photosystem I', 'Photosystem II', 'Electron Transport Chain', 'ATP Synthesis', 'NADPH Formation', 'Water Splitting', 'Oxygen Release']
      },
      {
        name: 'Calvin Cycle (Dark Reactions)',
        children: ['Carbon Fixation', 'RuBisCO Enzyme', 'CO₂ + RuBP', 'Reduction Phase', 'Regeneration', '3-Carbon Compounds', 'Glucose Formation']
      },
      {
        name: 'Requirements',
        children: ['Sunlight (Energy)', 'Carbon Dioxide (CO₂)', 'Water (H₂O)', 'Chlorophyll', 'Chloroplasts', 'Optimal Temperature', 'Proper pH']
      },
      {
        name: 'Products',
        children: ['Glucose (C₆H₁₂O₆)', 'Oxygen Gas (O₂)', 'ATP (Energy)', 'NADPH', 'Starch (Storage)', 'Cellulose']
      },
      {
        name: 'Factors Affecting Rate',
        children: ['Light Intensity', 'CO₂ Concentration', 'Temperature', 'Water Availability', 'Chlorophyll Content', 'Enzyme Activity']
      },
      {
        name: 'Types',
        children: ['C3 Plants', 'C4 Plants', 'CAM Plants', 'Adaptations', 'Efficiency Differences', 'Environmental Conditions']
      }
    ]
  },
  'Genetics': {
    center: 'Genetics',
    branches: [
      {
        name: 'DNA Structure',
        children: ['Double Helix', 'Nucleotides', 'Base Pairs (A-T, G-C)', 'Sugar-Phosphate Backbone', 'Antiparallel Strands', 'Major/Minor Grooves']
      },
      {
        name: 'Gene Expression',
        children: ['Transcription', 'Translation', 'mRNA', 'tRNA', 'rRNA', 'Ribosomes', 'Genetic Code', 'Protein Synthesis']
      },
      {
        name: 'Inheritance Patterns',
        children: ['Mendel\'s Laws', 'Dominant/Recessive', 'Codominance', 'Multiple Alleles', 'Sex-linked', 'Polygenic Traits']
      },
      {
        name: 'Mutations',
        children: ['Point Mutations', 'Chromosomal Changes', 'Silent Mutations', 'Missense', 'Nonsense', 'Frameshift', 'Causes & Effects']
      },
      {
        name: 'Applications',
        children: ['Genetic Engineering', 'CRISPR', 'Gene Therapy', 'Cloning', 'GMOs', 'Forensics', 'Medicine']
      }
    ]
  },
  'Poetry Analysis': {
    center: 'Poetry Analysis',
    branches: [
      {
        name: 'Literary Devices',
        children: ['Metaphor', 'Simile', 'Alliteration', 'Personification', 'Symbolism', 'Imagery', 'Rhyme Scheme', 'Meter']
      },
      {
        name: 'Poetic Forms',
        children: ['Sonnet', 'Haiku', 'Free Verse', 'Blank Verse', 'Ballad', 'Epic', 'Lyric', 'Narrative']
      },
      {
        name: 'Themes & Meaning',
        children: ['Love', 'Nature', 'Death', 'Time', 'Identity', 'Society', 'Spirituality', 'Human Experience']
      },
      {
        name: 'Analysis Techniques',
        children: ['Close Reading', 'Context Analysis', 'Biographical Criticism', 'Historical Context', 'Comparative Analysis', 'Thematic Study']
      }
    ]
  },
  'World War I': {
    center: 'World War I',
    branches: [
      {
        name: 'Causes',
        children: ['Imperialism', 'Alliance System', 'Nationalism', 'Militarism', 'Assassination of Archduke Franz Ferdinand', 'Arms Race']
      },
      {
        name: 'Major Battles',
        children: ['Battle of Verdun', 'Somme Offensive', 'Battle of Jutland', 'Gallipoli Campaign', 'Battle of Tannenberg', 'Passchendaele']
      },
      {
        name: 'New Technologies',
        children: ['Machine Guns', 'Poison Gas', 'Tanks', 'Aircraft', 'Submarines', 'Artillery', 'Trench Warfare']
      },
      {
        name: 'Consequences',
        children: ['Treaty of Versailles', 'Russian Revolution', 'Ottoman Empire Collapse', 'League of Nations', 'Economic Impact', 'Social Changes']
      }
    ]
  },
  'Physical Geography': {
    center: 'Physical Geography',
    branches: [
      {
        name: 'Landforms',
        children: ['Mountains', 'Plains', 'Plateaus', 'Valleys', 'Deserts', 'Coasts', 'Rivers', 'Lakes']
      },
      {
        name: 'Climate Systems',
        children: ['Temperature Patterns', 'Precipitation', 'Wind Systems', 'Climate Zones', 'Weather Patterns', 'Seasonal Variations']
      },
      {
        name: 'Geological Processes',
        children: ['Plate Tectonics', 'Erosion', 'Weathering', 'Volcanism', 'Earthquakes', 'Rock Cycle', 'Glaciation']
      },
      {
        name: 'Natural Resources',
        children: ['Minerals', 'Fossil Fuels', 'Water Resources', 'Forests', 'Agricultural Land', 'Renewable Energy', 'Conservation']
      }
    ]
  },
  'Supply and Demand': {
    center: 'Supply and Demand',
    branches: [
      {
        name: 'Demand Factors',
        children: ['Consumer Income', 'Price of Substitutes', 'Consumer Preferences', 'Population Size', 'Future Expectations', 'Seasonal Factors']
      },
      {
        name: 'Supply Factors',
        children: ['Production Costs', 'Technology', 'Number of Sellers', 'Government Regulations', 'Resource Availability', 'Weather Conditions']
      },
      {
        name: 'Market Equilibrium',
        children: ['Equilibrium Price', 'Equilibrium Quantity', 'Market Clearing', 'Shortage', 'Surplus', 'Price Adjustments']
      },
      {
        name: 'Elasticity',
        children: ['Price Elasticity of Demand', 'Income Elasticity', 'Cross-Price Elasticity', 'Price Elasticity of Supply', 'Factors Affecting Elasticity']
      }
    ]
  },
  'Programming Basics': {
    center: 'Programming Basics',
    branches: [
      {
        name: 'Data Types',
        children: ['Integers', 'Floats', 'Strings', 'Booleans', 'Arrays', 'Objects', 'Null/Undefined', 'Constants']
      },
      {
        name: 'Control Structures',
        children: ['If/Else Statements', 'Switch Statements', 'For Loops', 'While Loops', 'Do-While Loops', 'Break/Continue', 'Nested Loops']
      },
      {
        name: 'Functions',
        children: ['Function Declaration', 'Parameters', 'Return Values', 'Scope', 'Recursion', 'Higher-Order Functions', 'Anonymous Functions']
      },
      {
        name: 'Best Practices',
        children: ['Code Comments', 'Variable Naming', 'Error Handling', 'Code Organization', 'Testing', 'Documentation', 'Version Control']
      }
    ]
  },
  'Cognitive Psychology': {
    center: 'Cognitive Psychology',
    branches: [
      {
        name: 'Memory Systems',
        children: ['Sensory Memory', 'Short-term Memory', 'Long-term Memory', 'Working Memory', 'Encoding', 'Storage', 'Retrieval', 'Forgetting']
      },
      {
        name: 'Attention & Perception',
        children: ['Selective Attention', 'Divided Attention', 'Visual Perception', 'Auditory Perception', 'Pattern Recognition', 'Perceptual Organization']
      },
      {
        name: 'Learning & Thinking',
        children: ['Problem Solving', 'Decision Making', 'Language Processing', 'Concept Formation', 'Reasoning', 'Creativity', 'Metacognition']
      },
      {
        name: 'Research Methods',
        children: ['Experiments', 'Neuroimaging', 'Eye Tracking', 'Reaction Time', 'Case Studies', 'Observational Studies', 'Statistical Analysis']
      }
    ]
  }
};

export default MindMapGenerator;