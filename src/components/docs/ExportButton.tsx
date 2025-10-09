import { Download } from 'lucide-react';

interface ExportButtonProps {
  content: string;
  filename: string;
}

export default function ExportButton({ content, filename }: ExportButtonProps) {
  const handleExport = () => {
    // Create a Blob from the markdown content
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });

    // Create a temporary URL for the Blob
    const url = URL.createObjectURL(blob);

    // Create a temporary link element to trigger the download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;

    // Append to the document, click, and then remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the temporary URL
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      className="absolute top-4 left-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-sm transition-colors flex items-center gap-2"
      aria-label={`Export ${filename}`}
    >
      <Download className="w-4 h-4" />
      تصدير كملف MD
    </button>
  );
}