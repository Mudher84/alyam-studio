const fs = require('fs');
let content = fs.readFileSync('src/components/cms/RichTextEditor.tsx', 'utf8');

// Replace all jarring mixed white boxes/inputs with a unified, professional Adobe Creative Suite dark UI palette
// Backgrounds: #1a1b1f (editor container), #22252b (toolbars), #2a2e37 (inputs, selects, buttons), #323640 (hover)
// Text: #e2e8f0 (light gray), borders: #3a3f4b

content = content.replace(
  /className="border border-\[#2d3139\] rounded-xl overflow-hidden bg-\[#181a1f\] text-gray-200 shadow-2xl flex flex-col font-sans select-none"/g,
  'className="border border-[#2f333d] rounded-xl overflow-hidden bg-[#181a1f] text-gray-100 shadow-2xl flex flex-col font-sans select-none"'
);

// Replace toolbar backgrounds
content = content.replace(
  /className="bg-\[#212328\] border-b border-\[#2d3139\] p-2\.5 flex flex-wrap items-center justify-between text-xs font-mono text-gray-200 gap-2\.5 shadow-md"/g,
  'className="bg-[#21242c] border-b border-[#2d323e] p-2.5 flex flex-wrap items-center justify-between text-xs font-mono text-gray-200 gap-2.5 shadow-md"'
);

content = content.replace(
  /className="bg-\[#1e2025\] border-b border-\[#2d3139\] p-2\.5 flex flex-wrap items-center justify-between text-xs font-mono text-gray-200 gap-2\.5 shadow-inner"/g,
  'className="bg-[#1c1e25] border-b border-[#2d323e] p-2.5 flex flex-wrap items-center justify-between text-xs font-mono text-gray-200 gap-2.5 shadow-inner"'
);

// Replace any bg-white inside the toolbar with unified professional dark inputs (#262a33)
content = content.replace(/bg-white border-\[#3b3e45\]/g, 'bg-[#262a33] border-[#383d4a] text-gray-200');
content = content.replace(/bg-white p-0\.5 rounded-md border border-\[#3b3e45\]/g, 'bg-[#262a33] p-0.5 rounded-md border border-[#383d4a]');
content = content.replace(/bg-white border-\[#3b3e45\] rounded-md/g, 'bg-[#262a33] border-[#383d4a] rounded-md text-gray-200');
content = content.replace(/bg-white border border-\[#3b3e45\]/g, 'bg-[#262a33] border border-[#383d4a] text-gray-200');
content = content.replace(/bg-white/g, 'bg-[#262a33]');

// Text colors for inputs and selects inside toolbar
content = content.replace(/text-black/g, 'text-gray-100');

fs.writeFileSync('src/components/cms/RichTextEditor.tsx', content);
console.log('RichTextEditor professional clean unified theme applied successfully!');
