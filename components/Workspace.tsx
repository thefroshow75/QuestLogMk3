
import React, { useState, useRef } from 'react';
import { WorkspaceItem } from '../types';
import { FolderIcon } from './icons/FolderIcon';
import { ArchiveBoxIcon } from './icons/ArchiveBoxIcon';
import { PlusIcon } from './icons/PlusIcon';

interface WorkspaceProps {
    items: WorkspaceItem[];
    onAddItem: (item: WorkspaceItem) => void;
}

const Workspace: React.FC<WorkspaceProps> = ({ items, onAddItem }) => {
    const [filter, setFilter] = useState<'ALL' | 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'LINK'>('ALL');
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const filteredItems = filter === 'ALL' ? items : items.filter(i => i.type === filter);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files) as File[];
        processFiles(files);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files) as File[];
            processFiles(files);
        }
    };

    const processFiles = (files: File[]) => {
        files.forEach(file => {
            let type: WorkspaceItem['type'] = 'DOCUMENT';
            if (file.type.startsWith('image/')) type = 'IMAGE';
            else if (file.type.startsWith('video/')) type = 'VIDEO';
            else if (file.type === 'text/html' || file.name.endsWith('.url')) type = 'LINK';

            const newItem: WorkspaceItem = {
                id: crypto.randomUUID(),
                name: file.name,
                type,
                size: (file.size / 1024).toFixed(1) + ' KB',
                date: new Date().toISOString().split('T')[0],
                tags: ['upload'],
            };
            onAddItem(newItem);
        });
    };

    const handleExport = (format: string) => {
        // Stub for export functionality
        const itemNames = filteredItems.map(i => i.name).join(', ');
        alert(`Exporting [${itemNames}] as ${format}... (Stub)`);
    };

    return (
        <div className="h-full flex flex-col overflow-hidden px-6 pt-4">
            <div className="flex justify-between items-center mb-6 flex-shrink-0">
                <h2 className="font-display text-3xl text-[rgb(var(--color-accent-primary-rgb))]">Workspace</h2>
                <div className="flex gap-2">
                    <button onClick={() => handleExport('ZIP')} className="px-3 py-2 bg-[rgba(var(--color-interactive-primary-rgb),0.2)] hover:bg-[rgba(var(--color-interactive-primary-rgb),0.4)] rounded-lg text-sm font-bold transition-colors">Export ZIP</button>
                    <button onClick={() => handleExport('JSON')} className="px-3 py-2 bg-[rgba(var(--color-interactive-primary-rgb),0.2)] hover:bg-[rgba(var(--color-interactive-primary-rgb),0.4)] rounded-lg text-sm font-bold transition-colors">Export JSON</button>
                </div>
            </div>

            {/* Drop Zone */}
            <div 
                className={`
                    border-2 border-dashed rounded-xl p-8 mb-6 flex flex-col items-center justify-center transition-all cursor-pointer
                    ${isDragging 
                        ? 'border-[rgb(var(--color-accent-secondary-rgb))] bg-[rgba(var(--color-accent-secondary-rgb),0.1)] scale-[1.01]' 
                        : 'border-[rgba(var(--color-text-muted-rgb),0.3)] bg-[rgba(var(--color-background-secondary-rgb),0.3)] hover:border-[rgba(var(--color-accent-secondary-rgb),0.5)]'
                    }
                `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
                <ArchiveBoxIcon className={`w-12 h-12 mb-2 ${isDragging ? 'text-[rgb(var(--color-accent-secondary-rgb))]' : 'text-[rgb(var(--color-text-muted-rgb))]'}`} />
                <p className="font-bold text-[rgb(var(--color-text-secondary-rgb))]">Drag & Drop files or Click to Upload</p>
                <p className="text-xs text-[rgb(var(--color-text-muted-rgb))] mt-1">Supports Images, Videos, Docs, Code</p>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 flex-shrink-0">
                {['ALL', 'IMAGE', 'VIDEO', 'DOCUMENT', 'LINK'].map(f => (
                    <button 
                        key={f}
                        onClick={() => setFilter(f as any)}
                        className={`px-3 py-1.5 rounded-full font-bold text-xs transition-colors whitespace-nowrap ${filter === f ? 'bg-[rgb(var(--color-accent-secondary-rgb))] text-[rgb(var(--color-background-primary-rgb))]' : 'bg-[rgba(var(--color-background-secondary-rgb),0.5)] text-[rgb(var(--color-text-secondary-rgb))] hover:bg-[rgba(var(--color-background-secondary-rgb),0.8)]'}`}
                    >
                        {f.charAt(0) + f.slice(1).toLowerCase() + (f === 'ALL' ? '' : 's')}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto pr-2 pb-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 content-start">
                {filteredItems.length > 0 ? (
                    filteredItems.map(item => (
                        <div key={item.id} className="group relative bg-[rgba(var(--color-background-secondary-rgb),0.5)] border border-[rgba(var(--color-border-primary-rgb),0.2)] rounded-lg p-3 hover:bg-[rgba(var(--color-interactive-primary-rgb),0.1)] transition-colors">
                             <div className="aspect-square rounded-md bg-[rgba(var(--color-background-primary-rgb),0.5)] mb-3 flex items-center justify-center overflow-hidden">
                                {item.type === 'IMAGE' ? (
                                    <div className="w-full h-full bg-[rgb(var(--color-accent-tertiary-rgb))] opacity-20"></div> // Placeholder
                                ) : (
                                    <FolderIcon className="w-10 h-10 text-[rgb(var(--color-text-muted-rgb))]" />
                                )}
                             </div>
                             <h4 className="font-bold text-sm text-[rgb(var(--color-text-primary-rgb))] truncate" title={item.name}>{item.name}</h4>
                             <div className="flex justify-between items-center mt-1">
                                 <span className="text-[10px] text-[rgb(var(--color-text-muted-rgb))]">{item.size}</span>
                                 <span className="text-[10px] text-[rgb(var(--color-text-muted-rgb))] uppercase">{item.type}</span>
                             </div>
                             
                             {/* Hover Actions */}
                             <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                 <button className="p-1 bg-[rgb(var(--color-interactive-primary-rgb))] text-white rounded hover:opacity-90" title="Attach to Quest">
                                     <PlusIcon className="w-3 h-3" />
                                 </button>
                             </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-12 text-[rgb(var(--color-text-muted-rgb))]">
                        <FolderIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No resources found in this category.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Workspace;
