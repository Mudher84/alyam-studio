import React, { useState } from 'react';
import { useEditor, EditorContent, Extension } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-font-family';
import { TextAlign } from '@tiptap/extension-text-align';
import { Underline } from '@tiptap/extension-underline';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { Highlight } from '@tiptap/extension-highlight';

import {
  Bold, Italic, List, ListOrdered, Quote, Heading2, Heading3,
  ImageIcon, Link as LinkIcon, Undo, Redo, Code,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Search, Type, ArrowUpDown, ArrowLeftRight, Paintbrush,
  RotateCw, ChevronsUpDown, HelpCircle
} from 'lucide-react';

// Custom TipTap Extension for advanced Character styles (FontSize, LineHeight, Tracking, Transforms, Baseline Shift, Shear, TextTransform)
const AdvancedTextStyle = Extension.create({
  name: 'advancedTextStyle',

  addGlobalAttributes() {
    return [
      {
        types: ['textStyle'],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize?.replace('pt', '').replace('px', ''),
            renderHTML: attributes => {
              if (!attributes.fontSize) return {};
              return { style: `font-size: ${attributes.fontSize}pt` };
            },
          },
          fontWeight: {
            default: null,
            parseHTML: element => element.style.fontWeight,
            renderHTML: attributes => {
              if (!attributes.fontWeight) return {};
              return { style: `font-weight: ${attributes.fontWeight}` };
            },
          },
          lineHeight: {
            default: null,
            parseHTML: element => element.style.lineHeight,
            renderHTML: attributes => {
              if (!attributes.lineHeight) return {};
              return { style: `line-height: ${attributes.lineHeight}` };
            },
          },
          letterSpacing: {
            default: null,
            parseHTML: element => element.style.letterSpacing,
            renderHTML: attributes => {
              if (!attributes.letterSpacing) return {};
              return { style: `letter-spacing: ${attributes.letterSpacing}px` };
            },
          },
          textTransform: {
            default: null,
            parseHTML: element => element.style.textTransform,
            renderHTML: attributes => {
              if (!attributes.textTransform) return {};
              return { style: `text-transform: ${attributes.textTransform}` };
            },
          },
          scaleX: {
            default: '100',
            parseHTML: element => element.getAttribute('data-scale-x'),
            renderHTML: attributes => {
              if (!attributes.scaleX || attributes.scaleX === '100') return {};
              return {
                'data-scale-x': attributes.scaleX,
                style: `display: inline-block; transform: scaleX(${Number(attributes.scaleX) / 100})`,
              };
            },
          },
          scaleY: {
            default: '100',
            parseHTML: element => element.getAttribute('data-scale-y'),
            renderHTML: attributes => {
              if (!attributes.scaleY || attributes.scaleY === '100') return {};
              return {
                'data-scale-y': attributes.scaleY,
                style: `display: inline-block; transform: scaleY(${Number(attributes.scaleY) / 100})`,
              };
            },
          },
          baselineShift: {
            default: '0',
            parseHTML: element => element.style.verticalAlign,
            renderHTML: attributes => {
              if (!attributes.baselineShift || attributes.baselineShift === '0') return {};
              return { style: `vertical-align: ${attributes.baselineShift}pt` };
            },
          },
          shear: {
            default: '0',
            parseHTML: element => element.getAttribute('data-shear'),
            renderHTML: attributes => {
              if (!attributes.shear || attributes.shear === '0') return {};
              return {
                'data-shear': attributes.shear,
                style: `display: inline-block; transform: skewX(${-Number(attributes.shear)}deg)`,
              };
            },
          },
        },
      },
      {
        types: ['paragraph', 'heading'],
        attributes: {
          dir: {
            default: 'rtl',
            parseHTML: element => element.getAttribute('dir') || 'rtl',
            renderHTML: attributes => ({ dir: attributes.dir || 'rtl' }),
          },
          textIndent: {
            default: null,
            parseHTML: element => element.style.textIndent,
            renderHTML: attributes => {
              if (!attributes.textIndent) return {};
              return { style: `text-indent: ${attributes.textIndent}mm` };
            },
          },
          indentLeft: {
            default: null,
            parseHTML: element => element.style.paddingInlineStart,
            renderHTML: attributes => {
              if (!attributes.indentLeft) return {};
              return { style: `padding-inline-start: ${attributes.indentLeft}mm` };
            },
          },
          indentRight: {
            default: null,
            parseHTML: element => element.style.paddingInlineEnd,
            renderHTML: attributes => {
              if (!attributes.indentRight) return {};
              return { style: `padding-inline-end: ${attributes.indentRight}mm` };
            },
          },
          spaceBefore: {
            default: null,
            parseHTML: element => element.style.marginTop,
            renderHTML: attributes => {
              if (!attributes.spaceBefore) return {};
              return { style: `margin-top: ${attributes.spaceBefore}pt` };
            },
          },
          spaceAfter: {
            default: null,
            parseHTML: element => element.style.marginBottom,
            renderHTML: attributes => {
              if (!attributes.spaceAfter) return {};
              return { style: `margin-bottom: ${attributes.spaceAfter}pt` };
            },
          },
          textJustify: {
            default: null,
            parseHTML: element => element.style.getPropertyValue('text-justify'),
            renderHTML: attributes => {
              if (!attributes.textJustify) return {};
              return { style: `text-justify: ${attributes.textJustify}; text-align: justify;` };
            },
          },
        },
      },
    ];
  },
});

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  onImageClick?: () => void;
}

