import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, RotateCcw, ShoppingCart, Clock, CheckCircle, XCircle, Trophy, Eye, EyeOff, DollarSign } from 'lucide-react';

const allGroceryItems = [
  { id: 1, emoji: '🍎', name: 'Apple', price: 2.50, category: 'Fruits' },
  { id: 2, emoji: '🍌', name: 'Banana', price: 1.25, category: 'Fruits' },
  { id: 3, emoji: '🍊', name: 'Orange', price: 2.00, category: 'Fruits' },
  { id: 4, emoji: '🍇', name: 'Grapes', price: 4.50, category: 'Fruits' },
  { id: 5, emoji: '🍓', name: 'Strawberry', price: 3.75, category: 'Fruits' },
  { id: 6, emoji: '🥖', name: 'Bread', price: 2.25, category: 'Bakery' },
  { id: 7, emoji: '🥐', name: 'Croissant', price: 1.75, category: 'Bakery' },
  { id: 8, emoji: '🍞', name: 'Sandwich Bread', price: 2.50, category: 'Bakery' },
  { id: 9, emoji: '🥛', name: 'Milk', price: 3.50, category: 'Dairy' },
  { id: 10, emoji: '🧀', name: 'Cheese', price: 5.25, category: 'Dairy' },
  { id: 11, emoji: '🧈', name: 'Butter', price: 4.00, category: 'Dairy' },
  { id: 12, emoji: '🥚', name: 'Eggs', price: 3.00, category: 'Dairy' },
  { id: 13, emoji: '🥕', name: 'Carrot', price: 1.50, category: 'Vegetables' },
  { id: 14, emoji: '🥬', name: 'Lettuce', price: 2.25, category: 'Vegetables' },
  { id: 15, emoji: '🍅', name: 'Tomato', price: 3.25, category: 'Vegetables' },
  { id: 16, emoji: '🥔', name: 'Potato', price: 2.75, category: 'Vegetables' },
  { id: 17, emoji: '🍗', name: 'Chicken', price: 8.50, category: 'Meat' },
  { id: 18, emoji: '🥩', name: 'Beef', price: 12.75, category: 'Meat' },
  { id: 19, emoji: '🐟', name: 'Fish', price: 9.25, category: 'Meat' },
  { id: 20, emoji: '🍝', name: 'Pasta', price: 1.75, category: 'Pantry' }
];

