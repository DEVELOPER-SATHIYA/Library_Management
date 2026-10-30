import { Input } from "../../styles/ui";
import { ClearButton, SearchWrap } from "./common.styles";
import { Icon } from "./Icon";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchBar = ({ value, onChange, placeholder = "Search…" }: SearchBarProps) => (
  <SearchWrap>
    <Icon name="search" size={16} />
    <Input
      type="search"
      value={value}
      placeholder={placeholder}
      aria-label={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
    {value && (
      <ClearButton type="button" aria-label="Clear search" onClick={() => onChange("")}>
        <Icon name="x" size={14} />
      </ClearButton>
    )}
  </SearchWrap>
);
