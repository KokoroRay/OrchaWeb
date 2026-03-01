import { useState, useRef, useEffect } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';
import styles from './SearchBox.module.css';

interface SearchBoxProps {
    placeholder?: string;
    onSearch?: (query: string) => void;
}

export const SearchBox = ({ 
    placeholder = "Tìm kiếm sản phẩm, bài viết...", 
    onSearch 
}: SearchBoxProps) => {
    const [query, setQuery] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const searchBoxRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchBoxRef.current && !searchBoxRef.current.contains(event.target as Node)) {
                handleClose();
            }
        };

        if (isExpanded) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isExpanded]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsExpanded(false);
            setIsClosing(false);
            setQuery('');
        }, 200); // Match animation duration
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim() && onSearch) {
            onSearch(query.trim());
            // Không tự động đóng search sau khi tìm kiếm
        }
    };

    const handleClear = () => {
        setQuery('');
        // Không tự động đóng search khi clear
    };

    const handleToggle = () => {
        if (isExpanded) {
            handleClose();
        } else {
            setIsExpanded(true);
        }
    };

    return (
        <div 
            ref={searchBoxRef}
            className={`${styles.searchBox} ${isExpanded ? styles.expanded : ''}`}
        >
            <button 
                type="button"
                className={styles.searchToggle}
                onClick={handleToggle}
                aria-label="Toggle search"
            >
                <FaSearch />
            </button>

            {isExpanded && (
                <form onSubmit={handleSubmit} className={`${styles.searchForm} ${isClosing ? styles.closing : ''}`}>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={placeholder}
                        className={styles.searchInput}
                        autoFocus
                    />
                    {query && (
                        <button 
                            type="button"
                            onClick={handleClear}
                            className={styles.clearButton}
                            aria-label="Clear search"
                        >
                            <FaTimes />
                        </button>
                    )}
                    <button type="submit" className={styles.submitButton}>
                        <FaSearch />
                    </button>
                </form>
            )}
        </div>
    );
};