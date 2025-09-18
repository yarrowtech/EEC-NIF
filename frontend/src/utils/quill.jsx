import { useEffect, useRef, useState } from "react";
import { BetweenHorizonalEnd } from "lucide-react";
import Quill from "quill";
import "quill/dist/quill.snow.css";


export default function QuillEditor({
  type,
  idPrefix = "editor",
  value = "",
  onChange = () => {},
  placeholder = "Type your text here...",
}) {
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const quillRef = useRef(null);

  useEffect(() => {
    const toolbarId = `#${idPrefix}-toolbar`;
    const editorId = `#${idPrefix}-editor`;

    const quill = new Quill(editorId, {
      theme: "snow",
      placeholder,
      modules: {
        toolbar: {
          container: toolbarId,
          handlers: {
            insert: function () {
              const range = quill.getSelection();
              if (range) {
                quill.insertText(range.index, "${{________}}")
              }
            },
          },
        },
      },
    });

    quillRef.current = quill;

    // Initialize content
    if (value) {
      quill.root.innerHTML = value;
      setWordCount(quill.getText().trim().length ? quill.getText().trim().split(/\s+/).length : 0);
      setCharCount(Math.max(0, quill.getText().length - 1));
    }

    quill.on("text-change", () => {
      const text = quill.getText();
      const html = quill.root.innerHTML;
      setWordCount(text.trim().length ? text.trim().split(/\s+/).length : 0);
      setCharCount(Math.max(0, text.length - 1));
      onChange(html);
    });
  }, []);

  // Sync external value updates
  useEffect(() => {
    const quill = quillRef.current;
    if (!quill) return;
    // Avoid resetting if content didn’t actually change
    if (quill.root.innerHTML !== value) {
      const sel = quill.getSelection();
      quill.root.innerHTML = value || "";
      if (sel) quill.setSelection(sel);
    }
  }, [value]);

  return (
    <div className="flex flex-col">
      <div id={`${idPrefix}-toolbar`}>
        <span className="ql-formats">
          <button className="ql-bold"></button>
          <button className="ql-italic"></button>
          <button className="ql-underline"></button>
          <button className="ql-strike"></button>
        </span>
        <span className="ql-formats">
          <button className="ql-blockquote"></button>
          <button className="ql-code-block"></button>
        </span>
        <span className="ql-formats">
          <button className="ql-link"></button>
          <button className="ql-image"></button>
          <button className="ql-video"></button>
          <button className="ql-formula"></button>
        </span>
        <span className="ql-formats">
          <button
            className="ql-list"
            value="ordered"
            aria-label="list: ordered"
          ></button>
          <button
            className="ql-list"
            value="bullet"
            aria-label="list: bullet"
          ></button>
          <button
            className="ql-list"
            value="check"
            aria-label="list: check"
          ></button>
        </span>
        <span className="ql-formats">
          <button
            className="ql-script"
            value="super"
            aria-label="script: super"
          ></button>
          <button
            className="ql-script"
            value="sub"
            aria-label="script: sub"
          ></button>
        </span>
        <span className="ql-formats">
          <button
            className="ql-indent"
            value="+1"
            aria-label="indent: +1"
          ></button>
          <button
            className="ql-indent"
            value="-1"
            aria-label="indent: -1"
          ></button>
        </span>
        <select className="ql-header">
          <option value="1"></option>
          <option value="2"></option>
          <option value="3"></option>
          <option value="4"></option>
          <option value="5"></option>
          <option value="6"></option>
        </select>
        <span className="ql-formats">
          <select className="ql-align"></select>
          <select className="ql-color"></select>
          <select className="ql-background"></select>
        </span>
        {type == "question-editor" && <span className="ql-formats">
          <button className="ql-insert">
            <BetweenHorizonalEnd />
          </button>
        </span>}
      </div>
      <div id={`${idPrefix}-editor`}></div>
      <div className="text-xs self-end flex gap-3">
            <p className="">{charCount} chars</p>
            <p className="">{wordCount} words</p>
        </div>
    </div>
  );
}
