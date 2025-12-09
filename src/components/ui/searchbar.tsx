import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  X, 
  Mic, 
  Filter, 
  SearchSlash,
  Loader2,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
  showClear?: boolean;
  showVoiceSearch?: boolean;
  showFilters?: boolean;
  showSuggestions?: boolean;
  suggestions?: string[];
  isLoading?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "glass" | "minimal" | "neon";
}

export function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder = "Search...",
  className,
  debounceMs = 300,
  showClear = true,
  showVoiceSearch = false,
  showFilters = false,
  showSuggestions = false,
  suggestions = [],
  isLoading = false,
  size = "md",
  variant = "default",
}: SearchBarProps) {
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [showSuggestionDropdown, setShowSuggestionDropdown] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimeout = useRef<number | undefined>(undefined);

  const sizeClasses = {
    sm: "h-9 text-sm",
    md: "h-11 text-base",
    lg: "h-14 text-lg",
  };

  const variantClasses = {
    default: "bg-background border shadow-sm",
    glass: "bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg",
    minimal: "bg-transparent border-b border-muted-foreground/20 rounded-none",
    neon: "bg-black border-2 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]",
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    if (debounceMs > 0) {
      clearTimeout(debounceTimeout.current);
      debounceTimeout.current = setTimeout(() => {
        onChange(newValue);
      }, debounceMs);
    } else {
      onChange(newValue);
    }
    
    if (showSuggestions && newValue.length > 0) {
      setShowSuggestionDropdown(true);
    } else {
      setShowSuggestionDropdown(false);
    }
  };

  const handleClear = () => {
    onChange("");
    inputRef.current?.focus();
    setShowSuggestionDropdown(false);
  };

  const handleVoiceSearch = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Voice search not supported in your browser");
      return;
    }

    setIsVoiceActive(true);
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onChange(transcript);
      if (onSearch) onSearch(transcript);
      setIsVoiceActive(false);
    };

    recognition.onerror = () => {
      setIsVoiceActive(false);
    };

    recognition.onend = () => {
      setIsVoiceActive(false);
    };

    recognition.start();
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    if (onSearch) onSearch(suggestion);
    setShowSuggestionDropdown(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && onSearch) {
      onSearch(value);
      setShowSuggestionDropdown(false);
    }
    if (e.key === "Escape") {
      setShowSuggestionDropdown(false);
      inputRef.current?.blur();
    }
  };

  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  return (
    <div className={cn("relative w-full", className)}>
      <div className="relative">
        <div
          className={cn(
            "relative flex items-center rounded-lg transition-all duration-300",
            sizeClasses[size],
            variantClasses[variant],
            isFocused && "ring-2 ring-primary ring-offset-2",
            variant === "neon" && isFocused && "ring-cyan-400",
          )}
        >
          {isLoading ? (
            <Loader2 className="absolute left-3 h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
          )}

          <Input
            ref={inputRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setIsFocused(false);
              setTimeout(() => setShowSuggestionDropdown(false), 200);
            }}
            placeholder={placeholder}
            className={cn(
              "flex-1 border-0 bg-transparent pl-10 pr-24 focus-visible:ring-0 focus-visible:ring-offset-0",
              sizeClasses[size],
            )}
          />

          <div className="absolute right-2 flex items-center gap-1">
            {showSuggestions && value.length > 0 && (
              <Badge
                variant="secondary"
                className="mr-2 animate-pulse bg-linear-to-r from-purple-500 to-pink-500 text-white"
              >
                {suggestions.length} results
              </Badge>
            )}

            {showVoiceSearch && (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={handleVoiceSearch}
                className={cn(
                  "h-7 w-7 transition-all",
                  isVoiceActive && "animate-pulse bg-red-500 text-white",
                )}
              >
                <Mic className="h-3.5 w-3.5" />
              </Button>
            )}

            {showFilters && (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-7 w-7"
              >
                <Filter className="h-3.5 w-3.5" />
              </Button>
            )}

            {showClear && value && !isLoading && (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={handleClear}
                className="h-7 w-7"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}

            {onSearch && (
              <Button
                type="button"
                size="sm"
                onClick={() => onSearch(value)}
                className={cn(
                  "ml-1 h-7 px-3 text-xs font-semibold",
                  variant === "neon" &&
                    "bg-linear-to-r from-cyan-500 to-blue-500 text-white hover:opacity-90",
                )}
              >
                <Sparkles className="mr-1 h-3 w-3" />
                Search
              </Button>
            )}
          </div>
        </div>

        {showSuggestions && showSuggestionDropdown && suggestions.length > 0 && (
          <div className="absolute top-full z-50 mt-2 w-full rounded-lg border bg-popover p-2 shadow-lg animate-in slide-in-from-top-5">
            <div className="space-y-1">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onMouseDown={() => handleSuggestionClick(suggestion)}
                  className="flex w-full items-center rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                >
                  <SearchSlash className="mr-2 h-3.5 w-3.5" />
                  <span>{suggestion}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {variant === "neon" && (
        <div className="absolute -bottom-2 left-0 right-0 h-px bg-linear-to-r from-transparent via-cyan-400 to-transparent" />
      )}
    </div>
  );
}