const FONTS = [
  { name: 'Adobe Arabic', value: '"Adobe Arabic", "Cairo", serif' },
  { name: 'Cairo', value: '"Cairo", sans-serif' },
  { name: 'Almarai', value: '"Almarai", sans-serif' },
  { name: 'Amiri', value: '"Amiri", serif' },
  { name: 'Readex Pro', value: '"Readex Pro", sans-serif' },
  { name: 'Traditional Arabic', value: '"Traditional Arabic", serif' },
  { name: 'Playfair Display', value: '"Playfair Display", serif' },
  { name: 'Plus Jakarta Sans', value: '"Plus Jakarta Sans", sans-serif' },
  { name: 'Courier New', value: '"Courier New", monospace' },
];

const FONT_WEIGHTS = [
  { label: 'Light', value: '300' },
  { label: 'Regular', value: '400' },
  { label: 'Medium', value: '500' },
  { label: 'SemiBold', value: '600' },
  { label: 'Bold', value: '700' },
  { label: 'Black', value: '900' },
];

const FONT_SIZES = ['9', '10', '11', '12', '14', '16', '18', '24', '30', '36', '48', '72'];
const LINE_HEIGHTS = ['Auto', '12', '14', '16', '18', '20', '24', '28', '32', '40', '1.2', '1.5', '1.8', '2.0'];
const TRACKING_VALS = ['Metrics', 'Optical', '-50', '-25', '0', '10', '25', '50', '100', '200'];

const COLORS = [
  '#000000', '#333333', '#666666', '#999999', '#cccccc', '#ffffff',
  '#d97706', '#2563eb', '#dc2626', '#16a34a', '#9333ea', '#0891b2'
];

const HIGHLIGHT_COLORS = [
  'transparent', '#fef08a', '#fde68a', '#bfdbfe', '#bbf7d0', '#e9d5ff', '#fed7aa', '#fecdd3'
];

