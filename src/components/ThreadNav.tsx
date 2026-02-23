import { useApp } from '../context/AppContext';
import type { Message } from '../types';
import { IconChevronDown, IconChevronUp } from './Icons';

interface ThreadNavProps {
    messages: Message[];
    currentIndex: number;
    onNavigate: (index: number) => void;
}

export default function ThreadNav({ messages, currentIndex, onNavigate }: ThreadNavProps) {
    if (messages.length <= 1) return null;

    const currentPos = currentIndex + 1;
    const total = messages.length;

    return (
        <div className="thread-nav">
            <button
                className="thread-nav-btn"
                onClick={() => onNavigate(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
            >
                <IconChevronUp size={14} />
            </button>
            <span className="thread-nav-count">{currentPos}/{total}</span>
            <button
                className="thread-nav-btn"
                onClick={() => onNavigate(Math.min(messages.length - 1, currentIndex + 1))}
                disabled={currentIndex === messages.length - 1}
            >
                <IconChevronDown size={14} />
            </button>
        </div>
    );
}
