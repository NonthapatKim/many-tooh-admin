export interface PageProps {
    urlParth: string;
}

export interface AddModalProps {
    setAddModal: React.Dispatch<React.SetStateAction<boolean>>;
    refreshData: () => void;
}