export default function RichTextEditor({ content, onChange, onImageClick }: RichTextEditorProps) {
  const [activeTab, setActiveTab] = useState<'character' | 'paragraph'>('character');

  // Toolbar state inputs
  const [fontFamily, setFontFamily] = useState('"Adobe Arabic", "Cairo", serif');
  const [fontWeight, setFontWeight] = useState('400');
  const [fontSize, setFontSize] = useState('12');
  const [lineHeight, setLineHeight] = useState('1.5');
  const [tracking, setTracking] = useState('0');
  const [scaleX, setScaleX] = useState('100');
  const [scaleY, setScaleY] = useState('100');
  const [baselineShift, setBaselineShift] = useState('0');
  const [shear, setShear] = useState('0');
  const [textColor, setTextColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('transparent');

  // Paragraph states
  const [dir, setDir] = useState<'rtl' | 'ltr'>('rtl');
  const [kashida, setKashida] = useState('Medium');
  const [indentLeft, setIndentLeft] = useState('0');
  const [indentRight, setIndentRight] = useState('0');
  const [textIndent, setTextIndent] = useState('0');
  const [spaceBefore, setSpaceBefore] = useState('0');
  const [spaceAfter, setSpaceAfter] = useState('0');
  const [language, setLanguage] = useState('Arabic');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false }),
      TextStyle,
      FontFamily,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Underline,
      Subscript,
      Superscript,
      AdvancedTextStyle,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base lg:prose-lg max-w-none focus:outline-none min-h-[420px] p-8 text-gray-800 bg-gray-100 dir-rtl',
        dir: 'rtl',
      },
    },
  });

  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content, editor]);

  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  // Helper setters that apply changes to selection or active mark
  const applyFontFamily = (val: string) => {
    setFontFamily(val);
    editor.chain().focus().setFontFamily(val).run();
  };

  const applyFontWeight = (val: string) => {
    setFontWeight(val);
    editor.chain().focus().setMark('textStyle', { fontWeight: val }).run();
  };

  const applyFontSize = (val: string) => {
    setFontSize(val);
    editor.chain().focus().setMark('textStyle', { fontSize: val }).run();
  };

  const applyLineHeight = (val: string) => {
    setLineHeight(val);
    const lhVal = val === 'Auto' ? '1.5' : val.includes('.') ? val : `${val}pt`;
    editor.chain().focus().setMark('textStyle', { lineHeight: lhVal }).run();
  };

  const applyTracking = (val: string) => {
    setTracking(val);
    const num = val === 'Metrics' || val === 'Optical' ? '0' : val;
    editor.chain().focus().setMark('textStyle', { letterSpacing: num }).run();
  };

  const applyScaleX = (val: string) => {
    setScaleX(val);
    editor.chain().focus().setMark('textStyle', { scaleX: val }).run();
  };

  const applyScaleY = (val: string) => {
    setScaleY(val);
    editor.chain().focus().setMark('textStyle', { scaleY: val }).run();
  };

  const applyBaselineShift = (val: string) => {
    setBaselineShift(val);
    editor.chain().focus().setMark('textStyle', { baselineShift: val }).run();
  };

  const applyShear = (val: string) => {
    setShear(val);
    editor.chain().focus().setMark('textStyle', { shear: val }).run();
  };

  const applyTextColor = (val: string) => {
    setTextColor(val);
    editor.chain().focus().setColor(val).run();
  };

  const applyHighlightColor = (val: string) => {
    setBgColor(val);
    if (val === 'transparent') {
      editor.chain().focus().unsetHighlight().run();
    } else {
      editor.chain().focus().toggleHighlight({ color: val }).run();
    }
  };

  const applyTextTransform = (transformType: 'uppercase' | 'capitalize' | 'none') => {
    const current = editor.getAttributes('textStyle').textTransform;
    const next = current === transformType ? 'none' : transformType;
    editor.chain().focus().setMark('textStyle', { textTransform: next }).run();
  };

  const applyDir = (direction: 'rtl' | 'ltr') => {
    setDir(direction);
    editor.chain().focus().updateAttributes('paragraph', { dir: direction }).updateAttributes('heading', { dir: direction }).run();
  };

  const applyIndents = (left: string, right: string, first: string) => {
    setIndentLeft(left);
    setIndentRight(right);
    setTextIndent(first);
    editor.chain().focus()
      .updateAttributes('paragraph', { indentLeft: left, indentRight: right, textIndent: first })
      .updateAttributes('heading', { indentLeft: left, indentRight: right, textIndent: first })
      .run();
  };

  const applyMargins = (before: string, after: string) => {
    setSpaceBefore(before);
    setSpaceAfter(after);
    editor.chain().focus()
      .updateAttributes('paragraph', { spaceBefore: before, spaceAfter: after })
      .updateAttributes('heading', { spaceBefore: before, spaceAfter: after })
      .run();
  };

  const applyKashida = (val: string) => {
    setKashida(val);
    const modeMap: Record<string, string> = {
      None: 'none',
      Short: 'kashida',
      Medium: 'kashida',
      Long: 'kashida',
    };
    editor.chain().focus()
      .updateAttributes('paragraph', { textJustify: modeMap[val] || 'auto' })
      .updateAttributes('heading', { textJustify: modeMap[val] || 'auto' })
      .run();
  };

  return (
    <div className="border border-gray-300 rounded-xl overflow-hidden bg-white text-gray-800 shadow-xl flex flex-col font-sans select-none">
      
      {/* ADOBE INDESIGN / PHOTOSHOP CONTROL BAR HEADER - PROFESSIONAL SLATE GRAY */}
      <div className="bg-gray-100 border-b border-gray-300 p-2.5 flex flex-wrap items-center justify-between text-xs font-mono text-gray-800 gap-2.5 shadow-md">
        
        {/* Left: Mode Tabs & Main Character Controls */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Character / Paragraph Panel Switcher Buttons (A / ⁋) */}
          <div className="flex bg-gray-100 p-0.5 rounded-md border border-gray-300 shadow-inner">
            <button
              type="button"
              onClick={() => setActiveTab('character')}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-all flex items-center gap-1 ${activeTab === 'character' ? 'bg-amber-500 text-gray-800 font-extrabold shadow' : 'text-gray-800 hover:text-white hover:bg-gray-100'}`}
              title="Character Controls (A)"
            >
              <span className="font-serif text-sm">A</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('paragraph')}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-all flex items-center gap-1 ${activeTab === 'paragraph' ? 'bg-amber-500 text-gray-800 font-extrabold shadow' : 'text-gray-800 hover:text-white hover:bg-gray-100'}`}
              title="Paragraph Controls (⁋)"
            >
              <span className="font-sans text-sm font-black">⁋</span>
            </button>
          </div>

          <div className="w-px h-5 bg-gray-100"></div>

          {/* FONT FAMILY DROPDOWN */}
          <div className="relative flex items-center bg-gray-100 border border-gray-300 text-gray-800 rounded-md px-2 py-1 hover:border-amber-500/60 transition-colors shadow-inner">
            <Search size={12} className="text-amber-400/80 mr-1.5 shrink-0" />
            <select
              value={fontFamily}
              onChange={(e) => applyFontFamily(e.target.value)}
              className="bg-transparent text-gray-800 focus:outline-none cursor-pointer py-0.5 text-xs font-sans w-36 sm:w-44 appearance-none pr-5"
            >
              {FONTS.map(f => (
                <option key={f.name} value={f.value} className="bg-gray-100 text-gray-800">{f.name}</option>
              ))}
            </select>
            <ChevronsUpDown size={11} className="text-gray-800 absolute right-1.5 pointer-events-none" />
          </div>

          {/* FONT STYLE / WEIGHT */}
          <div className="relative flex items-center bg-gray-100 border border-gray-300 text-gray-800 rounded-md px-2 py-1 hover:border-amber-500/60 transition-colors shadow-inner">
            <select
              value={fontWeight}
              onChange={(e) => applyFontWeight(e.target.value)}
              className="bg-transparent text-gray-800 focus:outline-none cursor-pointer py-0.5 text-xs font-sans w-24 appearance-none pr-4"
            >
              {FONT_WEIGHTS.map(w => (
                <option key={w.label} value={w.value} className="bg-gray-100 text-gray-800">{w.label}</option>
              ))}
            </select>
            <ChevronsUpDown size={11} className="text-gray-800 absolute right-1.5 pointer-events-none" />
          </div>

          <div className="w-px h-5 bg-gray-100"></div>

          {/* FONT SIZE (↕T) */}
          <div className="flex items-center bg-gray-100 border border-gray-300 text-gray-800 rounded-md px-2 py-1 gap-1.5 hover:border-amber-500/60 transition-colors shadow-inner" title="Font Size (pt)">
            <span className="text-[10px] text-amber-400 font-extrabold shrink-0">↕T</span>
            <select
              value={fontSize}
              onChange={(e) => applyFontSize(e.target.value)}
              className="bg-transparent text-gray-800 focus:outline-none cursor-pointer text-xs w-14 font-mono appearance-none"
            >
              {FONT_SIZES.map(s => (
                <option key={s} value={s} className="bg-gray-100 text-gray-800">{s} pt</option>
              ))}
            </select>
          </div>

          {/* LINE HEIGHT / LEADING (↕A) */}
          <div className="flex items-center bg-gray-100 border border-gray-300 text-gray-800 rounded-md px-2 py-1 gap-1.5 hover:border-amber-500/60 transition-colors shadow-inner" title="Leading / Line Height (↕A)">
            <span className="text-[10px] text-amber-400 font-extrabold shrink-0">↕A</span>
            <select
              value={lineHeight}
              onChange={(e) => applyLineHeight(e.target.value)}
              className="bg-transparent text-gray-800 focus:outline-none cursor-pointer text-xs w-20 font-mono appearance-none"
            >
              {LINE_HEIGHTS.map(lh => (
                <option key={lh} value={lh} className="bg-gray-100 text-gray-800">({lh === 'Auto' ? '14.4 pt' : `${lh} pt`})</option>
              ))}
            </select>
          </div>

          <div className="w-px h-5 bg-gray-100"></div>

          {/* CHARACTER TOGGLES: TT, Tt, T¹, T₁, U, S */}
          <div className="flex items-center bg-gray-100 border border-gray-300 text-gray-800 rounded-md p-0.5 gap-0.5 shadow-inner">
            {/* ALL CAPS (TT) */}
            <button
              type="button"
              onClick={() => applyTextTransform('uppercase')}
              className={`px-1.5 py-1 rounded text-xs font-black transition-all ${editor.getAttributes('textStyle').textTransform === 'uppercase' ? 'bg-amber-500 text-gray-800 shadow' : 'text-gray-800 hover:bg-gray-100 hover:text-white'}`}
              title="All Caps (TT)"
            >
              TT
            </button>
            {/* SMALL CAPS / CAPITALIZE (Tt) */}
            <button
              type="button"
              onClick={() => applyTextTransform('capitalize')}
              className={`px-1.5 py-1 rounded text-xs font-bold transition-all ${editor.getAttributes('textStyle').textTransform === 'capitalize' ? 'bg-amber-500 text-gray-800 shadow' : 'text-gray-800 hover:bg-gray-100 hover:text-white'}`}
              title="Small Caps / Capitalize (Tt)"
            >
              Tt
            </button>
            {/* SUPERSCRIPT (T¹) */}
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleSuperscript().run()}
              className={`px-1.5 py-1 rounded text-xs transition-all ${editor.isActive('superscript') ? 'bg-amber-500 text-gray-800 shadow font-bold' : 'text-gray-800 hover:bg-gray-100 hover:text-white'}`}
              title="Superscript (T¹)"
            >
              T¹
            </button>
            {/* SUBSCRIPT (T₁) */}
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleSubscript().run()}
              className={`px-1.5 py-1 rounded text-xs transition-all ${editor.isActive('subscript') ? 'bg-amber-500 text-gray-800 shadow font-bold' : 'text-gray-800 hover:bg-gray-100 hover:text-white'}`}
              title="Subscript (T₁)"
            >
              T₁
            </button>
            {/* UNDERLINE */}
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`px-1.5 py-1 rounded text-xs underline transition-all ${editor.isActive('underline') ? 'bg-amber-500 text-gray-800 shadow font-bold' : 'text-gray-800 hover:bg-gray-100 hover:text-white'}`}
              title="Underline (U)"
            >
              U
            </button>
            {/* STRIKETHROUGH */}
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`px-1.5 py-1 rounded text-xs line-through transition-all ${editor.isActive('strike') ? 'bg-amber-500 text-gray-800 shadow font-bold' : 'text-gray-800 hover:bg-gray-100 hover:text-white'}`}
              title="Strikethrough (S)"
            >
              S
            </button>
          </div>

          <div className="w-px h-5 bg-gray-100"></div>

          {/* KERNING / TRACKING (V/A) */}
          <div className="flex items-center bg-gray-100 border border-gray-300 text-gray-800 rounded-md px-2 py-1 gap-1 hover:border-amber-500/60 transition-colors shadow-inner" title="Tracking / Kerning (V/A)">
            <span className="text-[10px] text-amber-400 font-extrabold shrink-0">V/A</span>
            <select
              value={tracking}
              onChange={(e) => applyTracking(e.target.value)}
              className="bg-transparent text-gray-800 focus:outline-none cursor-pointer text-xs w-16 font-mono appearance-none"
            >
              {TRACKING_VALS.map(tr => (
                <option key={tr} value={tr} className="bg-gray-100 text-gray-800">{tr}</option>
              ))}
            </select>
          </div>

          {/* VERTICAL SCALE (↕T %) */}
          <div className="flex items-center bg-gray-100 border border-gray-300 text-gray-800 rounded-md px-2 py-1 gap-1 hover:border-amber-500/60 transition-colors shadow-inner" title="Vertical Scale (↕T %)">
            <span className="text-[10px] text-amber-400 font-extrabold shrink-0">↕T</span>
            <select
              value={scaleY}
              onChange={(e) => applyScaleY(e.target.value)}
              className="bg-transparent text-gray-800 focus:outline-none cursor-pointer text-xs w-14 font-mono appearance-none"
            >
              {['80', '90', '100', '110', '120', '130'].map(s => (
                <option key={s} value={s} className="bg-gray-100 text-gray-800">{s}%</option>
              ))}
            </select>
          </div>

          {/* HORIZONTAL SCALE (↔T %) */}
          <div className="flex items-center bg-gray-100 border border-gray-300 text-gray-800 rounded-md px-2 py-1 gap-1 hover:border-amber-500/60 transition-colors shadow-inner" title="Horizontal Scale (↔T %)">
            <span className="text-[10px] text-amber-400 font-extrabold shrink-0">↔T</span>
            <select
              value={scaleX}
              onChange={(e) => applyScaleX(e.target.value)}
              className="bg-transparent text-gray-800 focus:outline-none cursor-pointer text-xs w-14 font-mono appearance-none"
            >
              {['80', '90', '100', '110', '120', '130'].map(s => (
                <option key={s} value={s} className="bg-gray-100 text-gray-800">{s}%</option>
              ))}
            </select>
          </div>

          <div className="w-px h-5 bg-gray-100"></div>

          {/* BASELINE SHIFT (Aᵃ) */}
          <div className="flex items-center bg-gray-100 border border-gray-300 text-gray-800 rounded-md px-2 py-1 gap-1 hover:border-amber-500/60 transition-colors shadow-inner" title="Baseline Shift (Aᵃ pt)">
            <span className="text-[10px] text-amber-400 font-extrabold shrink-0">Aᵃ</span>
            <select
              value={baselineShift}
              onChange={(e) => applyBaselineShift(e.target.value)}
              className="bg-transparent text-gray-800 focus:outline-none cursor-pointer text-xs w-14 font-mono appearance-none"
            >
              {['-4', '-2', '0', '2', '4', '6'].map(b => (
                <option key={b} value={b} className="bg-gray-100 text-gray-800">{b} pt</option>
              ))}
            </select>
          </div>

          {/* SLANT / SHEAR ANGLE (T∠ °) */}
          <div className="flex items-center bg-gray-100 border border-gray-300 text-gray-800 rounded-md px-2 py-1 gap-1 hover:border-amber-500/60 transition-colors shadow-inner" title="Slant / Shear Angle (T∠ °)">
            <span className="text-[10px] text-amber-400 font-extrabold shrink-0">T∠</span>
            <select
              value={shear}
              onChange={(e) => applyShear(e.target.value)}
              className="bg-transparent text-gray-800 focus:outline-none cursor-pointer text-xs w-12 font-mono appearance-none"
            >
              {['-15', '-10', '0', '10', '15'].map(sh => (
                <option key={sh} value={sh} className="bg-gray-100 text-gray-800">{sh}°</option>
              ))}
            </select>
          </div>

          <div className="w-px h-5 bg-gray-100"></div>

          {/* COLOR PICKER & HIGHLIGHT */}
          <div className="flex items-center gap-1.5 bg-gray-100 border border-gray-300 text-gray-800 rounded-md p-1 shadow-inner">
            {/* Text Color Picker */}
            <label className="flex items-center gap-1 cursor-pointer" title="Text Color">
              <span className="text-xs font-extrabold text-amber-400">A.</span>
              <input
                type="color"
                value={textColor}
                onChange={(e) => applyTextColor(e.target.value)}
                className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent p-0"
              />
            </label>

            {/* Highlight Background Color */}
            <div className="relative group">
              <button
                type="button"
                className="w-4 h-4 rounded border border-gray-500 flex items-center justify-center text-[9px] font-bold"
                style={{ backgroundColor: bgColor === 'transparent' ? '#ffffff' : bgColor }}
                title="Highlight Color"
              >
                {bgColor === 'transparent' ? '✕' : ''}
              </button>
              <div className="absolute top-full right-0 mt-1.5 hidden group-hover:flex bg-gray-100 border border-gray-300 rounded-md p-1.5 gap-1 z-30 shadow-2xl">
                {HIGHLIGHT_COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => applyHighlightColor(c)}
                    className="w-4 h-4 rounded border border-gray-600 hover:scale-110 transition-transform"
                    style={{ backgroundColor: c === 'transparent' ? '#ffffff' : c }}
                  >
                    {c === 'transparent' && <span className="text-[9px] text-red-500 font-bold">✕</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* LANGUAGE SELECTOR */}
          <div className="relative flex items-center bg-gray-100 border border-gray-300 text-gray-800 rounded-md px-2 py-1 hover:border-amber-500/60 transition-colors shadow-inner">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent text-gray-800 focus:outline-none cursor-pointer text-xs font-sans w-22 appearance-none pr-4"
            >
              <option value="Arabic" className="bg-gray-100 text-gray-800">Arabic</option>
              <option value="English (US)" className="bg-gray-100 text-gray-800">English (US)</option>
              <option value="English (UK)" className="bg-gray-100 text-gray-800">English (UK)</option>
              <option value="French" className="bg-gray-100 text-gray-800">French</option>
              <option value="German" className="bg-gray-100 text-gray-800">German</option>
            </select>
            <ChevronsUpDown size={10} className="text-gray-800 absolute right-1.5 pointer-events-none" />
          </div>

        </div>

      </div>

      {/* SECOND ROW: PARAGRAPH CONTROLS & ALIGNMENTS - SLATE GRAY */}
      <div className="bg-gray-100 border-b border-gray-300 p-2.5 flex flex-wrap items-center justify-between text-xs font-mono text-gray-800 gap-2.5 shadow-inner">
        <div className="flex flex-wrap items-center gap-2">
          
          {/* ALIGNMENT BUTTONS */}
          <div className="flex items-center bg-gray-100 border border-gray-300 text-gray-800 rounded-md p-0.5 gap-0.5 shadow-inner">
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              className={`p-1.5 rounded transition-all ${editor.isActive({ textAlign: 'left' }) ? 'bg-amber-500 text-gray-800 shadow font-bold' : 'text-gray-800 hover:bg-gray-100 hover:text-white'}`}
              title="Align Left"
            >
              <AlignLeft size={14} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              className={`p-1.5 rounded transition-all ${editor.isActive({ textAlign: 'center' }) ? 'bg-amber-500 text-gray-800 shadow font-bold' : 'text-gray-800 hover:bg-gray-100 hover:text-white'}`}
              title="Align Center"
            >
              <AlignCenter size={14} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              className={`p-1.5 rounded transition-all ${editor.isActive({ textAlign: 'right' }) ? 'bg-amber-500 text-gray-800 shadow font-bold' : 'text-gray-800 hover:bg-gray-100 hover:text-white'}`}
              title="Align Right"
            >
              <AlignRight size={14} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
              className={`p-1.5 rounded transition-all ${editor.isActive({ textAlign: 'justify' }) ? 'bg-amber-500 text-gray-800 shadow font-bold' : 'text-gray-800 hover:bg-gray-100 hover:text-white'}`}
              title="Align Justify"
            >
              <AlignJustify size={14} />
            </button>
          </div>

          <div className="w-px h-5 bg-gray-100"></div>

          {/* PARAGRAPH DIRECTION: RTL / LTR */}
          <div className="flex items-center bg-gray-100 border border-gray-300 text-gray-800 rounded-md p-0.5 gap-0.5 shadow-inner">
            <button
              type="button"
              onClick={() => applyDir('rtl')}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${dir === 'rtl' ? 'bg-amber-500 text-gray-800 shadow' : 'text-gray-800 hover:bg-gray-100 hover:text-white'}`}
              title="Right to Left (⁋◀)"
            >
              ⁋◀ RTL
            </button>
            <button
              type="button"
              onClick={() => applyDir('ltr')}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${dir === 'ltr' ? 'bg-amber-500 text-gray-800 shadow' : 'text-gray-800 hover:bg-gray-100 hover:text-white'}`}
              title="Left to Right (▶⁋)"
            >
              ▶⁋ LTR
            </button>
          </div>

          <div className="w-px h-5 bg-gray-100"></div>

          {/* ARABIC KASHIDA JUSTIFICATION FORMAT */}
          <div className="flex items-center bg-gray-100 border border-gray-300 text-gray-800 rounded-md px-2 py-1 gap-1.5 hover:border-amber-500/60 transition-colors shadow-inner" title="Kashida Justification Format">
            <span className="text-[10px] text-amber-400 font-extrabold shrink-0">مد</span>
            <select
              value={kashida}
              onChange={(e) => applyKashida(e.target.value)}
              className="bg-transparent text-gray-800 focus:outline-none cursor-pointer text-xs font-sans w-20 appearance-none"
            >
              <option value="Medium" className="bg-gray-100 text-gray-800">Medium</option>
              <option value="Short" className="bg-gray-100 text-gray-800">Short</option>
              <option value="Long" className="bg-gray-100 text-gray-800">Long</option>
              <option value="None" className="bg-gray-100 text-gray-800">None</option>
            </select>
          </div>

          <div className="w-px h-5 bg-gray-100"></div>

          {/* INDENTS & MARGINS (Left Indent, Right Indent, First Line Indent, Space Before, Space After) */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Left Indent */}
            <div className="flex items-center bg-gray-100 border border-gray-300 text-gray-800 rounded-md px-2 py-1 gap-1" title="Left Indent (mm)">
              <span className="text-[10px] text-amber-400 shrink-0 font-bold">⇤</span>
              <input
                type="number"
                value={indentLeft}
                onChange={(e) => applyIndents(e.target.value, indentRight, textIndent)}
                className="bg-transparent text-gray-800 focus:outline-none w-10 text-xs font-mono"
              />
              <span className="text-[10px] text-gray-800">mm</span>
            </div>

            {/* Right Indent */}
            <div className="flex items-center bg-gray-100 border border-gray-300 text-gray-800 rounded-md px-2 py-1 gap-1" title="Right Indent (mm)">
              <span className="text-[10px] text-amber-400 shrink-0 font-bold">⇥</span>
              <input
                type="number"
                value={indentRight}
                onChange={(e) => applyIndents(indentLeft, e.target.value, textIndent)}
                className="bg-transparent text-gray-800 focus:outline-none w-10 text-xs font-mono"
              />
              <span className="text-[10px] text-gray-800">mm</span>
            </div>

            {/* First Line Indent */}
            <div className="flex items-center bg-gray-100 border border-gray-300 text-gray-800 rounded-md px-2 py-1 gap-1" title="First Line Indent (mm)">
              <span className="text-[10px] text-amber-400 shrink-0 font-bold">⮑</span>
              <input
                type="number"
                value={textIndent}
                onChange={(e) => applyIndents(indentLeft, indentRight, e.target.value)}
                className="bg-transparent text-gray-800 focus:outline-none w-10 text-xs font-mono"
              />
              <span className="text-[10px] text-gray-800">mm</span>
            </div>

            {/* Space Before */}
            <div className="flex items-center bg-gray-100 border border-gray-300 text-gray-800 rounded-md px-2 py-1 gap-1" title="Space Before (pt)">
              <span className="text-[10px] text-amber-400 shrink-0 font-bold">↑⁋</span>
              <input
                type="number"
                value={spaceBefore}
                onChange={(e) => applyMargins(e.target.value, spaceAfter)}
                className="bg-transparent text-gray-800 focus:outline-none w-10 text-xs font-mono"
              />
              <span className="text-[10px] text-gray-800">pt</span>
            </div>

            {/* Space After */}
            <div className="flex items-center bg-gray-100 border border-gray-300 text-gray-800 rounded-md px-2 py-1 gap-1" title="Space After (pt)">
              <span className="text-[10px] text-amber-400 shrink-0 font-bold">↓⁋</span>
              <input
                type="number"
                value={spaceAfter}
                onChange={(e) => applyMargins(spaceBefore, e.target.value)}
                className="bg-transparent text-gray-800 focus:outline-none w-10 text-xs font-mono"
              />
              <span className="text-[10px] text-gray-800">pt</span>
            </div>
          </div>

        </div>

        {/* RIGHT ACTIONS: HEADINGS, LISTS, LINKS, MEDIA, UNDO/REDO */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`px-2 py-1 rounded-md font-extrabold text-xs transition-all ${editor.isActive('heading', { level: 2 }) ? 'bg-amber-500 text-gray-800 shadow' : 'text-gray-800 hover:bg-gray-100'}`}
            title="Heading 2"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`px-2 py-1 rounded-md font-extrabold text-xs transition-all ${editor.isActive('heading', { level: 3 }) ? 'bg-amber-500 text-gray-800 shadow' : 'text-gray-800 hover:bg-gray-100'}`}
            title="Heading 3"
          >
            H3
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded-md transition-all ${editor.isActive('bulletList') ? 'bg-amber-500 text-gray-800 shadow' : 'text-gray-800 hover:bg-gray-100'}`}
            title="Bullet List"
          >
            <List size={14} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 rounded-md transition-all ${editor.isActive('orderedList') ? 'bg-amber-500 text-gray-800 shadow' : 'text-gray-800 hover:bg-gray-100'}`}
            title="Ordered List"
          >
            <ListOrdered size={14} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-1.5 rounded-md transition-all ${editor.isActive('blockquote') ? 'bg-amber-500 text-gray-800 shadow' : 'text-gray-800 hover:bg-gray-100'}`}
            title="Blockquote"
          >
            <Quote size={14} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`p-1.5 rounded-md transition-all ${editor.isActive('codeBlock') ? 'bg-amber-500 text-gray-800 shadow' : 'text-gray-800 hover:bg-gray-100'}`}
            title="Code Block"
          >
            <Code size={14} />
          </button>
          <button
            type="button"
            onClick={setLink}
            className={`p-1.5 rounded-md transition-all ${editor.isActive('link') ? 'bg-amber-500 text-gray-800 shadow' : 'text-gray-800 hover:bg-gray-100'}`}
            title="Insert Link"
          >
            <LinkIcon size={14} />
          </button>
          {onImageClick && (
            <button
              type="button"
              onClick={onImageClick}
              className="p-1.5 rounded-md text-gray-800 hover:bg-gray-100 transition-all"
              title="Insert Image"
            >
              <ImageIcon size={14} />
            </button>
          )}

          <div className="w-px h-5 bg-gray-100 mx-1"></div>

          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-1.5 rounded-md text-gray-800 hover:bg-gray-100 disabled:opacity-30 transition-all"
            title="Undo (Ctrl+Z)"
          >
            <Undo size={14} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-1.5 rounded-md text-gray-800 hover:bg-gray-100 disabled:opacity-30 transition-all"
            title="Redo (Ctrl+Y)"
          >
            <Redo size={14} />
          </button>
        </div>
      </div>

      {/* INDESIGN DOCUMENT SHEET CANVAS VIEW */}
      <div
        className="flex-1 bg-gray-100 p-4 sm:p-8 flex justify-center items-start overflow-y-auto cursor-text min-h-[500px]"
        onClick={() => editor.commands.focus()}
      >
        <div className="max-w-4xl w-full bg-gray-100 text-gray-800 shadow-2xl rounded-sm p-8 sm:p-12 min-h-[600px] border border-gray-300 relative transition-all">
          <EditorContent editor={editor} />
        </div>
      </div>

    </div>
  );
}
