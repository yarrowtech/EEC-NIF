import React, { useRef, useState } from "react";
import { Info } from "lucide-react"

export default function ClozeDragDrop() {
  const [questionSet, setQuestionSet] = useState([
    {
      question:
        "There are several different types of drums. The ${{blank}} drum is a long bodied drum typically held between the knees and played with the fingers. A drum with small metal disc around the edge played by being shaken is a ${{blank}}. Many years ago, a ${{blank}} drum was used to announce an army's arrival onto a battlefield. Finally, the biggest drum in a marching band is called a ${{blank}} drum.",
      options: ["snare", "bass", "tom-tom", "cymbal"],
      hint: ["hint1", "hint2", "hint3", "hint4"],
    },
  ]);
  const [optionPos, setOptionPos] = useState("down");
  return (
    <section className={`${optionPos == 'left' || optionPos == 'right' ? 'w-[80vw]' : 'w-[60vw]'} m-auto flex flex-col items-center gap-3 pt-10`}>
        <div className=" top-2 right-2 flex gap-2 items-center">
            <label className="text-purple-500">Option Position:</label>
            <select name="" id="" className="border-2 border-purple-500 p-2 rounded-xl" onChange={(e) => setOptionPos(e.target.value)}>
                <option value="" hidden>Select Option Position</option>
                <option value="up">Up</option>
                <option value="down">Down</option>
                <option value="left">Left</option>
                <option value="right">Right</option>
            </select>
        </div>
      {questionSet.map((question, index) => (
        <QuestionCard key={index} question={question} optionPos={optionPos} />
      ))}
    </section>
  );
}

function QuestionCard({ question, optionPos }) {
  const parts = question.question.split("${{blank}}");
  const [options, setOptions] = useState(question.options);
  const dropBoxRef = useRef([]);
  const [showDrop, setShowDrop] = useState(
    options.map(() => {
      return { show: false, value: "", showHint: false };
    })
  );
  const upArrow = "-top-4 left-1/2 -translate-x-1/2 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-b-[30px] border-b-yellow-100 border-t-0"
  const downArrow = "-bottom-4 left-1/2 -translate-x-1/2 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-yellow-100 border-b-0";
  const leftArrow = "-left-4 top-1/2 -translate-y-1/2 border-t-[15px] border-t-transparent border-b-[15px] border-b-transparent border-r-[30px] border-r-yellow-100 border-l-0";
  const rightArrow = "-right-4 top-1/2 -translate-y-1/2 border-t-[15px] border-t-transparent border-b-[15px] border-b-transparent border-l-[30px] border-l-yellow-100 border-r-0";
  return (
    <div className={`w-3/4 border flex ${optionPos == "down" ? 'flex-col' : optionPos == "left" ? 'flex-row-reverse' : optionPos == "right" ? 'flex-row' : 'flex-col-reverse'} items-center justify-center gap-5 border-purple-500 p-8 rounded-xl shadow-l`}>
      <div>
        {parts.map((part, i) => {
          return (
            <React.Fragment key={i}>
              <span className="select-none text-black">{part}</span>
              {i < parts.length - 1 ? (
                <span
                  ref={(el) => (dropBoxRef.current[i] = el)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    const data = e.dataTransfer.getData("text");
                    const temp = [...showDrop];
                    if (temp[i].show) return
                    temp[i].show = true;
                    temp[i].value = data;
                    setShowDrop([...temp]);
                    setOptions(options.filter((option) => option !== data));
                  }}
                  className={`inline-block px-4 py-1 min-w-15 min-h-7 border-dashed border-3 border-black ${
                    showDrop[i].show ? "border-purple-400" : ""
                  }`}
                >
                  {showDrop[i].show ? (
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-black">{showDrop[i].value}</span>
                      <button
                        onClick={() => {
                          const temp = [...showDrop];
                          temp[i].show = false;
                          setShowDrop([...temp]);
                          setOptions([...options, showDrop[i].value]);
                        }}
                        className="bg-gray-200 px-2 rounded-md cursor-pointer"
                      >
                        x
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <Info className="w-4 m-auto cursor-pointer" onClick={() => {
                        const temp = [...showDrop];
                        temp[i].showHint = !temp[i].showHint;
                        setShowDrop([...temp]);
                      }} />
                      {showDrop[i].showHint && <div className="bg-yellow-100 p-2 absolute left-1/2 -translate-x-1/2 top-full z-10 border-1 border-black min-w-50 rounded-lg">
                        <div className="w-0 h-0 border-b-[15px] border-l-[7px] border-r-[7px] border-b-yellow-100 border-l-transparent border-r-transparent absolute left-1/2 -translate-x-1/2 bottom-full"></div>
                        <p className="text-xs">{question.hint[i]}</p>
                      </div>}
                    </div>
                  )}
                </span>
              ) : (
                ""
              )}
            </React.Fragment>
          );
        })}
      </div>
      <div className="w-full relative">
        <div className={`absolute ${optionPos == 'up' ? downArrow : optionPos == 'left' ? rightArrow : optionPos == 'right' ? leftArrow : upArrow} w-5 h-5`}></div>
        <div className={`bg-yellow-100 w-full flex ${optionPos != 'up' && optionPos != 'down' ? 'flex-col' : ''} items-center justify-center gap-2 p-5 rounded-xl`}>
          {options.map((option, index) => (
            <div
              draggable={true}
              onDragStart={(e) =>
                e.dataTransfer.setData("text", e.currentTarget.innerText)
              }
              className="bg-gray-200 px-5 py-2 rounded-lg cursor-grab border border-purple-300 hover:border-purple-500 text-black"
              key={index}
            >
              {option}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
