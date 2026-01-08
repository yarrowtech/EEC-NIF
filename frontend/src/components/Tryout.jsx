import React, { useState } from "react";
import { Coins } from "lucide-react";
import ChoiceMatrix from '../tryout/choice_matrix';
import ClozeDragDrop from '../tryout/cloze_drag_drop';
import ClozeDropDown from '../tryout/cloze_drop_down';
import ClozeText from '../tryout/cloze_text';
import FileUpload from '../tryout/file_upload';
import ImageHighlighter from '../tryout/image_highlighter';
import MatchList from '../tryout/match_list';
import MCQTryout from '../tryout/mcq';
import TextEditor from '../tryout/plain_txt';
import SortList from '../tryout/sort_list';
import { addPoints, hasAward, markAwarded } from '../utils/points';

const Tryout = () => {
  const [tryoutType, setTryoutType] = useState("names");
  const [tryoutDifficulty, setTryoutDifficulty] = useState('basic');
  
  const tryoutDifficultyOptions = [
    {
      value: 'basic',
      label: 'Basic',
      className: 'bg-emerald-500/15 text-emerald-700 border-emerald-200 hover:bg-emerald-500/25 hover:text-emerald-800',
      activeClass: 'ring-emerald-400 bg-emerald-500/25 text-emerald-900'
    },
    {
      value: 'intermediate',
      label: 'Intermediate',
      className: 'bg-amber-500/15 text-amber-700 border-amber-200 hover:bg-amber-500/25 hover:text-amber-800',
      activeClass: 'ring-amber-400 bg-amber-500/25 text-amber-900'
    },
    {
      value: 'advanced',
      label: 'Advanced',
      className: 'bg-rose-500/15 text-rose-700 border-rose-200 hover:bg-rose-500/25 hover:text-rose-800',
      activeClass: 'ring-rose-400 bg-rose-500/25 text-rose-900'
    }
  ];

  const baseDifficultyButtonClasses = "px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-150 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 border ring-1 ring-transparent";

  const handleTryoutComplete = () => {
    const awardKey = `tryout_${tryoutType}`;
    if (!hasAward(awardKey)) {
      addPoints(5);
      markAwarded(awardKey);
      const el = document.createElement('div');
      el.className = 'fixed top-20 right-6 bg-emerald-600 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-bounce z-50';
      el.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"></circle><circle cx="19" cy="21" r="1"></circle><path d="M2.05 10.05a7 7 0 0 1 9.9 0l10 10"></path><path d="M13 13h8"></path></svg><span>+5 Points</span>';
      document.body.appendChild(el);
      setTimeout(() => document.body.removeChild(el), 1800);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative">
      <div className="mb-6 flex flex-wrap items-center gap-3 justify-left">
        <label htmlFor="tryoutType" className="font-medium text-gray-700">Tryout Type:</label>
        <select
          id="tryoutType"
          value={tryoutType}
          onChange={e => setTryoutType(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="choice_matrix">Choice Matrix</option>
          <option value="cloze_drag_drop">Cloze Drag Drop</option>
          <option value="cloze_drop_down">Cloze Drop Down</option>
          <option value="cloze_text">Cloze Text</option>
          <option value="file_upload">File Upload</option>
          <option value="image_highlighter">Image Highlighter</option>
          <option value="match_list">Match List</option>
          <option value="mcq">MCQ</option>
          <option value="plain_txt">Plain Text</option>
          <option value="sort_list">Sort List</option>
        </select>
      </div>
      
      <div className="mb-6">
        <span className="font-medium text-gray-700">Difficulty:</span>
        <div className="mt-3 flex flex-wrap gap-3">
          {tryoutDifficultyOptions.map(option => {
            const isActive = tryoutDifficulty === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setTryoutDifficulty(option.value)}
                className={`${baseDifficultyButtonClasses} ${option.className} ${isActive ? option.activeClass + ' ring-2' : ''}`}
                aria-pressed={isActive}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
      
      <div>
        {tryoutType === 'choice_matrix' && <ChoiceMatrix />}
        {tryoutType === 'cloze_drag_drop' && <ClozeDragDrop />}
        {tryoutType === 'cloze_drop_down' && <ClozeDropDown />}
        {tryoutType === 'cloze_text' && <ClozeText />}
        {tryoutType === 'file_upload' && <FileUpload />}
        {tryoutType === 'image_highlighter' && <ImageHighlighter />}
        {tryoutType === 'match_list' && <MatchList />}
        {tryoutType === 'mcq' && <MCQTryout />}
        {tryoutType === 'plain_txt' && <TextEditor />}
        {tryoutType === 'sort_list' && <SortList />}
        {tryoutType === 'names' && (
          <div className="text-gray-500 text-center py-8">Select The Tryout From The Drop Down Menu.</div>
        )}
        {tryoutType === 'rich_text' && (
          <div className="text-gray-500 text-center py-8">Rich Text tryout is not available. Please check the file name or implementation.</div>
        )}
        {![
          'choice_matrix','cloze_drag_drop','cloze_drop_down','cloze_text','file_upload','image_highlighter','match_list','mcq','plain_txt','rich_text','sort_list','names'
        ].includes(tryoutType) && (
          <div className="text-gray-500 text-center py-8">Select a tryout type to begin.</div>
        )}
      </div>
      
      <div className="mt-6">
        <button
          onClick={handleTryoutComplete}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white shadow"
        >
          <Coins className="w-4 h-4" />
          Mark Tryout Completed & Collect +5
        </button>
      </div>
    </div>
  );
};

export default Tryout;