const GroceryGame = ({ onBack }) => {
  const [gameState, setGameState] = useState('menu'); // 'menu', 'studying', 'shopping', 'result'
  const [shoppingList, setShoppingList] = useState([]);
  const [cart, setCart] = useState([]);
  const [studyTime, setStudyTime] = useState(15);
  const [listVisible, setListVisible] = useState(true);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [budget, setBudget] = useState(0);
  const [mistakes, setMistakes] = useState([]);
  const [gameHistory, setGameHistory] = useState([]);
  const maxRounds = 3;

  const generateShoppingList = (roundNumber) => {
    const listSize = Math.min(5 + roundNumber, 8); // 6-8 items based on round
    const shuffled = [...allGroceryItems].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, listSize);
    
    // Calculate budget (items total + 10-30% buffer)
    const totalCost = selected.reduce((sum, item) => sum + item.price, 0);
    const budgetBuffer = totalCost * (0.1 + Math.random() * 0.2); // 10-30% buffer
    
    return {
      items: selected,
      budget: Math.round((totalCost + budgetBuffer) * 100) / 100
    };
  };

  const startNewRound = () => {
    const { items, budget: roundBudget } = generateShoppingList(round);
    setShoppingList(items);
    setBudget(roundBudget);
    setCart([]);
    setStudyTime(15);
    setListVisible(true);
    setGameState('studying');
    setMistakes([]);
  };

  const startShopping = () => {
    setGameState('shopping');
    setListVisible(false);
  };

  const addToCart = (item) => {
    setCart(prev => [...prev, item]);
  };

  const removeFromCart = (index) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const getTotalPrice = () => {
    return Math.round(cart.reduce((total, item) => total + item.price, 0) * 100) / 100;
  };

  const checkShoppingList = () => {
    const cartItemIds = cart.map(item => item.id);
    const listItemIds = shoppingList.map(item => item.id);
    
    const correctItems = cartItemIds.filter(id => listItemIds.includes(id));
    const extraItems = cartItemIds.filter(id => !listItemIds.includes(id));
    const missedItems = listItemIds.filter(id => !cartItemIds.includes(id));
    
    const total = getTotalPrice();
    const withinBudget = total <= budget;
    
    const accuracy = Math.round((correctItems.length / Math.max(listItemIds.length, cartItemIds.length)) * 100);
    let roundScore = correctItems.length * 10;
    
    // Bonus for perfect shopping
    if (correctItems.length === listItemIds.length && extraItems.length === 0) {
      roundScore += 50; // Perfect list bonus
    }
    
    // Bonus for staying within budget
    if (withinBudget) {
      roundScore += 20; // Budget bonus
    }
    
    const roundResult = {
      round,
      correctItems: correctItems.length,
      totalItems: listItemIds.length,
      extraItems: extraItems.length,
      missedItems: missedItems.length,
      totalSpent: total,
      budget,
      withinBudget,
      accuracy,
      score: roundScore
    };
    
    setScore(prev => prev + roundScore);
    setGameHistory(prev => [...prev, roundResult]);
    
    setTimeout(() => {
      if (round < maxRounds) {
        setRound(round + 1);
        startNewRound();
      } else {
        setGameState('result');
      }
    }, 4000);
    
    return roundResult;
  };

  const resetGame = () => {
    setGameState('menu');
    setShoppingList([]);
    setCart([]);
    setStudyTime(15);
    setListVisible(true);
    setScore(0);
    setRound(1);
    setBudget(0);
    setMistakes([]);
    setGameHistory([]);
  };

  const toggleListVisibility = () => {
    setListVisible(!listVisible);
  };

  // Study timer countdown
  useEffect(() => {
    let timer;
    if (gameState === 'studying' && studyTime > 0) {
      timer = setTimeout(() => setStudyTime(studyTime - 1), 1000);
    } else if (gameState === 'studying' && studyTime === 0) {
      startShopping();
    }
    return () => clearTimeout(timer);
  }, [gameState, studyTime]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        {onBack && (
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Grocery Memory Challenge</h2>
          <p className="text-gray-600">Memorize your shopping list and shop efficiently!</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8">
        {gameState === 'menu' && (
          <div className="text-center space-y-6">
            <div className="mb-6">
              <ShoppingCart className="w-16 h-16 text-purple-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Memory Shopping Challenge</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Study your shopping list, memorize it, then shop without looking! Stay within budget and get the right items.
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              {allGroceryItems.slice(0, 6).map((item) => (
                <div key={item.id} className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-3xl mb-2">{item.emoji}</div>
                  <div className="text-xs text-gray-600">{item.name}</div>
                  <div className="text-xs text-green-600">${item.price}</div>
                </div>
              ))}
            </div>
            
            {score > 0 && (
              <div className="bg-purple-50 rounded-lg p-4 mb-4">
                <div className="text-lg font-bold text-purple-600">Final Score: {score} points</div>
                <div className="text-sm text-gray-600 mb-2">
                  {score >= 300 ? '🏆 Shopping Expert!' : score >= 200 ? '🛒 Great Shopper!' : '🎯 Keep Practicing!'}
                </div>
                <div className="text-xs text-gray-500">
                  Average Accuracy: {gameHistory.length > 0 
                    ? Math.round(gameHistory.reduce((sum, h) => sum + h.accuracy, 0) / gameHistory.length)
                    : 0}%
                </div>
              </div>
            )}
            
            <button
              onClick={startNewRound}
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              <Play className="w-5 h-5" />
              {score > 0 ? 'Play Again' : 'Start Shopping Challenge'}
            </button>
          </div>
        )}

        {gameState === 'studying' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="text-lg font-semibold">Round {round}/{maxRounds}</div>
              <div className="flex items-center gap-2 text-orange-600">
                <Clock className="w-5 h-5" />
                <span className="text-xl font-bold">{studyTime}s</span>
              </div>
              <div className="text-lg font-semibold">Score: {score}</div>
            </div>

            <div className="text-center space-y-6">
              <div className="text-xl font-bold text-gray-800">
                Study Your Shopping List
              </div>
              <div className="text-sm text-gray-600">
                Memorize these items and their details. You have {studyTime} seconds!
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-xl p-6 max-w-4xl mx-auto">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <span className="text-lg font-bold text-gray-800">Budget: ${budget}</span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {shoppingList.map((item) => (
                    <div key={item.id} className="bg-white rounded-lg p-4 text-center shadow-md">
                      <div className="text-3xl mb-2">{item.emoji}</div>
                      <div className="text-sm font-bold text-gray-800 mb-1">{item.name}</div>
                      <div className="text-xs text-gray-600 mb-1">{item.category}</div>
                      <div className="text-sm font-bold text-green-600">${item.price}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 max-w-md mx-auto">
                <p className="text-sm text-yellow-800">
                  💡 <strong>Memory Tips:</strong> Group items by category, remember prices, 
                  and create mental associations with the emojis!
                </p>
              </div>
              
              <button
                onClick={startShopping}
                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors"
              >
                I'm Ready to Shop!
              </button>
            </div>
          </div>
        )}

        {gameState === 'shopping' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="text-lg font-semibold">Shopping - Round {round}</div>
              <button
                onClick={toggleListVisibility}
                className="flex items-center gap-2 px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors text-sm"
              >
                {listVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {listVisible ? 'Hide' : 'Peek at'} List
              </button>
              <div className="text-lg font-semibold">Budget: ${budget}</div>
            </div>

            {listVisible && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="text-sm font-bold text-yellow-800 mb-2">Your Shopping List:</div>
                <div className="flex flex-wrap gap-2">
                  {shoppingList.map((item) => (
                    <span key={item.id} className="inline-flex items-center gap-1 bg-white px-2 py-1 rounded text-sm">
                      <span>{item.emoji}</span>
                      <span>{item.name}</span>
                      <span className="text-green-600">${item.price}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Store Items */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Grocery Store</h3>
                <div className="grid grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                  {allGroceryItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => addToCart(item)}
                      className="p-3 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-center group"
                    >
                      <div className="text-2xl mb-1">{item.emoji}</div>
                      <div className="text-xs font-medium text-gray-700 group-hover:text-blue-600">
                        {item.name}
                      </div>
                      <div className="text-xs text-gray-500">{item.category}</div>
                      <div className="text-xs font-bold text-green-600">${item.price}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Shopping Cart */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Your Cart</h3>
                
                <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
                  {cart.length === 0 ? (
                    <div className="text-gray-500 text-center py-8">Cart is empty</div>
                  ) : (
                    cart.map((item, index) => (
                      <div key={index} className="flex items-center justify-between bg-white p-2 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{item.emoji}</span>
                          <div>
                            <div className="text-sm font-medium">{item.name}</div>
                            <div className="text-xs text-gray-500">{item.category}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-green-600">${item.price}</span>
                          <button
                            onClick={() => removeFromCart(index)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-bold">Total:</span>
                    <span className={`text-lg font-bold ${
                      getTotalPrice() > budget ? 'text-red-600' : 'text-green-600'
                    }`}>
                      ${getTotalPrice()}
                    </span>
                  </div>
                  
                  {getTotalPrice() > budget && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-2 mb-4">
                      <div className="text-sm text-red-800">
                        ⚠️ Over budget by ${Math.round((getTotalPrice() - budget) * 100) / 100}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCart([])}
                      className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      Clear Cart
                    </button>
                    <button
                      onClick={() => {
                        const result = checkShoppingList();
                        setGameState('result');
                      }}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                    >
                      Checkout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {gameState === 'result' && gameHistory.length > 0 && (
          <div className="text-center space-y-6">
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto" />
            
            <div className="text-2xl font-bold text-gray-800 mb-4">
              {round > maxRounds ? 'Shopping Challenge Complete!' : `Round ${round} Results`}
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-xl p-6 max-w-3xl mx-auto">
              <div className="text-3xl font-bold text-purple-600 mb-4">{score} Total Points</div>
              
              {round <= maxRounds ? (
                // Single round results
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Items Correct:</span>
                      <div className="text-lg font-bold text-green-600">
                        {gameHistory[gameHistory.length - 1]?.correctItems}/{gameHistory[gameHistory.length - 1]?.totalItems}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Budget Status:</span>
                      <div className={`text-lg font-bold ${
                        gameHistory[gameHistory.length - 1]?.withinBudget ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {gameHistory[gameHistory.length - 1]?.withinBudget ? '✓ Within Budget' : '✗ Over Budget'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="font-medium">Accuracy: {gameHistory[gameHistory.length - 1]?.accuracy}%</div>
                    <div className="text-sm text-gray-600">
                      Total Spent: ${gameHistory[gameHistory.length - 1]?.totalSpent} / ${gameHistory[gameHistory.length - 1]?.budget}
                    </div>
                  </div>
                </div>
              ) : (
                // Final results
                <div className="space-y-4">
                  <div className="text-lg text-gray-700 mb-4">
                    Overall Performance Across {maxRounds} Rounds
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    {gameHistory.map((result, index) => (
                      <div key={index} className="flex justify-between items-center bg-white rounded-lg p-3">
                        <span>Round {result.round}:</span>
                        <div className="flex gap-4 text-xs">
                          <span className="text-green-600">{result.correctItems}/{result.totalItems} items</span>
                          <span className={result.withinBudget ? 'text-green-600' : 'text-red-600'}>
                            {result.withinBudget ? 'Budget ✓' : 'Over Budget'}
                          </span>
                          <span className="font-bold">{result.score} pts</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="font-medium text-gray-700">
                      Average Accuracy: {Math.round(gameHistory.reduce((sum, h) => sum + h.accuracy, 0) / gameHistory.length)}%
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-center">
              {round <= maxRounds ? (
                <div className="text-gray-600">
                  Round {round + 1} starting automatically...
                </div>
              ) : (
                <>
                  <button
                    onClick={resetGame}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                  >
                    <Play className="w-5 h-5" />
                    Play Again
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {(gameState === 'shopping' || gameState === 'studying') && (
          <div className="text-center mt-6">
            <button
              onClick={resetGame}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Quit Game
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroceryGame;