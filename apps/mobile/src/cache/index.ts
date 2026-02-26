export type ScreenHeaderProps = {
    activeSearch?: boolean;
    searchValue?: string;
    onChangeSearchText?: (value: string) => void;
    onBackPress?: () => void;
    onSearchPress?: () => void;
    onInfoPress?: () => void;
};